from flask_bcrypt import Bcrypt
from flask_session import Session

from src.DatabaseConnection.DatabaseConnection import DatabaseConnection
from src.utils.pathParser import getAbsPathFromRelSrc

# database
database_connection: DatabaseConnection = DatabaseConnection()
database_connection.connect(filename=getAbsPathFromRelSrc("config/database.ini"))
database_connection.logVersion()

# bcrypt
flask_bcrypt = Bcrypt()

# session
flask_session = Session()
