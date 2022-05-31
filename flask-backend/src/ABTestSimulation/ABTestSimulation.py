import random
import time

import numpy
import pandas as pd
from psycopg2.extensions import register_adapter, AsIs

from src.ABTestSimulation.Algorithms.iknn import ItemKNNIterative
from src.DatabaseConnection.DatabaseConnection import DatabaseConnection

from src.socketioEvents.reportProgress import report_progress_steps, report_progress_percentage


def addapt_numpy_float64(numpy_float64):
    return AsIs(numpy_float64)


def addapt_numpy_int64(numpy_int64):
    return AsIs(numpy_int64)


register_adapter(numpy.float64, addapt_numpy_float64)
register_adapter(numpy.int64, addapt_numpy_int64)


class UserDataPerStep:
    def __init__(self, step_date, active):
        self.step_date = step_date
        self.algorithm_data = []
        self.active = active


def remove_tuples(arr):
    for i in range(len(arr)):
        arr[i] = arr[i][0]
    e = time.time()


def generateRandomTopK(listx, items):
    return random.sample(listx, items)


class ABTestSimulation():
    def __init__(self, database_connection: DatabaseConnection, abtest, task_id=""):
        self.frontend_data = []
        self.done = False
        self.abtest = abtest
        self.database_connection: DatabaseConnection = database_connection

        self.prev_progress = 0
        self.current_progress = 0
        self.test_id = task_id

    def calculateAttributions(self, days: int):
        name = f'attr_abtest_{self.abtest["abtest_id"]}_{days}d'
        print(f'Calculating attributions @{days}D Time since start:{time.time() - self.start_time}')
        query = f'''
            create materialized view {name} as (
            select algorithm_id, bought_on, unique_customer_id, 
                count(distinct (unique_article_id)) as attributions, 
                sum(price)/count(distinct (unique_article_id)) revenue_per_attr    
            from (select abtest_id, start_date, end_date
                      from ab_test
                      where abtest_id = {self.abtest["abtest_id"]}) ab_test
                         natural join algorithm
                         natural join statistics
                         natural join recommendation
                         natural join customer
                         natural join article
                         join purchase p on article.article_id = p.article_id and article.dataset_name = p.dataset_name and
                                            customer.customer_id = p.customer_id and customer.dataset_name = p.dataset_name and
                                            date_of between bought_on - interval '30 days' and bought_on
            where bought_on between start_date and end_date
            group by algorithm_id, bought_on, unique_customer_id
                );
            '''
        self.database_connection.engine_execute(query)
        query = f'create index {name}_on_bought_on on {name}(bought_on)'
        self.database_connection.engine_execute(query)

    def calculateClickedThrough(self):
        print(f'Calculating ClickedThrough {self.start_time} Time since start:{time.time() - self.start_time}')
        query = f'''
        update customer_specific_statistics css
            set clicked_through = ctr.clicked_through
        from (select algorithm_id, statistics_id, unique_customer_id, 
                case when count(distinct (unique_article_id)) > 0 then true else false end as clicked_through
            from (select abtest_id, start_date, end_date,stepsize
                from ab_test where abtest_id = {self.abtest["abtest_id"]}) ab_test
         natural join algorithm
         natural join statistics
         natural join recommendation
         natural join customer
         natural join article
         join purchase p on article.article_id = p.article_id and article.dataset_name = p.dataset_name and
                            customer.customer_id = p.customer_id and customer.dataset_name = p.dataset_name and
                            bought_on between date_of and date_of + stepsize::integer
        where bought_on between start_date and end_date
        group by algorithm_id, statistics_id, unique_customer_id ) ctr
        where ctr.unique_customer_id = css.unique_customer_id and css.statistics_id = ctr.statistics_id
        ;        
        '''
        self.database_connection.engine_execute(query)

    def collectStatistics(self):
        self.calculateAttributions(7)
        self.calculateAttributions(30)
        self.calculateClickedThrough()

    def insertCustomer(self, unique_customer_id, statistics_id):
        self.database_connection.session.execute(
            "INSERT INTO customer_specific_statistics(unique_customer_id, statistics_id) "
            "VALUES(:unique_customer_id, :statistics_id)",
            {
                "unique_customer_id": unique_customer_id, "statistics_id": statistics_id
            }
        )

    def insertRecommendation(self, recommendation_id, unique_customer_id, statistics_id, unique_article_id):
        self.database_connection.session.execute(
            "INSERT INTO recommendation(recommendation_id, unique_customer_id, statistics_id, unique_article_id) "
            "VALUES(:recommendation_id, :customer_id, :statistics_id, :unique_article_id)",
            {
                "recommendation_id": recommendation_id, "customer_id": unique_customer_id,
                "statistics_id": statistics_id, "unique_article_id": unique_article_id
            })

    def insertRecommendations(self, recommendations, statistics_id, unique_customer_id):
        self.insertCustomer(statistics_id=statistics_id, unique_customer_id=unique_customer_id
                            )

        for vv in range(len(recommendations)):
            self.insertRecommendation(recommendation_id=vv + 1, unique_customer_id=unique_customer_id,
                                      statistics_id=statistics_id,
                                      unique_article_id=recommendations[vv])
        self.database_connection.session.commit()

    def run(self):
        self.start_time = time.time()
        # Start Date
        dt_start = pd.to_datetime(self.abtest["start"], format='%Y-%m-%d')
        # Current Date = Start Date
        dt_current_date = dt_start
        # End Date
        dt_end = pd.to_datetime(self.abtest["end"], format='%Y-%m-%d')
        # Date Diff
        dayz = (dt_end - dt_start).days

        start_date = dt_start.strftime('%Y-%m-%d')

        end_date = dt_end.strftime('%Y-%m-%d')

        # dynamic algorithms info that changes during simulation
        dynamic_info_algorithms = {}
        dataset_name = self.abtest["dataset_name"]
        all_customer_ids = self.database_connection.getAllUniqueCumstomerIDs(dataset_name)
        all_unique_item_ids = self.database_connection.getAllUniqueArticleIDs(dataset_name)
        remove_tuples(all_unique_item_ids)

        # data statistics over time (x-axis = time)
        top_k_over_time_statistics = {'time': []}
        active_users_over_time_statistics = {'time': [], 'n_users': []}
        data_per_user_over_time_statistics = {'time': [],
                                              'customer_id': {customer_id.unique_customer_id: [] for customer_id in
                                                              all_customer_ids}}

        for i in range(len(self.abtest["algorithms"])):
            idx = int(self.abtest["algorithms"][i]["id"]) - \
                  int(self.abtest["algorithms"][0]["id"])
            top_k_over_time_statistics[idx] = []

            if self.abtest["algorithms"][i]["name"] == "ItemKNN":
                dynamic_info_algorithms[idx] = {
                    "dt_start_LookBackWindow": pd.to_datetime(self.abtest["start"], format='%Y-%m-%d'),
                    "dt_start_RetrainInterval": pd.to_datetime(self.abtest["start"], format='%Y-%m-%d'),
                    "KNN": ItemKNNIterative(k=int(
                        self.abtest["algorithms"][i]["parameters"]["KNearest"]),
                        normalize=(self.abtest["algorithms"][i]["parameters"]["Normalize"] == 'True'))}

            elif self.abtest["algorithms"][i]["name"] == "Recency":
                dynamic_info_algorithms[idx] = {"dt_start_RetrainInterval": pd.to_datetime(
                    self.abtest["start"], format='%Y-%m-%d'), "prev_top_k": []}

            elif self.abtest["algorithms"][i]["name"] == "Popularity":
                dynamic_info_algorithms[idx] = {
                    "dt_start_LookBackWindow": pd.to_datetime(self.abtest["start"], format='%Y-%m-%d'),
                    "dt_start_RetrainInterval": pd.to_datetime(self.abtest["start"], format='%Y-%m-%d'),
                    "prev_top_k": []}

        active_users = self.database_connection.session.execute(
            f"select distinct bought_on, unique_customer_id from purchase natural join customer where bought_on between '{start_date}' and '{end_date}' order by bought_on,unique_customer_id").fetchall()  # end_date not included?

        purchases = self.database_connection.session.execute(
            f"select distinct customer_id, article_id, unique_customer_id, unique_article_id, bought_on from purchase natural join customer natural join article where dataset_name = '{dataset_name}' and  bought_on between '{start_date}' and '{end_date}' order by bought_on, unique_customer_id").fetchall()  # end_date not included?

        purchases_length = len(purchases)

        active_users_length = len(active_users)

        start_purchases = 0
        start_active_users = 0
        start_active_users_next = 0

        # SIMULATION LOOP MAIN
        for n_day in range(0, int(dayz) + 1, int(self.abtest["stepsize"])):
            print(f'Day: {n_day}/{dayz} Time since start:{time.time() - self.start_time}')
            report_progress_steps(self.test_id, n_day, int(dayz))

            start_active_users = start_active_users_next

            if n_day:
                dt_current_date = dt_current_date + \
                                  pd.DateOffset(days=int(self.abtest["stepsize"]))

            current_date = dt_current_date.strftime('%Y-%m-%d')

            # statistics per step per algorithm customer_specific_statistics per active user (als n = active_users
            # dan is er n customer_specific_statistics rows) k recommendations per active user

            for algo in range(len(self.abtest["algorithms"])):

                self.database_connection.session.execute(
                    "INSERT INTO statistics(date_of, algorithm_id)"
                    "VALUES(:datetime, :algorithm_id)",
                    {"datetime": current_date, "algorithm_id": self.abtest["algorithms"][algo]["id"]})

                statistics_id = self.database_connection.session.execute(
                    f'SELECT last_value FROM statistics_statistics_id_seq').fetchone()[0]
                self.database_connection.session.commit()

                idx = int(self.abtest["algorithms"][algo]["id"]) - \
                      int(self.abtest["algorithms"][0]["id"])
                k = int(self.abtest["topk"])
                start_date = dt_start.strftime('%Y-%m-%d')

                if self.abtest["algorithms"][algo]["name"] == "ItemKNN":

                    diff = (dt_current_date - dynamic_info_algorithms[idx]["dt_start_LookBackWindow"]).days - \
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
                        numz = int(self.abtest["algorithms"][algo]["parameters"]["LookBackWindow"])
                        retrain = (
                                dt_current_date - dynamic_info_algorithms[idx]["dt_start_RetrainInterval"]).days
                        interactions = self.database_connection.session.execute(f'''SELECT unique_customer_id, unique_article_id from purchase natural join article natural join customer WHERE dataset_name = '{dataset_name}' AND bought_on BETWEEN '{current_date}'::date - interval '{numz} days' AND '{current_date}'::date''').fetchall()
                        self.database_connection.session.commit()

                        for i in range(len(interactions)):
                            interactions[i] = (
                                interactions[i][0], interactions[i][1])

                        if retrain > int(self.abtest["algorithms"][algo]["parameters"]['RetrainInterval']):
                            # retrain interval bereikt => train de KNN algoritme
                            dynamic_info_algorithms[idx]["KNN"].train(
                                interactions, unique_item_ids=all_unique_item_ids)
                            dynamic_info_algorithms[idx]["dt_start_RetrainInterval"] = dt_current_date - pd.DateOffset(
                                days=(retrain - int(
                                    self.abtest["algorithms"][algo]["parameters"]['RetrainInterval']) - 1))
                            # 2020-01-01 - 2020-01-05 = 4 -> 2 keer trainen?   momenten waarop getrain moet worden: 2020-01-01, 2020-01-03, 2020-01-05


                        user2purchasedItems = dict()

                        while (start_purchases + 1 < purchases_length) and (
                                purchases[start_purchases + 1][4] == purchases[start_purchases][4]):
                            if purchases[start_purchases][2] not in user2purchasedItems:
                                user2purchasedItems[purchases[start_purchases][2]] = []
                            else:
                                user2purchasedItems[purchases[start_purchases][2]].append(purchases[start_purchases][3])
                            start_purchases += 1

                        if purchases[start_purchases][2] not in user2purchasedItems:
                            user2purchasedItems[purchases[start_purchases][2]] = []
                        else:
                            user2purchasedItems[purchases[start_purchases][2]].append(purchases[start_purchases][3])

                        start_purchases += 1

                        user_histories = dict()
                
                        for cc in range(len(interactions)):
                            if interactions[cc][0] in user2purchasedItems:
                                if interactions[cc][0] in user_histories:
                                    user_histories[interactions[cc][0]].append(interactions[cc][1])
                                else:
                                    user_histories[interactions[cc][0]] = [interactions[cc][1]]

                        index2customer_id = {index: customer_id for index,
                                                                    customer_id in enumerate(user_histories)}

                        # als training mag gebeuren maximaal window_size geleden, moeten we dit dan ook doen met de
                        # history van de users of moeten we hun history nemen van het begin
                        histories = list(user_histories.values())
                        # print(histories)
                        recommendations = dynamic_info_algorithms[idx]["KNN"].recommend_all(
                            histories, k)
                        
                        lxlist = []
                        lylist = []

                        for cc in range(len(recommendations)):
                            recommendations[cc] += generateRandomTopK(all_unique_item_ids, k - len(recommendations[cc]))
                            lylist.append([index2customer_id[cc], statistics_id])
                            for vv in range(len(recommendations[cc])):
                                lxlist.append([vv+1, index2customer_id[cc], statistics_id, recommendations[cc][vv]])
                        
                        dfy = pd.DataFrame(lylist)
                        dfx = pd.DataFrame(lxlist)

                        dfy.columns = ['unique_customer_id', 'statistics_id']
                        dfx.columns = ['recommendation_id', 'unique_customer_id', 'statistics_id', 'unique_article_id']

                        self.database_connection.session_insert_pd_dataframe(dfy, 'customer_specific_statistics')
                        self.database_connection.session_insert_pd_dataframe(dfx, 'recommendation')

                        self.database_connection.session.commit()


                    else:
                        top_k_random = generateRandomTopK(
                            all_unique_item_ids, k)
                        
                        lxlist = []
                        lylist = []

                        local_start_active_users = start_active_users

                        while (local_start_active_users + 1 < active_users_length) and (
                                active_users[local_start_active_users + 1][0] == active_users[local_start_active_users][
                            0]):
                            lylist.append([active_users[local_start_active_users][1], statistics_id])
                            for vv in range(k):
                                lxlist.append([vv + 1, active_users[local_start_active_users][1], statistics_id,
                                               top_k_random[vv]])
                            local_start_active_users += 1
                        lylist.append([active_users[local_start_active_users][1], statistics_id])
                        for vv in range(k):
                            lxlist.append(
                                [vv + 1, active_users[local_start_active_users][1], statistics_id, top_k_random[vv]])
                        local_start_active_users += 1
                        start_active_users_next = local_start_active_users

                        dfy = pd.DataFrame(lylist)
                        dfx = pd.DataFrame(lxlist)

                        dfy.columns = ['unique_customer_id', 'statistics_id']
                        dfx.columns = ['recommendation_id', 'unique_customer_id', 'statistics_id', 'unique_article_id']

                        self.database_connection.session_insert_pd_dataframe(dfy, 'customer_specific_statistics')
                        self.database_connection.session_insert_pd_dataframe(dfx, 'recommendation')

                        self.database_connection.session.commit()

                        # train KNN algoritme to initialize it:
                        numz = int(self.abtest["algorithms"][algo]["parameters"]["LookBackWindow"])
                        interactions = self.database_connection.session.execute(f'''SELECT SUBQUERY.unique_customer_id, SUBQUERY.unique_article_id FROM (SELECT * FROM purchase natural join article natural join customer WHERE bought_on BETWEEN '{current_date}'::date - interval '{numz} days' AND '{current_date}'::date AND dataset_name = '{dataset_name}') AS SUBQUERY''').fetchall()  # BETWEEN zetten
                        for i in range(len(interactions)):
                            interactions[i] = (
                                interactions[i][0], interactions[i][1])
                        dynamic_info_algorithms[idx]["KNN"].train(
                            interactions, unique_item_ids=all_unique_item_ids)


                elif self.abtest["algorithms"][algo]["name"] == "Recency":

                    if n_day:
                        dt_prev_day = dt_current_date - pd.DateOffset(days=1)
                        prev_day = dt_prev_day.strftime('%Y-%m-%d')
                        retrain = (
                                dt_current_date - dynamic_info_algorithms[idx]["dt_start_RetrainInterval"]).days
                        if (retrain > int(self.abtest["algorithms"][algo]["parameters"]['RetrainInterval'])):
                            # retrain interval bereikt => bereken nieuwe topk voor specifieke algoritme                     x natural JOIN purchase t natural join article a ORDER BY bought_on
                            top_k = self.database_connection.session.execute(
                                f"SELECT unique_article_id, MIN(bought_on) FROM purchase natural join article WHERE bought_on < '{current_date}' and dataset_name = '{dataset_name}' GROUP BY unique_article_id ORDER BY MIN(bought_on) DESC LIMIT {k}").fetchall()
                            top_k_items = []
                            for i in range(len(top_k)):
                                top_k_items.append(top_k[i][0])
                            # top_k_over_time_statistics[idx].append(top_k)
                            dynamic_info_algorithms[idx]["dt_start_RetrainInterval"] = dt_current_date - pd.DateOffset(
                                days=(retrain - int(
                                    self.abtest["algorithms"][algo]["parameters"]['RetrainInterval']) - 1))
                            dynamic_info_algorithms[idx]["prev_top_k"] = top_k_items
                        else:
                            top_k_items = dynamic_info_algorithms[idx]["prev_top_k"]

                        lxlist = []
                        lylist = []
                        local_start_active_users = start_active_users

                        while (local_start_active_users + 1 < active_users_length) and (
                                active_users[local_start_active_users + 1][0] == active_users[local_start_active_users][
                            0]):
                            lylist.append([active_users[local_start_active_users][1], statistics_id])
                            for vv in range(k):
                                lxlist.append(
                                    [vv + 1, active_users[local_start_active_users][1], statistics_id, top_k_items[vv]])
                            local_start_active_users += 1
                        lylist.append([active_users[local_start_active_users][1], statistics_id])
                        for vv in range(k):
                            lxlist.append(
                                [vv + 1, active_users[local_start_active_users][1], statistics_id, top_k_items[vv]])
                        local_start_active_users += 1
                        start_active_users_next = local_start_active_users

                        dfy = pd.DataFrame(lylist)
                        dfx = pd.DataFrame(lxlist)

                        dfy.columns = ['unique_customer_id', 'statistics_id']
                        dfx.columns = ['recommendation_id', 'unique_customer_id', 'statistics_id', 'unique_article_id']

                        self.database_connection.session_insert_pd_dataframe(dfy, 'customer_specific_statistics')
                        self.database_connection.session_insert_pd_dataframe(dfx, 'recommendation')

                        self.database_connection.session.commit()


                    else:
                        top_k = self.database_connection.session.execute(f"SELECT a.unique_article_id, t.bought_on FROM(SELECT article_id,MIN(bought_on) AS bought_on \
                                FROM purchase WHERE bought_on < '{current_date}'  AND dataset_name = '{dataset_name}' GROUP BY article_id) x natural JOIN purchase t natural join article a ORDER BY bought_on DESC LIMIT {k}").fetchall()
                        top_k_items = []
                        for i in range(len(top_k)):
                            top_k_items.append(top_k[i][0])
                        if len(top_k_items) < k:
                            top_k_random = generateRandomTopK(
                                all_unique_item_ids, k)
                        else:
                            top_k_random = top_k_items

                        lxlist = []
                        lylist = []

                        local_start_active_users = start_active_users

                        while (local_start_active_users + 1 < active_users_length) and (
                                active_users[local_start_active_users + 1][0] == active_users[local_start_active_users][
                            0]):
                            lylist.append([active_users[local_start_active_users][1], statistics_id])
                            for vv in range(k):
                                lxlist.append([vv + 1, active_users[local_start_active_users][1], statistics_id,
                                               top_k_random[vv]])
                            local_start_active_users += 1
                        lylist.append([active_users[local_start_active_users][1], statistics_id])
                        for vv in range(k):
                            lxlist.append(
                                [vv + 1, active_users[local_start_active_users][1], statistics_id, top_k_random[vv]])
                        local_start_active_users += 1
                        start_active_users_next = local_start_active_users

                        dfy = pd.DataFrame(lylist)
                        dfx = pd.DataFrame(lxlist)

                        dfy.columns = ['unique_customer_id', 'statistics_id']
                        dfx.columns = ['recommendation_id', 'unique_customer_id', 'statistics_id', 'unique_article_id']

                        self.database_connection.session_insert_pd_dataframe(dfy, 'customer_specific_statistics')
                        self.database_connection.session_insert_pd_dataframe(dfx, 'recommendation')

                        self.database_connection.session.commit()

                        dynamic_info_algorithms[idx]["prev_top_k"] = top_k_random





                elif self.abtest["algorithms"][algo]["name"] == "Popularity":
                    diff = (dt_current_date - dynamic_info_algorithms[idx]["dt_start_LookBackWindow"]).days - \
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
                                dt_current_date - dynamic_info_algorithms[idx]["dt_start_RetrainInterval"]).days
                        if (retrain > int(self.abtest["algorithms"][algo]["parameters"]['RetrainInterval'])):
                            numz = int(self.abtest["algorithms"][algo]["parameters"]["LookBackWindow"])
                            top_k = self.database_connection.session.execute(
                                f"SELECT unique_article_id, count(*) times_bought FROM purchase natural join article WHERE bought_on BETWEEN '{current_date}'::date - interval '{numz} days' AND '{current_date}'::date AND dataset_name = '{dataset_name}' GROUP BY unique_article_id ORDER BY times_bought DESC LIMIT {k}").fetchall()

                            top_k_items = []
                            for i in range(len(top_k)):
                                top_k_items.append(top_k[i][0])

                            dynamic_info_algorithms[idx]["dt_start_RetrainInterval"] = dt_current_date - pd.DateOffset(
                                days=(retrain - int(
                                    self.abtest["algorithms"][algo]["parameters"]['RetrainInterval']) - 1))
                            dynamic_info_algorithms[idx]["prev_top_k"] = top_k_items
                        else:
                            top_k_items = dynamic_info_algorithms[idx]["prev_top_k"]

                            lxlist = []
                            lylist = []

                            local_start_active_users = start_active_users

                            while (local_start_active_users + 1 < active_users_length) and (
                                    active_users[local_start_active_users + 1][0] ==
                                    active_users[local_start_active_users][0]):
                                lylist.append([active_users[local_start_active_users][1], statistics_id])
                                for vv in range(k):
                                    lxlist.append([vv + 1, active_users[local_start_active_users][1], statistics_id,
                                                   top_k_items[vv]])
                                local_start_active_users += 1
                            lylist.append([active_users[local_start_active_users][1], statistics_id])
                            for vv in range(k):
                                lxlist.append(
                                    [vv + 1, active_users[local_start_active_users][1], statistics_id, top_k_items[vv]])
                            local_start_active_users += 1
                            start_active_users_next = local_start_active_users

                            dfy = pd.DataFrame(lylist)
                            dfx = pd.DataFrame(lxlist)

                            dfy.columns = ['unique_customer_id', 'statistics_id']
                            dfx.columns = ['recommendation_id', 'unique_customer_id', 'statistics_id', 'unique_article_id']

                            self.database_connection.session_insert_pd_dataframe(dfy, 'customer_specific_statistics')
                            self.database_connection.session_insert_pd_dataframe(dfx, 'recommendation')

                            self.database_connection.session.commit()

                    else:
                        numz = int(self.abtest["algorithms"][algo]["parameters"]["LookBackWindow"])
                        top_k = self.database_connection.session.execute(
                                f'''SELECT unique_article_id, count(*) times_bought FROM purchase natural join article WHERE bought_on BETWEEN '{current_date}'::date - interval '{numz} days' AND '{current_date}'::date AND dataset_name = '{dataset_name}' GROUP BY unique_article_id ORDER BY times_bought DESC LIMIT {k}''').fetchall()
                        top_k_items = []
                        for i in range(len(top_k)):
                            top_k_items.append(top_k[i][0])
                        if len(top_k_items) < k:
                            top_k_random = generateRandomTopK(
                                all_unique_item_ids, k)
                        else:
                            top_k_random = top_k_items
                        
                        lxlist = []
                        lylist = []

                        local_start_active_users = start_active_users

                        while (local_start_active_users + 1 < active_users_length) and (
                                active_users[local_start_active_users + 1][0] == active_users[local_start_active_users][
                            0]):
                            lylist.append([active_users[local_start_active_users][1], statistics_id])
                            for vv in range(k):
                                lxlist.append([vv + 1, active_users[local_start_active_users][1], statistics_id,
                                               top_k_random[vv]])
                            local_start_active_users += 1
                        lylist.append([active_users[local_start_active_users][1], statistics_id])
                        for vv in range(k):
                            lxlist.append(
                                [vv + 1, active_users[local_start_active_users][1], statistics_id, top_k_random[vv]])
                        local_start_active_users += 1
                        start_active_users_next = local_start_active_users

                        dfy = pd.DataFrame(lylist)
                        dfx = pd.DataFrame(lxlist)

                        dfy.columns = ['unique_customer_id', 'statistics_id']
                        dfx.columns = ['recommendation_id', 'unique_customer_id', 'statistics_id', 'unique_article_id']

                        self.database_connection.session_insert_pd_dataframe(dfy, 'customer_specific_statistics')
                        self.database_connection.session_insert_pd_dataframe(dfx, 'recommendation')

                        self.database_connection.session.commit()

                        dynamic_info_algorithms[idx]["prev_top_k"] = top_k_random

                self.prev_progress = self.current_progress
                self.current_progress = round(n_day / float(dayz), 2) * 100.0

        self.done = True
        self.prev_progress = 0

        self.database_connection.session.commit()

        self.collectStatistics()
        self.current_progress = 100
        report_progress_percentage(self.test_id, 100)

        return

