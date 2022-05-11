import os
import sys

# appends parent directory to the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from celery import Celery
from src.appConfig import Config
from time import sleep
from src.utils.Logger import Logger

# celery
celery = Celery(__name__, broker=Config.CELERY_BROKER_URL, result_backend=Config.RESULT_BACKEND)


@celery.task
def long_task(duration):
    sleep(duration)
    message = f"slept {duration} seconds"
    Logger.log(message)
    return message


if __name__ == '__main__':
    celery.start()
