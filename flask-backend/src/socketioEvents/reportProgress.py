from src.extensions import socketio_extension, redis_extension
from time import sleep


def report_progress_steps(task_id: str, done: int, total_to_be_done: int):
    report_progress_percentage(task_id, done / total_to_be_done * 100)


def report_progress_percentage(task_id: str, percentage):
    if percentage > 100:
        percentage = 100

    channel = f"task:{task_id}:progress"

    socketio_extension.emit(channel, percentage)
    redis_extension.set(channel, percentage, ex=10800)    # expires in 3 hours

    # buffer to let the client know that task has finished (e.g. page reload)
    if percentage == 100:
        sleep(3)
        socketio_extension.emit(channel, percentage)


def report_progress_message(task_id: str, message: str):
    channel = f"task:{task_id}:progress_message"
    socketio_extension.emit(channel, message)
    redis_extension.set(channel, message, ex=10800)  # expires in 3 hours


def report_error_message(task_id: str, message: str):
    socketio_extension.emit(f"task:{task_id}:error_message", message)
    sleep(3)
    socketio_extension.emit(f"task:{task_id}:error_message", message)
