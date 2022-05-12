import os
import sys

from flask import Flask
from flask_sse import sse

# appends parent directory to the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.factories.appConfig import Config
from src.extensions import database_connection
from src.extensions import flask_bcrypt
from src.extensions import flask_session
from src.utils.pathParser import getAbsPathFromRelSrc


def create_app() -> Flask:
    flask_app = Flask(__name__)
    flask_app.config.from_object(Config)

    # databse
    database_connection.connect(filename=getAbsPathFromRelSrc("configFiles/database.ini"))

    # bcrypt
    flask_bcrypt.init_app(flask_app)

    # sessions
    flask_session.init_app(flask_app)

    # server side events
    flask_app.register_blueprint(sse, url_prefix='/api/stream')

    # api blueprints
    from src.api.apiABTest import api_abtest
    from src.api.apiAccount import api_account
    from src.api.apiDataset import api_dataset
    from src.api.apiSimulation import api_simulation
    from src.api.apiStatistics import api_statistics
    from src.api.apiTask import api_task

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
