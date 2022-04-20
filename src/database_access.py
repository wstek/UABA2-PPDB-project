import sys

import sqlalchemy
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import MetaData, Sequence, select, text
from config import configDatabase
from Logger import Logger
from typing import List
import csv
import time

MAXBUFFERSIZE: int = 500000


class Database:
    def __init__(self):
        self.engine = None
        self.session = None
        self.meta_data = None
        self.entries_count = 0
        self.total_lines = 0
        self.progress = 0

    def connect(self, filename='database.ini', section='postgresql'):
        # read connection parameters
        params = configDatabase(filename, section)

        self.engine = sqlalchemy.create_engine(f"postgresql://{params['user']}@localHost:5432/{params['dbname']}",
                                               executemany_mode='batch')
        self.session = scoped_session(sessionmaker(bind=self.engine))
        self.meta_data = MetaData(bind=self.engine)

    def getConnection(self):
        return self.engine.connect()

    def logVersion(self):
        """
        Displays the PostgreSQL database server version
        :return: None
        """
        db_version = self.session.execute("SELECT version()").fetchone()[0]
        Logger.log("PostgreSQL database version:" + db_version)

    def queryTable(self, table, query_data: dict):
        return self.session.query(table).filter_by(**query_data)

    def insertRow(self, table, values: dict):
        self.entries_count += 1
        # self.engine.execute(insert(table).values([values]))
        self.engine.execute(table.insert(), [values])
        self.updateProgress()

    def insertRows(self, table, values: List[dict]):
        self.entries_count += len(values)
        # self.engine.execute(insert(table).values(values))
        self.engine.execute(table.insert(), values)
        self.updateProgress()

    def insertRowNoConflict(self, table, values: dict):
        self.entries_count += 1
        self.engine.execute(insert(table).values([values]).on_conflict_do_nothing())
        self.updateProgress()
        # self.engine.execute(table.insert(), [values])

    def insertRowsNoConflict(self, table, values: List[dict]):
        self.entries_count += len(values)
        self.engine.execute(insert(table).values(values).on_conflict_do_nothing())
        # self.engine.execute(table.insert(), values)
        self.updateProgress()

    def addDataset(self, dataset_name: str, uploader_name: str, purchase_data_filename: str, article_data_filename: str,
                   customer_data_filename: str):
        self.meta_data.reflect()

        if not self.__addDatasetEntry(dataset_name, uploader_name):
            return False

        # todo check if files exist

        # execution time measurement
        start_time = time.time()

        self.total_lines = sum(1 for line in open(article_data_filename)) + sum(
            1 for line in open(customer_data_filename)) + sum(
            1 for line in open(purchase_data_filename)) - 3

        self.__addArticlesDataset(dataset_name, article_data_filename)
        self.__addCustomersDataset(dataset_name, customer_data_filename)
        self.__addPurchasesDataset(dataset_name, purchase_data_filename)

        duration = time.time() - start_time
        Logger.log(f"{self.entries_count} rows inserted in {duration} seconds")

        total_nr_rows_method1 = 1 + 862725 + 61249 + 10980132
        total_nr_rows_method2 = 1 + (862725 * 7) + (61249 * 26) + 10980132

        if not self.entries_count:
            return

        Logger.log("############################")
        Logger.log(f"nr of row inserts (our method): {total_nr_rows_method2}\n"
                   f"approximate execution time: {total_nr_rows_method2 / self.entries_count * duration / 60} minutes")

        Logger.log("############################")
        Logger.log(f"nr of row inserts (dynamic table generation method): {total_nr_rows_method1}\n"
                   f"approximate execution time: {total_nr_rows_method1 / self.entries_count * duration / 60} minutes")

        # commit changes to database
        self.session.commit()

    def __addDatasetEntry(self, dataset_name: str, uploader_name: str):
        datasets_table = self.meta_data.tables["dataset"]

        # check if dataset_name already exists
        if self.queryTable(datasets_table, {"name": dataset_name}).first():
            Logger.logError(f"Couldn't add dataset {dataset_name}, it already exists")
            return False

        self.insertRow(datasets_table, {
            "name": dataset_name,
            "uploaded_by": uploader_name
        })

        return True

    def __addArticlesDataset(self, dataset_name: str, article_data_filename: str):
        attribute_names = []
        attribute_order = {}

        # insert articles
        articles_table = self.meta_data.tables["article"]
        articles_attributes_table = self.meta_data.tables["article_attribute"]

        article_buffer = []
        article_attribute_buffer = []
        with open(article_data_filename) as infile:
            is_first_row = True
            reader = csv.reader(infile, delimiter=",")

            for attributes in reader:
                # extract names and order of attributes
                if is_first_row:
                    attribute_names = attributes

                    # todo check if article_id atribute exists
                    for attribute_nr in range(len(attributes)):
                        attribute_order[attributes[attribute_nr]] = attribute_nr

                    is_first_row = False
                    continue

                article_buffer.append({"dataset_name": dataset_name,
                                       "article_id": attributes[attribute_order["article_id"]]})

                for attribute_nr in range(len(attributes)):
                    if attribute_nr == attribute_order["article_id"]:
                        continue

                    article_attribute_buffer.append({
                        "dataset_name": dataset_name,
                        "article_id": attributes[attribute_order["article_id"]],
                        "attribute": attribute_names[attribute_nr],
                        "value": attributes[attribute_nr]
                    })

                if len(article_buffer) >= MAXBUFFERSIZE or len(article_attribute_buffer) >= MAXBUFFERSIZE:
                    self.insertRows(articles_table, article_buffer)
                    article_buffer.clear()

                    self.insertRows(articles_attributes_table, article_attribute_buffer)
                    article_attribute_buffer.clear()

            self.insertRows(articles_table, article_buffer)
            self.insertRows(articles_attributes_table, article_attribute_buffer)

            article_buffer.clear()
            article_attribute_buffer.clear()

    def __addCustomersDataset(self, dataset_name: str, customer_data_filename: str):
        attribute_names = []
        attribute_order = {}

        # insert customers
        customers_table = self.meta_data.tables["customer"]
        customers_attributes_table = self.meta_data.tables["customer_attribute"]

        customer_buffer = []
        customer_attribute_buffer = []
        with open(customer_data_filename) as infile:
            is_first_row = True
            reader = csv.reader(infile, delimiter=",")

            for attributes in reader:
                # extract names and order of attributes
                if is_first_row:
                    attribute_names = attributes

                    # todo check if customer_id atribute exists
                    for attribute_nr in range(len(attributes)):
                        attribute_order[attributes[attribute_nr]] = attribute_nr

                    is_first_row = False
                    continue

                customer_buffer.append({"dataset_name": dataset_name,
                                        "customer_id": attributes[attribute_order["customer_id"]]})

                for attribute_nr in range(len(attributes)):
                    if attribute_nr == attribute_order["customer_id"]:
                        continue

                    customer_attribute_buffer.append({
                        "dataset_name": dataset_name,
                        "customer_id": attributes[attribute_order["customer_id"]],
                        "attribute": attribute_names[attribute_nr],
                        "value": attributes[attribute_nr]
                    })

                if len(customer_buffer) >= MAXBUFFERSIZE or len(customer_attribute_buffer) >= MAXBUFFERSIZE:
                    self.insertRows(customers_table, customer_buffer)
                    customer_buffer.clear()

                    self.insertRows(customers_attributes_table, customer_attribute_buffer)
                    customer_attribute_buffer.clear()

            self.insertRows(customers_table, customer_buffer)
            self.insertRows(customers_attributes_table, customer_attribute_buffer)

            customer_buffer.clear()
            customer_attribute_buffer.clear()

    def __addPurchasesDataset(self, dataset_name: str, purchases_data_filename: str):
        attr_order = {}

        purchase_buffer = []

        # insert purchases
        purchases_table = self.meta_data.tables["purchase"]
        with open(purchases_data_filename) as infile:
            is_first_row = True
            reader = csv.reader(infile, delimiter=",")

            for attributes in reader:
                # extract order of attributes
                if is_first_row:
                    # todo check if attributes exist
                    for attribute_nr in range(len(attributes)):
                        attr_order[attributes[attribute_nr]] = attribute_nr

                    is_first_row = False
                    continue

                purchase_buffer.append({
                    "dataset_name": dataset_name,
                    "customer_id": attributes[attr_order["customer_id"]],
                    "article_id": attributes[attr_order["article_id"]],
                    "price": attributes[attr_order["price"]],
                    "timestamp": attributes[attr_order["t_dat"]]
                })

                if len(purchase_buffer) >= MAXBUFFERSIZE:
                    self.insertRowsNoConflict(purchases_table, purchase_buffer)
                    purchase_buffer.clear()

            self.insertRowsNoConflict(purchases_table, purchase_buffer)
            purchase_buffer.clear()

    def updateProgress(self):
        self.progress = self.entries_count / self.total_lines
        sys.stdout.write("Download progress: %d%%   \r" % (self.progress * 100))
        sys.stdout.flush()


if __name__ == '__main__':
    db_con = Database()
    db_con.connect(filename="config/database.ini")
    db_con.addDataset("H_M", "xSamx33", "../datasets/H_M/purchases.csv", "../datasets/H_M/articles.csv",
                      "../datasets/H_M/customers.csv")
    # db_con.logVersion()
