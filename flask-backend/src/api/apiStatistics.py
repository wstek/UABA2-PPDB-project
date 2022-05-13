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

    personal_abtestids = database_connection.session.execute(
        f"select abtest_id from ab_test where created_by = '{username}';").fetchall()
    personal_abtestids = [r[0] for r in personal_abtestids]
    return {"personal_abtestids": personal_abtestids}\

@api_statistics.route("/api/abtest/statistics/<int:abtest_id>")
def get_personal_algorithms(abtest_id):
    username = session.get("user_id")

    if not username:
        return {"error": "unauthorized"}, 401

    personal_algorithms = database_connection.session.execute(
        f"select algorithm_id from ab_test natural join algorithm where abtest_id = '{abtest_id}' and created_by = '{username}';").fetchall()
    personal_algorithms = [r[0] for r in personal_algorithms]
    return {"personal_algorithms": personal_algorithms}


@api_statistics.route("/api/users/<int:abtest_id>/<int:algorithm_id>", methods=['GET'])
def get_users(abtest_id, algorithm_id):
    users = database_connection.session.execute(
        f"SELECT distinct(unique_customer_id) FROM customer_specific_statistics natural join algorithm  natural join statistics natural join ab_test WHERE abtest_id= {abtest_id};").fetchall()
    for u in range(len(users)):
        users[u] = users[u][0]
    return {"userlist": users}


@api_statistics.route("/api/abtest/statistics/<int:customer_id>/<int:selected_abtest>")
def get_user_attributes(customer_id, selected_abtest):
    attr = database_connection.session.execute(
        f"select attribute_name, attribute_value from  customer_attribute natural join  ab_test where customer_id = '{customer_id}'and abtest_id = '{selected_abtest}';").fetchall()
    response = dict()
    for r in attr:
        response[r[0]] = r[1]

    return response


