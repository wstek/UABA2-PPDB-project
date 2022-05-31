import json
import time

from flask import Blueprint, jsonify
from flask import session, request

from src.celeryTasks.tasks import dummy_task, dummy_task2, dummy_task3
from src.extensions import celery_extension, redis_extension

api_task = Blueprint("api_task", __name__)


@api_task.route("/api/tasks", methods=["POST"])
def run_task():
    data = json.loads(request.data)

    task = None
    name = ""

    if data["type"] == 1:
        task = dummy_task.delay(data["duration"], user_id=session["user_id"], meta="dummy")
        name = "dummy_task"
    elif data["type"] == 2:
        task = dummy_task2.delay(data["duration"], user_id=session["user_id"], meta="dummy")
        name = "insert_dataset"
    elif data["type"] == 3:
        task = dummy_task3.delay(data["duration"], user_id=session["user_id"], meta="dummy")
        name = "simulation"

    return jsonify({"id": task.id, "name": name, "time_start": time.time(), "progress": 0, "progress_message": "",
                    "meta": "dummy"}), 202


@api_task.route("/api/get_tasks")
def get_tasks():
    active_tasks = celery_extension.control.inspect().active()
    active_tasks = list(active_tasks.values())[0]

    user_id = session["user_id"]
    user_tasks = []

    for active_task in active_tasks:
        if "user_id" not in active_task["kwargs"] or user_id != active_task["kwargs"]["user_id"]:
            continue

        meta = ""
        if "meta" in active_task["kwargs"]:
            meta = active_task["kwargs"]["meta"]

        user_tasks.append({
            "id": active_task["id"],
            "name": active_task["name"],
            "time_start": active_task["time_start"],
            "progress": redis_extension.get(f"task:{active_task['id']}:progress"),
            "progress_message": redis_extension.get(f"task:{active_task['id']}:progress_message"),
            "meta": meta
        })

    # sort user_tasks on start time
    sorted_user_tasks = sorted(user_tasks, key=lambda d: d["time_start"])

    return jsonify(sorted_user_tasks), 200


@api_task.route("/api/abort_task", methods=["POST"])
def abort_task():
    data = json.loads(request.data)

    celery_extension.control.revoke(data["task_id"], terminate=True, signal='SIGUSR1')

    return "aborted task" + data["task_id"], 200
