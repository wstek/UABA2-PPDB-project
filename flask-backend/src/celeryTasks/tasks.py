from time import sleep
from typing import Dict

from celery.exceptions import SoftTimeLimitExceeded

from src.ABTestSimulation.ABTestSimulation import ABTestSimulation
from src.DatabaseConnection.InsertDataset import InsertDataset
from src.extensions import celery_extension, database_connection
from src.socketioEvents.reportProgress import report_progress_steps, report_error_message
from src.utils.Logger import Logger


def dummy_task_func(duration, task_id=""):
    report_progress_steps(task_id, 0, duration)

    for i in range(duration):
        sleep(1)

        report_progress_steps(task_id, i + 1, duration)


@celery_extension.task(name="dummy_task", bind=True)
def dummy_task(self, duration: int, user_id: str = "", meta=""):

    try:
        dummy_task_func(duration, self.request.id)
    except SoftTimeLimitExceeded:
        return "aborted"

    return f"slept {duration} seconds"


@celery_extension.task(name="dummy_insert_dataset", bind=True)
def dummy_task2(self, duration: int, user_id: str = "", meta=""):

    try:
        dummy_task_func(duration, self.request.id)
    except SoftTimeLimitExceeded:
        return "aborted"

    return f"slept {duration} seconds"


@celery_extension.task(name="dummy_simulation", bind=True)
def dummy_task3(self, duration: int, user_id: str = "", meta=""):

    try:
        dummy_task_func(duration, self.request.id)
    except SoftTimeLimitExceeded:
        return "aborted"

    return f"slept {duration} seconds"


@celery_extension.task(name="insert_dataset", bind=True)
def insert_dataset(self, filenames: Dict[str, str], column_select_data: dict, user_id: str = "", meta=""):
    insert_dataset_obj = InsertDataset(database_connection, user_id, filenames, column_select_data, self.request.id)

    try:
        insert_dataset_obj.start_insert()

    except SoftTimeLimitExceeded:
        insert_dataset_obj.abort()
        Logger.log("aborted task")

    except ValueError as err:
        insert_dataset_obj.abort()
        Logger.logError(str(err))
        report_error_message(self.request.id, f"Could not insert {column_select_data['dataset_name']}: \"{str(err)}\"")

    except Exception as err:
        insert_dataset_obj.abort()
        Logger.logError(str(err))
        report_error_message(self.request.id, f"Could not insert {column_select_data['dataset_name']}")

    finally:
        insert_dataset_obj.cleanup()

    return "started dataset insert"


@celery_extension.task(name="start_simulation", bind=True)
def start_simulation(self, simulation_input: dict, user_id: str = "", meta=""):
    simulation = ABTestSimulation(database_connection, simulation_input, task_id=self.request.id)
    simulation.run()

    return "started simulation"
