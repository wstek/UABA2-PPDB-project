import json
import os
from datetime import timedelta

import flask
import redis
from flask import Flask, request, session
from flask_bcrypt import Bcrypt
from flask_cors import CORS, cross_origin
from flask_session import Session
from werkzeug.utils import secure_filename

from ABTestSimulation import ABTestSimulation, remove_tuples
from DatabaseConnection import DatabaseConnection
from Logger import Logger

app = Flask(__name__)
app.config['SECRET_KEY'] = "changeme"
app.config['SESSION_TYPE'] = 'redis'
# app.config['SESSION_PERMANENT'] = False
# app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_REDIS'] = redis.from_url('redis://localhost:6379')
app.config["SESSION_COOKIE_SECURE"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=60)
# app.config['SESSION_MODIFIED'] = True
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# app.config['SQLALCHEMY_ECHO'] = True
# app.config['SESSION_PERMANENT'] = False
# app.config['SESSION_USE_SIGNER'] = True

# 2 gigabyte file upload limit
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 2000
app.config['UPLOAD_EXTENSIONS'] = ['.csv']
app.config['UPLOAD_PATH'] = '../uploaded-files'

bcrypt = Bcrypt(app)
server_session = Session(app)
database_connection: DatabaseConnection = DatabaseConnection()
database_connection.connect(filename="config/database.ini")
database_connection.logVersion()
cors = CORS(app, supports_credentials=True, resources={
    '/*': {'origins': 'http://localhost:3000'}})  # https://team6.ua-ppdb.me/

exporting_threads = {}
LoggedIn = False


@app.route("/api/progress", methods=['GET'])
@cross_origin(supports_credentials=True)
def get_data():
    global exporting_threads
    if exporting_threads:
        return {"data": exporting_threads[0].frontend_data}
    else:
        return {"done": True}


@app.route("/api/me", methods=['GET'])
@cross_origin(supports_credentials=True)
def get_current_user():
    user_id = session.get("user_id")

    if not user_id:
        return {"error": "Unauthorized"}, 401

    user = database_connection.session.execute("SELECT * FROM datascientist WHERE username = :username",
                                               {"username": user_id}).fetchone()
    database_connection.session.commit()
    admin = database_connection.session.execute("SELECT * FROM admin WHERE username = :username",
                                                {"username": user_id}).fetchone()
    database_connection.session.commit()
    returnValue = {"username": user.username, "first_name": user.first_name, "last_name": user.last_name,
                   "email": user.email_address, 'admin': admin is not None}
    return returnValue


@app.route("/api/abtest/statistics/")
@cross_origin(supports_credentials=True)
def get_personal_abtestids():
    username = session.get("user_id")

    if not username:
        return {"error": "unauthorized"}, 401

    personal_abtestids = database_connection.session.execute(
        f"select abtest_id from ab_test where created_by = '{username}';").fetchall()
    personal_abtestids = [r[0] for r in personal_abtestids]
    return {"personal_abtestids": personal_abtestids}


@app.route("/api/abtest/delete/<int:abtest_id>/", methods=["DELETE"])
@cross_origin(supports_credentials=True)
def del_abtest(abtest_id):
    username = session.get("user_id")
    if not username:
        return {"error": "unauthorized"}, 401
    owned = database_connection.session.execute(
        f"select abtest_id from ab_test where created_by = '{username}' and abtest_id = '{abtest_id}';").fetchall()

    database_connection.session.execute(
        f"delete from ab_test where created_by = '{username}' and abtest_id = '{abtest_id}';")
    database_connection.session.commit()
    return "200"


@app.route("/api/abtest/statistics/<int:customer_id>/<int:selected_abtest>")
@cross_origin(supports_credentials=True)
def get_user_attributes(customer_id, selected_abtest):
    attr = database_connection.session.execute(
        f"select attribute_name, attribute_value from  customer_attribute natural join  ab_test where customer_id = '{customer_id}'and abtest_id = '{selected_abtest}';").fetchall()
    response = dict()
    for r in attr:
        response[r[0]] = r[1]

    return response


