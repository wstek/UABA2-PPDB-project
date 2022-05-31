from flask import Blueprint, session
from sqlalchemy import exc

from src.extensions import database_connection

api_abtest = Blueprint("api_abtest", __name__)


@api_abtest.route("/api/abtest/<int:abtest_id>/delete/", methods=["DELETE"])
def del_abtest(abtest_id):
    username = session.get("user_id")
    if not username:
        return {"error": "unauthorized"}, 401
    try:
        database_connection.session.execute(
            f"delete from ab_test where created_by = '{username}' and abtest_id = '{abtest_id}';")
        database_connection.session.commit()
    except exc.SQLAlchemyError:
        database_connection.session.rollback()
    return "200"
