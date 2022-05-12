from time import sleep

from flask_sse import sse

from src.extensions import celery_extension
from src.utils.Logger import Logger


@celery_extension.task(name="dummy_task")
def dummy_task(duration):
    sleep(duration)
    message = f"slept {duration} seconds"
    Logger.log(message)

    sse.publish("Hello world!", type='tasttest')

    return message
