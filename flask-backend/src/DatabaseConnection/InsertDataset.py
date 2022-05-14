from typing import Dict

import pandas as pd

from src.DatabaseConnection import DatabaseConnection
from src.utils.Logger import Logger

# todo: load only necessary columns in memory
# todo: check dimensions of the selected columns
# todo: exception handling


def shallowCopyDfColumn(df_input, column_name_input, df_output, column_name_output):
    df_output[column_name_output] = df_input[[column_name_input]].copy(deep=False)


class InsertDataset:
    def __init__(self, database_connection: DatabaseConnection, uploader_name: str, filenames: Dict[str, str],
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

    def clear(self):
        pass

    def startInsert(self):
        self.database_connection.reflectMetaData()

        # todo: check if dataset files exists (pathParser function)

        self.__insertDatasetName()

        # todo: execution time measurement

        # parse dataset files into pandas dataframes
        for original_dataset_name in self.filenames:
            # todo: custom seperator
            dataset_filename = self.filenames[original_dataset_name]
            self.df_dataset_files[original_dataset_name] = pd.read_csv(dataset_filename, sep=',')

        Logger.log(f"Inserting dataset {self.dataset_name}")

        self.__createPurchasedataDf()

        # insert or generate metadata dataframes and insert into database
        if self.column_select_data["generate_article_metadata"]:
            self.__generateMetadata("article")
        else:
            self.__insertMetadata("article")

        if self.column_select_data["generate_customer_metadata"]:
            self.__generateMetadata("customer")
        else:
            self.__insertMetadata("customer")

        # insert purchase data dataframe into database
        self.database_connection.insertPdDataframeInTable(self.df_purchase_data, "purchase")

        self.database_connection.session.commit()
        pass

    def cleanup(self):
        # todo: cleanup uploaded files
        pass

    def abort(self):
        # todo: delete already inserted data from database
        pass

    def __createPurchasedataDf(self):
        # get purchase data column selection
        purchase_select_data = self.column_select_data["purchaseData"]

        # insert purchase data into purchase data dataframe
        for database_column_name in purchase_select_data:
            selection = purchase_select_data[database_column_name]
            shallowCopyDfColumn(self.df_dataset_files[selection[0]], selection[1], self.df_purchase_data,
                                database_column_name)

        self.df_purchase_data["dataset_name"] = self.dataset_name

    def __insertDatasetName(self):
        datasets_table = self.database_connection.meta_data.tables["dataset"]

        # check if dataset_name already exists
        if self.database_connection.queryTable(datasets_table, {"name": self.dataset_name}).first():
            Logger.logError(f"Couldn't add dataset {self.dataset_name}, it already exists")

        self.database_connection.insertRow(datasets_table, {
            "name": self.dataset_name,
            "uploaded_by": self.uploader_name
        })

    def __generateMetadata(self, metadata_type: str):
        metadata_id_name = metadata_type + "_id"

        # create meta table dataframe
        df_meta_table = pd.DataFrame()

        shallowCopyDfColumn(self.df_purchase_data, metadata_id_name, df_meta_table, metadata_id_name)
        df_meta_table.drop_duplicates(inplace=True)

        df_meta_table["dataset_name"] = self.dataset_name

        # insert into database
        self.database_connection.insertPdDataframeInTable(df_meta_table, metadata_type)

    def __insertMetadata(self, metadata_type: str):
        metadata_id_name = metadata_type + "_id"

        # get metadata column selection
        column_select_metadata = self.column_select_data[metadata_type + "Metadata"]

        # create meta table dataframe
        df_meta_table = pd.DataFrame()

        meta_id_selection = column_select_metadata[metadata_id_name]
        shallowCopyDfColumn(self.df_dataset_files[meta_id_selection[0]], meta_id_selection[1],
                            df_meta_table, metadata_id_name)

        df_meta_table["dataset_name"] = self.dataset_name

        # insert into database
        self.database_connection.insertPdDataframeInTable(df_meta_table, metadata_type)

        # todo:
        # create new dataframe for each attribute type

        # inset attribute dataframe into meta_attribute table
