from time import sleep

from src.celeryTasks.celery import celery
from src.utils.Logger import Logger


@celery.task
def long_task(duration):
    sleep(duration)
    message = f"slept {duration} seconds"
    Logger.log(message)
    return message
