from flask import Blueprint, session

from src.extensions import database_connection

api_abtest = Blueprint("api_abtest", __name__)


@api_abtest.route("/api/abtest/delete/<int:abtest_id>/", methods=["DELETE"])
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
