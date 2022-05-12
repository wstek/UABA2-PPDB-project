import os
import sys

from flask_bcrypt import Bcrypt
from flask_session import Session
from celery import Celery

# appends parent directory to the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.DatabaseConnection.DatabaseConnection import DatabaseConnection

# database
database_connection: DatabaseConnection = DatabaseConnection()

# bcrypt
flask_bcrypt = Bcrypt()

# session
flask_session = Session()

# celery
celery_extension = Celery("worker", include=["src.celeryTasks.tasks"])
