from time import sleep

from flask_sse import sse

from src.celeryTasks.celery import app as celery_app
from src.utils.Logger import Logger


@celery_app.task(name="dummy_task")
def dummy_task(duration):
    sleep(duration)
    message = f"slept {duration} seconds"
    Logger.log(message)
    # sse.publish({"message": "Hello!"}, type='tasttest')

    from src.celeryTasks.celery import flask_instance
    with flask_instance.app_context():
        sse.publish(
            "hello", type='tasttest')

    return message
