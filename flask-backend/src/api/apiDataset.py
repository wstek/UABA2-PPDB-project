import json
import os
import time

from flask import Blueprint, request, abort, current_app, session
from werkzeug.utils import secure_filename

from src.celeryTasks.tasks import insert_dataset
from src.extensions import database_connection
from src.factories.appConfig import Config
from src.utils.pathParser import checkDirExistsAndCreate

api_dataset = Blueprint("api_dataset", __name__)


@api_dataset.route("/api/upload_dataset", methods=["POST"])
def upload_dataset():
    user_id = session["user_id"]

    column_select_data = json.loads(request.form.get('data'))

    filenames = {}

    # check if the upload directory exists
    checkDirExistsAndCreate(current_app.config['UPLOAD_PATH'])

    # parse the filedata
    for uploaded_file in request.files.getlist('files'):
        original_filename = uploaded_file.filename

        # check file extension
        file_ext = os.path.splitext(original_filename)[1]
        if file_ext not in Config.UPLOAD_EXTENSIONS and file_ext != '.csv':
            abort(400)

        # todo: error handling (empty filename)

        # give file a secure name
        # todo: maybe a function for path joining?
        new_filename = user_id + '_' + secure_filename(uploaded_file.filename)
        new_filepath = os.path.join(Config.UPLOAD_PATH, new_filename)

        # upload the file
        uploaded_file.save(new_filepath)

        # insert into filenames object
        filenames[original_filename] = [new_filepath, column_select_data["delimiter"]]

    # start the dataset insert background process
    print(json.dumps(filenames))
    print(json.dumps(column_select_data))
    task = insert_dataset.delay(user_id, filenames, column_select_data)

    return {"task_id": task.id}, 202


@api_dataset.route("/api/get_datasets_information/<dataset_name>")
def get_dataset_information(dataset_name):
    information = dict()

    # User Count
    query_result = database_connection.getUserCount(dataset_name)
    information["user_count"] = query_result.count

    # Interaction Count
    query_result = database_connection.getPurchaseCount(dataset_name)
    information["purchase_count"] = query_result.count

    # Item count
    query_result = database_connection.getItemCount(dataset_name)
    information["item_count"] = query_result.count

    query_result = database_connection.getPriceDistribution(dataset_name=dataset_name,intervals=1000)

    information["prices"] = { row.average : row.count for row in query_result}
    # price_interval_min = price_min
    # while price_interval_min < price_max:
    #     price_interval_max = price_interval_min + price_diff
    #     query_result = database_connection.getPriceCount(price_interval_min, price_interval_max, dataset_name)
    #     information["prices"][price_interval_min + price_diff / 2] = query_result.count
    #     price_interval_min = price_interval_max

    return information


@api_dataset.route("/api/get_datasets")
def get_datasets():
    datasets = database_connection.session.execute(
        f"SELECT name FROM dataset").fetchall()
    for i in range(len(datasets)):
        datasets[i] = str(datasets[i].name)

    return {"all_datasets": datasets}
