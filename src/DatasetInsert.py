import pandas as pd

import DatabaseConnection


class DatasetInsert:
    def __init__(self, database_connection: DatabaseConnection, dataset_name: str, uploader_name: str,
                 filenames: dict[str, str],
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
        self.dataset_name = dataset_name
        self.uploader_name = uploader_name
        self.filenames = filenames
        self.column_select_data = column_select_data

        self.df_dataset_files = {}  # key: original dataset name, value: pandas dataframe

    def clear(self):
        pass

    def insertDataset(self):
        # reflect database changes
        self.database_connection.reflectMetaData()

        # check and insert dataset_name

        # parse dataset files into pandas dataframes
        for original_dataset_name, dataset_filename in self.filenames:
            self.df_dataset_files[original_dataset_name] = pd.read_csv(dataset_filename, sep=',')  # todo: custom seperator

        # create metadata dataframes
        # article
        self.__insertMetadata()

        # article_metadata_select = column_select_data["articleMetadata"]
        # article_id_selection = article_metadata_select["article_id"]
        # df_article_table = pd.DataFrame
        #
        # __addDatasetColumnToDataframe(df_dataset_files[article_id_selection[0]], article_id_selection[1],
        #                               df_article_table)
        # df_article_table["dataset_name"] = dataset_name
        #
        # # customer
        # customer_metadata_select = column_select_data["customerMetadata"]
        # customer_id_selection = customer_metadata_select["customer_id"]
        # df_customer_table = pd.DataFrame
        #
        # __addDatasetColumnToDataframe(df_dataset_files[customer_id_selection[0]], customer_id_selection[1],
        #                               df_customer_table)
        # df_customer_table["dataset_name"] = dataset_name

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

    def __insertMetadata(self, metadata_type: str):
        column_select_metadata = self.column_select_data[metadata_type + "Metadata"]
        article_id_selection = column_select_metadata[metadata_type + "_id"]
        df_article_table = pd.DataFrame

        self.__addDatasetColumnToDataframe(self.df_dataset_files[article_id_selection[0]], article_id_selection[1],
                                           df_article_table)
        df_article_table["dataset_name"] = self.dataset_name

    def __addDatasetColumnToDataframe(self, df_dataset_file, column_name, df_output):
        pass
