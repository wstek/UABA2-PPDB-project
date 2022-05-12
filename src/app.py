import os
import sys

from flask import Flask
from flask_sse import sse

# appends parent directory to the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.appConfig import Config
from src.celeryTasks.celery import app as celery_app
from src.appVar import database_connection
from src.appVar import flask_bcrypt
from src.appVar import flask_session


def create_app(config):
    flask_app = Flask(__name__)
    flask_app.config.from_object(config)

    # bcrypt
    flask_bcrypt.init_app(flask_app)

    # sessions
    flask_session.init_app(flask_app)

    # server side events
    flask_app.register_blueprint(sse, url_prefix='/api/stream')

    # celery
    celery_app.conf.update(flask_app.config)

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


# RUN DEV SERVER
if __name__ == "__main__":
    app = create_app(Config)
    app.run(debug=True)
