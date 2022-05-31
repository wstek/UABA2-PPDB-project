from datetime import timedelta

from flask import Blueprint, session
from datetime import datetime as dt
from src.extensions import database_connection

api_statistics = Blueprint("api_statistics", __name__)


@api_statistics.route("/api/statistics/")
def get_personal_abtestids():
    username = session.get("user_id")
    if not username:
        return {"error": "unauthorized"}, 401

    personal_abtestids = database_connection.getABTests(username=username)
    personal_abtestids = [r.abtest_id for r in personal_abtestids]

    return {"personal_abtestids": personal_abtestids}


@api_statistics.route("/api/statistics/abtest/<int:abtest_id>")
def get_personal_algorithms(abtest_id):
    username = session.get("user_id")

    if not username:
        return {"error": "unauthorized"}, 401

    personal_algorithms = database_connection.getAlgorithms(abtest_id=abtest_id)
    personal_algorithms = [r.algorithm_id for r in personal_algorithms]

    return {"personal_algorithms": personal_algorithms}


@api_statistics.route("/api/user/get_top_k_per_algorithm/<int:abtest_id>/<int:user_id>")
def getTopKPerAlgorithmPerDay(abtest_id, user_id):
    dates = database_connection.session_execute_and_fetch(
        f'''
        select start_date, end_date from ab_test where abtest_id = {abtest_id}
        '''
    )
    start_date = dates[0][0]
    start_date = start_date.strftime("%d-%b-%Y")
    end_date = dates[0][1]
    end_date = end_date.strftime("%d-%b-%Y")

    query_result = database_connection.session_execute_and_fetch(f''' 
            -- take top k out
            select date_of, unique_article_id, algorithm_id, recommendation_id
            from algorithm natural join statistics natural join customer_specific_statistics 
            natural join recommendation
            where abtest_id = {abtest_id} and date_of between '{start_date}' and '{end_date}'
            and unique_customer_id = '{user_id}' order by date_of, recommendation_id, algorithm_id
            ''')

    response = dict()
    date = None
    d = None
    rid = None

    for row in query_result:
        if not date or d != row[0]:
            date = row[0]
            d = row[0]
            date = date.strftime("%d-%b-%Y")
            response[date] = []

        if rid != row.recommendation_id or not rid:
            rid = row.recommendation_id
            response[date].append({})
        response[date][rid - 1][str(row[2])] = {"article": row[1]}

    dates = []

    for key in response:
        dates.append(key)

    return {"resp": response, "dates": dates}


@api_statistics.route("/api/user/metadata/<int:abtest_id>/<int:user_id>")
def getMetadata(abtest_id, user_id):
    query_result = database_connection.session_execute_and_fetch(f''' 
            -- take top k out
            select attribute_name, attribute_value
            from customer natural join customer_attribute natural join ab_test
            where abtest_id = '{abtest_id}'and unique_customer_id = '{user_id}'
            ''')

    response = dict()
    for row in query_result:
        response[row[0]] = row[1]
    return response


@api_statistics.route("/api/items/<int:abtest_id>", methods=['GET'])
def get_items(abtest_id):
    active_items = database_connection.session_execute_and_fetch(
        f'''
        select unique_article_id
from (select distinct(unique_article_id) as unique_article_id
      from ab_test
               natural join dataset
               natural join purchase
               natural join article
      where abtest_id = {abtest_id}
        and bought_on >= start_date
        and bought_on <= end_date
      ) q1
natural join
     (select distinct(unique_article_id) as unique_article_id
      from ab_test
               natural join algorithm
               natural join statistics
               natural join recommendation
      where abtest_id = {abtest_id}
        and date_of >= start_date
        and date_of <= end_date
) q2;
        '''
    )
    if not active_items:
        return {"error": "Page does not exist"}, 404
    for items in range(len(active_items)):
        active_items[items] = active_items[items][0]

    max_days = database_connection.session_execute_and_fetch(
        f'''
            select end_date - start_date as difference from ab_test where abtest_id = {abtest_id}
        '''
    )
    response = dict()
    response["itemlist"] = active_items
    response["max_days"] = max_days[0][0]

    return response


