import os
import sys

# appends parent directory to the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from celery import Celery
from src.appConfig import Config

app = Celery("src.celeryTasks", broker=Config.CELERY_BROKER_URL, result_backend=Config.RESULT_BACKEND,
             result_extended=Config.RESULT_EXTENDED, include=["src.celeryTasks.tasks"])

from src.app import create_app
flask_instance = create_app(Config)

if __name__ == "__main__":
    app.start()