@app.route("/api/abtest/statistics/<int:abtest_id>/<stat>")
@cross_origin(supports_credentials=True)
def get_stat(abtest_id, stat):
    username = session.get("user_id")

    if not username:
        return {"error": "unauthorized"}, 401
    if stat == "algorithm_information":
        algorithm_id: int
        algorithm_name: str
        parametername: str
        parametervalue: any

        # alle parameter entries
        # result : list (algorithm_id, algorithm_name, parametername, value)
        result = database_connection.session.execute(
            f"select algorithm_id, algorithm_name, parameter_name, value from algorithm natural join parameter where abtest_id = {abtest_id};").fetchall()
        algorithms = {}
        # for every parameter
        for row in result:
            algorithm_id = row[0]
            algorithmname = row[1]
            parametername = row[2]
            parametervalue = row[3]
            # if algorithm id was not present in the dictionary
            if not algorithm_id in algorithms.keys():
                # add the algorithm in the dictionarry and initialize name
                algorithms[algorithm_id] = {'name': algorithmname}
            algorithms[algorithm_id][parametername] = parametervalue
        return algorithms

    if stat == "abtest_simulation":
        date_data = database_connection.session.execute(
            f"SELECT DISTINCT date_of FROM statistics WHERE abtest_id = {abtest_id}").fetchall()
        remove_tuples(date_data)
        dataset_name = database_connection.session.execute(
            f'SELECT dataset_name FROM ab_test WHERE abtest_id = {abtest_id}').fetchall()
        users_data = database_connection.session.execute(
            "SELECT DISTINCT customer_id FROM customer").fetchall()
        remove_tuples(users_data)
        algorithms_data = database_connection.session.execute(
            f"SELECT * FROM algorithm WHERE abtest_id = {abtest_id}").fetchall()
        y_stat = []
        for x in range(len(date_data)):
            y_stat.append({})
            for y in range(len(users_data)):
                y_stat[x][users_data[y]] = {"history": [], "algorithms": {}}
                for z in range(len(algorithms_data)):
                    statistics_id = database_connection.session.execute(
                        f"SELECT statistics_id FROM statistics WHERE date_of = '{date_data[x]}' AND algorithm_id = "
                        f"{algorithms_data[z][0]} AND abtest_id = {abtest_id}").fetchall()
                    k_recommendations = database_connection.session.execute(
                        f"SELECT sub.article_id FROM (SELECT article_id, recommendation_id FROM recommendation WHERE "
                        f"customer_id = {users_data[y]} AND statistics_id = {statistics_id[0][0]} AND dataset_name = "
                        f"'{dataset_name[0][0]}' ORDER BY recommendation_id ASC) AS sub").fetchall()
                    remove_tuples(k_recommendations)
                    history = database_connection.session.execute(
                        f"SELECT article_id FROM purchase WHERE customer_id = {users_data[y]} AND bought_on < "
                        f"'{date_data[x]}'").fetchall()
                    remove_tuples(history)
                    y_stat[x][users_data[y]]["history"] = history
                    y_stat[x][users_data[y]]["algorithms"][algorithms_data[z][
                        0]] = k_recommendations
        database_connection.session.commit()
        return {"abtest_simulation": {"x": date_data, "y": y_stat}}

    if stat == "abtest_summary":
        abtest_summary = database_connection.session.execute(
            f'SELECT * FROM "ab_test" WHERE abtest_id = {abtest_id}').fetchall()
        database_connection.session.commit()
        abtest_summary = abtest_summary[0]
        algorithms = []
        data = database_connection.session.execute(
            f"SELECT algorithm_id, algorithm_name FROM algorithm WHERE abtest_id = {abtest_id}").fetchall()
        database_connection.session.commit()
        for i in range(len(data)):
            algorithms.append({"algorithm_id": data[
                i][0], "algorithm_name": data[i][1]})
            parameters = database_connection.session.execute(
                f"SELECT parameter_name, value FROM parameter WHERE algorithm_id = {data[i][0]} AND abtest_id = "
                f"{abtest_id}").fetchall()
            database_connection.session.commit()
            for k in range(len(parameters)):
                algorithms[i][parameters[k][0]] = parameters[k][1]

        return {"abtest_summary": {"abtest_id": abtest_summary[0], "top_k": abtest_summary[1],
                                   "stepsize": abtest_summary[2], "start": abtest_summary[3],
                                   "end": abtest_summary[4], "dataset_name": abtest_summary[5],
                                   "created_on": abtest_summary[6], "created_by": abtest_summary[7]},
                "algorithms": algorithms}

    if stat == "active_users_over_time":
        datetimes = database_connection.session.execute(
            f"SELECT date_of,COUNT(DISTINCT(customer_id)) FROM statistics natural join customer_specific_statistics "
            f"WHERE abtest_id = {abtest_id} group by date_of").fetchall()
        XFnY = [[str(r[0]), r[1]] for r in datetimes]
        XFnY.insert(0, ['Date', 'Users'])
        return {'graphdata': XFnY}
    if stat == "purchases_over_time":
        datetimes = database_connection.session.execute(
            f"SELECT DISTINCT date_of FROM statistics WHERE abtest_id = {abtest_id}").fetchall()
        XFnY = [['Date', 'Purchases']]
        XFnY = [['Date', 'Purchases']]
        for i in range(len(datetimes)):
            countz = database_connection.session.execute(
                f"SELECT COUNT(customer_id) FROM purchase WHERE bought_on = '{datetimes[i][0]}'").fetchall()
            XFnY.append([str(datetimes[i][0]), countz[0][0]])
        return {'graphdata': XFnY}

    if stat == "CTR_over_time":
        XFnY = []
        # ['Date', 'ClickThroughRate']
        datetimes = database_connection.session.execute(
            f"SELECT date_of, algorithm_id,parameter_value FROM statistics NATURAL JOIN dynamic_stepsize_var NATURAL "
            f"JOIN  algorithm WHERE abtest_id = {abtest_id} AND parameter_name = 'CTR' ORDER BY date_of").fetchall()
        datetime = None
        Y = []
        legend = ["Date"]
        for index in range(len(datetimes)):
            entry = datetimes[index]
            algorithm_id = entry[1]
            if str(algorithm_id) not in legend:
                legend.append(str(algorithm_id))
            else:
                XFnY.append(legend)
                break
        for index in range(len(datetimes)):
            entry = datetimes[index]
            value = float(entry[2])
            if datetime != entry[0]:
                if len(Y):
                    XFnY.append(Y)
                datetime = entry[0]
                Y = [str(datetime)]
            Y.append(value)
        XFnY.append(Y)
        return {'graphdata': XFnY}

    if stat == "Attribution_rate":
        XFnY = []
        # ['Date', 'ClickThroughRate']
        datetimes = database_connection.session.execute(
            f"SELECT date_of, algorithm_id,parameter_value FROM statistics NATURAL JOIN dynamic_stepsize_var NATURAL "
            f"JOIN  algorithm WHERE abtest_id = {abtest_id} AND parameter_name = 'ATTR_RATE' ORDER BY date_of"
        ).fetchall()
        datetime = None
        Y = []
        legend = ["Date"]
        for index in range(len(datetimes)):
            entry = datetimes[index]
            algorithm_id = entry[1]
            if str(algorithm_id) not in legend:
                legend.append(str(algorithm_id))
            else:
                XFnY.append(legend)
                break
        for index in range(len(datetimes)):
            entry = datetimes[index]
            value = float(entry[2])
            if datetime != entry[0]:
                if len(Y):
                    XFnY.append(Y)
                datetime = entry[0]
                Y = [str(datetime)]
            Y.append(value)
        XFnY.append(Y)