@api_statistics.route("/api/items/purchases/<int:abtest_id>/<int:article_id>", methods=['GET'])
def get_item_purchases_over_time(abtest_id, article_id):
    amount_of_purchases = database_connection.session_execute_and_fetch(
        f'''
        select distinct date_of from statistics natural join ab_test natural join algorithm
        where date_of >= start_date and date_of <= end_date and abtest_id = {abtest_id} order by date_of
       '''
    )

    response = dict()
    for i in amount_of_purchases:
        j = i[0]
        j = j.strftime("%d-%b-%Y")
        response[j] = 0

    amount_of_purchases = database_connection.session_execute_and_fetch(
        f'''
            SELECT bought_on,COUNT(unique_article_id)
            FROM purchase natural join article natural join ab_test
            WHERE bought_on between  start_date and end_date 
            and abtest_id = '{abtest_id}' and unique_article_id = '{article_id}'
            group by bought_on ;        
        '''
    )

    if not amount_of_purchases:
        return response

    date: dt.date
    d: object
    for purchase in amount_of_purchases:
        date = purchase.bought_on
        date = date.strftime("%d-%b-%Y")
        response[date] = (purchase[1])
    return response


@api_statistics.route("/api/items/recommendations/<int:abtest_id>/<int:article_id>", methods=['GET'])
def get_item_recommendations_over_time(abtest_id, article_id):

    rows = database_connection.session_execute_and_fetch(
        f'''
                select date_of, statistics.algorithm_id, count(recommendation_id)
                from ab_test
                         natural join algorithm
                         right join  statistics on algorithm.algorithm_id = statistics.algorithm_id
                         left join (select * from recommendation where unique_article_id = {article_id}) recommendation on statistics.statistics_id = recommendation.statistics_id
                where abtest_id = {abtest_id}
                  and date_of between start_date and end_date
                group by statistics.algorithm_id, date_of
                order by statistics.algorithm_id, date_of;
            '''
    )

    # response[date][algorithm_id] += 1
    response = {}
    for row in rows:
        _date = row.date_of.strftime("%d-%b-%Y")
        if not _date in response.keys():
            response[_date] = {  }
        response[_date][row.algorithm_id] = row.count
    return {"resp": response}


@api_statistics.route("/api/items/recommendations/purchases/<int:abtest_id>/<int:article_id>",
                      methods=['GET'])
def get_item_recommendations_and_purchases_over_time(abtest_id, article_id):
    amount_of_recommendations = database_connection.session_execute_and_fetch(
        f'''
         select distinct date_of from statistics natural join ab_test natural join algorithm
         where date_of >= start_date and date_of <= end_date and abtest_id = {abtest_id} order by date_of
        '''
    )

    algorithms = database_connection.session_execute_and_fetch(
        f'''
            select algorithm_id from algorithm where abtest_id = {abtest_id};
        '''
    )
    dates = []
    aids = []
    response = dict()
    for key in amount_of_recommendations:
        date = key[0]
        date = date.strftime("%d-%b-%Y")
        dates.append(date)
        response[date] = {}
        for i in algorithms:
            algorithm = i[0]
            if algorithm not in aids:
                aids.append(algorithm)
            response[date][algorithm] = 0

    dates = database_connection.session_execute_and_fetch(
        f'''
        select start_date, end_date from ab_test where abtest_id = {abtest_id}
        '''
    )
    start_date = dates[0][0]
    start_date = start_date.strftime("%d-%b-%Y")
    end_date = dates[0][1]
    end_date = end_date.strftime("%d-%b-%Y")

    amount_of_recommendations = database_connection.session_execute_and_fetch(
        f'''
        select date_of,  algorithm_id, recommendation_id, unique_article_id
        from recommendation natural join statistics natural join algorithm natural join purchase natural join article natural join customer_specific_statistics
        natural join customer
        where abtest_id  = '{abtest_id}' and bought_on >= '{start_date}' and bought_on <= '{end_date}' 
        and date_of = bought_on and unique_article_id = '{article_id}'
        group by date_of, algorithm_id, recommendation_id, unique_article_id;
    '''

    )

    if not amount_of_recommendations:
        return {"resp": response, "aids": aids}

    date = None
    d = None
    algorithm_id = None
    for article in amount_of_recommendations:
        if not date or d != article[0]:
            date = article[0]
            d = article[0]
            date = date.strftime("%d-%b-%Y")

        if not algorithm_id or algorithm_id != article[1]:
            algorithm_id = article[1]

        response[date][algorithm_id] += 1
    return {"resp": response, "aids": aids}


