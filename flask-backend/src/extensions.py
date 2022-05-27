from celery import Celery
from flask_bcrypt import Bcrypt
from flask_session import Session
from flask_socketio import SocketIO

from src.DatabaseConnection.DatabaseConnection import DatabaseConnection
from src.socketioEvents.Events import Events

database_connection: DatabaseConnection = DatabaseConnection()

bcrypt_extension = Bcrypt()

session_extension = Session()

socketio_extension = SocketIO(path="/api/socket.io", cors_allowed_origins='*')
socketio_extension.on_namespace(Events("/"))

celery_extension = Celery("worker", include=["src.celeryTasks.tasks"])
