from flask import Blueprint, request, session

from src.extensions import bcrypt_extension
from src.extensions import database_connection
from src.utils.Logger import Logger

api_account = Blueprint("api_account", __name__)


@api_account.route("/api/me", methods=['GET'])
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
    return {"username": user.username, "first_name": user.first_name, "last_name": user.last_name,
            "email": user.email_address, 'admin': admin is not None}


@api_account.route("/api/register", methods=["POST"])
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

    hashed_password = bcrypt_extension.generate_password_hash(password).decode('utf-8')
    database_connection.session.execute(
        "INSERT INTO datascientist("
        "first_name, last_name, birthdate, email_address, username, password) "
        "VALUES(:first_name, :last_name, :birthdate, :email_address, :username, :password)",
        {"first_name": firstname, "last_name": lastname, "birthdate": birthdate, "email_address": email,
         "username": username, "password": hashed_password})
    database_connection.session.commit()
    session["user_id"] = username
    return {"username": username, "email": email}


@api_account.route("/api/make_admin")
def make_admin():
    try:
        username = session.get("user_id")
        database_connection.makeAdmin(username)
        return 'Success'
    except:
        return 'Failure'


@api_account.route("/api/login", methods=["POST"])
def login_user1():
    username = request.json["username"]
    password = request.json["password"]
    user = database_connection.session.execute(
        f"SELECT * FROM datascientist WHERE username = '{username}'").fetchone()
    database_connection.session.commit()
    if not user:
        return {"error": "Account Does Not Exist"}, 401

    if not bcrypt_extension.check_password_hash(user.password, password):
        return {"error": "Wrong Password"}, 401
    admin = database_connection.session.execute("SELECT * FROM admin WHERE username = :username",
                                                {"username": username}).fetchone()

    session["user_id"] = user.username
    return {"username": user.username, "first_name": user.first_name, "last_name": user.last_name,
            "email": user.email_address, 'admin': admin is not None}


@api_account.route("/api/logout")
def logout_user():
    if "user_id" in session:
        session.pop("user_id")
    return "200"


@api_account.route("/api/account/changeinfo/<stat>/<username>", methods=["POST", "OPTIONS"])
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


@api_account.route("/api/aaa", methods=["GET"])
def logIpAddress():
    Logger.log("User visited, IP: " + request.environ.get('HTTP_X_REAL_IP', request.remote_addr), True)
    return "200"
