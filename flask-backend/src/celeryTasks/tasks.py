from time import sleep
from typing import Dict

from celery.exceptions import SoftTimeLimitExceeded
from flask_sse import sse

from src.ABTestSimulation.ABTestSimulation import ABTestSimulation
from src.DatabaseConnection.InsertDataset import InsertDataset
from src.extensions import celery_extension, database_connection
from src.utils.Logger import Logger


@celery_extension.task(name="dummy_task")
def dummy_task(user_id: str, duration: int):
    sleep(duration)
    message = f"slept {duration} seconds"
    Logger.log(message)

    sse.publish("Hello world!", type='tasktest')

    return message


@celery_extension.task(name="insert_dataset")
def insert_dataset(user_id: str, filenames: Dict[str, str], column_select_data: dict):
    print(user_id, filenames, column_select_data)
    insert_dataset_obj = InsertDataset(database_connection, user_id, filenames, column_select_data)

    try:
        insert_dataset_obj.startInsert()
    except SoftTimeLimitExceeded:
        insert_dataset_obj.abort()
    finally:
        insert_dataset_obj.cleanup()

    return "inserted dataset"


@celery_extension.task(name="start_simulation")
def start_simulation(user_id: str, simulation_input: dict):
    simulation = ABTestSimulation(database_connection, sse, simulation_input)
    simulation.run()

    return "finished simulation"
