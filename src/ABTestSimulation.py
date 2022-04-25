import copy
import threading
import time
import pandas as pd
from ItemKNN import ItemKNNIterative


# TODO als er data is achter de start date van de simulatie mogen we deze data dan gebruiken (bv voor training, etc)

class RandomData:
    def __init__(self, id, topk, name):
        self.name = name
        self.id = id
        self.topk = topk
        self.random = True


class KNNData:
    def __init__(self, id, topk, history):
        self.name = 'ItemKNN'
        self.id = id
        self.topk = topk
        self.history = history
        self.random = False


class RecencyData:
    def __init__(self, id, topk):
        self.name = 'Recency'
        self.id = id
        self.topk = topk
        self.random = False


class PopularityData:
    def __init__(self, id, topk):
        self.name = 'Popularity'
        self.id = id
        self.topk = topk
        self.random = False


class UserDataPerStep:
    def __init__(self, step_date, active):
        self.step_date = step_date
        self.algorithm_data = []
        self.active = active


def remove_tuples(arr):
    for i in range(len(arr)):
        arr[i] = arr[i][0]


class ABTestSimulation(threading.Thread):
    def __init__(self, database_connection, abtest):
        self.database_connection = database_connection
        self.abtest = abtest
        self.progress = 0

        super().__init__()

    def run(self):  # TODO: OPMERKING: mogen we data gebruiken voor self.abtest["start"] voor de simulatie?

        # start date of simulation (static)
        dt_start = pd.to_datetime(self.abtest["start"], format='%Y-%m-%d')

        # current date of simulation (dynamic)
        dt_current_date = pd.to_datetime(self.abtest["start"], format='%Y-%m-%d')

        # end date of simulation (static)
        dt_end = pd.to_datetime(self.abtest["end"], format='%Y-%m-%d')

        # total days for which the simulation is run
        dayz = (dt_end - dt_start).days

        # data statistics over time (x-axis = time)
        top_k_over_time_statistics = {'time': []}
        active_users_over_time_statistics = {'time': [], 'n_users': []}
        data_per_user_over_time_statistics = {'time': [], 'customer_id': {}}

        # algoritmes = 10, users = 5, topk = 10, dag = 1

        # dynamic algorithms info that changes during simulation
        dynamic_info_algorithms = {}

        all_customer_ids = self.database_connection.session.execute(
            "SELECT DISTINCT customer_id FROM customer").fetchall()

        for i in range(len(all_customer_ids)):
            data_per_user_over_time_statistics['customer_id'][all_customer_ids[i][0]] = []

        for i in range(len(self.abtest["algorithms"])):
            idx = int(self.abtest["algorithms"][i]["id"]) - int(self.abtest["algorithms"][0]["id"])
            top_k_over_time_statistics[idx] = []

            if self.abtest["algorithms"][i]["name"] == "ItemKNN":
                dynamic_info_algorithms[idx] = {
                    "dt_start_LookBackWindow": pd.to_datetime(self.abtest["start"], format='%Y-%m-%d'),
                    "dt_start_RetrainInterval": pd.to_datetime(self.abtest["start"], format='%Y-%m-%d'),
                    "KNN": ItemKNNIterative(k=int( \
                        self.abtest["algorithms"][i]["parameters"]["KNearest"]),
                        normalize=(self.abtest["algorithms"][i]["parameters"]["Normalize"] == 'True'))}
                # TODO: IS ...[i]["parameters"]["Normalize"] normalize hier een bool of een string -> pasop

            elif self.abtest["algorithms"][i]["name"] == "Recency":
                dynamic_info_algorithms[idx] = {
                    "dt_start_RetrainInterval": pd.to_datetime(self.abtest["start"], format='%Y-%m-%d'),
                    "prev_top_k": []}

            elif self.abtest["algorithms"][i]["name"] == "Popularity":
                dynamic_info_algorithms[idx] = {
                    "dt_start_LookBackWindow": pd.to_datetime(self.abtest["start"], format='%Y-%m-%d'),
                    "dt_start_RetrainInterval": pd.to_datetime(self.abtest["start"], format='%Y-%m-%d'),
                    "prev_top_k": []}

        # SIMULATION LOOP MAIN
        for n_day in range(0, dayz + 1, int(self.abtest["stepsize"])):
            if n_day:
                dt_current_date = dt_current_date + pd.DateOffset(days=int(self.abtest["stepsize"]))

            current_date = dt_current_date.strftime('%Y-%m-%d')  # .split()[0]

            active_users = self.database_connection.session.execute(f"SELECT DISTINCT SUBQUERY.customer_id FROM (SELECT * FROM \
                    purchase WHERE CAST(timestamp as DATE) = '{current_date}') AS SUBQUERY").fetchall()

            remove_tuples(active_users)

            user_histories = dict()

            for i in range(len(active_users)):
                data_per_user_over_time_statistics['customer_id'][active_users[i]].append(
                    UserDataPerStep(current_date, active=True))
                user_histories[active_users[i]] = []

            for customer_id in data_per_user_over_time_statistics['customer_id']:
                if len(data_per_user_over_time_statistics['customer_id'][customer_id]) < len(
                        data_per_user_over_time_statistics['time']):
                    data_per_user_over_time_statistics['customer_id'][customer_id].append(
                        UserDataPerStep(current_date, active=False))

            active_users_over_time_statistics['time'].append(current_date)
            active_users_over_time_statistics['n_users'].append(len(active_users))

            print("n_users:", len(active_users))

            for algo in range(len(self.abtest["algorithms"])):

                idx = int(self.abtest["algorithms"][algo]["id"]) - int(self.abtest["algorithms"][0]["id"])
                k = int(self.abtest["topk"])
                start_date = dt_start.strftime('%Y-%m-%d')

                if self.abtest["algorithms"][algo]["name"] == "ItemKNN":

                    diff = (dt_current_date - dynamic_info_algorithms[idx]["dt_start_LookBackWindow"]).days - \
                           int(self.abtest["algorithms"][algo]["parameters"]["LookBackWindow"])
                    if diff > 0:
                        dynamic_info_algorithms[idx]["dt_start_LookBackWindow"] += pd.DateOffset(days=diff)
                        start_date = dynamic_info_algorithms[idx]["dt_start_LookBackWindow"].strftime('%Y-%m-%d')

                    if n_day:
                        dt_prev_day = dt_current_date - pd.DateOffset(days=1)
                        prev_day = dt_prev_day.strftime('%Y-%m-%d')
                        retrain = (dt_current_date - dynamic_info_algorithms[idx]["dt_start_RetrainInterval"]).days
                        interactions = self.database_connection.session.execute(f"SELECT customer_id, article_id from purchase WHERE \
                            CAST(timestamp as DATE) BETWEEN '{start_date}' AND '{prev_day}'").fetchall()
                        for i in range(len(interactions)):
                            interactions[i] = (interactions[i][0], interactions[i][1])

                        if (retrain > int(self.abtest["algorithms"][algo]["parameters"]['RetrainInterval'])):
                            # retrain interval bereikt => train de KNN algoritme
                            dynamic_info_algorithms[idx]["KNN"].train(interactions)
                            dynamic_info_algorithms[idx]["dt_start_RetrainInterval"] = dt_current_date - pd.DateOffset(
                                days= \
                                    (retrain - int(
                                        self.abtest["algorithms"][algo]["parameters"]['RetrainInterval']) - 1))
                            # 2020-01-01 - 2020-01-05 = 4 -> 2 keer trainen?   momenten waarop getrain moet worden:
                            # 2020-01-01, 2020-01-03, 2020-01-05

                        for cc in range(len(interactions)):
                            if interactions[cc][0] in user_histories:
                                user_histories[interactions[cc][0]].append(interactions[cc][1])

                        # top_k_random = self.database_connection.session.execute(f"SELECT SUBQUERY.article_id FROM (SELECT
                        # article_id FROM article ORDER BY RANDOM() LIMIT {k}) as SUBQUERY ORDER BY article_id
                        # ASC").fetchall() remove_tuples(top_k_random)

                        # for key in list(user_histories.keys()): #random moet gedaan worden in loop om unieke topk
                        # voor elke use te maken maar is trager if not(user_histories[key]):
                        # data_per_user_over_time_statistics['customer_id'][key][-1].algorithm_data.append(
                        # RANDOM_DATA(id=idx, topk=top_k_random, name="ItemKNN")) del user_histories[key]

                        index2item_id = {index: item_id for index, item_id in enumerate(user_histories)}

                        # als training mag gebeuren maximaal window_size geleden, moeten we dit dan ook doen met de
                        # history van de users of moeten we hun history nemen van het begin
                        histories = list(user_histories.values())
                        print(histories)
                        recommendations = dynamic_info_algorithms[idx]["KNN"].recommend_all(histories, k)

                        # TODO: print all topk recommendations for all users?

                        for cc in range(len(recommendations)):
                            data_per_user_over_time_statistics['customer_id'][index2item_id[cc]][
                                -1].algorithm_data.append(
                                KNNData(id=idx, topk=recommendations[cc], history=histories[cc]))
                            # print(interactions[:3])
                            # top_k_over_time_statistics[idx].append(copy.deepcopy(top_k_over_time_statistics[idx][-1]))

                        # clicks = self.database_connection.session.execute(f"SELECT COUNT(DISTINCT SUBQUERY6.customer_id) FROM (
                        # SELECT * FROM \ (SELECT SUBQUERY1.customer_id, SUBQUERY1.article_id FROM (SELECT * FROM
                        # purchase WHERE CAST(timestamp as DATE) = \ '{current_date}') AS SUBQUERY1) AS SUBQUERY2
                        # NATURAL JOIN (SELECT SUBQUERY.article_id, count(*) AS popular_items FROM \ (SELECT * FROM
                        # purchase WHERE CAST(timestamp as DATE) BETWEEN '{start_date}' AND '{current_date}') AS
                        # SUBQUERY GROUP \ BY SUBQUERY.article_id ORDER BY popular_items DESC LIMIT {k}) AS
                        # SUBQUERY5) AS SUBQUERY6").fetchone()[0]

                        # print("clicks:",clicks) CTR = clicks/float(n_active_users) print("CTR",CTR) print(
                        # f"algorithms {algo}: top_k (BETWEEN {start_date} AND {prev_day}):",
                        # top_k_over_time_statistics[idx][-1])

                        # SELECT customer_id, array_to_string(array_agg(article_id), ' ') FROM test3 WHERE CAST(
                        # timestamp as DATE) BETWEEN '2020-01-01' and '2020-01-03' GROUP BY customer_id;
                    else:
                        # print(top_k_random) #[(774254001,), (794389001,), (800528001,)]
                        print(len(active_users))
                        top_k_random = self.database_connection.session.execute(
                            f"SELECT SUBQUERY.article_id FROM (SELECT article_id FROM article ORDER BY RANDOM() LIMIT {k}) as SUBQUERY ORDER BY article_id ASC").fetchall()
                        remove_tuples(top_k_random)
                        for i in range(
                                len(active_users)):  # random moet gedaan worden in loop om unieke topk voor elke use te maken maar is trager
                            data_per_user_over_time_statistics['customer_id'][active_users[i]][
                                -1].algorithm_data.append(
                                RandomData(id=idx, topk=top_k_random, name="ItemKNN"))  # DEEP COPY????????????

                        print(f"algorithms {algo}: top_k random:", top_k_random)

                        # train KNN algoritme to initialize it:
                        interactions = self.database_connection.session.execute(
                            f"SELECT customer_id, article_id from purchase").fetchall()
                        for i in range(len(interactions)):
                            interactions[i] = (interactions[i][0], interactions[i][1])
                        dynamic_info_algorithms[idx]["KNN"].train(interactions)

                        # top_k_over_time_statistics[idx].append(top_k_random)

                        # print(f"algorithms {algo}: top_k random:",top_k_over_time_statistics[idx][-1])

                        # query_str = "SELECT article_id FROM article WHERE"
                        # for articleid in range(len(k_random_items)):
                        #     if not(articleid):
                        #         query_str += " article_id = " + k_random_items[articleid][0]
                        #     else:
                        #         query_str += " OR article_id = " + k_random_items[articleid][0]

                        # clicks = self.database_connection.session.execute(f"SELECT COUNT(DISTINCT SUBQUERY6.customer_id) FROM (
                        # SELECT * FROM \ (SELECT SUBQUERY1.customer_id, SUBQUERY1.article_id FROM (SELECT * FROM
                        # purchase WHERE CAST(timestamp as DATE) = \ '{current_date}') AS SUBQUERY1) AS SUBQUERY2
                        # NATURAL JOIN ({query_str}) AS SUBQUERY5) AS SUBQUERY6").fetchone()[0]

                        # print("clicks:",clicks)
                        # CTR = clicks/float(n_active_users)
                        # print("CTR",CTR)

                elif self.abtest["algorithms"][algo]["name"] == "Recency":

                    if n_day:
                        dt_prev_day = dt_current_date - pd.DateOffset(days=1)
                        prev_day = dt_prev_day.strftime('%Y-%m-%d')
                        retrain = (dt_current_date - dynamic_info_algorithms[idx]["dt_start_RetrainInterval"]).days
                        if (retrain > int(self.abtest["algorithms"][algo]["parameters"]['RetrainInterval'])):
                            # retrain interval bereikt => bereken nieuwe topk voor specifieke algoritme
                            top_k = self.database_connection.session.execute(f"SELECT t.article_id, t.timestamp FROM(SELECT article_id,MIN(timestamp) AS timestamp \
                                FROM purchase WHERE CAST(timestamp as DATE) BETWEEN '{start_date}' AND '{prev_day}' GROUP BY article_id) x JOIN purchase t ON \
                                    x.article_id = t.article_id AND x.timestamp = t.timestamp ORDER BY timestamp DESC LIMIT {k}").fetchall()

                            top_k_items = []
                            for i in range(len(top_k)):
                                top_k_items.append(top_k[i][0])
                            # top_k_over_time_statistics[idx].append(top_k)
                            dynamic_info_algorithms[idx]["dt_start_RetrainInterval"] = dt_current_date - pd.DateOffset(
                                days=(retrain - int(
                                    self.abtest["algorithms"][algo]["parameters"]['RetrainInterval']) - 1))
                        else:
                            top_k_items = dynamic_info_algorithms[idx]["prev_top_k"]
                            # top_k_over_time_statistics[idx].append(copy.deepcopy(top_k_over_time_statistics[idx][-1]))

                        print(
                            f"current_day: {current_date}, algorithms {algo}: top_k (BETWEEN {start_date} AND {prev_day}):",
                            top_k_items)

                        for i in range(len(active_users)):
                            data_per_user_over_time_statistics['customer_id'][active_users[i]][
                                -1].algorithm_data.append(RecencyData(id=idx, topk=copy.deepcopy(top_k_items)))

                        # clicks = self.database_connection.session.execute(f"SELECT COUNT(DISTINCT SUBQUERY6.customer_id) FROM (
                        # SELECT * FROM \ (SELECT SUBQUERY1.customer_id, SUBQUERY1.article_id FROM (SELECT * FROM
                        # purchase WHERE CAST(timestamp as DATE) = \ '{current_date}') AS SUBQUERY1) AS SUBQUERY2
                        # NATURAL JOIN (SELECT SUBQUERY.article_id, count(*) AS popular_items FROM \ (SELECT * FROM
                        # purchase WHERE CAST(timestamp as DATE) BETWEEN '{start_date}' AND '{current_date}') AS
                        # SUBQUERY GROUP \ BY SUBQUERY.article_id ORDER BY popular_items DESC LIMIT {k}) AS
                        # SUBQUERY5) AS SUBQUERY6").fetchone()[0]

                        # print("clicks:",clicks) CTR = clicks/float(n_active_users) print("CTR",CTR) print(
                        # f"algorithms {algo}: top_k (BETWEEN {start_date} AND {prev_day}):",
                        # top_k_over_time_statistics[idx][-1])

                    else:
                        top_k_random = self.database_connection.session.execute(
                            f"SELECT SUBQUERY.article_id FROM (SELECT article_id FROM article ORDER BY RANDOM() LIMIT {k}) as SUBQUERY ORDER BY article_id ASC").fetchall()
                        remove_tuples(top_k_random)
                        for i in range(len(active_users)):
                            data_per_user_over_time_statistics['customer_id'][active_users[i]][
                                -1].algorithm_data.append(
                                RandomData(id=idx, topk=copy.deepcopy(top_k_random), name="Recency"))
                        # top_k_over_time_statistics[idx].append(top_k_random)
                        print(f"current_day: {current_date}, algorithms {algo}: top_k random:", top_k_random)

                        # train Recency algoritme to initialize it:
                        top_k = self.database_connection.session.execute(f"SELECT t.article_id, t.timestamp FROM(SELECT article_id,MIN(timestamp) AS timestamp \
                                FROM purchase WHERE CAST(timestamp as DATE) = '{start_date}' GROUP BY article_id) x JOIN purchase t ON \
                                    x.article_id = t.article_id AND x.timestamp = t.timestamp ORDER BY timestamp DESC LIMIT {k}").fetchall()
                        top_k_items = []
                        for i in range(len(top_k)):
                            top_k_items.append(top_k[i][0])

                        dynamic_info_algorithms[idx]["prev_top_k"] = top_k_items
                        # query_str = "SELECT article_id FROM article WHERE"
                        # for articleid in range(len(k_random_items)):
                        #     if not(articleid):
                        #         query_str += " article_id = " + k_random_items[articleid][0]
                        #     else:
                        #         query_str += " OR article_id = " + k_random_items[articleid][0]

                        # clicks = self.database_connection.session.execute(f"SELECT COUNT(DISTINCT SUBQUERY6.customer_id) FROM (
                        # SELECT * FROM \ (SELECT SUBQUERY1.customer_id, SUBQUERY1.article_id FROM (SELECT * FROM
                        # purchase WHERE CAST(timestamp as DATE) = \ '{current_date}') AS SUBQUERY1) AS SUBQUERY2
                        # NATURAL JOIN ({query_str}) AS SUBQUERY5) AS SUBQUERY6").fetchone()[0]

                        # print("clicks:",clicks)
                        # CTR = clicks/float(n_active_users)
                        # print("CTR",CTR)

                elif self.abtest["algorithms"][algo]["name"] == "Popularity":

                    diff = (dt_current_date - dynamic_info_algorithms[idx]["dt_start_LookBackWindow"]).days - \
                           int(self.abtest["algorithms"][algo]["parameters"]["LookBackWindow"])
                    if diff > 0:
                        dynamic_info_algorithms[idx]["dt_start_LookBackWindow"] += pd.DateOffset(days=diff)
                        start_date = dynamic_info_algorithms[idx]["dt_start_LookBackWindow"].strftime('%Y-%m-%d')

                    if n_day:
                        dt_prev_day = dt_current_date - pd.DateOffset(days=1)
                        prev_day = dt_prev_day.strftime('%Y-%m-%d')
                        retrain = (dt_current_date - dynamic_info_algorithms[idx]["dt_start_RetrainInterval"]).days
                        if (retrain > int(self.abtest["algorithms"][algo]["parameters"]['RetrainInterval'])):
                            # retrain interval bereikt => bereken nieuwe topk voor specifieke algoritme
                            top_k = self.database_connection.session.execute(f"SELECT SUBQUERY.article_id, count(*) AS popular_items FROM \
                                (SELECT * FROM purchase WHERE CAST(timestamp as DATE) BETWEEN '{start_date}' AND '{prev_day}') AS SUBQUERY GROUP \
                                    BY SUBQUERY.article_id ORDER BY popular_items DESC LIMIT {k}").fetchall()

                            top_k_items = []
                            for i in range(len(top_k)):
                                top_k_items.append(top_k[i][0])

                            # top_k_over_time_statistics[idx].append(top_k)
                            dynamic_info_algorithms[idx]["dt_start_RetrainInterval"] = dt_current_date - pd.DateOffset(
                                days=(retrain - int(
                                    self.abtest["algorithms"][algo]["parameters"]['RetrainInterval']) - 1))
                        else:
                            top_k_items = dynamic_info_algorithms[idx]["prev_top_k"]
                            # top_k_over_time_statistics[idx].append(copy.deepcopy(top_k_over_time_statistics[idx][-1]))

                        print(f"algorithms {algo}: top_k (BETWEEN {start_date} AND {prev_day}):", top_k_items)

                        for i in range(len(active_users)):
                            data_per_user_over_time_statistics['customer_id'][active_users[i]][
                                -1].algorithm_data.append(PopularityData(id=idx, topk=copy.deepcopy(top_k_items)))

                        # clicks = self.database_connection.session.execute(f"SELECT COUNT(DISTINCT SUBQUERY6.customer_id) FROM (
                        # SELECT * FROM \ (SELECT SUBQUERY1.customer_id, SUBQUERY1.article_id FROM (SELECT * FROM
                        # purchase WHERE CAST(timestamp as DATE) = \ '{current_date}') AS SUBQUERY1) AS SUBQUERY2
                        # NATURAL JOIN (SELECT SUBQUERY.article_id, count(*) AS popular_items FROM \ (SELECT * FROM
                        # purchase WHERE CAST(timestamp as DATE) BETWEEN '{start_date}' AND '{current_date}') AS
                        # SUBQUERY GROUP \ BY SUBQUERY.article_id ORDER BY popular_items DESC LIMIT {k}) AS
                        # SUBQUERY5) AS SUBQUERY6").fetchone()[0]

                        # print("clicks:",clicks) CTR = clicks/float(n_active_users) print("CTR",CTR) print(
                        # f"algorithms {algo}: top_k (BETWEEN {start_date} AND {prev_day}):",
                        # top_k_over_time_statistics[idx][-1])

                    else:
                        top_k_random = self.database_connection.session.execute(
                            f"SELECT SUBQUERY.article_id FROM (SELECT article_id FROM article ORDER BY RANDOM() LIMIT {k}) as SUBQUERY ORDER BY article_id ASC").fetchall()
                        remove_tuples(top_k_random)
                        for i in range(len(active_users)):
                            data_per_user_over_time_statistics['customer_id'][active_users[i]][
                                -1].algorithm_data.append(
                                RandomData(id=idx, topk=copy.deepcopy(top_k_random), name="Popularity"))
                        print(f"algorithms {algo}: top_k random:", top_k_random)

                        # train Popularity algorithms to initialize it:
                        top_k = self.database_connection.session.execute(f"SELECT SUBQUERY.article_id, count(*) AS popular_items FROM \
                                (SELECT * FROM purchase WHERE CAST(timestamp as DATE) = '{start_date}') AS SUBQUERY GROUP \
                                    BY SUBQUERY.article_id ORDER BY popular_items DESC LIMIT {k}").fetchall()

                        top_k_items = []
                        for i in range(len(top_k)):
                            top_k_items.append(top_k[i][0])
                        dynamic_info_algorithms[idx]["prev_top_k"] = top_k_items

                        # query_str = "SELECT article_id FROM article WHERE"
                        # for articleid in range(len(k_random_items)):
                        #     if not(articleid):
                        #         query_str += " article_id = " + k_random_items[articleid][0]
                        #     else:
                        #         query_str += " OR article_id = " + k_random_items[articleid][0]

                        # clicks = self.database_connection.session.execute(f"SELECT COUNT(DISTINCT SUBQUERY6.customer_id) FROM (
                        # SELECT * FROM \ (SELECT SUBQUERY1.customer_id, SUBQUERY1.article_id FROM (SELECT * FROM
                        # purchase WHERE CAST(timestamp as DATE) = \ '{current_date}') AS SUBQUERY1) AS SUBQUERY2
                        # NATURAL JOIN ({query_str}) AS SUBQUERY5) AS SUBQUERY6").fetchone()[0]

                        # print("clicks:",clicks)
                        # CTR = clicks/float(n_active_users)
                        # print("CTR",CTR)

                time.sleep(0.3)
                self.progress = n_day * 100.0 / float(dayz)
        return