@api_statistics.route("/api/items/metadata/<int:abtest_id>/<int:article_id>", methods=['GET'])
def get_item_attribute(abtest_id, article_id):
    active_items = database_connection.session_execute_and_fetch(
        f"select attribute_name, attribute_value from article natural join ab_test natural join article_attribute "
        f"where unique_article_id = {article_id} and abtest_id = {abtest_id} "
    )
    if not active_items:
        return {"error": "Page does not exist"}, 404
    response = dict()
    for items in range(len(active_items)):
        response[active_items[items][0]] = active_items[items][1]

    return response


@api_statistics.route("/api/items/image/<int:abtest_id>/<int:article_id>", methods=['GET'])
def get_item_image(abtest_id, article_id):
    image_url = database_connection.session_execute_and_fetch(
        f"select distinct(attribute_value) from article natural join ab_test natural join article_attribute "
        f"where unique_article_id = {article_id} and type = 'image' and abtest_id = '{abtest_id}'"
    )
    response = dict()
    if not image_url:
        response["image"] = ""
        return response

    response["image"] = image_url[0][0]
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
            algorithms[algo_row.algorithm_id] = {'Type':algo_row.algorithm_type}
        algorithms[algo_row.algorithm_id][algo_row.parameter_name] = algo_row.value
    return algorithms


def get_abtest_information(abtest_id):
    abtest_information = database_connection.getABTestInfo(abtest_id)
    returnvalue = {'dates': [], 'start_date': str(abtest_information.start_date),
                   'end_date': str(abtest_information.end_date), 'top-k': abtest_information.top_k,
                   'dataset-name': abtest_information.dataset_name, 'created-on': str(abtest_information.created_on),
                   'stepsize': abtest_information.stepsize, 'abtest-id': abtest_information.abtest_id}
    for n in range(int((abtest_information.end_date - abtest_information.start_date).days) + 1):
        date = (abtest_information.start_date + timedelta(abtest_information.stepsize * n))
        returnvalue['dates'].append(str(date))
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
    XFnY = [(str(r.bought_on), r.count) for r in active_users_over_time]
    XFnY.insert(0, ('Date', 'Users'))
    return {'graphdata': XFnY}


def get_purchases_over_time(abtest_id):
    abtest_information = database_connection.getABTestInfo(abtest_id)
    active_users_over_time = database_connection.getPurchasesOverTime(
        start=abtest_information.start_date,
        end=abtest_information.end_date,
        dataset_name=abtest_information.dataset_name
    )
    XFnY = [(str(r.bought_on), r.count) for r in active_users_over_time]
    XFnY.insert(0, ('Date', 'Users'))
    return {'graphdata': XFnY}


def attr_rows_to_XFnY(rows):
    # date_of, algorithm_id, parameter_value
    XFnY = []
    datetime = None
    Y = []

    legend = ["Date"]
    for index in range(len(rows)):
        entry = rows[index]

        if entry["algorithm_name"]:
            algorithm_key = entry["algorithm_name"]
        else:
            algorithm_key = str(entry.algorithm_id)
        if algorithm_key not in legend:
            legend.append(algorithm_key)
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


def get_attr_rate_over_time(abtest_id,days):
    # ['Date', 'AttributionRate']
    attr_rate_rows:list
    if days == 7 or days == 30:
        attr_rate_rows = database_connection.getAttributionRateOverTime(abtest_id,days=days)
    else:
        return {'graphdata': []}

    algorithms = database_connection.getAlgorithms(abtest_id)
    dates = database_connection.getAllDates(abtest_id)
    database_connection.getABTestInfo(abtest_id)

    # date_of, algorithm_id, parameter_value
    XFnY = [["Date"]]

    date_to_index = {}
    algorithm_to_index = {}
    if not len(algorithms):
        return {'graphdata': []}
    for algorithm in algorithms:
        if algorithm.algorithm_name:
            algorithm_key = algorithm.algorithm_name
        else:
            algorithm_key = str(algorithm.algorithm_id)

        algorithm_to_index[algorithm_key] = len(XFnY[0])
        XFnY[0].append(algorithm_key)
    for index in range(len(dates)):
        date_to_index[dates[index].date] = index +1
        XFnY.append([str(dates[index].date)] + [ 0 for i in range(len(XFnY[0])-1)])

    for attr_row in attr_rate_rows:
        if attr_row.algorithm_name:
            algorithm_key = attr_row.algorithm_name
        else:
            algorithm_key = str(attr_row.algorithm_id)
        XFnY[date_to_index[attr_row.bought_on]][algorithm_to_index[algorithm_key]] = float(attr_row.atr)
    return {'graphdata': XFnY}


