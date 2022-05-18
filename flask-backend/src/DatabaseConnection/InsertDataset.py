import json
import math
import os
import sys
import time
from typing import Dict

import pandas as pd

# appends parent directory to the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.DatabaseConnection.DatabaseConnection import DatabaseConnection
from src.utils.Logger import Logger
from src.utils.pathParser import getAbsPathFromProjectRoot


# todo: check if multithreading interferes with database connection session


def shallowCopyDfColumn(df_input, column_name_input, df_output, column_name_output, delete_empty=False):
    df_output[column_name_output] = df_input[[column_name_input]].copy(deep=False)

    if not delete_empty and df_output.isnull().values.any():
        raise ValueError("merging columns with different sizes")

    if delete_empty:
        df_output.dropna(inplace=True)


class InsertDataset:
    def __init__(self, database_connection: DatabaseConnection, uploader_name: str, filenames: Dict[str, list],
                 column_select_data: dict):
        """
        Inserts a new dataset in the database
        :param database_connection: database connection
        :param uploader_name: name of the uploader
        :param filenames: dict with key: original dataset name, value: dataset filepath
        :param column_select_data: dict that contains the selected columns
        """
        self.database_connection = database_connection
        self.uploader_name = uploader_name
        self.filenames = filenames
        self.column_select_data = column_select_data

        self.dataset_name = column_select_data["datasetName"]
        self.df_purchase_data = pd.DataFrame()

        self.df_dataset_files = {}  # key: original dataset name, value: pandas dataframe

    def startInsert(self):
        self.__insertDatasetName()

        Logger.log(f"Inserting dataset {self.dataset_name}")

        # execution time measurement
        start_time = time.time()
        stopwatch = start_time

        self.__parse_csv_files()

        Logger.log(f"Parsed {len(self.filenames)} files in {math.floor(time.time() - stopwatch)} seconds")
        stopwatch = time.time()

        self.__createPurchasedataDf()

        Logger.log(f"Created purchases dataframe in {math.floor(time.time() - stopwatch)} seconds")
        stopwatch = time.time()

        # insert or generate metadata dataframes and insert into database
        if self.column_select_data["generate_article_metadata"]:
            self.__generateMetadata("article")
        else:
            self.__insertMetadata("article")

        Logger.log(
            f"Created article dataframe and inserted in database in {math.floor(time.time() - stopwatch)} seconds")
        stopwatch = time.time()

        if self.column_select_data["generate_customer_metadata"]:
            self.__generateMetadata("customer")
        else:
            self.__insertMetadata("customer")

        Logger.log(
            f"Created customer dataframe and inserted in database in {math.floor(time.time() - stopwatch)} seconds")
        stopwatch = time.time()

        # insert purchase data dataframe into database
        self.df_purchase_data.drop_duplicates(subset=["dataset_name", "customer_id", "article_id", "bought_on"],
                                              inplace=True)
        self.database_connection.insert_pd_dataframe(self.df_purchase_data, "purchase")

        Logger.log(f"Inserted purchases dataframe in database in {math.floor(time.time() - stopwatch)} seconds")
        stopwatch = time.time()

        self.database_connection.session.commit()

        Logger.log(f"Commited changes to database in {math.floor(time.time() - stopwatch)} seconds")

        Logger.log(f"Added dataset \"{self.dataset_name}\" in {math.floor(time.time() - start_time)} seconds")

    def cleanup(self):
        # debug
        # return
        for original_filename in self.filenames:
            filepath = self.filenames[original_filename][0]
            os.remove(filepath)

    def abort(self):
        self.database_connection.session.rollback()

    def __parse_csv_files(self):
        dataset_file_dtypes = {}

        column_selection_custom_dtypes = [
            [self.column_select_data["purchaseData"]["price"], "float"],
            [self.column_select_data["purchaseData"]["article_id"], "Int64"],
            [self.column_select_data["purchaseData"]["customer_id"], "Int64"],
        ]

        if not self.column_select_data["generate_article_metadata"]:
            column_selection_custom_dtypes.append([self.column_select_data["articleMetadata"]["article_id"], "Int64"])

        if not self.column_select_data["generate_customer_metadata"]:
            column_selection_custom_dtypes.append([self.column_select_data["customerMetadata"]["customer_id"], "Int64"])

        for column_selection_custom_dtype in column_selection_custom_dtypes:
            selection = column_selection_custom_dtype[0]
            dtype = column_selection_custom_dtype[1]

            if selection[0] not in dataset_file_dtypes:
                dataset_file_dtypes[selection[0]] = {}

            dataset_file_dtypes[selection[0]][selection[1]] = dtype

        # parse dataset files into pandas dataframes
        for original_dataset_name in self.filenames:
            dataset_filename = self.filenames[original_dataset_name][0]
            delimiter = self.filenames[original_dataset_name][1]

            custom_dtypes = {}

            if original_dataset_name in dataset_file_dtypes:
                custom_dtypes = dataset_file_dtypes[original_dataset_name]

            self.df_dataset_files[original_dataset_name] = pd.read_csv(dataset_filename,
                                                                       sep=delimiter,
                                                                       dtype=custom_dtypes
                                                                       )

            self.df_dataset_files[original_dataset_name].drop_duplicates(inplace=True)

    def __insertDatasetName(self):
        query = f"""
        INSERT INTO dataset (name, uploaded_by) 
        VALUES ('{self.dataset_name}', '{self.uploader_name}')
        """

        self.database_connection.session_execute(query)

    def __createPurchasedataDf(self):
        # get purchase data column selection
        purchase_select_data = self.column_select_data["purchaseData"]

        # insert purchase data into purchase data dataframe
        for database_column_name in purchase_select_data:
            selection = purchase_select_data[database_column_name]
            shallowCopyDfColumn(self.df_dataset_files[selection[0]], selection[1], self.df_purchase_data,
                                database_column_name, delete_empty=True)

        self.df_purchase_data["dataset_name"] = self.dataset_name

        # remove timestamps if it contains them (expensive operation)
        if len(self.df_purchase_data["bought_on"][0].split()) > 1:
            Logger.log("Converting timestamp to date")
            self.df_purchase_data["bought_on"] = pd.to_datetime(self.df_purchase_data["bought_on"]).dt.date

        self.df_purchase_data.drop_duplicates(subset=["dataset_name", "customer_id", "article_id", "bought_on"],
                                              inplace=True)

        print(self.df_purchase_data.head(10))

    def __generateMetadata(self, metadata_type: str):
        metadata_id_name = metadata_type + "_id"

        # create meta table dataframe
        df_meta_table = pd.DataFrame()

        shallowCopyDfColumn(self.df_purchase_data, metadata_id_name, df_meta_table, metadata_id_name)

        df_meta_table.drop_duplicates(inplace=True)

        df_meta_table["dataset_name"] = self.dataset_name

        # insert into database
        self.database_connection.insert_pd_dataframe(df_meta_table, metadata_type)

    def __insertMetadata(self, metadata_type: str):
        metadata_id_name = metadata_type + "_id"

        # get metadata column selection
        column_select_metadata = self.column_select_data[metadata_type + "Metadata"]

        # create meta table dataframe
        df_meta_table = pd.DataFrame()

        meta_id_selection = column_select_metadata[metadata_id_name]
        shallowCopyDfColumn(self.df_dataset_files[meta_id_selection[0]], meta_id_selection[1], df_meta_table,
                            metadata_id_name)

        df_meta_table["dataset_name"] = self.dataset_name

        # insert into database
        self.database_connection.insert_pd_dataframe(df_meta_table, metadata_type)

        # create new dataframe for each attribute type
        for column_selection in column_select_metadata:
            if column_selection == metadata_type + "_id":
                continue

            meta_attribute_selection = column_select_metadata[column_selection]

            df_meta_attribute_table = df_meta_table.copy(deep=False)

            df_meta_attribute_table["attribute_name"] = column_selection

            shallowCopyDfColumn(self.df_dataset_files[meta_attribute_selection[0]], meta_attribute_selection[1],
                                df_meta_attribute_table, "attribute_value", delete_empty=True)

            df_meta_attribute_table["type"] = meta_attribute_selection[2]

            self.database_connection.insert_pd_dataframe(df_meta_attribute_table, metadata_type + "_attribute")


