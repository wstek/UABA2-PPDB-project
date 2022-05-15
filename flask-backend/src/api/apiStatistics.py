import time
from datetime import timedelta

from flask import Blueprint, session

from src.ABTestSimulation.ABTestSimulation import remove_tuples
from src.extensions import database_connection

api_statistics = Blueprint("api_statistics", __name__)


@api_statistics.route("/api/abtest/statistics/")
def get_personal_abtestids():
    username = session.get("user_id")
    if not username:
        return {"error": "unauthorized"}, 401

    personal_abtestids = database_connection.getABTests(username=username)
    personal_abtestids = [r.abtest_id for r in personal_abtestids]

    return {"personal_abtestids": personal_abtestids}


@api_statistics.route("/api/abtest/statistics/<int:abtest_id>")
def get_personal_algorithms(abtest_id):
    username = session.get("user_id")

    if not username:
        return {"error": "unauthorized"}, 401

    personal_algorithms = database_connection.getAlgorithms(abtest_id=abtest_id)
    personal_algorithms = [r.algorithm_id for r in personal_algorithms]

    return {"personal_algorithms": personal_algorithms}


@api_statistics.route("/api/users/<int:abtest_id>/<int:algorithm_id>", methods=['GET'])
def get_users(abtest_id, algorithm_id):
    abtest_information = database_connection.getABTestInfo(abtest_id)
    if not abtest_information:
        return {"error": "Page does not exist"}, 404

    users_rows = database_connection.getActiveUsers(start=abtest_information.start_date, end=abtest_information.end_date, dataset_name=abtest_information.dataset_name)
    #         f"-- SELECT distinct(unique_customer_id) FROM customer_specific_statistics natural join algorithm  natural join statistics natural join ab_test WHERE abtest_id= {abtest_id};").fetchall()
    users = [row.unique_customer_id for row in users_rows]

    return {"userlist": users}


@api_statistics.route("/api/abtest/statistics/<int:customer_id>/<int:selected_abtest>")
def get_user_attributes(customer_id, selected_abtest):
    attr = database_connection.session.execute(
        f"select attribute_name, attribute_value from customer_attribute natural join  ab_test where customer_id = '{customer_id}'and abtest_id = '{selected_abtest}';").fetchall()
    response = dict()
    for r in attr:
        response[r.attribute_name] = r.attribute_value

    return response\

@api_statistics.route("/api/<int:abtest_id>/<int:algorithm_id>/<int:customer_id>")
def get_user_topk(abtest_id, algorithm_id, customer_id):
    attr = database_connection.session.execute(
        f"select date_of, unique_customer_id, article_id  from  recommendation natural join  "
        f"statistics natural join algorithm natural join article "
        f"where unique_customer_id = '{customer_id}'and abtest_id = '{abtest_id}' and algorithm_id = '{algorithm_id}';").fetchall()
    date = None
    d = None
    response = dict()
    for article in attr:
        if not date or d != article[0]:
            date = article[0]
            d = article[0]
            date = date.strftime("%d-%b-%Y (%H:%M:%S.%f)")
            response[date] = []

        response[date].append(article[2])
    return response


def get_abtest_algorithm_information(abtest_id):
    algorithms = {}
    algorithms_information = database_connection.getAlgorithmsInformation(abtest_id=abtest_id)
    # for every parameter
    for algo_row in algorithms_information:
        # if algorithm id was not present in the dictionary
        if algo_row.algorithm_id not in algorithms.keys():
            # add the algorithm in the dictionarry and initialize name
            algorithms[algo_row.algorithm_id] = {'name': algo_row.algorithm_name}
        algorithms[algo_row.algorithm_id][algo_row.parameter_name] = algo_row.value
    return algorithms


def get_abtest_information(abtest_id):
    abtest_information = database_connection.getABTestInfo(abtest_id)
    returnvalue = {'dates': [], 'start_date': abtest_information.start_date,
                   'end_date': abtest_information.end_date, 'top-k': abtest_information.top_k,
                   'dataset-name': abtest_information.dataset_name, 'created-on': abtest_information.created_on,
                   'stepsize': abtest_information.stepsize}
    for n in range(int((abtest_information.end_date - abtest_information.start_date).days)):
        date = (abtest_information.start_date + timedelta(abtest_information.stepsize * n))
        returnvalue['dates'].append(date)
    return returnvalue


def get_active_users_over_time(abtest_id):
    abtest_information = database_connection.getABTestInfo(abtest_id)
    if not abtest_information:
        return {"error": "Page does not exist"}, 404

    active_users_over_time = database_connection.getActiveUsersOverTime(
        start=abtest_information.start_date,
        end=abtest_information.end_date,
        dataset_name=abtest_information.dataset_name
    )
    XFnY = [[str(r.bought_on), r.count] for r in active_users_over_time]
    XFnY.insert(0, ['Date', 'Users'])
    return {'graphdata': XFnY}


def get_purchases_over_time(abtest_id):
    abtest_information = database_connection.getABTestInfo(abtest_id)
    active_users_over_time = database_connection.getPurchasesOverTime(
        start=abtest_information.start_date,
        end=abtest_information.end_date,
        dataset_name=abtest_information.dataset_name
    )
    XFnY = [[str(r.bought_on), r.count] for r in active_users_over_time]
    XFnY.insert(0, ['Date', 'Users'])
    return {'graphdata': XFnY}


def attr_rows_to_XFnY(rows):
    # date_of, algorithm_id, parameter_value
    XFnY = []
    datetime = None
    Y = []
    legend = ["Date"]
    for index in range(len(rows)):
        entry = rows[index]
        algorithm_id = entry.algorithm_id
        if str(algorithm_id) not in legend:
            legend.append(str(algorithm_id))
        else:
            XFnY.append(legend)
            break
    for index in range(len(rows)):
        entry = rows[index]
        value = float(entry.parameter_value)
        if datetime != entry.date_of:
            if len(Y):
                XFnY.append(Y)
            datetime = entry.date_of
            Y = [str(datetime)]
        Y.append(value)
    XFnY.append(Y)
    return {'graphdata': XFnY}


def get_attr_rate_over_time(abtest_id):
    # ['Date', 'AttributionRate']
    attr_rate_rows = database_connection.getAttributionRateOverTime(abtest_id)
    return attr_rows_to_XFnY(attr_rate_rows)


def get_CRT_over_time(abtest_id):
    # ['Date', 'ClickThroughRate']
    attr_rate_rows = database_connection.getCRTOverTime(abtest_id)
    return attr_rows_to_XFnY(attr_rate_rows)


@api_statistics.route("/api/abtest/statistics/<int:abtest_id>/<stat>")
def get_stat(abtest_id, stat):
    username = session.get("user_id")
    if not username:
        return {"error": "unauthorized"}, 401

    if stat == "ABTest_information":
        return get_abtest_information(abtest_id)

    elif stat == "algorithm_information":
        return get_abtest_algorithm_information(abtest_id)

    elif stat == "active_users_over_time":
        return get_active_users_over_time(abtest_id)

    elif stat == "purchases_over_time":
        return get_purchases_over_time(abtest_id)

    elif stat == "AttrRate_over_time":
        return get_attr_rate_over_time(abtest_id)

    elif stat == "CTR_over_time":
        return get_CRT_over_time(abtest_id)
