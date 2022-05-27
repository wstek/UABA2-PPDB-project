from flask import session
from flask_socketio import emit, Namespace

from src.utils.Logger import Logger


class Events(Namespace):
    def on_connect(self):
        Logger.log(f"user {session['user_id']} connected")
        # debug
        emit("server_response", {"data": "connected"})

    def on_disconnect(self):
        Logger.log(f"user {session['user_id']} disconnected")

    def on_client_event(self, message):
        Logger.log("client message: " + message["data"])
        # debug
        emit("server_response", {"data": message["data"]})
