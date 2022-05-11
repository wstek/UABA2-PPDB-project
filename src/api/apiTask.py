from flask import Blueprint, request, jsonify
# from src.celeryTasks.tasks import long_task
from src.celeryTasks.celery import long_task

api_task = Blueprint("api_task", __name__)


@api_task.route("/api/tasks", methods=["POST"])
def run_task():
    task = long_task.delay(5)
    return jsonify({"task_id": task.id}), 202

    # return "200"
    # content = request.json
    # print("aaaahh")
    # task_duration = content["seconds"]
    # task = long_task.delay(int(task_duration))
    # return jsonify({"task_id": task.id}), 202
