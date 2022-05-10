from flask import Blueprint, request

from src.utils.Logger import Logger

account_blueprint = Blueprint("account", __name__)


@account_blueprint.route("/api/aaa", methods=["GET"])
def logIpAddress():
    Logger.log("User visited, IP: " +
               request.environ.get('HTTP_X_REAL_IP', request.remote_addr), True)
    return "200"