# @ app.before_request
# @ cross_origin(supports_credentials=True)
# def before_request():
#     # global LoggedIn
#     # user_id = session.get("user_id")
#     # if LoggedIn and not user_id:
#     #     LoggedIn = False
#     #     return {"error": "Unauthorized"}, 401
#     # if LoggedIn and user_id:
#     session.permanent = True
#     app.permanent_session_lifetime = timedelta(minutes=1)
#     session.modified = True
#     return redirect(url_for('login_user1'))


@app.route("/api/register", methods=["POST"])
@cross_origin(supports_credentials=True)
def register_user():
    global LoggedIn
    firstname = request.json["firstname"]
    lastname = request.json["lastname"]
    birthdate = request.json["birthdate"]
    email = request.json["email"]
    username = request.json["username"]
    password = request.json["password"]

    user = database_connection.session.execute(
        "SELECT * FROM datascientist WHERE username = :username OR email_address = :email",
        {"username": username, "email": email}).fetchall()
    database_connection.session.commit()

    if user:
        return {"error": "User already exists"}, 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    database_connection.session.execute(
        "INSERT INTO datascientist("
        "first_name, last_name, birthdate, email_address, username, password) "
        "VALUES(:first_name, :last_name, :birthdate, :email_address, :username, :password)",
        {"first_name": firstname, "last_name": lastname, "birthdate": birthdate, "email_address": email,
         "username": username, "password": hashed_password})
    database_connection.session.commit()
    session["user_id"] = username

    session.permanent = True
    LoggedIn = True
    return {"username": username, "email": email}


@app.route("/api/login", methods=["POST"])
@cross_origin(supports_credentials=True)
def login_user1():
    global LoggedIn
    username = request.json["username"]
    password = request.json["password"]
    user = database_connection.session.execute(f"SELECT * FROM datascientist WHERE username = '{username}'").fetchone()
    database_connection.session.commit()
    if not user:
        return {"error": "Account Does Not Exist"}, 401

    if not bcrypt.check_password_hash(user.password, password):
        return {"error": "Wrong Password"}, 401
    admin = database_connection.session.execute("SELECT * FROM admin WHERE username = :username",
                                                {"username": username}).fetchone()

    session.permanent = True
    session["user_id"] = user.username
    LoggedIn = True
    return {"username": user.username, "email": user.email_address, "admin": admin is not None}