def get_ARPU_over_time(abtest_id, days):
    # ['Date', 'AttributionRate']
    arpu_rate_rows:list
    if days == 7 or days == 30:
        arpu_rate_rows = database_connection.getARPUOverTime(abtest_id,days=days)
    else:
        return {'graphdata': []}

    algorithms = database_connection.getAlgorithms(abtest_id)
    dates = database_connection.getAllDates(abtest_id)
    database_connection.getABTestInfo(abtest_id)

    # date_of, algorithm_id, parameter_value
    XFnY = [["Date"]]

    date_to_index = {}
    algorithm_to_index = {}
    if not len(algorithms):
        return {'graphdata': []}
    for algorithm in algorithms:
        if algorithm.algorithm_name:
            algorithm_key = algorithm.algorithm_name
        else:
            algorithm_key = str(algorithm.algorithm_id)

        algorithm_to_index[algorithm_key] = len(XFnY[0])
        XFnY[0].append(algorithm_key)
    for index in range(len(dates)):
        date_to_index[dates[index].date] = index +1
        XFnY.append([str(dates[index].date)] + [ 0 for i in range(len(XFnY[0])-1)])

    for arpu_row in arpu_rate_rows:
        if arpu_row.algorithm_name:
            algorithm_key = arpu_row.algorithm_name
        else:
            algorithm_key = str(arpu_row.algorithm_id)
        XFnY[date_to_index[arpu_row.bought_on]][algorithm_to_index[algorithm_key]] = float(arpu_row.arpu)
    return {'graphdata': XFnY}


def get_CRT_over_time(abtest_id):
    # ['Date', 'ClickThroughRate']
    crt_rows = database_connection.getCRTOverTime(abtest_id)

    algorithms = database_connection.getAlgorithms(abtest_id)
    dates = database_connection.getAllDates(abtest_id)
    database_connection.getCRTOverTime(abtest_id)

    # date_of, algorithm_id, parameter_value
    XFnY = [["Date"]]

    date_to_index = {}
    algorithm_to_index = {}
    if not len(algorithms):
        return {'graphdata': []}
    for algorithm in algorithms:
        if algorithm.algorithm_name:
            algorithm_key = algorithm.algorithm_name
        else:
            algorithm_key = str(algorithm.algorithm_id)

        algorithm_to_index[algorithm_key] = len(XFnY[0])
        XFnY[0].append(algorithm_key)
    for index in range(len(dates)):
        date_to_index[dates[index].date] = index + 1
        XFnY.append([str(dates[index].date)] + [0 for i in range(len(XFnY[0]) - 1)])

    for crt_row in crt_rows:
        if crt_row.algorithm_name:
            algorithm_key = crt_row.algorithm_name
        else:
            algorithm_key = str(crt_row.algorithm_id)
        XFnY[date_to_index[crt_row.date_of]][algorithm_to_index[algorithm_key]] = float(crt_row.ctr)
    return {'graphdata': XFnY}


@api_statistics.route(
    "/api/statistics/abtest/<int:abtest_id>/get_unique_customer_stats/<int:start_date_index>/<int:end_date_index>")
def getUniqueCustomerStatsRelativeDates(abtest_id, start_date_index, end_date_index):
    query_result = database_connection.getDates(abtest_id)
    [start_date, end_date] = query_result[start_date_index].date_of, query_result[end_date_index].date_of
    return getUniqueCustomerStats(abtest_id, start_date, end_date)


@api_statistics.route(
    "/api/statistics/abtest/<int:abtest_id>/get_unique_customer_stats/<string:start_date>/<string:end_date>")
