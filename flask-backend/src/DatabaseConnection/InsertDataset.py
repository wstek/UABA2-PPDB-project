import copy
import math
import os
import sys
import time
from typing import Dict

import pandas as pd

from src.socketioEvents.reportProgress import report_progress_steps, report_progress_message

# appends parent directory to the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.DatabaseConnection.DatabaseConnection import DatabaseConnection
from src.utils.Logger import Logger
from src.utils.pathParser import getAbsPathFromProjectRoot


def split_dataframe(df, size):
    # size of each row
    row_size = df.memory_usage().sum() / len(df)

    # maximum number of rows of each segment
    row_limit = int(size // row_size)

    # number of segments
    seg_num = int((len(df) + row_limit - 1) // row_limit)

    # split df
    segments = [df.iloc[i * row_limit: (i + 1) * row_limit] for i in range(seg_num)]

    return segments


def shallow_copy_df_column(df_input, column_name_input, df_output, column_name_output, delete_empty=False,
                           ignore_empty=False):
    df_output[column_name_output] = df_input[[column_name_input]].copy(deep=False)

    if not ignore_empty and not delete_empty and df_output.isnull().values.any():
        raise ValueError("merging columns with different sizes")

    if not ignore_empty and delete_empty:
        df_output.dropna(inplace=True)


def add_attribute_df(attribute, df_file, df_meta_id_table, df_meta_attribute_tables):
    df_meta_attribute_table = df_meta_id_table.copy(deep=False)

    shallow_copy_df_column(df_file, attribute["column_name"], df_meta_attribute_table,
                           "attribute_value", delete_empty=True)

    df_meta_attribute_table["attribute_name"] = attribute["name"]
    df_meta_attribute_table["type"] = attribute["type"]

    df_meta_attribute_tables.append(df_meta_attribute_table)


class InsertDataset:
    def __init__(self, database_connection: DatabaseConnection, uploader_name: str, filenames: Dict[str, str],
                 dataset_selection_data: dict, task_id=""):
        """
        Inserts a new dataset in the database
        :param database_connection: database connection
        :param uploader_name: name of the uploader
        :param filenames: dict with key: original dataset name, value: dataset filepath
        :param dataset_selection_data: dict that contains information about the selected columns
        """
        self.task_id = task_id

        self.steps = 0

        self.start_time = 0
        self.stopwatch = 0

        self.database_connection = database_connection
        self.uploader_name = uploader_name
        self.filenames = filenames

        self.dataset_selection_data = dataset_selection_data
        self.dataset_name = dataset_selection_data["dataset_name"]

        self.df_files = {}  # key: original dataset name, value: pandas dataframe

        self.df_purchase_files = pd.DataFrame()
        self.df_purchase_data = pd.DataFrame()

        self.df_article_id = pd.DataFrame()
        self.df_article_id_table_list = []
        self.df_article_attribute_table_list = []

        self.df_customer_id = pd.DataFrame()
        self.df_customer_id_table_list = []
        self.df_customer_attribute_table_list = []

    def start_stopwatch(self):
        self.start_time = time.time()
        self.stopwatch = self.start_time

    def increment_step(self):
        self.steps += 1
        report_progress_steps(self.task_id, self.steps, 14)

    def get_stopwatch_time(self):
        passed_time = math.floor(time.time() - self.stopwatch)
        self.stopwatch = time.time()

        self.increment_step()

        return passed_time

    def get_total_time(self):
        Logger.log(str(self.steps))
        return self.stopwatch - self.start_time

    def start_insert(self):
        Logger.log(f"Inserting dataset {self.dataset_name}")
        report_progress_steps(self.task_id, self.steps, 13)

        self.database_connection.session_execute("SET LOCAL synchronous_commit = 'off'")
        self.database_connection.session_execute("SET session_replication_role = replica;")

        self.__insert_dataset_name()

        # execution time measurement
        self.start_stopwatch()

        report_progress_message(self.task_id, "parsing files")
        self.__parse_csv_files()

        # create purchase df from purchase files
        report_progress_message(self.task_id, "creating purchase dataframe")
        self.__concatenate_purchase_files()
        self.__create_purchasedata_df()

        # create meta id dfs from purchase files
        report_progress_message(self.task_id, "creating purchase metadata dataframes")
        self.__create_meta_id_df_purchase("article", self.df_article_id, self.df_article_id_table_list)
        self.__create_meta_id_df_purchase("customer", self.df_customer_id, self.df_customer_id_table_list)

        # create meta dfs from purchase files
        self.__create_purchase_metadata_df("article", self.df_article_id, self.df_article_attribute_table_list)
        self.__create_purchase_metadata_df("customer", self.df_customer_id, self.df_customer_attribute_table_list)

        # create meta dfs from metadata files
        report_progress_message(self.task_id, "creating metadata dataframes")
        self.__create_metadata_df("article", self.df_article_id_table_list, self.df_article_attribute_table_list)
        self.__create_metadata_df("customer", self.df_customer_id_table_list, self.df_customer_attribute_table_list)

        # insert all data into database
        report_progress_message(self.task_id, "inserting article data")
        self.__insert_metadata("article", self.df_article_id_table_list, self.df_article_attribute_table_list)

        report_progress_message(self.task_id, "inserting customer data")
        self.__insert_metadata("customer", self.df_customer_id_table_list, self.df_customer_attribute_table_list)

        report_progress_message(self.task_id, "inserting purchase data")
        self.__insert_purchase_data()

        # commit transaction to database
        report_progress_message(self.task_id, "commiting to database")
        self.database_connection.session.commit()
        Logger.log(f"commited transaction to database in {self.get_stopwatch_time()} seconds")

        Logger.log(f"added dataset \"{self.dataset_name}\" in {self.get_total_time()} seconds")
        report_progress_steps(self.task_id, 13, 13)

    def cleanup(self):
        for original_filename in self.filenames:
            filepath = self.filenames[original_filename]
            os.remove(filepath)

    def abort(self):
        self.database_connection.session.rollback()
        self.database_connection.engine_execute(f'''DELETE FROM "dataset" WHERE name='{self.dataset_name}';''')

    def __parse_csv_files(self):
        for original_filename in self.filenames:
            current_filename = self.filenames[original_filename]
            seperator = self.dataset_selection_data["file_seperators"][original_filename]

            custom_dtypes = self.dataset_selection_data["file_column_data_types"][original_filename]

            # date type is a special case
            check_date = False
            date_columns = []
            new_custom_dtypes = copy.deepcopy(custom_dtypes)
            for date_column, dtype in custom_dtypes.items():
                if dtype == "date":
                    check_date = True
                    date_columns.append(date_column)
                    new_custom_dtypes.pop(date_column, None)

            custom_dtypes = new_custom_dtypes

            # read column names
            column_names = pd.read_csv(current_filename,
                                       sep=seperator,
                                       nrows=0
                                       ).columns

            # update dtypes dict so that every column has, except the one who already had a type, string as type
            custom_dtypes.update({column: str for column in column_names if column not in custom_dtypes})

            self.df_files[original_filename] = pd.read_csv(current_filename,
                                                           sep=seperator,
                                                           dtype=custom_dtypes,
                                                           on_bad_lines="skip"
                                                           )

            self.df_files[original_filename].drop_duplicates(inplace=True)

            # if date column contains a timestamp, remove it (expensive operation)
            if check_date:

                for date_column in date_columns:
                    if len(self.df_files[original_filename][date_column][0].split()) > 1:
                        report_progress_message(self.task_id, "converting timestamps to dates")
                        Logger.log("Converting timestamp to date")

                        self.df_files[original_filename][date_column] = pd.to_datetime(
                            self.df_files[original_filename][date_column]).dt.date

                        self.df_files[original_filename].drop_duplicates(inplace=True)

        Logger.log(f"parsed {len(self.filenames)} files in {self.get_stopwatch_time()} seconds")

    def __concatenate_file_df(self, filenames: list):
        df_file_list = []

        column_names = self.df_files[filenames[0]].columns

        # check if the column names match between all files
        for filename in filenames:
            df_file = self.df_files[filename]

            if df_file.columns.all() != column_names.all():
                raise ValueError("concatenating files with different column names")

            df_file_list.append(df_file)

        df_files = pd.concat(df_file_list, ignore_index=True, sort=False, copy=False)
        df_files.drop_duplicates(inplace=True)

        return df_files

    def __concatenate_purchase_files(self):
        purchase_select_data = self.dataset_selection_data["purchase_data"]
        self.df_purchase_files = self.__concatenate_file_df(purchase_select_data["filenames"])

    def __create_purchasedata_df(self):
        purchase_select_data = self.dataset_selection_data["purchase_data"]

        shallow_copy_df_column(self.df_purchase_files, purchase_select_data["column_name_bought_on"],
                               self.df_purchase_data, "bought_on", ignore_empty=True)
        shallow_copy_df_column(self.df_purchase_files, purchase_select_data["column_name_price"], self.df_purchase_data,
                               "price", ignore_empty=True)
        shallow_copy_df_column(self.df_purchase_files, purchase_select_data["column_name_article_id"],
                               self.df_purchase_data,
                               "article_id", ignore_empty=True)
        shallow_copy_df_column(self.df_purchase_files, purchase_select_data["column_name_customer_id"],
                               self.df_purchase_data,
                               "customer_id", ignore_empty=True)

        self.df_purchase_data.dropna(inplace=True)
        self.df_purchase_data.drop_duplicates(subset=["customer_id", "article_id", "bought_on"], inplace=True)

        self.df_purchase_data["dataset_name"] = self.dataset_name

        Logger.log(f"created purchase df from purchase files in {self.get_stopwatch_time()} seconds")

    def __create_meta_id_df_purchase(self, metadata_type: str, df_meta_id, df_meta_id_tables):
        metadata_id_name = metadata_type + "_id"

        shallow_copy_df_column(self.df_purchase_data, metadata_id_name, df_meta_id, metadata_id_name)
        df_meta_id["dataset_name"] = self.dataset_name

        df_meta_id_tables.append(df_meta_id)

        Logger.log(f"created {metadata_type} id dfs from purchase files in {self.get_stopwatch_time()} seconds")

    def __create_purchase_metadata_df(self, metadata_type: str, df_meta_id_table, df_meta_attribute_tables):
        purchase_select_data = self.dataset_selection_data["purchase_data"]

        for attribute in purchase_select_data[metadata_type + "_metadata_attributes"]:
            add_attribute_df(attribute, self.df_purchase_files, df_meta_id_table, df_meta_attribute_tables)

        Logger.log(f"created {metadata_type} dfs from purchase files in {self.get_stopwatch_time()} seconds")

    def __create_metadata_df(self, metadata_type: str, df_meta_id_tables, df_meta_attribute_tables):
        metadata_id_name = metadata_type + "_id"
        metadata_selection = self.dataset_selection_data[metadata_type + "_metadata"]

        for metadata in metadata_selection:
            df_meta_id_table = pd.DataFrame()

            df_file = self.__concatenate_file_df(metadata["filenames"])

            shallow_copy_df_column(df_file, metadata["column_name_id"], df_meta_id_table, metadata_id_name)
            df_meta_id_table["dataset_name"] = self.dataset_name

            df_meta_id_tables.append(df_meta_id_table)

            for attribute in metadata["attributes"]:
                add_attribute_df(attribute, df_file, df_meta_id_table, df_meta_attribute_tables)

        Logger.log(f"created {metadata_type} dfs from metadata files in {self.get_stopwatch_time()} seconds")

    def __insert_pandas_dataframe(self, df, table_name):
        df_segments = split_dataframe(df, 0.25 * pow(10, 8))

        total_segments = len(df_segments)
        current_segment_count = 0

        for df_segment in df_segments:
            current_segment_count += 1
            self.database_connection.session_insert_pd_dataframe(df_segment, table_name)
            Logger.log(f"inserted {table_name} segment {current_segment_count} of {total_segments}")
            report_progress_message(self.task_id,
                                    f"inserting {table_name} segment {current_segment_count} of {total_segments}")

    def __insert_dataset_name(self):
        query = f"""
        INSERT INTO dataset (name, uploaded_by) 
        VALUES ('{self.dataset_name}', '{self.uploader_name}')
        """

        try:
            self.database_connection.engine_execute(query)

        except Exception as error:
            print(error)
            raise ValueError(f"dataset {self.dataset_name} already exists")

    def __insert_purchase_data(self):
        Logger.log(
            "purchase dataframe memory usage: " + str(
                round(self.df_purchase_data.memory_usage(index=True, deep=True).sum() * 0.000001)) + "mb")

        self.__insert_pandas_dataframe(self.df_purchase_data, "purchase")

        Logger.log(f"inserted purchase data in {self.get_stopwatch_time()} seconds")

    def __insert_metadata(self, metadata_type: str, df_meta_id_tables, df_meta_attribute_tables):
        if len(df_meta_id_tables) > 0:
            df_meta_ids = pd.concat(df_meta_id_tables, ignore_index=True, sort=False, copy=False)
            df_meta_ids.drop_duplicates(inplace=True)

            Logger.log(metadata_type + " dataframe memory usage: " + str(
                round(df_meta_ids.memory_usage(index=True, deep=True).sum() * 0.000001)) + "mb")

            self.__insert_pandas_dataframe(df_meta_ids, metadata_type)

            Logger.log(f"inserted {metadata_type} id data in {self.get_stopwatch_time()} seconds")

        if len(df_meta_attribute_tables) > 0:
            df_meta_attributes = pd.concat(df_meta_attribute_tables, ignore_index=True, sort=False, copy=False)
            df_meta_attributes.drop_duplicates(subset=["attribute_name", metadata_type + "_id"], inplace=True)

            Logger.log(metadata_type + " attributes dataframe memory usage: " + str(
                round(df_meta_attributes.memory_usage(index=True, deep=True).sum() * 0.000001)) + "mb")

            self.__insert_pandas_dataframe(df_meta_attributes, metadata_type + "_attribute")

            Logger.log(f"inserted {metadata_type} attribute data in {self.get_stopwatch_time()} seconds")


if __name__ == "__main__":
    filenames_HM = {
        # project root = flask-backend directory
        "purchases.csv": getAbsPathFromProjectRoot("../datasets/h_m/purchases.csv"),
        "articles.csv": getAbsPathFromProjectRoot("../datasets/h_m/articles.csv"),
        "customers.csv": getAbsPathFromProjectRoot("../datasets/h_m/customers.csv")
    }

    dataset_selection_data_HM = {
        "dataset_name": "H&M14",
        "file_seperators": {
            "purchases.csv": ",",
            "articles.csv": ",",
            "customers.csv": ","
        },
        "file_column_data_types": {
            "purchases.csv": {
                "t_dat": "date",
                "price": "float",
                "article_id": "Int64",
                "customer_id": "Int64"
            },
            "articles.csv": {
                "article_id": "Int64"
            },
            "customers.csv": {
                "customer_id": "Int64"
            }
        },
        "purchase_data": {
            "filenames": [
                "purchases.csv"
            ],

            "column_name_bought_on": "t_dat",
            "column_name_price": "price",
            "column_name_article_id": "article_id",
            "column_name_customer_id": "customer_id",

            "article_metadata_attributes": [],
            "customer_metadata_attributes": []
        },
        "article_metadata": [
            {
                "filenames": [
                    "articles.csv"
                ],

                "column_name_id": "article_id",

                "attributes": [
                    {
                        "column_name": "product_code",
                        "name": "product_code",
                        "type": "int"
                    },
                    {
                        "column_name": "graphical_appearance_name",
                        "name": "graphical_appearance_name",
                        "type": "string"
                    },
                    {
                        "column_name": "image_url",
                        "name": "image_url",
                        "type": "image"
                    }
                ]
            }
        ],
        "customer_metadata": [
            {
                "filenames": [
                    "customers.csv"
                ],

                "column_name_id": "customer_id",

                "attributes": [
                    {
                        "column_name": "age",
                        "name": "age",
                        "type": "float"
                    },
                    {
                        "column_name": "postal_code",
                        "name": "postal_code",
                        "type": "string"
                    }
                ]
            }
        ]
    }

    db_con = DatabaseConnection()
    db_con.connect(filename=getAbsPathFromProjectRoot("config-files/database.ini"))
    db_con.log_version()

    insert_dataset_obj = InsertDataset(db_con, "mosh", filenames_HM, dataset_selection_data_HM, "dummy_task")

    try:
        insert_dataset_obj.start_insert()

    except ValueError as err:
        insert_dataset_obj.abort()
        Logger.logError(str(err))
        raise err

    except Exception as err:
        insert_dataset_obj.abort()
        Logger.logError(str(err))
        raise err

    finally:
        # production
        # insert_dataset_obj.cleanup()

        pass
