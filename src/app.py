import base64
from distutils.log import Log
from glob import glob
import redis
from flask import Flask, request, session, redirect, url_for
from flask_bcrypt import Bcrypt
from flask_cors import CORS, cross_origin
from flask_session import Session
from Logger import Logger
from DatabaseConnection import DatabaseConnection
from ABTestSimulation import ABTestSimulation
from datetime import timedelta

app = Flask(__name__)
app.config['SECRET_KEY'] = "changeme"
app.config['SESSION_TYPE'] = 'redis'
# app.config['SESSION_PERMANENT'] = False
# app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_REDIS'] = redis.from_url('redis://localhost:6379')
app.config["SESSION_COOKIE_SECURE"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "None"
# app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=1)
# app.config['SESSION_MODIFIED'] = True
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# app.config['SQLALCHEMY_ECHO'] = True
# app.config['SESSION_PERMANENT'] = False
# app.config['SESSION_USE_SIGNER'] = True

bcrypt = Bcrypt(app)
server_session = Session(app)
database_connection = DatabaseConnection()
database_connection.connect(filename="config/database.ini")
database_connection.logVersion()
cors = CORS(app, supports_credentials=True, resources={
            '/*': {'origins': 'http://localhost:3000'}})  # https://team6.ua-ppdb.me/

exporting_threads = {}
LoggedIn = False


@app.route("/api/me", methods=['GET'])
@cross_origin(supports_credentials=True)
def get_current_user():

    user_id = session.get("user_id")

    if not user_id:
        return {"error": "Unauthorized"}, 401

    user = database_connection.session.execute("SELECT * FROM datascientist WHERE username = :username",
                                               {"username": user_id}).fetchone()
    admin = database_connection.session.execute("SELECT * FROM admin WHERE username = :username",
                                                {"username": user_id}).fetchone()
    returnValue = {"username": user.username,
                   "email": user.email_address, 'admin': admin is not None}
    return returnValue


# @app.before_request
# @cross_origin(supports_credentials=True)
# def before_request():
#     global LoggedIn
#     user_id = session.get("user_id")
#     if LoggedIn and not user_id:
#         LoggedIn = False
#         return {"error": "Unauthorized"}, 401
#     if LoggedIn and user_id:
#         session.permanent = True
#         app.permanent_session_lifetime = timedelta(minutes=1)
#         session.modified = True

@ app.route("/api/register", methods=["POST"])
@ cross_origin(supports_credentials=True)
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


@ app.route("/api/login", methods=["POST"])
@ cross_origin(supports_credentials=True)
def login_user1():
    global LoggedIn
    username = request.json["username"]
    password = request.json["password"]
    user = database_connection.session.execute("SELECT * FROM datascientist WHERE username = :username",
                                               {"username": username}).fetchone()
    if not user:
        return {"error": "Unauthorized"}, 401

    if not bcrypt.check_password_hash(user.password, password):
        return {"error": "Unauthorized"}, 401

    session.permanent = True
    session["user_id"] = user.username
    LoggedIn = True
    return {"username": user.username, "email": user.email_address}


@ app.route("/api/start_simulation", methods=["POST", "OPTIONS"])
@ cross_origin(supports_credentials=True)
def start_simulation():
    start = request.json["start"]
    end = request.json["end"]
    topk = request.json["topk"]
    stepsize = request.json["stepsize"]
    dataset_name = request.json["dataset_name"]
    algorithms = request.json["algorithms"]

    # abtest_id = database_connection.session.execute("SELECT nextval('ABTest_abtest_id_seq')").fetchone()[0]

    database_connection.session.execute(
        'INSERT INTO "ABTest"('
        'start, "end", top_k, stepsize, dataset_name, created_by) '
        'VALUES(:start, :end, :top_k, :stepsize, :dataset_name, :created_by)',
        {"start": start, "end": end, "top_k": int(topk), "stepsize": int(stepsize), "dataset_name": dataset_name,
         "created_by": session["user_id"]})
    database_connection.session.commit()

    abtest_id = database_connection.session.execute(
        'SELECT max(abtest_id) FROM "ABTest"').fetchone()[0]

    for i in range(len(algorithms)):
        # algorithm_id = database_connection.session.execute("SELECT nextval(
        # 'algorithm_algorithm_id_seq')").fetchone()[0]
        database_connection.session.execute(
            "INSERT INTO algorithm(abtest_id, algorithm_name) VALUES(:abtest_id, :algorithm_name)",
            {"abtest_id": abtest_id, "algorithm_name": algorithms[i]["name"]})
        database_connection.session.commit()
        algorithm_id = database_connection.session.execute(
            'SELECT max(algorithm_id) FROM algorithm').fetchone()[0]
        algorithms[i]["id"] = algorithm_id
        for param, value in algorithms[i]["parameters"].items():
            database_connection.session.execute(
                "INSERT INTO parameter("
                "parametername, algorithm_id, abtest_id, type, value) "
                "VALUES(:parametername, :algorithm_id, :abtest_id, :type, :value)",
                {"parametername": param, "algorithm_id": algorithm_id, "abtest_id": abtest_id, "type": "string", "value": value})

    global exporting_threads
    exporting_threads[0] = ABTestSimulation(database_connection,
                                            {"abtest_id": abtest_id, "start": start, "end": end, "topk": topk, "stepsize": stepsize,
                                             "dataset_name": dataset_name, "algorithms": algorithms})
    exporting_threads[0].start()
    return "200"


@ app.route("/api/read_csv", methods=["POST"])
@ cross_origin(supports_credentials=True)
def read_csv():
    datasets = request.json
    for i in range(len(datasets)):
        base64_message = base64.b64decode(
            datasets[i]['file']).decode('utf-8').rstrip()
        print(base64_message)
    return "200"


@ app.route("/api/get_datasets")
@ cross_origin(supports_credentials=True)
def get_datasets():
    datasets = database_connection.session.execute(
        "SELECT * FROM dataset").fetchall()
    for i in range(len(datasets)):
        datasets[i] = str(datasets[i].name)
    return {"all_datasets": datasets}


@ app.route("/api/logout")
@ cross_origin(supports_credentials=True)
def logout_user():
    global LoggedIn
    if "user_id" in session:
        LoggedIn = False
        session.pop("user_id")
    return "200"


@ app.route("/api/aaa", methods=["GET"])
def logIpAddress():
    Logger.log("User visited, IP: " +
               request.environ.get('HTTP_X_REAL_IP', request.remote_addr), True)
    return "200"


# RUN DEV SERVER
if __name__ == "__main__":
    app.run(debug=True)
