from celery import Celery
from flask_bcrypt import Bcrypt
from flask_session import Session

from src.DatabaseConnection.DatabaseConnection import DatabaseConnection

database_connection: DatabaseConnection = DatabaseConnection()

flask_bcrypt = Bcrypt()

flask_session = Session()

celery_extension = Celery("worker", include=["src.celeryTasks.tasks"])