@api_statistics.route("/api/abtest/statistics/<int:abtest_id>/<stat>")
def get_stat(abtest_id, stat):
    username = session.get("user_id")

    if not username:
        return {"error": "unauthorized"}, 401

    if stat == "ABTest_information":
        result = database_connection.session.execute(
            f"select start_date, end_date, stepsize,top_k,dataset_name,created_on from ab_test where abtest_id = {abtest_id};").fetchall()
        start_date = result[0][0]
        end_date = result[0][1]
        stepsize = result[0][2]
        top_k = result[0][3]
        dataset_name = result[0][4]
        created_on = result[0][5]
        returnvalue = {'dates': [], 'start_date': start_date, 'end_date': end_date, 'top-k': top_k,
                       'dataset-name': dataset_name, 'created-on': created_on}

        for n in range(int((end_date - start_date).days)):
            date = (start_date + timedelta(stepsize * n))

            returnvalue['dates'].append(date)
        return returnvalue

    if stat == "algorithm_information":
        algorithm_id: int
        algorithm_name: str
        parametername: str
        parametervalue: any

        # result : list (algorithm_id, algorithm_name, parametername, value)
        result = database_connection.session.execute(
            f"select algorithm_id, algorithm_name, parameter_name, value from algorithm natural join parameter where abtest_id = {abtest_id};").fetchall()
        algorithms = {}
        # for every parameter
        for row in result:
            algorithm_id = row[0]
            algorithmname = row[1]
            parametername = row[2]
            parametervalue = row[3]
            # if algorithm id was not present in the dictionary
            if not algorithm_id in algorithms.keys():
                # add the algorithm in the dictionarry and initialize name
                algorithms[algorithm_id] = {'name': algorithmname}
            algorithms[algorithm_id][parametername] = parametervalue
        return algorithms

    if stat == "abtest_simulation":
        date_data = database_connection.session.execute(
            f"SELECT DISTINCT date_of FROM statistics WHERE abtest_id = {abtest_id}").fetchall()
        remove_tuples(date_data)
        dataset_name = database_connection.session.execute(
            f'SELECT dataset_name FROM ab_test WHERE abtest_id = {abtest_id}').fetchall()
        users_data = database_connection.session.execute(
            "SELECT DISTINCT customer_id FROM customer").fetchall()
        remove_tuples(users_data)
        algorithms_data = database_connection.session.execute(
            f"SELECT * FROM algorithm WHERE abtest_id = {abtest_id}").fetchall()
        y_stat = []
        for x in range(len(date_data)):
            y_stat.append({})
            for y in range(len(users_data)):
                y_stat[x][users_data[y]] = {"history": [], "algorithms": {}}
                for z in range(len(algorithms_data)):
                    statistics_id = database_connection.session.execute(
                        f"SELECT statistics_id FROM statistics WHERE date_of = '{date_data[x]}' AND algorithm_id = "
                        f"{algorithms_data[z][0]} AND abtest_id = {abtest_id}").fetchall()
                    k_recommendations = database_connection.session.execute(
                        f"SELECT sub.article_id FROM (SELECT article_id, recommendation_id FROM recommendation WHERE "
                        f"customer_id = {users_data[y]} AND statistics_id = {statistics_id[0][0]} AND dataset_name = "
                        f"'{dataset_name[0][0]}' ORDER BY recommendation_id ASC) AS sub").fetchall()
                    remove_tuples(k_recommendations)
                    history = database_connection.session.execute(
                        f"SELECT article_id FROM purchase WHERE customer_id = {users_data[y]} AND bought_on < "
                        f"'{date_data[x]}'").fetchall()
                    remove_tuples(history)
                    y_stat[x][users_data[y]]["history"] = history
                    y_stat[x][users_data[y]]["algorithms"][algorithms_data[z][
                        0]] = k_recommendations
        database_connection.session.commit()
        return {"abtest_simulation": {"x": date_data, "y": y_stat}}

    if stat == "abtest_summary":
        abtest_summary = database_connection.session.execute(
            f'SELECT * FROM "ab_test" WHERE abtest_id = {abtest_id}').fetchall()
        database_connection.session.commit()
        abtest_summary = abtest_summary[0]
        algorithms = []
        data = database_connection.session.execute(
            f"SELECT algorithm_id, algorithm_name FROM algorithm WHERE abtest_id = {abtest_id}").fetchall()
        database_connection.session.commit()
        for i in range(len(data)):
            algorithms.append({"algorithm_id": data[
                i][0], "algorithm_name": data[i][1]})
            parameters = database_connection.session.execute(
                f"SELECT parameter_name, value FROM parameter WHERE algorithm_id = {data[i][0]} AND abtest_id = "
                f"{abtest_id}").fetchall()
            database_connection.session.commit()
            for k in range(len(parameters)):
                algorithms[i][parameters[k][0]] = parameters[k][1]

        return {"abtest_summary": {"abtest_id": abtest_summary[0], "top_k": abtest_summary[1],
                                   "stepsize": abtest_summary[2], "start": abtest_summary[3],
                                   "end": abtest_summary[4], "dataset_name": abtest_summary[5],
                                   "created_on": abtest_summary[6], "created_by": abtest_summary[7]},
                "algorithms": algorithms}

    if stat == "active_users_over_time":
        datetimes = database_connection.session.execute(
            f"SELECT date_of,COUNT(DISTINCT(unique_customer_id)) FROM statistics natural join customer_specific_statistics WHERE abtest_id = {abtest_id} group by date_of").fetchall()
        XFnY = [[str(r[0]), r[1]] for r in datetimes]
        XFnY.insert(0, ['Date', 'Users'])
        return {'graphdata': XFnY}
    if stat == "purchases_over_time":
        datetimes = database_connection.session.execute(
            f"SELECT DISTINCT date_of,dataset_name FROM statistics natural join ab_test WHERE abtest_id = {abtest_id}").fetchall()
        XFnY = [['Date', 'Purchases']]
        for i in range(len(datetimes)):
            countz = database_connection.session.execute(
                f"SELECT COUNT(customer_id) FROM purchase WHERE bought_on = '{datetimes[i][0]}' and dataset_name = '{datetimes[i][1]}' ").fetchall()
            XFnY.append([str(datetimes[i][0]), countz[0][0]])
        return {'graphdata': XFnY}

    if stat == "AttrRate_over_time":
        XFnY = []
        # ['Date', 'ClickThroughRate']
        datetimes = database_connection.session.execute(
            f"SELECT date_of, algorithm_id,parameter_value FROM statistics NATURAL JOIN dynamic_stepsize_var NATURAL "
            f"JOIN  algorithm WHERE abtest_id = {abtest_id} AND parameter_name = 'ATTR_RATE' ORDER BY date_of").fetchall()
        datetime = None
        Y = []
        legend = ["Date"]
        for index in range(len(datetimes)):
            entry = datetimes[index]
            algorithm_id = entry[1]
            if str(algorithm_id) not in legend:
                legend.append(str(algorithm_id))
            else:
                XFnY.append(legend)
                break
        for index in range(len(datetimes)):
            entry = datetimes[index]
            value = float(entry[2])
            if datetime != entry[0]:
                if len(Y):
                    XFnY.append(Y)
                datetime = entry[0]
                Y = [str(datetime)]
            Y.append(value)
        XFnY.append(Y)
        return {'graphdata': XFnY}
    if stat == "CTR_over_time":
        XFnY = []
        # ['Date', 'ClickThroughRate']
        datetimes = database_connection.session.execute(
            f"SELECT date_of, algorithm_id,parameter_value FROM statistics NATURAL JOIN dynamic_stepsize_var NATURAL "
            f"JOIN  algorithm WHERE abtest_id = {abtest_id} AND parameter_name = 'CTR' ORDER BY date_of").fetchall()
        datetime = None
        Y = []
        legend = ["Date"]
        for index in range(len(datetimes)):
            entry = datetimes[index]
            algorithm_id = entry[1]
            if str(algorithm_id) not in legend:
                legend.append(str(algorithm_id))
            else:
                XFnY.append(legend)
                break
        for index in range(len(datetimes)):
            entry = datetimes[index]
            value = float(entry[2])
            if datetime != entry[0]:
                if len(Y):
                    XFnY.append(Y)
                datetime = entry[0]
                Y = [str(datetime)]
            Y.append(value)
        XFnY.append(Y)
        return {'graphdata': XFnY}

    if stat == "Attribution_rate":
        XFnY = []
        # ['Date', 'ClickThroughRate']
        datetimes = database_connection.session.execute(
            f"SELECT date_of, algorithm_id,parameter_value FROM statistics NATURAL JOIN dynamic_stepsize_var NATURAL "
            f"JOIN  algorithm WHERE abtest_id = {abtest_id} AND parameter_name = 'ATTR_RATE' ORDER BY date_of"
        ).fetchall()
        datetime = None
        Y = []
        legend = ["Date"]
        for index in range(len(datetimes)):
            entry = datetimes[index]
            algorithm_id = entry[1]
            if str(algorithm_id) not in legend:
                legend.append(str(algorithm_id))
            else:
                XFnY.append(legend)
                break
        for index in range(len(datetimes)):
            entry = datetimes[index]
            value = float(entry[2])
            if datetime != entry[0]:
                if len(Y):
                    XFnY.append(Y)
                datetime = entry[0]
                Y = [str(datetime)]
            Y.append(value)
        XFnY.append(Y)
