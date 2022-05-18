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


@api_statistics.route("/api/items/<int:abtest_id>/<int:algorithm_id>", methods=['GET'])
def get_items(abtest_id, algorithm_id):
    active_items = database_connection.execute(
        f"select distinct unique_article_id from article natural join ab_test natural join purchase natural join recommendation "
        f"natural join statistics "
        f"where bought_on >= start_date and bought_on <= end_date and abtest_id = {abtest_id} and date_of >= start_date "
        f"and date_of <= end_date"
    )
    if not active_items:
        return {"error": "Page does not exist"}, 404
    for items in range(len(active_items)):
        active_items[items] = active_items[items][0]

    return {"itemlist": active_items}


@api_statistics.route("/api/items/purchases/<int:abtest_id>/<int:article_id>", methods=['GET'])
def get_item_purchases_over_time(abtest_id, article_id):

    amount_of_purchases = database_connection.execute(
        f"select distinct bought_on from article natural join ab_test natural join purchase "
        f"where bought_on >= start_date and bought_on <= end_date and abtest_id = {abtest_id}  "
    )

    response = dict()
    for i in amount_of_purchases:
        j = i[0]
        j = j.strftime("%d-%b-%Y")
        response[j] = []

    amount_of_purchases = database_connection.execute(
        f"select bought_on, customer_id from article natural join ab_test natural join purchase "
        f"where bought_on >= start_date and bought_on <= end_date and abtest_id = {abtest_id} and  unique_article_id = {article_id} "
    )

    if not amount_of_purchases:
        return {"error": "Page does not exist"}, 404

    date = None
    d = None
    for article in amount_of_purchases:
        if not date or d != article[0]:
            date = article[0]
            d = article[0]
            date = date.strftime("%d-%b-%Y")
            response[date] = []

        response[date].append(article[1])
    return response

@api_statistics.route("/api/items/recommendations/<int:abtest_id>/<int:article_id>", methods=['GET'])
def get_item_recommendations_over_time(abtest_id, article_id):

    amount_of_recommendations = database_connection.execute(
        f"select distinct date_of  from recommendation natural join statistics natural join ab_test "
        f"where date_of >= start_date and date_of <= end_date and abtest_id = {abtest_id}"
    )

    response = dict()
    for key in amount_of_recommendations:
        date = key[0]
        date = date.strftime("%d-%b-%Y")
        response[date] = []

    amount_of_recommendations = database_connection.execute(
        f"select date_of, unique_customer_id  from recommendation natural join statistics natural join ab_test "
        f"where date_of >= start_date and date_of <= end_date and abtest_id = {abtest_id} and  unique_article_id = {article_id} "
    )

    if not amount_of_recommendations:
        return {"error": "Page does not exist"}, 404

    date = None
    d = None
    for article in amount_of_recommendations:
        if not date or d != article[0]:
            date = article[0]
            d = article[0]
            date = date.strftime("%d-%b-%Y")
            response[date] = []

        response[date].append(article[1])
    return response

@api_statistics.route("/api/items/recommendations/purchases/<int:abtest_id>/<int:article_id>", methods=['GET'])
def get_item_recommendations_and_purchases_over_time(abtest_id, article_id):

    amount_of_recommendations = database_connection.execute(
        f"select distinct date_of  from recommendation natural join statistics natural join ab_test "
        f"where date_of >= start_date and date_of <= end_date and abtest_id = {abtest_id}"
    )

    response = dict()
    for key in amount_of_recommendations:
        date = key[0]
        date = date.strftime("%d-%b-%Y")
        response[date] = []

    amount_of_recommendations = database_connection.execute(
    f'''
        select date_of, unique_customer_id  from recommendation natural join statistics natural join ab_test natural join purchase 
        where date_of >= start_date and date_of <= end_date and abtest_id = {abtest_id} and  unique_article_id = {article_id}
    '''

    )

    if not amount_of_recommendations:
        return {"error": "Page does not exist"}, 404

    date = None
    d = None
    for article in amount_of_recommendations:
        if not date or d != article[0]:
            date = article[0]
            d = article[0]
            date = date.strftime("%d-%b-%Y")
            response[date] = []

        response[date].append(article[1])
    return response

@api_statistics.route("/api/items/metadata/<int:abtest_id>/<int:article_id>", methods=['GET'])
def get_item_attribute(abtest_id, article_id):
    active_items = database_connection.execute(
        f"select attribute_name, attribute_value from article natural join ab_test natural join article_attribute "
        f"where unique_article_id = {article_id} and abtest_id = {abtest_id} "
    )
    if not active_items:
        return {"error": "Page does not exist"}, 404
    response = dict()
    for items in range(len(active_items)):
        response[active_items[items][0]] = active_items[items][1]

    return response

@api_statistics.route("/api/users/<int:abtest_id>/<int:algorithm_id>", methods=['GET'])
def get_users(abtest_id, algorithm_id):
    abtest_information = database_connection.getABTestInfo(abtest_id)
    if not abtest_information:
        return {"error": "Page does not exist"}, 404

    users_rows = database_connection.getActiveUsers(
        start=abtest_information.start_date,
        end=abtest_information.end_date,
        dataset_name=abtest_information.dataset_name
    )
    users = [row.unique_customer_id for row in users_rows]

    return {"userlist": users}


@api_statistics.route("/api/abtest/statistics/<int:customer_id>/<int:selected_abtest>")
def get_user_attributes(customer_id, selected_abtest):
    attr = database_connection.session.execute(
        f"select attribute_name, attribute_value from customer_attribute natural join  ab_test where customer_id = '{customer_id}'and abtest_id = '{selected_abtest}';").fetchall()
    response = dict()
    for r in attr:
        response[r.attribute_name] = r.attribute_value

    return response


@api_statistics.route("/api/purchases/<int:abtest_id>/<int:customer_id>")
def get_user_history(abtest_id, customer_id):
    attr = database_connection.session.execute(
        f"select bought_on, unique_article_id  from ab_test natural join purchase natural join customer natural join article "
        f"where abtest_id = '{abtest_id}' and unique_customer_id = '{customer_id}' and end_date >= bought_on"
    ).fetchall()

    date = None
    d = None
    response = dict()
    for article in attr:
        if not date or d != article[0]:
            date = article[0]
            d = article[0]
            date = date.strftime("%d-%b-%Y")
            response[date] = []

        response[date].append(article[1])
    return response


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
            date = date.strftime("%d-%b-%Y")
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
    print(str(abtest_information.start_date))
    returnvalue = {'dates': [], 'start_date': str(abtest_information.start_date),
                   'end_date': str(abtest_information.end_date), 'top-k': abtest_information.top_k,
                   'dataset-name': abtest_information.dataset_name, 'created-on': str(abtest_information.created_on),
                   'stepsize': abtest_information.stepsize, 'abtest-id': abtest_information.abtest_id}
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

    abtest_info = database_connection.getABTestInfo(abtest_id)
    if not abtest_info:
        return {"error": "PageNotFound"}, 404
    if not username or abtest_info.created_by != username:
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
