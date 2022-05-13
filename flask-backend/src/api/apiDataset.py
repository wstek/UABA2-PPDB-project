import json
import os

from flask import Blueprint, request, abort, current_app
from werkzeug.utils import secure_filename

from src.extensions import database_connection

api_dataset = Blueprint("api_dataset", __name__)


@api_dataset.route("/api/upload_dataset", methods=["POST"])
def upload_dataset():
    column_select_data = json.loads(request.form.get('data'))
    for uploaded_file in request.files.getlist('files'):
        filename = secure_filename(uploaded_file.filename)
        if filename != '':
            # check file extension
            file_ext = os.path.splitext(filename)[1]
            if file_ext not in current_app.config['UPLOAD_EXTENSIONS'] and file_ext != '.csv':
                abort(400)

            # todo save file with userid
            # check if the upload directory exists
            if not os.path.exists(current_app.config['UPLOAD_PATH']):
                os.makedirs(current_app.config['UPLOAD_PATH'])
            # upload the file
            uploaded_file.save(os.path.join(
                current_app.config['UPLOAD_PATH'], filename))

    return "200"


@api_dataset.route("/api/get_datasets")
def get_datasets():
    datasets = database_connection.session.execute(
        "SELECT * FROM dataset").fetchall()
    database_connection.session.commit()

    for i in range(len(datasets)):
        datasets[i] = str(datasets[i].name)

    return {"all_datasets": datasets}
