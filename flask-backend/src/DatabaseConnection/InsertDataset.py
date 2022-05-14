from typing import Dict

import pandas as pd

from src.DatabaseConnection import DatabaseConnection
from src.utils.Logger import Logger


def addDatasetColumnToDataframe(df_dataset_file, dataset_column_name, df_output, database_column_name):
    try:
        df_output[database_column_name] = df_dataset_file[dataset_column_name]
    except Exception:
        return False

    return True


class InsertDataset:
    def __init__(self, database_connection: DatabaseConnection, uploader_name: str, filenames: Dict[str, str],
                 column_select_data: dict):
        """
        Inserts a new dataset in the database
        :param database_connection: database connection
        :param dataset_name: name of dataset
        :param uploader_name: name of the uploader
        :param filenames: dict with key: original dataset name, value: dataset filepath
        :param column_select_data: dict that contains the selected columns
        """
        self.database_connection = database_connection
        self.dataset_name = column_select_data["datasetName"]
        self.uploader_name = uploader_name
        self.filenames = filenames
        self.column_select_data = column_select_data

        self.df_dataset_files = {}  # key: original dataset name, value: pandas dataframe

    def clear(self):
        pass

    def startInsert(self):
        # reflect database changes
        self.database_connection.reflectMetaData()

        # todo: check if dataset files exists (pathParser function)

        # check and insert dataset_name
        self.__insertDatasetName()

        # todo: execution time measurement

        # parse dataset files into pandas dataframes
        for original_dataset_name in self.filenames:
            # todo: custom seperator
            dataset_filename = self.filenames[original_dataset_name]
            print(dataset_filename)
            self.df_dataset_files[original_dataset_name] = pd.read_csv(dataset_filename, sep=',')

        Logger.log(f"Inserting dataset {self.dataset_name}")

        # insert data
        self.__insertMetadata("article")
        self.__insertMetadata("customer")

        self.__insertPurchasedata()

        # commit changes to database
        self.database_connection.session.commit()
        pass

    def cleanup(self):
        # todo: cleanup uploaded files
        pass

    def abort(self):
        # todo: delete already inserted data from database
        pass

    def __insertDatasetName(self):
        datasets_table = self.database_connection.meta_data.tables["dataset"]

        # check if dataset_name already exists
        if self.database_connection.queryTable(datasets_table, {"name": self.dataset_name}).first():
            Logger.logError(
                f"Couldn't add dataset {self.dataset_name}, it already exists")
            return False

        # insert
        self.database_connection.insertRow(datasets_table, {
            "name": self.dataset_name,
            "uploaded_by": self.uploader_name
        })

        return True

    def __insertMetadata(self, metadata_type: str):
        # get metadata column selection
        column_select_metadata = self.column_select_data[metadata_type + "Metadata"]

        # create meta table dataframe
        df_meta_table = pd.DataFrame()

        meta_id_selection = column_select_metadata[metadata_type + "_id"]
        addDatasetColumnToDataframe(self.df_dataset_files[meta_id_selection[0]], meta_id_selection[1],
                                    df_meta_table, metadata_type + "_id")

        df_meta_table["dataset_name"] = self.dataset_name

        # insert in meta table
        self.database_connection.insertPdDataframeInTable(df_meta_table, metadata_type)

        # todo:
        # create new dataframe for each attribute type

        # inset attribute dataframe into meta_attribute table

    def __insertPurchasedata(self):
        # create purchase dataframe
        purchase_select_data = self.column_select_data["purchaseData"]

        # create purchase table dataframe
        df_purchase_data = pd.DataFrame()

        for database_column_name in purchase_select_data:
            selection = purchase_select_data[database_column_name]
            addDatasetColumnToDataframe(self.df_dataset_files[selection[0]], selection[1], df_purchase_data,
                                        database_column_name)

        df_purchase_data["dataset_name"] = self.dataset_name

        # insert in purchase table
        self.database_connection.insertPdDataframeInTable(df_purchase_data, "purchase")
