import json

from flask import Blueprint, jsonify
from flask import session, request

from src.celeryTasks.tasks import dummy_task
from src.extensions import celery_extension, redis_extension
import time

api_task = Blueprint("api_task", __name__)


@api_task.route("/api/tasks", methods=["POST"])
def run_task():
    data = json.loads(request.data)
    task = dummy_task.delay(data["duration"], user_id=session["user_id"])

    return jsonify({"id": task.id, "name": "dummy_task", "time_start": time.time(), "progress": 0}), 202


@api_task.route("/api/get_tasks")
def get_tasks():
    active_tasks = celery_extension.control.inspect().active()
    active_tasks = list(active_tasks.values())[0]

    user_id = session["user_id"]
    user_tasks = []

    for active_task in active_tasks:
        if "user_id" not in active_task["kwargs"] or user_id != active_task["kwargs"]["user_id"]:
            continue

        user_tasks.append({
            "id": active_task["id"],
            "name": active_task["name"],
            "time_start": active_task["time_start"],
            "progress": redis_extension.get(active_task["id"])
        })

    # sort user_tasks on start time
    sorted_user_tasks = sorted(user_tasks, key=lambda d: d["time_start"])

    return jsonify(sorted_user_tasks), 200