if __name__ == "__main__":
    filenames = '{"product_metadata.csv": ["/mnt/c/dev/Programming-project-databases/flask-backend/uploaded-files/mosh_product_metadata.csv", ","], "purchases.csv": ["/mnt/c/dev/Programming-project-databases/flask-backend/uploaded-files/mosh_purchases2.csv", ","], "user_metadata.csv": ["/mnt/c/dev/Programming-project-databases/flask-backend/uploaded-files/mosh_user_metadata.csv", ","]}'
    column_select_data = '{"datasetName": "dummy", "purchaseData": {"bought_on": ["purchases.csv", "time_of_purchase"], "price": ["purchases.csv", " price_of_product"], "article_id": ["purchases.csv", " product_id"], "customer_id": ["purchases.csv", " user_id"]}, "generate_article_metadata": false, "articleMetadata": {"article_id": ["product_metadata.csv", "product_id"], ' \
                         '"color": ["product_metadata.csv", "color", "string"]}, "generate_customer_metadata": false, "customerMetadata": {"customer_id": ["user_metadata.csv", "user_id"]}}'

    # filenames = '{"articles.csv": "/mnt/c/dev/Programming-project-databases/flask-backend/uploaded-files/mosh_articles.csv", "customers.csv": "/mnt/c/dev/Programming-project-databases/flask-backend/uploaded-files/mosh_customers.csv", "purchases.csv": "/mnt/c/dev/Programming-project-databases/flask-backend/uploaded-files/mosh_purchases.csv"}'
    # column_select_data = '{"datasetName": "H&M", "purchaseData": {"bought_on": ["purchases.csv", "t_dat"], "price": ["purchases.csv", "price"], "article_id": ["purchases.csv", "article_id"], "customer_id": ["purchases.csv", "customer_id"]}, "generate_article_metadata": false, "articleMetadata": {"article_id": ["articles.csv", "article_id"]}, "generate_customer_metadata": false, "customerMetadata": {"customer_id": ["customers.csv", "customer_id"]}}'

    # filenames = '{"2020-Jan.csv": ["/mnt/c/dev/Programming-project-databases/flask-backend/uploaded-files/mosh_2020-Jan.csv", ","]}'
    # column_select_data = '{"datasetName": "bro_wtf", "purchaseData": {"bought_on": ["2020-Jan.csv", "event_time"], "price": ["2020-Jan.csv", "price"], "article_id": ["2020-Jan.csv", "product_id"], "customer_id": ["2020-Jan.csv", "user_id"]}, "generate_article_metadata": true, "generate_customer_metadata": true, "delimiter": ","}'

    db_con = DatabaseConnection()
    db_con.connect(filename=getAbsPathFromProjectRoot("config-files/database.ini"))
    db_con.log_version()

    insert_dataset_obj = InsertDataset(db_con, "mosh", json.loads(filenames), json.loads(column_select_data))

    try:
        insert_dataset_obj.startInsert()
    # except SoftTimeLimitExceeded:
    #     insert_dataset_obj.abort()
    except ValueError as e:
        Logger.logError(str(e))
    except Exception as e:
        insert_dataset_obj.abort()

        # debug
        Logger.logError(str(e))
        raise Exception
    finally:
        insert_dataset_obj.cleanup()
