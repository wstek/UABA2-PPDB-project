import json
import os
import threading
from datetime import timedelta

import flask
import redis
from flask import Flask, request, session
from flask_bcrypt import Bcrypt
from flask_cors import cross_origin
from flask_session import Session
from flask_sse import sse
from werkzeug.utils import secure_filename

from ABTestSimulation import ABTestSimulation, remove_tuples
from DatabaseConnection import DatabaseConnection
from Logger import Logger

app = Flask(__name__)
app.config['SECRET_KEY'] = "changeme"
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_PERMANENT'] = True
app.config['SESSION_REDIS'] = redis.from_url('redis://localhost:6379')
app.config["SESSION_COOKIE_SECURE"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=60)

# server side events
app.config["REDIS_URL"] = "redis://localhost:6379"
app.register_blueprint(sse, url_prefix='/api/stream')

# 2 gigabyte file upload limit
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 2000
app.config['UPLOAD_EXTENSIONS'] = ['.csv']
app.config['UPLOAD_PATH'] = '../uploaded-files'

bcrypt = Bcrypt(app)
server_session = Session(app)
database_connection: DatabaseConnection = DatabaseConnection()
database_connection.connect(filename="config/database.ini")
database_connection.logVersion()

lock = threading.Lock()

thread_per_user = {}


@app.route("/api/progress", methods=['GET'])
def get_data():
    if session["user_id"] in thread_per_user:
        return {'start': thread_per_user[session["user_id"]].prev_progress,
                'end': thread_per_user[session["user_id"]].current_progress, 'started': True}
    else:
        return {'start': 0, 'end': 0, 'started': False}


# account
@app.route("/api/me", methods=['GET'])
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


@app.route("/api/register", methods=["POST"])
def register_user():
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
    return {"username": username, "email": email}


@app.route("/api/login", methods=["POST"])
def login_user1():
    username = request.json["username"]
    password = request.json["password"]
    user = database_connection.session.execute(
        f"SELECT * FROM datascientist WHERE username = '{username}'").fetchone()
    database_connection.session.commit()
    if not user:
        return {"error": "Account Does Not Exist"}, 401

    if not bcrypt.check_password_hash(user.password, password):
        return {"error": "Wrong Password"}, 401
    admin = database_connection.session.execute("SELECT * FROM admin WHERE username = :username",
                                                {"username": username}).fetchone()

    session["user_id"] = user.username
    return {"username": user.username, "email": user.email_address, "admin": admin is not None}


@app.route("/account/changeinfo/<stat>/<username>", methods=["POST", "OPTIONS"])
def change_info(stat, username):
    if stat == "first_name":
        firstname = request.json["changedFirstName"]
        database_connection.session.execute(
            f"UPDATE datascientist  SET first_name = '{firstname}' WHERE username = '{username}'")
        database_connection.session.commit()
    if stat == "last_name":
        lastname = request.json["changedLastName"]
        database_connection.session.execute(
            f"UPDATE datascientist SET last_name = '{lastname}' WHERE username = '{username}' ")
        database_connection.session.commit()

    if stat == "email":
        email = request.json["changedEmail"]
        database_connection.session.execute(
            f"UPDATE datascientist SET email_address = '{email}' WHERE username = '{username}'")
        database_connection.session.commit()
    return {"succes": "succes"}


@app.route("/api/aaa", methods=["GET"])
def logIpAddress():
    Logger.log("User visited, IP: " +
               request.environ.get('HTTP_X_REAL_IP', request.remote_addr), True)
    return "200"


# dataset
@app.route("/api/upload_datasets", methods=["POST"])
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
            uploaded_file.save(os.path.join(
                app.config['UPLOAD_PATH'], filename))

    return "200"


@app.route("/api/get_datasets")
def get_datasets():
    datasets = database_connection.session.execute(
        "SELECT * FROM dataset").fetchall()
    database_connection.session.commit()
    for i in range(len(datasets)):
        datasets[i] = str(datasets[i].name)
    return {"all_datasets": datasets}


