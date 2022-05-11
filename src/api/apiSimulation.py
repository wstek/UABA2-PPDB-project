from flask import Blueprint, request, session

from src.appVar import database_connection

api_simulation = Blueprint("api_simulation", __name__)


@api_simulation.route("/api/start_simulation", methods=["POST", "OPTIONS"])
def start_simulation():
    start = request.json["start"]
    end = request.json["end"]
    topk = request.json["topk"]
    stepsize = request.json["stepsize"]
    dataset_name = request.json["dataset_name"]
    algorithms = request.json["algorithms"]

    # abtest_id = database_connection.session.execute("SELECT nextval('ab_test_abtest_id_seq')").fetchone()[0]

    database_connection.session.execute(
        'INSERT INTO "ab_test"('
        'start_date, "end_date", top_k, stepsize, dataset_name, created_by) '
        'VALUES(:start, :end, :top_k, :stepsize, :dataset_name, :created_by)',
        {"start": start, "end": end, "top_k": int(topk), "stepsize": int(stepsize), "dataset_name": dataset_name,
         "created_by": session["user_id"]})
    database_connection.session.commit()

    abtest_id = database_connection.session.execute(
        'SELECT max(abtest_id) FROM "ab_test"').fetchone()[0]
    database_connection.session.commit()

    for i in range(len(algorithms)):
        # algorithm_id = database_connection.session.execute("SELECT nextval(
        # 'algorithm_algorithm_id_seq')").fetchone()[0]
        database_connection.session.execute(
            "INSERT INTO algorithm(abtest_id, algorithm_name) VALUES(:abtest_id, :algorithm_name)",
            {"abtest_id": abtest_id, "algorithm_name": algorithms[i]["name"]})
        database_connection.session.commit()
        algorithm_id = database_connection.session.execute(
            'SELECT max(algorithm_id) FROM algorithm').fetchone()[0]
        database_connection.session.commit()
        algorithms[i]["id"] = algorithm_id
        for param, value in algorithms[i]["parameters"].items():
            database_connection.session.execute(
                "INSERT INTO parameter(parameter_name, algorithm_id, abtest_id, type, value) VALUES(:parametername, "
                ":algorithm_id, :abtest_id, :type, :value)",
                {"parametername": param, "algorithm_id": algorithm_id, "abtest_id": abtest_id, "type": "string",
                 "value": value})
        database_connection.session.commit()

    # todo backround-task
    # with lock:
    #     thread_per_user[session["user_id"]] = ABTestSimulation(database_connection, sse, app,
    #                                                            {"abtest_id": abtest_id, "start": start, "end": end,
    #                                                             "topk": topk,
    #                                                             "stepsize": stepsize,
    #                                                             "dataset_name": dataset_name, "algorithms": algorithms
    #                                                             })
    # thread_per_user[session["user_id"]].start()
    return "200"


@api_simulation.route("/api/progress", methods=['GET'])
def get_data():
    # if session["user_id"] in thread_per_user:
    #     return {'start': thread_per_user[session["user_id"]].prev_progress,
    #             'end': thread_per_user[session["user_id"]].current_progress, 'started': True}
    # else:
    return {'start': 0, 'end': 0, 'started': False}
