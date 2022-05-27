import os
import sys

from flask import Flask

# appends parent directory to the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.factories.appConfig import Config
from src.extensions import database_connection
from src.extensions import bcrypt_extension
from src.extensions import session_extension
from src.extensions import socketio_extension
from src.utils.pathParser import getAbsPathFromProjectRoot

from src.api.apiABTest import api_abtest
from src.api.apiAccount import api_account
from src.api.apiDataset import api_dataset
from src.api.apiSimulation import api_simulation
from src.api.apiStatistics import api_statistics
from src.api.apiTask import api_task


def create_app() -> Flask:
    flask_app = Flask(__name__)
    flask_app.config.from_object(Config)

    # connect to database
    database_connection.connect(filename=getAbsPathFromProjectRoot("config-files/database.ini"))

    # initialize extensions
    bcrypt_extension.init_app(flask_app)
    session_extension.init_app(flask_app)
    socketio_extension.init_app(flask_app, message_queue=Config.REDIS_URL)

    # api blueprints
    flask_app.register_blueprint(api_account)
    flask_app.register_blueprint(api_dataset)
    flask_app.register_blueprint(api_abtest)
    flask_app.register_blueprint(api_simulation)
    flask_app.register_blueprint(api_statistics)
    flask_app.register_blueprint(api_task)

    @flask_app.teardown_appcontext
    def shutdown_session(exception=None):
        database_connection.session.remove()

    return flask_app
