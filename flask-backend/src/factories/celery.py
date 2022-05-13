from celery import Celery
from celery.app.task import Task as CeleryTask
from flask import Flask

from src.extensions import celery_extension
from src.factories.appConfig import Config


def configure_celery(app: Flask) -> Celery:
    task_base: CeleryTask = celery_extension.Task

    class ContextTask(task_base):
        abstract = True

        def __call__(self, *args, **kwargs):
            with app.app_context():
                return task_base.__call__(self, *args, **kwargs)

    celery_extension.conf.update(
        broker_url=Config.CELERY_BROKER_URL,
        result_backend=Config.RESULT_BACKEND,
        result_extended=Config.RESULT_EXTENDED
    )
    celery_extension.Task = ContextTask

    return celery_extension
