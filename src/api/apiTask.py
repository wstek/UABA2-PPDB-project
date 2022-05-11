from flask import Blueprint, request, jsonify
from src.tasks.taskTest import long_task

api_task = Blueprint("api_task", __name__)


@api_task.route("/api/tasks", methods=["POST"])
def run_task():
    content = request.json
    print("aaaahh")
    task_duration = content["seconds"]
    task = long_task.delay(int(task_duration))
    return jsonify({"task_id": task.id}), 202
