from crypt import methods
from flask import Flask, request, session, render_template
from database_access import Database
from flask_session import Session
from flask_bcrypt import Bcrypt
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta
import base64
import redis

app = Flask(__name__)
app.config['SECRET_KEY'] = "changeme"
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
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
db_engine = Database()
db_engine.connect(filename="config/database.ini")
db_engine.logVersion()
cors = CORS(app, supports_credentials=True, resources={'/*': {'origins': 'http://localhost:3000'}})

ab_test_id = 0


# @app.route("/")
# @cross_origin(supports_credentials=True)
# def index():
#     render_template('../react-frontend/build/index.html')


@app.route("/api/me", methods=['GET'])
@cross_origin(supports_credentials=True)
def get_current_user():
    print('hello')
    user_id = session.get("user_id")
    print(2, user_id)

    if not user_id:
        return {"error": "Unauthorized"}, 401

    user = db_engine.session.execute("SELECT * FROM datascientist WHERE username = :username",
                                      {"username": user_id}).fetchone()

    return {"username": user.username, "email": user.email_address}


@app.route("/api/register", methods=["POST"])
@cross_origin(supports_credentials=True)
def register_user():
    firstname = request.json["firstname"]
    lastname = request.json["lastname"]
    birthdate = request.json["birthdate"]
    email = request.json["email"]
    username = request.json["username"]
    password = request.json["password"]
    user = db_engine.session.execute(
        "SELECT * FROM datascientist WHERE username = :username OR email_address = :email",
        {"username": username, "email": email}).fetchall()
    if user:
        return {"error": "User already exists"}, 409
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    db_engine.session.execute(
        "INSERT INTO datascientist(first_name, last_name, birthdate, email_address, username, password) VALUES(:first_name, :last_name, :birthdate, :email_address, :username, :password)",
        {"first_name": firstname, "last_name": lastname, "birthdate": birthdate, "email_address": email,
         "username": username, "password": hashed_password})
    db_engine.session.commit()
    session["user_id"] = username
    return {"username": username, "email": email}


@app.route("/api/login", methods=["POST"])
@cross_origin(supports_credentials=True)
def login_user():
    username = request.json["username"]
    password = request.json["password"]
    user = db_engine.session.execute("SELECT * FROM datascientist WHERE username = :username",
                                      {"username": username}).fetchone()
    if not user:
        return {"error": "Unauthorized"}, 401

    if not bcrypt.check_password_hash(user.password, password):
        return {"error": "Unauthorized"}, 401

    # session.permanent = True
    session["user_id"] = user.username

    return {"username": user.username, "email": user.email_address}

@app.route("/api/abtest_setup", methods=["POST", "OPTIONS"])
@cross_origin(supports_credentials=True)
def abtest_setup():
    abtest_id = ab_test_id #HARDCODED FOR NOW
    start = request.json["start"]
    end = request.json["end"]
    topk = request.json["topk"]
    stepsize = request.json["stepsize"]
    algorithms_parameters = request.json["algorithms_parameters"]

    db_engine.session.execute("INSERT INTO ABTest(abtest_id, start, end, top_k, stepsize, dataset_name, created_by) VALUES(:abtest_id, :start, :end, :top_k, :stepsize, :dataset_name, :created_by)",
    {"abtest_id":abtest_id, "start":start, "end":end, "top_k":topk, "stepsize": stepsize, "dataset_name":"mohammed", "created_by":session["user_id"]})
    ab_test_id += 1
    return "200"

@app.route("/api/read_cvs", methods=["POST"])
@cross_origin(supports_credentials=True)
def read_cvs():
    datasets = request.json
    for i in range(len(datasets)):
        base64_message = base64.b64decode(datasets[i]['file']).decode('utf-8').rstrip()
        # print(base64_message)
    return "200"

@app.route("/api/logout")
@cross_origin(supports_credentials=True)
def logout_user():
    if "user_id" in session:
        session.pop("user_id")
    return "200"


# RUN DEV SERVER
if __name__ == "__main__":
    app.run(debug=True)
