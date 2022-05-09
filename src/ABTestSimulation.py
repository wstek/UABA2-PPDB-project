from operator import index
import threading
import pandas as pd
from iknn import ItemKNNIterative
import random
import numpy
from psycopg2.extensions import register_adapter, AsIs


def addapt_numpy_float64(numpy_float64):
    return AsIs(numpy_float64)


def addapt_numpy_int64(numpy_int64):
    return AsIs(numpy_int64)


register_adapter(numpy.float64, addapt_numpy_float64)
register_adapter(numpy.int64, addapt_numpy_int64)

# TODO als er data is achter de start date van de simulatie mogen we deze data dan gebruiken (bv voor training, etc)


class UserDataPerStep:
    def __init__(self, step_date, active):
        self.step_date = step_date
        self.algorithm_data = []
        self.active = active


def remove_tuples(arr):
    for i in range(len(arr)):
        arr[i] = arr[i][0]


class ABTestSimulation(threading.Thread):
    def __init__(self, database_connection, sse, app, abtest):
        super().__init__()
        self.sse = sse
        self.app = app
        self.frontend_data = []
        self.done = False
        self.abtest = abtest
        self.database_connection = database_connection

    def __getstate__(self):
        return (self.frontend_data, self.done, self.abtest, self.progress)

    def __setstate__(self, state):
        self.frontend_data, self.done, self.abtest, self.progress = state

    def insertCustomer(self, customer_id, statistics_id, dataset_name):
        self.database_connection.session.execute(
            "INSERT INTO customer_specific_statistics(customer_id, statistics_id,dataset_name) "
            "VALUES(:customer_id, :statistics_id, :dataset_name)",
            {
                "customer_id": customer_id, "statistics_id": statistics_id,
                "dataset_name": dataset_name
            }
        )

    def insertRecommendation(self, recommendation_id, customer_id, statistics_id, dataset_name, article_id):
        self.database_connection.session.execute(
            "INSERT INTO recommendation(recommendation_id, customer_id, statistics_id, dataset_name, article_id) VALUES(:recommendation_id, :customer_id, :statistics_id, :dataset_name, :article_id)",
            {
                "recommendation_id": recommendation_id, "customer_id": customer_id, "statistics_id": statistics_id,
                "dataset_name": dataset_name, "article_id": article_id})

    def insertRecommendations(self, recommendations, statistics_id, customer_id):
        self.insertCustomer(statistics_id=statistics_id, customer_id=customer_id,
                            dataset_name=self.abtest["dataset_name"])

        for vv in range(len(recommendations)):
            self.insertRecommendation(recommendation_id=vv + 1, customer_id=customer_id,
                                      statistics_id=statistics_id, dataset_name=self.abtest["dataset_name"],
                                      article_id=recommendations[vv])
        self.database_connection.session.commit()

    def generateRandomTopK(self, listx, items):
        return random.sample(listx, items)
        # TODO: OPMERKING: mogen we data gebruiken voor self.abtest["start"] voor de simulatie?

    def run(self):

        dt_start = pd.to_datetime(self.abtest["start"], format='%Y-%m-%d')
        dt_current_date = pd.to_datetime(
            self.abtest["start"], format='%Y-%m-%d')
        dt_end = pd.to_datetime(self.abtest["end"], format='%Y-%m-%d')
        dayz = (dt_end-dt_start).days

        last_time_train = dt_current_date.strftime('%Y-%m-%d')

        # data statistics over time (x-axis = time)
        top_k_over_time_statistics = {'time': []}
        active_users_over_time_statistics = {'time': [], 'n_users': []}
        data_per_user_over_time_statistics = {'time': [], 'customer_id': {}}

        # dynamic algorithms info that changes during simulation
        dynamic_info_algorithms = {}

        all_customer_ids = self.database_connection.session.execute(
            "SELECT DISTINCT customer_id FROM customer").fetchall()

        all_unique_item_ids = self.database_connection.session.execute(
            "SELECT DISTINCT article_id FROM article").fetchall()
        remove_tuples(all_unique_item_ids)

        for i in range(len(all_customer_ids)):
            data_per_user_over_time_statistics['customer_id'][all_customer_ids[i][0]] = [
            ]

        for i in range(len(self.abtest["algorithms"])):
            idx = int(self.abtest["algorithms"][i]["id"]) - \
                int(self.abtest["algorithms"][0]["id"])
            top_k_over_time_statistics[idx] = []

            if self.abtest["algorithms"][i]["name"] == "ItemKNN":
                dynamic_info_algorithms[idx] = {"dt_start_LookBackWindow": pd.to_datetime(self.abtest["start"], format='%Y-%m-%d'),
                                                "dt_start_RetrainInterval": pd.to_datetime(self.abtest["start"], format='%Y-%m-%d'), "KNN": ItemKNNIterative(k=int(
                                                    self.abtest["algorithms"][i]["parameters"]["KNearest"]), normalize=(self.abtest["algorithms"][i]["parameters"]["Normalize"] == 'True'))}

            elif self.abtest["algorithms"][i]["name"] == "Recency":
                dynamic_info_algorithms[idx] = {"dt_start_RetrainInterval": pd.to_datetime(
                    self.abtest["start"], format='%Y-%m-%d'), "prev_top_k": []}

            elif self.abtest["algorithms"][i]["name"] == "Popularity":
                dynamic_info_algorithms[idx] = {"dt_start_LookBackWindow": pd.to_datetime(self.abtest["start"], format='%Y-%m-%d'),
                                                "dt_start_RetrainInterval": pd.to_datetime(self.abtest["start"], format='%Y-%m-%d'), "prev_top_k": []}

        D = 7  # of 30

        D_prev_recommendations = []

        # SIMULATION LOOP MAIN
        for n_day in range(0, int(dayz)+1, int(self.abtest["stepsize"])):
            print(str(n_day) + "/" + str(int(dayz)))
            if n_day:
                dt_current_date = dt_current_date + \
                    pd.DateOffset(days=int(self.abtest["stepsize"]))

            current_date = dt_current_date.strftime('%Y-%m-%d')
            # statistics per step per algorithm
            # customer_specific_statistics per active user (als n = active_users dan is er n customer_specific_statistics rows)
            # k recommendations per active user
            active_users = self.database_connection.session.execute(f"SELECT DISTINCT SUBQUERY.customer_id FROM (SELECT * FROM \
                    purchase WHERE bought_on = '{current_date}') AS SUBQUERY").fetchall()
            self.database_connection.session.commit()

            purchases = self.database_connection.session.execute(
                f"SELECT customer_id, article_id FROM purchase WHERE bought_on = '{current_date}'").fetchall()

            user2purchasedItems = dict()

            for i in range(len(purchases)):
                if purchases[i][0] not in user2purchasedItems:
                    user2purchasedItems[purchases[i][0]] = []
                else:
                    user2purchasedItems[purchases[i]
                                        [0]].append(purchases[i][1])
            remove_tuples(active_users)

            user_histories = dict()

            self.frontend_data.append(
                f"\n\ncurrent total active users: {len(active_users)}")

            for i in range(len(active_users)):
                data_per_user_over_time_statistics['customer_id'][active_users[i]].append(
                    UserDataPerStep(current_date, active=True))
                user_histories[active_users[i]] = []

            for customer_id in data_per_user_over_time_statistics['customer_id']:
                if len(data_per_user_over_time_statistics['customer_id'][customer_id]) < len(data_per_user_over_time_statistics['time']):
                    data_per_user_over_time_statistics['customer_id'][customer_id].append(
                        UserDataPerStep(current_date, active=False))

            active_users_over_time_statistics['time'].append(current_date)
            active_users_over_time_statistics['n_users'].append(
                len(active_users))

            if len(D_prev_recommendations) == D+1:
                D_prev_recommendations.pop(0)
            D_prev_recommendations.append({})

            for algo in range(len(self.abtest["algorithms"])):
                # print(self.frontend_data)
                self.database_connection.session.execute("INSERT INTO statistics(date_of, algorithm_id, abtest_id) VALUES(:datetime, :algorithm_id,\
                :abtest_id)", {"datetime": current_date, "algorithm_id": self.abtest["algorithms"][algo]["id"], "abtest_id": self.abtest["abtest_id"]})
                statistics_id = self.database_connection.session.execute(
                    f'SELECT last_value FROM statistics_statistics_id_seq').fetchone()[0]
                self.database_connection.session.commit()

                idx = int(self.abtest["algorithms"][algo]["id"]) - \
                    int(self.abtest["algorithms"][0]["id"])
                k = int(self.abtest["topk"])
                start_date = dt_start.strftime('%Y-%m-%d')

                if self.abtest["algorithms"][algo]["name"] == "ItemKNN":

                    diff = (dt_current_date-dynamic_info_algorithms[idx]["dt_start_LookBackWindow"]).days - \
                        int(self.abtest["algorithms"][algo]
                            ["parameters"]["LookBackWindow"])
                    if diff > 0:
                        dynamic_info_algorithms[idx]["dt_start_LookBackWindow"] += pd.DateOffset(
                            days=diff)
                        start_date = dynamic_info_algorithms[idx]["dt_start_LookBackWindow"].strftime(
                            '%Y-%m-%d')

                    D_prev_recommendations[-1][idx] = {}

                    if n_day:
                        dt_prev_day = dt_current_date - pd.DateOffset(days=1)
                        prev_day = dt_prev_day.strftime('%Y-%m-%d')
                        retrain = (
                            dt_current_date-dynamic_info_algorithms[idx]["dt_start_RetrainInterval"]).days
                        interactions = self.database_connection.session.execute(f"SELECT customer_id, article_id from purchase WHERE \
                            bought_on BETWEEN '{start_date}' AND '{prev_day}'").fetchall()
                        self.database_connection.session.commit()

                        for i in range(len(interactions)):
                            interactions[i] = (
                                interactions[i][0], interactions[i][1])

                        if (retrain > int(self.abtest["algorithms"][algo]["parameters"]['RetrainInterval'])):
                            last_time_train = current_date
                            # retrain interval bereikt => train de KNN algoritme
                            dynamic_info_algorithms[idx]["KNN"].train(
                                interactions, unique_item_ids=all_unique_item_ids)
                            dynamic_info_algorithms[idx]["dt_start_RetrainInterval"] = dt_current_date - pd.DateOffset(
                                days=(retrain-int(self.abtest["algorithms"][algo]["parameters"]['RetrainInterval'])-1))
                            # 2020-01-01 - 2020-01-05 = 4 -> 2 keer trainen?   momenten waarop getrain moet worden: 2020-01-01, 2020-01-03, 2020-01-05
                        # gives all users in (start.date, prev.date) => not only the active users!
                        # users_with_not_enough_interactions = self.database_connection.session.execute(
                        #     f"SELECT sub.cust, COUNT(DISTINCT(sub2.article_id)) FROM (select d.customer_id as cust, o.customer_id \
                        #         FROM (SELECT customer_id, article_id from purchase WHERE CAST(timestamp as DATE) BETWEEN '{start_date}' \
                        #             AND '{prev_day}') AS d INNER JOIN (SELECT customer_id, article_id from purchase WHERE CAST(timestamp \
                        #                 as DATE) BETWEEN '{start_date}' AND '{prev_day}') AS o ON (d.article_id = o.article_id and d.customer_id \
                        #                     != o.customer_id)) AS sub INNER JOIN (SELECT customer_id, article_id from purchase WHERE CAST(timestamp \
                        #                         as DATE) BETWEEN '{start_date}' AND '{prev_day}') as sub2 ON sub.customer_id = sub2.customer_id GROUP \
                        #                             BY sub.cust HAVING COUNT(DISTINCT(sub2.article_id)) > {k-1}").fetchall()
                        # print("last time trained:", last_time_train)
                        for cc in range(len(interactions)):
                            if interactions[cc][0] in user_histories:
                                user_histories[interactions[cc][0]].append(
                                    interactions[cc][1])

                        # top_k_random = db_engine.session.execute(f"SELECT SUBQUERY.article_id FROM (SELECT article_id FROM article ORDER BY RANDOM() LIMIT {k}) as SUBQUERY ORDER BY article_id ASC").fetchall()
                        # remove_tuples(top_k_random)

                        # for key in list(user_histories.keys()): #random moet gedaan worden in loop om unieke topk voor elke use te maken maar is trager
                        #     if not(user_histories[key]):
                        #         data_per_user_over_time_statistics['customer_id'][key][-1].algorithm_data.append(RANDOM_DATA(id=idx, topk=top_k_random, name="ItemKNN"))
                        #         del user_histories[key]

                        index2customer_id = {index: customer_id for index,
                                             customer_id in enumerate(user_histories)}

                        # als training mag gebeuren maximaal window_size geleden, moeten we dit dan ook doen met de history van de users of moeten we hun history nemen van het begin
                        histories = list(user_histories.values())
                        # print(histories)
                        recommendations = dynamic_info_algorithms[idx]["KNN"].recommend_all(
                            histories, k)

                        clicks = 0
                        recommended_purchases = 0
                        recommended_purchases_prices = 0.0
                        for cc in range(len(recommendations)):
                            # print(cc)
                            recommendations[cc] += self.generateRandomTopK(
                                all_unique_item_ids, k-len(recommendations[cc]))
                            self.insertRecommendations(recommendations=recommendations[cc], statistics_id=statistics_id,
                                                       customer_id=index2customer_id[cc])
                            user_purchased_items = user2purchasedItems[index2customer_id[cc]]
                            out = False
                            for purchased_item in range(len(user_purchased_items)):
                                for recommended_item in range(len(recommendations[cc])):
                                    if user_purchased_items[purchased_item] == recommendations[cc][recommended_item]:
                                        out = True
                                        clicks += 1
                                        break
                                if out:
                                    break
                            out = False
                            D_prev_recommendations[-1][idx][index2customer_id[cc]
                                                            ] = recommendations[cc]
                            for purchased_item in range(len(user_purchased_items)):
                                out = False
                                for dayzx in range(len(D_prev_recommendations)):
                                    if index2customer_id[cc] in D_prev_recommendations[dayzx][idx]:
                                        prev_recommendations = D_prev_recommendations[
                                            dayzx][idx][index2customer_id[cc]]
                                        for prev_recommended_item in range(len(prev_recommendations)):
                                            if prev_recommendations[prev_recommended_item] == user_purchased_items[purchased_item]:
                                                out = True
                                                recommended_purchases += 1
                                                break
                                    if out:
                                        break

                        CTR = float(clicks)/len(active_users)
                        ATTR_RATE = float(recommended_purchases)/len(purchases)

                        self.database_connection.session.execute(
                            'INSERT INTO dynamic_stepsize_var (statistics_id, parameter_name, parameter_value) VALUES(:statistics_id, :parameter_name, :parametervalue)', {"statistics_id": statistics_id, "parameter_name": "CTR", "parametervalue": CTR})
                        self.database_connection.session.execute(
                            'INSERT INTO dynamic_stepsize_var(statistics_id, parameter_name, parameter_value) VALUES(:statistics_id, :parameter_name, :parametervalue)', {"statistics_id": statistics_id, "parameter_name": "ATTR_RATE", "parametervalue": ATTR_RATE})
                        self.database_connection.session.commit()

                        self.frontend_data.append(
                            f"current_day: {current_date}, algorithm {algo}: CTR: {CTR}, ATTR_RATE: {ATTR_RATE}, top_k recommendations (BETWEEN {start_date} AND {prev_day}): {recommendations}")
                        D_prev_recommendations[-1][idx]

                        # data_per_user_over_time_statistics['customer_id'][index2item_id[cc]][-1].algorithm_data.append(KNN_DATA(id=idx, topk=recommendations[cc], history=histories[cc]))

                        # top_k_over_time_statistics[idx].append(copy.deepcopy(top_k_over_time_statistics[idx][-1]))

                        # SELECT customer_id, array_to_string(array_agg(article_id), ' ') FROM test3 WHERE CAST(timestamp as DATE) BETWEEN '2020-01-01' and '2020-01-03' GROUP BY customer_id;
                    else:
                        top_k_random = self.generateRandomTopK(
                            all_unique_item_ids, k)
                        # top_k_random = self.database_connection.session.execute(
                        #     f"SELECT SUBQUERY.article_id FROM (SELECT article_id FROM article ORDER BY RANDOM() LIMIT {k}) as SUBQUERY ORDER BY article_id ASC").fetchall()

                        # random moet gedaan worden in loop om unieke topk voor elke use te maken maar is trager
                        for i in range(len(active_users)):
                            self.insertRecommendations(recommendations=top_k_random, statistics_id=statistics_id,
                                                       customer_id=active_users[i])

                        # calculate CTR
                        clicks = 0
                        recommended_purchases = 0
                        for customer_id, user_purchased_items in user2purchasedItems.items():
                            D_prev_recommendations[-1][idx][customer_id] = top_k_random
                            out = False
                            for purchased_item in range(len(user_purchased_items)):
                                for recommended_item in range(len(top_k_random)):
                                    if user_purchased_items[purchased_item] == top_k_random[recommended_item]:
                                        if not(out):
                                            out = True
                                            clicks += 1
                                        recommended_purchases += 1
                                        break

                        CTR = float(clicks)/len(active_users)
                        ATTR_RATE = float(recommended_purchases)/len(purchases)

                        self.database_connection.session.execute(
                            'INSERT INTO dynamic_stepsize_var(statistics_id, parameter_name, parameter_value) VALUES(:statistics_id, :parameter_name, :parametervalue)', {"statistics_id": statistics_id, "parameter_name": "CTR", "parametervalue": CTR})
                        self.database_connection.session.execute(
                            'INSERT INTO dynamic_stepsize_var(statistics_id, parameter_name, parameter_value) VALUES(:statistics_id, :parameter_name, :parametervalue)', {"statistics_id": statistics_id, "parameter_name": "ATTR_RATE", "parametervalue": ATTR_RATE})
                        self.database_connection.session.commit()

                        # data_per_user_over_time_statistics['customer_id'][active_users[i]][-1].algorithm_data.append(RANDOM_DATA(id=idx, topk=top_k_random, name="ItemKNN")) #DEEP COPY????????????

                        self.frontend_data.append(
                            f"algorithm {algo}: CTR: {CTR}, ATTR_RATE: {ATTR_RATE}, top_k random: {top_k_random}")

                        # train KNN algoritme to initialize it:
                        interactions = self.database_connection.session.execute(
                            f"SELECT SUBQUERY.customer_id, SUBQUERY.article_id FROM (SELECT * FROM \
                    purchase WHERE bought_on = '{start_date}') AS SUBQUERY").fetchall()  # BETWEEN zetten
                        for i in range(len(interactions)):
                            interactions[i] = (
                                interactions[i][0], interactions[i][1])
                        dynamic_info_algorithms[idx]["KNN"].train(
                            interactions, unique_item_ids=all_unique_item_ids)

                        # top_k_over_time_statistics[idx].append(top_k_random)

                # zoek in de recommendation table (between prev_day-D and prev_day) met algorithm_id gelijk aan de current algorithm (verwijder duplicaten)
                # -> selecteer op article_id -> geeft alle items die recommended ware door die algoritme in die periode -> vergelijk met items van current_day (aankopen)

                # -> degene die dan overeenkomen tellen we mee (COUNT)
                elif self.abtest["algorithms"][algo]["name"] == "Recency":

                    if n_day:
                        dt_prev_day = dt_current_date - pd.DateOffset(days=1)
                        prev_day = dt_prev_day.strftime('%Y-%m-%d')
                        retrain = (
                            dt_current_date-dynamic_info_algorithms[idx]["dt_start_RetrainInterval"]).days
                        if (retrain > int(self.abtest["algorithms"][algo]["parameters"]['RetrainInterval'])):
                            # retrain interval bereikt => bereken nieuwe topk voor specifieke algoritme
                            top_k = self.database_connection.session.execute(f"SELECT t.article_id, t.bought_on FROM(SELECT article_id,MIN(bought_on) AS bought_on \
                                FROM purchase WHERE bought_on BETWEEN '{start_date}' AND '{prev_day}' GROUP BY article_id) x JOIN purchase t ON \
                                    x.article_id = t.article_id AND x.bought_on = t.bought_on ORDER BY bought_on DESC LIMIT {k}").fetchall()

                            top_k_items = []
                            for i in range(len(top_k)):
                                top_k_items.append(top_k[i][0])
                            # top_k_over_time_statistics[idx].append(top_k)
                            dynamic_info_algorithms[idx]["dt_start_RetrainInterval"] = dt_current_date - pd.DateOffset(
                                days=(retrain-int(self.abtest["algorithms"][algo]["parameters"]['RetrainInterval'])-1))
                            dynamic_info_algorithms[idx]["prev_top_k"] = top_k_items
                        else:
                            top_k_items = dynamic_info_algorithms[idx]["prev_top_k"]
                            # top_k_over_time_statistics[idx].append(copy.deepcopy(top_k_over_time_statistics[idx][-1]))

                        D_prev_recommendations[-1][idx] = top_k_items

                        clicks = 0
                        recommended_purchases = 0
                        for customer_id, user_purchased_items in user2purchasedItems.items():

                            self.insertCustomer(
                                dataset_name=self.abtest["dataset_name"], statistics_id=statistics_id, customer_id=customer_id)
                            for vv in range(k):
                                self.insertRecommendation(recommendation_id=vv + 1, customer_id=customer_id,
                                                          dataset_name=self.abtest["dataset_name"],
                                                          article_id=top_k_items[vv], statistics_id=statistics_id)
                            out = False
                            for purchased_item in range(len(user_purchased_items)):
                                for recommended_item in range(len(top_k_items)):
                                    if user_purchased_items[purchased_item] == top_k_items[recommended_item]:
                                        out = True
                                        clicks += 1
                                        break
                                if out:
                                    break

                            for purchased_item in range(len(user_purchased_items)):
                                out = False
                                for dayzx in range(len(D_prev_recommendations)):
                                    prev_recommendations = D_prev_recommendations[
                                        dayzx][idx]
                                    for prev_recommended_item in range(len(prev_recommendations)):
                                        if prev_recommendations[prev_recommended_item] == user_purchased_items[purchased_item]:
                                            out = True
                                            recommended_purchases += 1
                                            break
                                    if out:
                                        break

                        CTR = float(clicks)/len(active_users)
                        ATTR_RATE = float(recommended_purchases)/len(purchases)

                        self.database_connection.session.execute(
                            'INSERT INTO dynamic_stepsize_var(statistics_id, parameter_name, parameter_value) VALUES(:statistics_id, :parameter_name, :parametervalue)', {"statistics_id": statistics_id, "parameter_name": "CTR", "parametervalue": CTR})
                        self.database_connection.session.execute(
                            'INSERT INTO dynamic_stepsize_var(statistics_id, parameter_name, parameter_value) VALUES(:statistics_id, :parameter_name, :parametervalue)', {"statistics_id": statistics_id, "parameter_name": "ATTR_RATE", "parametervalue": ATTR_RATE})
                        self.database_connection.session.commit()

                        self.frontend_data.append(
                            f"current_day: {current_date}, algorithm {algo}: CTR: {CTR}, ATTR_RATE: {ATTR_RATE}, top_k (BETWEEN {start_date} AND {prev_day}): {top_k_items}")

                        # data_per_user_over_time_statistics['customer_id'][active_users[i]][-1].algorithm_data.append(
                        #     RECENCY_DATA(id=idx, topk=copy.deepcopy(top_k_items)))

                    else:
                        top_k_random = self.generateRandomTopK(
                            all_unique_item_ids, k)

                        D_prev_recommendations[-1][idx] = top_k_random

                        clicks = 0
                        recommended_purchases = 0
                        for customer_id, user_purchased_items in user2purchasedItems.items():
                            self.insertCustomer(
                                dataset_name=self.abtest["dataset_name"], statistics_id=statistics_id, customer_id=customer_id)
                            for vv in range(k):
                                self.database_connection.session.execute("INSERT INTO recommendation(recommendation_id, customer_id, statistics_id, dataset_name, article_id) VALUES(:recommendation_id, :customer_id, :statistics_id, :dataset_name, :article_id)", {
                                    "recommendation_id": vv+1, "customer_id": customer_id, "statistics_id": statistics_id, "dataset_name": self.abtest["dataset_name"], "article_id": top_k_random[vv]})
                            out = False
                            for purchased_item in range(len(user_purchased_items)):
                                for recommended_item in range(len(top_k_random)):
                                    if user_purchased_items[purchased_item] == top_k_random[recommended_item]:
                                        if not(out):
                                            out = True
                                            clicks += 1
                                        recommended_purchases += 1
                                        break

                        CTR = float(clicks)/len(active_users)
                        ATTR_RATE = float(recommended_purchases)/len(purchases)

                        self.database_connection.session.execute(
                            'INSERT INTO dynamic_stepsize_var(statistics_id, parameter_name, parameter_value) VALUES(:statistics_id, :parameter_name, :parametervalue)', {"statistics_id": statistics_id, "parameter_name": "CTR", "parametervalue": CTR})
                        self.database_connection.session.execute(
                            'INSERT INTO dynamic_stepsize_var(statistics_id, parameter_name, parameter_value) VALUES(:statistics_id, :parameter_name, :parametervalue)', {"statistics_id": statistics_id, "parameter_name": "ATTR_RATE", "parametervalue": ATTR_RATE})
                        self.database_connection.session.commit()

                        # data_per_user_over_time_statistics['customer_id'][active_users[i]][-1].algorithm_data.append(
                        #     RANDOM_DATA(id=idx, topk=copy.deepcopy(top_k_random), name="Recency"))
                        # top_k_over_time_statistics[idx].append(top_k_random)
                        self.frontend_data.append(
                            f"current_day: {current_date}, algorithm {algo}: CTR: {CTR}, ATTR_RATE: {ATTR_RATE}, top_k random: {top_k_random}")

                        # train Recency algoritme to initialize it:
                        top_k = self.database_connection.session.execute(f"SELECT t.article_id, t.bought_on FROM(SELECT article_id,MIN(bought_on) AS bought_on \
                                FROM purchase WHERE bought_on = '{start_date}' GROUP BY article_id) x JOIN purchase t ON \
                                    x.article_id = t.article_id AND x.bought_on = t.bought_on ORDER BY bought_on DESC LIMIT {k}").fetchall()
                        top_k_items = []
                        for i in range(len(top_k)):
                            top_k_items.append(top_k[i][0])

                        dynamic_info_algorithms[idx]["prev_top_k"] = top_k_items

                elif self.abtest["algorithms"][algo]["name"] == "Popularity":
                    diff = (dt_current_date-dynamic_info_algorithms[idx]["dt_start_LookBackWindow"]).days - \
                        int(self.abtest["algorithms"][algo]
                            ["parameters"]["LookBackWindow"])
                    if diff > 0:
                        dynamic_info_algorithms[idx]["dt_start_LookBackWindow"] += pd.DateOffset(
                            days=diff)
                        start_date = dynamic_info_algorithms[idx]["dt_start_LookBackWindow"].strftime(
                            '%Y-%m-%d')

                    if n_day:
                        dt_prev_day = dt_current_date - pd.DateOffset(days=1)
                        prev_day = dt_prev_day.strftime('%Y-%m-%d')
                        retrain = (
                            dt_current_date-dynamic_info_algorithms[idx]["dt_start_RetrainInterval"]).days
                        if (retrain > int(self.abtest["algorithms"][algo]["parameters"]['RetrainInterval'])):
                            # retrain interval bereikt => bereken nieuwe topk voor specifieke algoritme
                            top_k = self.database_connection.session.execute(f"SELECT SUBQUERY.article_id, count(*) AS popular_items FROM \
                                (SELECT * FROM purchase WHERE bought_on BETWEEN '{start_date}' AND '{prev_day}') AS SUBQUERY GROUP \
                                    BY SUBQUERY.article_id ORDER BY popular_items DESC LIMIT {k}").fetchall()

                            top_k_items = []
                            for i in range(len(top_k)):
                                top_k_items.append(top_k[i][0])

                            # top_k_over_time_statistics[idx].append(top_k)
                            dynamic_info_algorithms[idx]["dt_start_RetrainInterval"] = dt_current_date - pd.DateOffset(
                                days=(retrain-int(self.abtest["algorithms"][algo]["parameters"]['RetrainInterval'])-1))
                            dynamic_info_algorithms[idx]["prev_top_k"] = top_k_items
                        else:
                            top_k_items = dynamic_info_algorithms[idx]["prev_top_k"]
                            # top_k_over_time_statistics[idx].append(copy.deepcopy(top_k_over_time_statistics[idx][-1]))

                        D_prev_recommendations[-1][idx] = top_k_items

                        clicks = 0
                        recommended_purchases = 0
                        for i in range(len(active_users)):
                            self.insertCustomer(
                                customer_id=active_users[i], statistics_id=statistics_id, dataset_name=self.abtest["dataset_name"])
                            for vv in range(k):
                                self.insertRecommendation(
                                    recommendation_id=vv+1, customer_id=active_users[i], statistics_id=statistics_id, article_id=top_k_items[vv], dataset_name=self.abtest["dataset_name"])
                            out = False
                            user_purchased_items = user2purchasedItems[active_users[i]]
                            for purchased_item in range(len(user_purchased_items)):
                                for recommended_item in range(len(top_k_items)):
                                    if user_purchased_items[purchased_item] == top_k_items[recommended_item]:
                                        out = True
                                        clicks += 1
                                        break
                                if out:
                                    break
                            for purchased_item in range(len(user_purchased_items)):
                                out = False
                                for dayzx in range(len(D_prev_recommendations)):
                                    prev_recommendations = D_prev_recommendations[
                                        dayzx][idx]
                                    for prev_recommended_item in range(len(prev_recommendations)):
                                        if prev_recommendations[prev_recommended_item] == user_purchased_items[purchased_item]:
                                            out = True
                                            recommended_purchases += 1
                                            break
                                    if out:
                                        break

                        CTR = float(clicks)/len(active_users)
                        ATTR_RATE = float(recommended_purchases)/len(purchases)

                        self.database_connection.session.execute(
                            'INSERT INTO dynamic_stepsize_var(statistics_id, parameter_name, parameter_value) VALUES(:statistics_id, :parameter_name, :parametervalue)', {"statistics_id": statistics_id, "parameter_name": "CTR", "parametervalue": CTR})
                        self.database_connection.session.execute(
                            'INSERT INTO dynamic_stepsize_var(statistics_id, parameter_name, parameter_value) VALUES(:statistics_id, :parameter_name, :parametervalue)', {"statistics_id": statistics_id, "parameter_name": "ATTR_RATE", "parametervalue": ATTR_RATE})
                        self.database_connection.session.commit()

                        self.frontend_data.append(
                            f"algorithm {algo}: CTR: {CTR}, ATTR_RATE: {ATTR_RATE}, top_k (BETWEEN {start_date} AND {prev_day}): {top_k_items}")
                        # data_per_user_over_time_statistics['customer_id'][active_users[i]][-1].algorithm_data.append(
                        #     POPULARITY_DATA(id=idx, topk=copy.deepcopy(top_k_items)))

                    else:
                        top_k_random = self.generateRandomTopK(
                            all_unique_item_ids, k)

                        D_prev_recommendations[-1][idx] = top_k_random

                        clicks = 0
                        recommended_purchases = 0

                        for customer_id, user_purchased_items in user2purchasedItems.items():
                            self.insertCustomer(customer_id=customer_id, statistics_id=statistics_id,
                                                dataset_name=self.abtest["dataset_name"])
                            for vv in range(k):
                                self.insertRecommendation(recommendation_id=vv + 1, customer_id=customer_id,
                                                          statistics_id=statistics_id, article_id=top_k_random[
                                                              vv],
                                                          dataset_name=self.abtest["dataset_name"])
                            out = False
                            for purchased_item in range(len(user_purchased_items)):
                                for recommended_item in range(len(top_k_random)):
                                    if user_purchased_items[purchased_item] == top_k_random[recommended_item]:
                                        if not(out):
                                            out = True
                                            clicks += 1
                                        recommended_purchases += 1
                                        break

                        CTR = float(clicks)/len(active_users)
                        ATTR_RATE = float(recommended_purchases)/len(purchases)

                        self.database_connection.session.execute(
                            'INSERT INTO "dynamic_stepsize_var"(statistics_id, parameter_name, parameter_value) VALUES(:statistics_id, :parameter_name, :parametervalue)', {"statistics_id": statistics_id, "parameter_name": "CTR", "parametervalue": CTR})
                        self.database_connection.session.execute(
                            'INSERT INTO "dynamic_stepsize_var"(statistics_id, parameter_name, parameter_value) VALUES(:statistics_id, :parameter_name, :parametervalue)', {"statistics_id": statistics_id, "parameter_name": "ATTR_RATE", "parametervalue": ATTR_RATE})
                        self.database_connection.session.commit()

                        # data_per_user_over_time_statistics['customer_id'][active_users[i]][-1].algorithm_data.append(
                        #     RANDOM_DATA(id=idx, topk=copy.deepcopy(top_k_random), name="Popularity"))
                        self.frontend_data.append(
                            f"algorithm {algo}: CTR: {CTR}, ATTR_RATE: {ATTR_RATE}, top_k random: {top_k_random}")

                        # train Popularity algorithm to initialize it:
                        top_k = self.database_connection.session.execute(f"SELECT SUBQUERY.article_id, count(*) AS popular_items FROM \
                                (SELECT * FROM purchase WHERE bought_on = '{start_date}') AS SUBQUERY GROUP \
                                    BY SUBQUERY.article_id ORDER BY popular_items DESC LIMIT {k}").fetchall()

                        top_k_items = []
                        for i in range(len(top_k)):
                            top_k_items.append(top_k[i][0])
                        dynamic_info_algorithms[idx]["prev_top_k"] = top_k_items
                with self.app.app_context():
                    self.sse.publish(
                        round(n_day/float(dayz), 2)*100.0, type='simulation_progress')
        self.done = True
        return
