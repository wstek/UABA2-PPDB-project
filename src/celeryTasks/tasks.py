import os
import sys
from time import sleep

# appends parent directory to the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.utils.Logger import Logger

from celery import Celery
from src.appConfig import Config

# celery
celery = Celery(__name__, broker=Config.CELERY_BROKER_URL, result_backend=Config.RESULT_BACKEND)


@celery.task
def long_task(duration):
    sleep(duration)
    message = f"slept {duration} seconds"
    Logger.log(message)
    return message
