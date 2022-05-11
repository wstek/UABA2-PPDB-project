from time import sleep

from src.appVar import celery


@celery.task
def long_task(duration):
    sleep(duration)
    return f"slept {duration} seconds"