def getUniqueCustomerStats(abtest_id, start_date, end_date):
    query_result = database_connection.getUniqueCustomerStats(abtest_id, start_date, end_date)
    ctr_per_user = database_connection.CTR_PerUser(abtest_id, start_date, end_date)

    return_array = { row.unique_customer_id : {'Customer': row.unique_customer_id, 'Purchases': row.purchases, 'Revenue': float(row.revenue),
                     'Days Active': row.days_active} for row in query_result}
    algorithm_key:str
    for ctr_row in ctr_per_user:
        if ctr_row.algorithm_name:
            algorithm_key = ctr_row.algorithm_name
        else:
            algorithm_key = str(ctr_row.algorithm_id)
        return_array[ctr_row.unique_customer_id][f"{algorithm_key}-CTR"] = ctr_row.ctr
    return {'returnvalue': list(return_array.values())}


@api_statistics.route("/api/statistics/abtest/<int:abtest_id>/get_top_k_per_algorithm/<start_date>/<end_date>")
def getTopKPerAlgorithm(abtest_id, start_date, end_date):
    top_k = database_connection.getABTestInfo(abtest_id).top_k
    query_result = database_connection.getTopkRecommended(abtest_id, start_date, end_date, top_k)
    return_array = [{} for rank in range(top_k)]
    for row in query_result:
        return_array[row.rank - 1][row.algorithm_id] = {'count': row.count, 'article': row.unique_article_id}
    # for algorithm_id in algorithm_ids:
    return {'returnvalue': return_array}


@api_statistics.route(
    "/api/statistics/abtest/<int:abtest_id>/get_top_k_purchased/<int:start_date_index>/<int:end_date_index>")
def getTopKPurchasedRelative(abtest_id, start_date_index, end_date_index):
    query_result = database_connection.getDates(abtest_id)
    [start_date, end_date] = query_result[start_date_index].date_of, query_result[end_date_index].date_of
    return getTopKPurchased(abtest_id, start_date, end_date)


@api_statistics.route(
    "/api/statistics/abtest/<int:abtest_id>/get_top_k_purchased/<string:start_date>/<string:end_date>")
def getTopKPurchased(abtest_id, start_date, end_date):
    top_k = database_connection.getABTestInfo(abtest_id).top_k
    query_result = database_connection.getTopKPurchased(abtest_id, start_date, end_date, top_k)
    return_array = [{'count': row.count, 'article': row.unique_article_id} for row in query_result]
    return {'returnvalue': return_array}


@api_statistics.route(
    "/api/statistics/abtest/<int:abtest_id>/get_active_usercount/<start_date>/<end_date>")
def get_active_usercount(abtest_id, start_date, end_date):
    query_result = database_connection.getActiveUsersBetween(abtest_id, start_date, end_date)
    return {'returnvalue': query_result.count}


@api_statistics.route("/api/abtest/<int:abtest_id>/get_active_usercount/<int:start_date_index>/<int:end_date_index>")
def relative_date_active_usercount(abtest_id, start_date_index, end_date_index):
    query_result = database_connection.getDates(abtest_id)
    [start_date, end_date] = query_result[start_date_index].date_of, query_result[end_date_index].date_of
    return get_active_usercount(abtest_id, start_date, end_date)


@api_statistics.route("/api/abtest/<int:abtest_id>/get_total_revenue_over_time")
def get_total_revenue_over_time(abtest_id):
    query_result = database_connection.getRevenueOverTime(abtest_id)
    returnvalue = [(str(r.revenue_on), r.revenue) for r in query_result]
    print(returnvalue)
    return {'returnvalue': returnvalue}


@api_statistics.route("/api/statistics/abtest/<int:abtest_id>/<stat>")
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
    elif stat == "AttrRate7_over_time":
        return get_attr_rate_over_time(abtest_id,7)
    elif stat == "AttrRate30_over_time":
        return get_attr_rate_over_time(abtest_id,30)
    elif stat == "ARPU7_over_time":
        return get_ARPU_over_time(abtest_id, 7)
    elif stat == "ARPU30_over_time":
        return get_ARPU_over_time(abtest_id, 30)
    elif stat == "CTR_over_time":
        return get_CRT_over_time(abtest_id)
