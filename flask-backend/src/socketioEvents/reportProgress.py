from src.extensions import socketio_extension, redis_extension
from src.utils.Logger import Logger
from time import sleep

# todo: case when progress close to 100


def report_progress_steps(task_id: str, done: int, total_to_be_done: int):
    report_progress_percentage(task_id, done / total_to_be_done * 100)


def report_progress_percentage(task_id: str, percentage):
    if percentage > 100:
        percentage = 100

    channel = f"task:{task_id}:progress"

    socketio_extension.emit(channel, percentage)
    redis_extension.set(task_id, percentage, ex=10800)    # expires in 3 hours

    # Logger.log(channel + " " + str(percentage))

    # buffer to let the client know that task has finished (e.g. page reload)
    if percentage == 100:
        sleep(3)
        socketio_extension.emit(channel, percentage)