@app.route("/api/start_simulation", methods=["POST", "OPTIONS"])
@cross_origin(supports_credentials=True)
def start_simulation():
    start = request.json["start"]
    end = request.json["end"]
    topk = request.json["topk"]
    stepsize = request.json["stepsize"]
    dataset_name = request.json["dataset_name"]
    algorithms = request.json["algorithms"]

    # abtest_id = database_connection.session.execute("SELECT nextval('ab_test_abtest_id_seq')").fetchone()[0]

    database_connection.session.execute(
        'INSERT INTO "ab_test"('
        'start, "end", top_k, stepsize, dataset_name, created_by) '
        'VALUES(:start, :end, :top_k, :stepsize, :dataset_name, :created_by)',
        {"start": start, "end": end, "top_k": int(topk), "stepsize": int(stepsize), "dataset_name": dataset_name,
         "created_by": session["user_id"]})
    database_connection.session.commit()

    abtest_id = database_connection.session.execute(
        'SELECT max(abtest_id) FROM "ab_test"').fetchone()[0]
    database_connection.session.commit()

    for i in range(len(algorithms)):
        # algorithm_id = database_connection.session.execute("SELECT nextval(
        # 'algorithm_algorithm_id_seq')").fetchone()[0]
        database_connection.session.execute(
            "INSERT INTO algorithm(abtest_id, algorithm_name) VALUES(:abtest_id, :algorithm_name)",
            {"abtest_id": abtest_id, "algorithm_name": algorithms[i]["name"]})
        database_connection.session.commit()
        algorithm_id = database_connection.session.execute(
            'SELECT max(algorithm_id) FROM algorithm').fetchone()[0]
        database_connection.session.commit()
        algorithms[i]["id"] = algorithm_id
        for param, value in algorithms[i]["parameters"].items():
            database_connection.session.execute(
                "INSERT INTO parameter(parameter_name, algorithm_id, abtest_id, type, value) VALUES(:parametername, "
                ":algorithm_id, :abtest_id, :type, :value)",
                {"parametername": param, "algorithm_id": algorithm_id, "abtest_id": abtest_id, "type": "string",
                 "value": value})
        database_connection.session.commit()

    global exporting_threads
    exporting_threads[0] = ABTestSimulation(database_connection,
                                            {"abtest_id": abtest_id, "start": start, "end": end, "topk": topk,
                                             "stepsize": stepsize,
                                             "dataset_name": dataset_name, "algorithms": algorithms})
    exporting_threads[0].start()
    return "200"


@app.route("/api/upload_datasets", methods=["POST"])
@cross_origin(supports_credentials=True)
def uploadCSV():
    column_select_data = json.loads(request.form.get('data'))
    for uploaded_file in request.files.getlist('files'):
        filename = secure_filename(uploaded_file.filename)
        if filename != '':
            # check file extension
            file_ext = os.path.splitext(filename)[1]
            if file_ext not in app.config['UPLOAD_EXTENSIONS'] and file_ext != '.csv':
                flask.abort(400)

            # todo save file with userid
            # check if the upload directory exists
            if not os.path.exists(app.config['UPLOAD_PATH']):
                os.makedirs(app.config['UPLOAD_PATH'])
            # upload the file
            uploaded_file.save(os.path.join(app.config['UPLOAD_PATH'], filename))
    return "200"


@app.route("/api/get_datasets")
@cross_origin(supports_credentials=True)
def get_datasets():
    datasets = database_connection.session.execute(
        "SELECT * FROM dataset").fetchall()
    database_connection.session.commit()
    for i in range(len(datasets)):
        datasets[i] = str(datasets[i].name)
    return {"all_datasets": datasets}


@app.route("/api/logout")
@cross_origin(supports_credentials=True)
def logout_user():
    global LoggedIn
    if "user_id" in session:
        LoggedIn = False
        session.pop("user_id")
    return "200"


@app.route("/api/aaa", methods=["GET"])
def logIpAddress():
    Logger.log("User visited, IP: " +
               request.environ.get('HTTP_X_REAL_IP', request.remote_addr), True)
    return "200"


@app.teardown_appcontext
def shutdown_session(exception=None):
    database_connection.session.remove()


# RUN DEV SERVER
if __name__ == "__main__":
    app.run(debug=True)
