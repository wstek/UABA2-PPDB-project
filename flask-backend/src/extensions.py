from celery import Celery
from flask_bcrypt import Bcrypt
from flask_session import Session
from flask_socketio import SocketIO
import redis

from src.DatabaseConnection.DatabaseConnection import DatabaseConnection
from src.socketioEvents.Events import Events

database_connection: DatabaseConnection = DatabaseConnection()

bcrypt_extension = Bcrypt()

session_extension = Session()

redis_extension = redis.StrictRedis(charset="utf-8", decode_responses=True)

socketio_extension = SocketIO(path="/api/socket.io", cors_allowed_origins='*')
socketio_extension.on_namespace(Events("/"))

celery_extension = Celery("worker", include=["src.celeryTasks.tasks"])
