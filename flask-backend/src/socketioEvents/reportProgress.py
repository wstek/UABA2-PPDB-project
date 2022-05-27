import json

from src.extensions import socketio_extension
from src.utils.Logger import Logger


def report_progress(task_id: str, done: int, total_to_be_done: int):
    channel = f"task:{task_id}:progress"

    progress = json.dumps({"done": done, "total_to_be_done": total_to_be_done})
    socketio_extension.emit(channel, progress)

    Logger.log(channel + " " + progress)
