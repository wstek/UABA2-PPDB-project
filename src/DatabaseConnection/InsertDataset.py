import pandas as pd
from typing import Dict

from src.DatabaseConnection import DatabaseConnection
from src.utils.Logger import Logger


class DatasetInsert:
    def __init__(self, database_connection: DatabaseConnection, dataset_name: str, uploader_name: str,
                 filenames: Dict[str, str],
                 column_select_data: dict):
        """
        Inserts a new dataset in the database
        :param database_connection: database connection
        :param dataset_name: name of dataset
        :param uploader_name: name of the uploader
        :param filenames: dict with key: original dataset name, value: dataset filename
        :param column_select_data: dict that contains the selected columns
        """
        self.database_connection = database_connection
        self.dataset_name = column_select_data["dataset_name"]
        self.uploader_name = uploader_name
        self.filenames = filenames
        self.column_select_data = column_select_data

        self.df_dataset_files = {}  # key: original dataset name, value: pandas dataframe

        # insert dataset
        self.insertDataset()

    def clear(self):
        pass

    def insertDataset(self):
        # reflect database changes
        self.database_connection.reflectMetaData()

        # check if dataset files exists

        # check and insert dataset_name

        # execution timem measurement

        # parse dataset files into pandas dataframes
        for original_dataset_name, dataset_filename in self.filenames:
            # todo: custom seperator
            self.df_dataset_files[original_dataset_name] = pd.read_csv(dataset_filename, sep=',')

        Logger.log(f"Adding dataset {self.dataset_name}")

        self.__insertMetadata("article")
        self.__insertMetadata("customer")

        self.__insertPurchasedata()

        # create purchase dataframe
        purchase_select_data = self.column_select_data["purchaseData"]
        df_purchase_data = pd.DataFrame()
        for column_name, selection in purchase_select_data:
            self.__addDatasetColumnToDataframe(self.df_dataset_files[selection[0]], selection[1], df_purchase_data)

        # commit changes to database
        self.database_connection.session.commit()
        pass

    def __abortInsertDataset(self, database_connection: DatabaseConnection, dataset_name: str):
        # todo: delete already inserted data from database
        pass

    def __insertDatasetName(self):
        datasets_table = self.database_connection.meta_data.tables["dataset"]

        # check if dataset_name already exists
        if self.database_connection.queryTable(datasets_table, {"name": self.dataset_name}).first():
            Logger.logError(
                f"Couldn't add dataset {self.dataset_name}, it already exists")
            return False

        self.database_connection.insertRow(datasets_table, {
            "name": self.dataset_name,
            "uploaded_by": self.uploader_name
        })

        return True

    def __insertMetadata(self, metadata_type: str):
        column_select_metadata = self.column_select_data[metadata_type + "Metadata"]
        meta_id_selection = column_select_metadata[metadata_type + "_id"]
        df_meta_table = pd.DataFrame

        self.__addDatasetColumnToDataframe(self.df_dataset_files[meta_id_selection[0]], meta_id_selection[1],
                                           df_meta_table)
        df_meta_table["dataset_name"] = self.dataset_name

        # insert in meta table
        self.database_connection.insertPDDataframeInTable(df_meta_table, metadata_type)

        # todo:
        # create new dataframe for each attribute type

        # inset attribute dataframe into meta_attribute table

    def __insertPurchasedata(self):
        pass

    def __addDatasetColumnToDataframe(self, df_dataset_file, column_name, df_output):
        pass