# abtest
@app.route("/api/abtest/delete/<int:abtest_id>/", methods=["DELETE"])
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


# simulation
@app.route("/api/start_simulation", methods=["POST", "OPTIONS"])
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
        'start_date, "end_date", top_k, stepsize, dataset_name, created_by) '
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
    with lock:
        thread_per_user[session["user_id"]] = ABTestSimulation(database_connection, sse, app,
                                                               {"abtest_id": abtest_id, "start": start, "end": end,
                                                                "topk": topk,
                                                                "stepsize": stepsize,
                                                                "dataset_name": dataset_name, "algorithms": algorithms})
    thread_per_user[session["user_id"]].start()
    return "200"


# statistics
@app.route("/api/abtest/statistics/")
def get_personal_abtestids():
    username = session.get("user_id")

    if not username:
        return {"error": "unauthorized"}, 401

    personal_abtestids = database_connection.session.execute(
        f"select abtest_id from ab_test where created_by = '{username}';").fetchall()
    personal_abtestids = [r[0] for r in personal_abtestids]
    return {"personal_abtestids": personal_abtestids}


@app.route("/api/users/<int:abtest_id>", methods=['GET'])
def get_users(abtest_id):
    users = database_connection.session.execute(
        f"SELECT customer_id FROM customer NATURAL JOIN ab_test WHERE abtest_id= '{abtest_id}'").fetchall()
    for u in range(len(users)):
        users[u] = users[u][0]
    return {"userlist": users}


@app.route("/api/abtest/statistics/<int:customer_id>/<int:selected_abtest>")
def get_user_attributes(customer_id, selected_abtest):
    attr = database_connection.session.execute(
        f"select attribute_name, attribute_value from  customer_attribute natural join  ab_test where customer_id = '{customer_id}'and abtest_id = '{selected_abtest}';").fetchall()
    response = dict()
    for r in attr:
        response[r[0]] = r[1]

    return response


@app.route("/api/abtest/statistics/<int:abtest_id>/<stat>")
def get_stat(abtest_id, stat):
    username = session.get("user_id")

    if not username:
        return {"error": "unauthorized"}, 401

    if stat == "ABTest_information":
        result = database_connection.session.execute(
            f"select start_date, end_date, stepsize,top_k,dataset_name,created_on from ab_test where abtest_id = {abtest_id};").fetchall()
        start_date = result[0][0]
        end_date = result[0][1]
        stepsize = result[0][2]
        top_k = result[0][3]
        dataset_name = result[0][4]
        created_on = result[0][5]
        returnvalue = {'dates': [], 'start_date': start_date, 'end_date': end_date, 'top-k': top_k,
                       'dataset-name': dataset_name, 'created-on': created_on}

        for n in range(int((end_date - start_date).days)):
            date = (start_date + timedelta(stepsize * n))

            returnvalue['dates'].append(date)
        return returnvalue

    if stat == "algorithm_information":
        algorithm_id: int
        algorithm_name: str
        parametername: str
        parametervalue: any

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

    if stat == "AttrRate_over_time":
        XFnY = []
        # ['Date', 'ClickThroughRate']
        datetimes = database_connection.session.execute(
            f"SELECT date_of, algorithm_id,parameter_value FROM statistics NATURAL JOIN dynamic_stepsize_var NATURAL "
            f"JOIN  algorithm WHERE abtest_id = {abtest_id} AND parameter_name = 'ATTR_RATE' ORDER BY date_of").fetchall()
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


@app.route("/api/logout")
@cross_origin(supports_credentials=True)
def logout_user():
    if "user_id" in session:
        if session["user_id"] in thread_per_user:
            thread_per_user[session["user_id"]].join()
            with lock:
                thread_per_user.pop(session["user_id"])
        session.pop("user_id")
    return "200"


@app.teardown_appcontext
def shutdown_session(exception=None):
    database_connection.session.remove()


# RUN DEV SERVER
if __name__ == "__main__":
    app.run(debug=True)
