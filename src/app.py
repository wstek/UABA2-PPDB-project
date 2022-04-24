from flask import Flask, request, session
from database_access import Database
from flask_session import Session
from flask_bcrypt import Bcrypt
from flask_cors import CORS, cross_origin
import base64
import redis
import threading
import time
import pandas as pd
import copy
from src.algorithms.iknn import ItemKNNIterative


# TODO als er data is achter de start date van de simulatie mogen we deze data dan gebruiken (bv voor training, etc)

class RANDOM_DATA:
    def __init__(self, id, topk, name):
        self.name = name
        self.id = id
        self.topk = topk
        self.random = True


class KNN_DATA:
    def __init__(self, id, topk, history):
        self.name = 'ItemKNN'
        self.id = id
        self.topk = topk
        self.history = history
        self.random = False


class RECENCY_DATA:
    def __init__(self, id, topk):
        self.name = 'Recency'
        self.id = id
        self.topk = topk
        self.random = False


class POPULARITY_DATA:
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


class Simulation(threading.Thread):
    def __init__(self, abtest):
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

        all_customer_ids = db_engine.session.execute("SELECT DISTINCT customer_id FROM customer").fetchall()

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

            active_users = db_engine.session.execute(f"SELECT DISTINCT SUBQUERY.customer_id FROM (SELECT * FROM \
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
                        interactions = db_engine.session.execute(f"SELECT customer_id, article_id from purchase WHERE \
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
                            # 2020-01-01 - 2020-01-05 = 4 -> 2 keer trainen?   momenten waarop getrain moet worden: 2020-01-01, 2020-01-03, 2020-01-05

                        for cc in range(len(interactions)):
                            if interactions[cc][0] in user_histories:
                                user_histories[interactions[cc][0]].append(interactions[cc][1])

                        # top_k_random = db_engine.session.execute(f"SELECT SUBQUERY.article_id FROM (SELECT
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
                                KNN_DATA(id=idx, topk=recommendations[cc], history=histories[cc]))
                            # print(interactions[:3])
                            # top_k_over_time_statistics[idx].append(copy.deepcopy(top_k_over_time_statistics[idx][-1]))

                        # clicks = db_engine.session.execute(f"SELECT COUNT(DISTINCT SUBQUERY6.customer_id) FROM (
                        # SELECT * FROM \ (SELECT SUBQUERY1.customer_id, SUBQUERY1.article_id FROM (SELECT * FROM
                        # purchase WHERE CAST(timestamp as DATE) = \ '{current_date}') AS SUBQUERY1) AS SUBQUERY2
                        # NATURAL JOIN (SELECT SUBQUERY.article_id, count(*) AS popular_items FROM \ (SELECT * FROM
                        # purchase WHERE CAST(timestamp as DATE) BETWEEN '{start_date}' AND '{current_date}') AS
                        # SUBQUERY GROUP \ BY SUBQUERY.article_id ORDER BY popular_items DESC LIMIT {k}) AS
                        # SUBQUERY5) AS SUBQUERY6").fetchone()[0]

                        # print("clicks:",clicks)
                        # CTR = clicks/float(n_active_users)
                        # print("CTR",CTR)
                        # print(f"algorithms {algo}: top_k (BETWEEN {start_date} AND {prev_day}):",top_k_over_time_statistics[idx][-1])

                        # SELECT customer_id, array_to_string(array_agg(article_id), ' ') FROM test3 WHERE CAST(timestamp as DATE) BETWEEN '2020-01-01' and '2020-01-03' GROUP BY customer_id;
                    else:
                        # print(top_k_random) #[(774254001,), (794389001,), (800528001,)]
                        print(len(active_users))
                        top_k_random = db_engine.session.execute(
                            f"SELECT SUBQUERY.article_id FROM (SELECT article_id FROM article ORDER BY RANDOM() LIMIT {k}) as SUBQUERY ORDER BY article_id ASC").fetchall()
                        remove_tuples(top_k_random)
                        for i in range(
                                len(active_users)):  # random moet gedaan worden in loop om unieke topk voor elke use te maken maar is trager
                            data_per_user_over_time_statistics['customer_id'][active_users[i]][
                                -1].algorithm_data.append(
                                RANDOM_DATA(id=idx, topk=top_k_random, name="ItemKNN"))  # DEEP COPY????????????

                        print(f"algorithms {algo}: top_k random:", top_k_random)

                        # train KNN algoritme to initialize it:
                        interactions = db_engine.session.execute(
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

                        # clicks = db_engine.session.execute(f"SELECT COUNT(DISTINCT SUBQUERY6.customer_id) FROM (
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
                            top_k = db_engine.session.execute(f"SELECT t.article_id, t.timestamp FROM(SELECT article_id,MIN(timestamp) AS timestamp \
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
                                -1].algorithm_data.append(RECENCY_DATA(id=idx, topk=copy.deepcopy(top_k_items)))

                        # clicks = db_engine.session.execute(f"SELECT COUNT(DISTINCT SUBQUERY6.customer_id) FROM (
                        # SELECT * FROM \ (SELECT SUBQUERY1.customer_id, SUBQUERY1.article_id FROM (SELECT * FROM
                        # purchase WHERE CAST(timestamp as DATE) = \ '{current_date}') AS SUBQUERY1) AS SUBQUERY2
                        # NATURAL JOIN (SELECT SUBQUERY.article_id, count(*) AS popular_items FROM \ (SELECT * FROM
                        # purchase WHERE CAST(timestamp as DATE) BETWEEN '{start_date}' AND '{current_date}') AS
                        # SUBQUERY GROUP \ BY SUBQUERY.article_id ORDER BY popular_items DESC LIMIT {k}) AS
                        # SUBQUERY5) AS SUBQUERY6").fetchone()[0]

                        # print("clicks:",clicks)
                        # CTR = clicks/float(n_active_users)
                        # print("CTR",CTR)
                        # print(f"algorithms {algo}: top_k (BETWEEN {start_date} AND {prev_day}):",top_k_over_time_statistics[idx][-1])

                    else:
                        top_k_random = db_engine.session.execute(
                            f"SELECT SUBQUERY.article_id FROM (SELECT article_id FROM article ORDER BY RANDOM() LIMIT {k}) as SUBQUERY ORDER BY article_id ASC").fetchall()
                        remove_tuples(top_k_random)
                        for i in range(len(active_users)):
                            data_per_user_over_time_statistics['customer_id'][active_users[i]][
                                -1].algorithm_data.append(
                                RANDOM_DATA(id=idx, topk=copy.deepcopy(top_k_random), name="Recency"))
                        # top_k_over_time_statistics[idx].append(top_k_random)
                        print(f"current_day: {current_date}, algorithms {algo}: top_k random:", top_k_random)

                        # train Recency algoritme to initialize it:
                        top_k = db_engine.session.execute(f"SELECT t.article_id, t.timestamp FROM(SELECT article_id,MIN(timestamp) AS timestamp \
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

                        # clicks = db_engine.session.execute(f"SELECT COUNT(DISTINCT SUBQUERY6.customer_id) FROM (
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
                            top_k = db_engine.session.execute(f"SELECT SUBQUERY.article_id, count(*) AS popular_items FROM \
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
                                -1].algorithm_data.append(POPULARITY_DATA(id=idx, topk=copy.deepcopy(top_k_items)))

                        # clicks = db_engine.session.execute(f"SELECT COUNT(DISTINCT SUBQUERY6.customer_id) FROM (
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
                        top_k_random = db_engine.session.execute(
                            f"SELECT SUBQUERY.article_id FROM (SELECT article_id FROM article ORDER BY RANDOM() LIMIT {k}) as SUBQUERY ORDER BY article_id ASC").fetchall()
                        remove_tuples(top_k_random)
                        for i in range(len(active_users)):
                            data_per_user_over_time_statistics['customer_id'][active_users[i]][
                                -1].algorithm_data.append(
                                RANDOM_DATA(id=idx, topk=copy.deepcopy(top_k_random), name="Popularity"))
                        print(f"algorithms {algo}: top_k random:", top_k_random)

                        # train Popularity algorithms to initialize it:
                        top_k = db_engine.session.execute(f"SELECT SUBQUERY.article_id, count(*) AS popular_items FROM \
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

                        # clicks = db_engine.session.execute(f"SELECT COUNT(DISTINCT SUBQUERY6.customer_id) FROM (SELECT * FROM \
                        # (SELECT SUBQUERY1.customer_id, SUBQUERY1.article_id FROM (SELECT * FROM purchase WHERE CAST(timestamp as DATE) = \
                        # '{current_date}') AS SUBQUERY1) AS SUBQUERY2 NATURAL JOIN ({query_str}) AS SUBQUERY5) AS SUBQUERY6").fetchone()[0]

                        # print("clicks:",clicks)
                        # CTR = clicks/float(n_active_users)
                        # print("CTR",CTR)

                time.sleep(0.3)
                self.progress = n_day * 100.0 / float(dayz)
        return


exporting_threads = {}

app = Flask(__name__)
app.config['SECRET_KEY'] = "changeme"
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_REDIS'] = redis.from_url('redis://localhost:6379')
app.config["SESSION_COOKIE_SECURE"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "None"
# app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=1)
# app.config['SESSION_MODIFIED'] = True
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# app.config['SQLALCHEMY_ECHO'] = True
# app.config['SESSION_PERMANENT'] = False
# app.config['SESSION_USE_SIGNER'] = True

bcrypt = Bcrypt(app)
server_session = Session(app)
db_engine = Database()
db_engine.connect(filename="config/database.ini")
db_engine.logVersion()
cors = CORS(app, supports_credentials=True, resources={'/*': {'origins': 'http://localhost:3000'}})


@app.route("/api/me", methods=['GET'])
@cross_origin(supports_credentials=True)
def get_current_user():
    user_id = session.get("user_id")

    if not user_id:
        return {"error": "Unauthorized"}, 401

    user = db_engine.session.execute("SELECT * FROM datascientist WHERE username = :username",
                                     {"username": user_id}).fetchone()

    return {"username": user.username, "email": user.email_address}


@app.route("/api/register", methods=["POST"])
@cross_origin(supports_credentials=True)
def register_user():
    firstname = request.json["firstname"]
    lastname = request.json["lastname"]
    birthdate = request.json["birthdate"]
    email = request.json["email"]
    username = request.json["username"]
    password = request.json["password"]
    user = db_engine.session.execute(
        "SELECT * FROM datascientist WHERE username = :username OR email_address = :email",
        {"username": username, "email": email}).fetchall()
    if user:
        return {"error": "User already exists"}, 409
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    db_engine.session.execute(
        "INSERT INTO datascientist(first_name, last_name, birthdate, email_address, username, password) VALUES(:first_name, :last_name, :birthdate, :email_address, :username, :password)",
        {"first_name": firstname, "last_name": lastname, "birthdate": birthdate, "email_address": email,
         "username": username, "password": hashed_password})
    db_engine.session.commit()
    session["user_id"] = username
    return {"username": username, "email": email}


@app.route("/api/login", methods=["POST"])
@cross_origin(supports_credentials=True)
def login_user():
    username = request.json["username"]
    password = request.json["password"]
    user = db_engine.session.execute("SELECT * FROM datascientist WHERE username = :username",
                                     {"username": username}).fetchone()
    if not user:
        return {"error": "Unauthorized"}, 401

    if not bcrypt.check_password_hash(user.password, password):
        return {"error": "Unauthorized"}, 401

    # session.permanent = True
    session["user_id"] = user.username

    return {"username": user.username, "email": user.email_address}


@app.route("/api/start_simulation", methods=["POST", "OPTIONS"])
@cross_origin(supports_credentials=True)
def start_simulation():
    start = request.json["start"]
    end = request.json["end"]
    topk = request.json["topk"]
    stepsize = request.json["stepsize"]
    dataset_name = request.json["dataset_name"]
    algorithms = request.json["algorithms"]

    # abtest_id = db_engine.session.execute("SELECT nextval('ABTest_abtest_id_seq')").fetchone()[0]

    db_engine.session.execute(
        'INSERT INTO "ABTest"(start, "end", top_k, stepsize, dataset_name, created_by) VALUES(:start, :end, :top_k, :stepsize, :dataset_name, :created_by)',
        {"start": start, "end": end, "top_k": int(topk), "stepsize": int(stepsize), "dataset_name": dataset_name,
         "created_by": session["user_id"]})
    db_engine.session.commit()

    abtest_id = db_engine.session.execute('SELECT max(abtest_id) FROM "ABTest"').fetchone()[0]

    for i in range(len(algorithms)):
        # algorithm_id = db_engine.session.execute("SELECT nextval('algorithm_algorithm_id_seq')").fetchone()[0]
        db_engine.session.execute(
            "INSERT INTO algorithms(abtest_id, algorithm_name) VALUES(:abtest_id, :algorithm_name)",
            {"abtest_id": abtest_id, "algorithm_name": algorithms[i]["name"]})
        db_engine.session.commit()
        algorithm_id = db_engine.session.execute('SELECT max(algorithm_id) FROM algorithms').fetchone()[0]
        algorithms[i]["id"] = algorithm_id
        for param, value in algorithms[i]["parameters"].items():
            db_engine.session.execute(
                "INSERT INTO parameter(parametername, algorithm_id, abtest_id, value) VALUES(:parametername, :algorithm_id, :abtest_id, :value)",
                {"parametername": param, "algorithm_id": algorithm_id, "abtest_id": abtest_id, "value": value})

    global exporting_threads
    exporting_threads[0] = Simulation(
        {"abtest_id": abtest_id, "start": start, "end": end, "topk": topk, "stepsize": stepsize,
         "dataset_name": dataset_name, "algorithms": algorithms})
    exporting_threads[0].start()
    return "200"


@app.route("/api/read_csv", methods=["POST"])
@cross_origin(supports_credentials=True)
def read_csv():
    datasets = request.json
    for i in range(len(datasets)):
        base64_message = base64.b64decode(datasets[i]['file']).decode('utf-8').rstrip()
        print(base64_message)
    return "200"


@app.route("/api/get_datasets")
@cross_origin(supports_credentials=True)
def get_datasets():
    datasets = db_engine.session.execute("SELECT * FROM dataset").fetchall()
    for i in range(len(datasets)):
        datasets[i] = str(datasets[i].name)
    return {"all_datasets": datasets}


@app.route("/api/logout")
@cross_origin(supports_credentials=True)
def logout_user():
    if "user_id" in session:
        session.pop("user_id")
    return "200"


@app.route("/api/progress")
def progress():
    global exporting_threads
    return str(exporting_threads[0].progress)


@app.route("/api/ping")
def ping():
    res = db_engine.session.execute(
        "SELECT customer_id, array_to_string(array_agg(article_id), ' ') FROM test2 GROUP BY customer_id").fetchall()
    print(res)
    return "200"


# RUN DEV SERVER
if __name__ == "__main__":
    app.run(debug=True)
