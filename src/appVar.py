import os
import sys

# from celery import Celery
from flask_bcrypt import Bcrypt
from flask_session import Session

# appends parent directory to the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.DatabaseConnection.DatabaseConnection import DatabaseConnection
# from src.appConfig import Config
from src.utils.pathParser import getAbsPathFromRelSrc

# database
database_connection: DatabaseConnection = DatabaseConnection()
database_connection.connect(filename=getAbsPathFromRelSrc("config/database.ini"))
database_connection.logVersion()

# bcrypt
flask_bcrypt = Bcrypt()

# session
flask_session = Session()

# # celery
# celery = Celery(__name__, broker=Config.CELERY_BROKER_URL, result_backend=Config.RESULT_BACKEND)
