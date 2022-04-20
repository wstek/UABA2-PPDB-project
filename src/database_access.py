import sys
import time
import math
import warnings
import csv
from typing import List
from pathlib import Path
import sqlalchemy
from sqlalchemy import MetaData, exc as sa_exc
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.dialects.postgresql import insert
from config import configDatabase
from Logger import Logger

MAXBUFFERSIZE: int = 500000


class Database:
    def __init__(self):
        self.engine = None
        self.session = None
        self.meta_data = None
        self.entries_count = 0
        self.total_lines = 0
        self.current_lines = 0
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
        self.engine.execute(table.insert(), [values])
        self.updateProgress()

    def insertRows(self, table, values: List[dict]):
        self.entries_count += len(values)
        self.engine.execute(table.insert(), values)
        self.updateProgress()

    def insertRowNoConflict(self, table, values: dict):
        self.entries_count += 1
        self.engine.execute(insert(table).values([values]).on_conflict_do_nothing())
        self.updateProgress()

    def insertRowsNoConflict(self, table, values: List[dict]):
        self.entries_count += len(values)
        self.engine.execute(insert(table).values(values).on_conflict_do_nothing())
        self.updateProgress()

    def addDataset(self, dataset_name: str, uploader_name: str, purchase_data_filename: str, article_data_filename: str,
                   customer_data_filename: str):
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", category=sa_exc.SAWarning)
            self.meta_data.reflect()

        Logger.log(f"Adding dataset {dataset_name}")

        # count all rows in all datasets
        self.total_lines = \
            sum(1 for line in open(article_data_filename)) + \
            sum(1 for line in open(customer_data_filename)) + \
            sum(1 for line in open(purchase_data_filename)) - 3

        # add row in dataset table
        if not self.__addDatasetEntry(dataset_name, uploader_name):
            return False

        # check if files exist
        for filename in [purchase_data_filename, article_data_filename, customer_data_filename]:
            file = Path(filename)
            if not file.is_file():
                Logger.logError(f"Could not find {filename}")

        # execution time measurement
        start_time = time.time()

        # add rows in article table and article_attribute table
        self.__addMetaDataset(dataset_name, article_data_filename, "article")
        # add rows in customer table and customer_attribute table
        self.__addMetaDataset(dataset_name, customer_data_filename, "customer")

        # add rows in purchase table
        self.__addPurchasesDataset(dataset_name, purchase_data_filename)

        duration = time.time() - start_time
        Logger.log(
            f"Added dataset \"{dataset_name}\", inserted {self.entries_count} rows in {math.floor(duration)} seconds")

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

    def __addMetaDataset(self, dataset_name: str, meta_data_filename: str, meta_data_type: str):
        attribute_names = []
        attribute_order = {}

        # insert article
        meta_data_table = self.meta_data.tables[meta_data_type]
        meta_data_attributes_table = self.meta_data.tables[meta_data_type + "_attribute"]

        meta_data_buffer = []
        meta_data_attribute_buffer = []
        with open(meta_data_filename) as infile:
            is_first_row = True
            reader = csv.reader(infile, delimiter=",")

            for attributes in reader:
                self.current_lines += 1

                # extract names and order of attributes
                if is_first_row:
                    attribute_names = attributes

                    for attribute_nr in range(len(attributes)):
                        attribute_order[attributes[attribute_nr]] = attribute_nr

                    # check if meta_data_id atribute exists
                    if meta_data_type + "_id" not in attribute_order.keys():
                        Logger.logError(f"Could not find \"{meta_data_type}_id\" column in {dataset_name}")
                        return False

                    is_first_row = False
                    continue

                meta_data_buffer.append({"dataset_name": dataset_name,
                                         meta_data_type + "_id": attributes[attribute_order[meta_data_type + "_id"]]})

                for attribute_nr in range(len(attributes)):
                    if attribute_nr == attribute_order[meta_data_type + "_id"]:
                        continue

                    meta_data_attribute_buffer.append({
                        "dataset_name": dataset_name,
                        meta_data_type + "_id": attributes[attribute_order[meta_data_type + "_id"]],
                        "attribute": attribute_names[attribute_nr],
                        "value": attributes[attribute_nr]
                    })

                if len(meta_data_buffer) >= MAXBUFFERSIZE or len(meta_data_attribute_buffer) >= MAXBUFFERSIZE:
                    self.insertRows(meta_data_table, meta_data_buffer)
                    meta_data_buffer.clear()

                    self.insertRows(meta_data_attributes_table, meta_data_attribute_buffer)
                    meta_data_attribute_buffer.clear()

            self.insertRows(meta_data_table, meta_data_buffer)
            self.insertRows(meta_data_attributes_table, meta_data_attribute_buffer)

            meta_data_buffer.clear()
            meta_data_attribute_buffer.clear()

            return True

    def __addPurchasesDataset(self, dataset_name: str, purchases_data_filename: str):
        attribute_order = {}

        purchase_buffer = []

        # insert purchases
        purchases_table = self.meta_data.tables["purchase"]
        with open(purchases_data_filename) as infile:
            is_first_row = True
            reader = csv.reader(infile, delimiter=",")

            for attributes in reader:
                self.current_lines += 1

                # extract order of attributes
                if is_first_row:
                    for attribute_nr in range(len(attributes)):
                        attribute_order[attributes[attribute_nr]] = attribute_nr

                    # todo variable names for purchase attritubes
                    # check if purchase atributes exists
                    if "customer_id" not in attribute_order.keys():
                        Logger.logError(f"Could not find \"customer_id\" column in {dataset_name}")
                        return False
                    elif "article_id" not in attribute_order.keys():
                        Logger.logError(f"Could not find \"article_id\" column in {dataset_name}")
                        return False
                    elif "price" not in attribute_order.keys():
                        Logger.logError(f"Could not find \"price\" column in {dataset_name}")
                        return False
                    elif "t_dat" not in attribute_order.keys():
                        Logger.logError(f"Could not find \"t_dat\" column in {dataset_name}")
                        return False

                    is_first_row = False
                    continue

                purchase_buffer.append({
                    "dataset_name": dataset_name,
                    "customer_id": attributes[attribute_order["customer_id"]],
                    "article_id": attributes[attribute_order["article_id"]],
                    "price": attributes[attribute_order["price"]],
                    "timestamp": attributes[attribute_order["t_dat"]]
                })

                if len(purchase_buffer) >= MAXBUFFERSIZE:
                    self.insertRowsNoConflict(purchases_table, purchase_buffer)
                    purchase_buffer.clear()

            self.insertRowsNoConflict(purchases_table, purchase_buffer)
            purchase_buffer.clear()

    def updateProgress(self):
        self.progress = self.current_lines / self.total_lines
        sys.stdout.write("Dataset progress: %d%%   \r" % (self.progress * 100))
        sys.stdout.flush()


if __name__ == '__main__':
    db_con = Database()
    db_con.connect(filename="config/database.ini")
    db_con.logVersion()
    db_con.addDataset("H_M", "xSamx33", "../datasets/H_M/purchases.csv", "../datasets/H_M/articles.csv",
                      "../datasets/H_M/customers.csv")
