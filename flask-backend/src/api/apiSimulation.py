import time

from flask import Blueprint, request, session

from src.celeryTasks.tasks import start_simulation as background_start_simulation
from src.extensions import database_connection

api_simulation = Blueprint("api_simulation", __name__)


@api_simulation.route("/api/start_simulation", methods=["POST", "OPTIONS"])
def start_simulation():
    start = request.json["start"]
    end = request.json["end"]
    topk = request.json["topk"]
    stepsize = request.json["stepsize"]
    dataset_name = request.json["dataset_name"]
    algorithms = request.json["algorithms"]

    database_connection.session.execute(
        f'''
            INSERT INTO ab_test(start_date, "end_date", top_k, stepsize, dataset_name, created_by)
            VALUES('{start}', '{end}', {topk}, {int(stepsize)}, '{dataset_name}', '{session["user_id"]}');
        '''
    )
    database_connection.session.commit()

    abtest_id = database_connection.session.execute(
        'SELECT max(abtest_id) FROM "ab_test"').fetchone()[0]
    database_connection.session.commit()
    print(algorithms)
    for i in range(len(algorithms)):
        database_connection.session.execute(
            "INSERT INTO algorithm(abtest_id, algorithm_type) VALUES(:abtest_id, :algorithm_type)",
            {"abtest_id": abtest_id, "algorithm_type": algorithms[i]["name"]})
        database_connection.session.commit()

        algorithm_id = database_connection.session.execute(
            'SELECT max(algorithm_id) FROM algorithm').fetchone()[0]
        database_connection.session.commit()

        algorithms[i]["id"] = algorithm_id
        for param, value in algorithms[i]["parameters"].items():
            database_connection.session.execute(
                "INSERT INTO parameter(parameter_name, algorithm_id, type, value) VALUES(:parametername, "
                ":algorithm_id, :type, :value)",
                {"parametername": param, "algorithm_id": algorithm_id, "abtest_id": abtest_id, "type": "string",
                 "value": value})
        database_connection.session.commit()

    simulation_input = {
        "abtest_id": abtest_id,
        "start": start,
        "end": end,
        "topk": topk,
        "stepsize": stepsize,
        "dataset_name": dataset_name,
        "algorithms": algorithms
    }

    task = background_start_simulation.delay(user_id=session["user_id"], simulation_input=simulation_input,
                                             meta=abtest_id)

    return {"id": task.id, "name": "simulation", "time_start": time.time(), "progress": 0, "progress_message": "",
            "meta": abtest_id}, 202
