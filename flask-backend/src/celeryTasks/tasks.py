from time import sleep

from flask_sse import sse

from src.extensions import celery_extension, database_connection

from src.utils.Logger import Logger
from src.ABTestSimulation.ABTestSimulation import ABTestSimulation


@celery_extension.task(name="dummy_task")
def dummy_task(user_id: str, duration: int):
    sleep(duration)
    message = f"slept {duration} seconds"
    Logger.log(message)
    Logger.log(user_id)

    sse.publish("Hello world!", type='tasktest')

    return message


@celery_extension.task(name="start_simulation")
def start_simulation(user_id: str, simulation_input: dict):

    simulation = ABTestSimulation(database_connection, sse, simulation_input)
    simulation.run()

    return "finished simulation"
