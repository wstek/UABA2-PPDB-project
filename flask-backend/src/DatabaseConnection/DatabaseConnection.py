from io import StringIO
from psycopg2.extensions import register_adapter, AsIs

import sqlalchemy
import numpy
from sqlalchemy import MetaData, text
from sqlalchemy.orm import scoped_session, sessionmaker

from src.utils.Logger import Logger
from src.utils.configParser import configDatabase
from src.utils.pathParser import getAbsPathFromProjectRoot


def addapt_numpy_float64(numpy_float64):
    return AsIs(numpy_float64)


def addapt_numpy_int64(numpy_int64):
    return AsIs(numpy_int64)


register_adapter(numpy.float64, addapt_numpy_float64)
register_adapter(numpy.int64, addapt_numpy_int64)


class DatabaseConnection:
    def __init__(self):
        self.engine = None
        self.session = None
        self.meta_data = None

    def connect(self, filename='database.ini', section='postgresql'):
        # connection parameters
        params = configDatabase(filename, section)

        # core
        self.engine = sqlalchemy.create_engine(
            f"postgresql://{params['user']}@localHost:5432/{params['dbname']}",
            executemany_mode='batch')

        # ORM
        self.session = scoped_session(sessionmaker(bind=self.engine))
        self.meta_data = MetaData(bind=self.engine)

    def log_version(self):
        """
        Displays the PostgreSQL database server version
        :return: None
        """
        db_version = self.session.execute("SELECT version()").fetchone()[0]
        Logger.log("PostgreSQL database version:" + db_version)

    def engine_execute(self, query: str):
        self.engine.execute(query)

    def session_execute(self, query: str):
        self.session.execute(query)

    def engine_execute_and_fetch(self, query: str, fetchall=True):
        result = self.engine.execute(text(query))

        if fetchall:
            return result.fetchall()
        return result.fetchone()

    def session_execute_and_fetch(self, query: str, fetchall=True):
        result = self.session.execute(text(query))

        if fetchall:
            return result.fetchall()
        return result.fetchone()

    def session_query_table(self, table, query_data: dict):
        return self.session.query(table).filter_by(**query_data)

    def remove_dataset(self, dataset_name: str):
        query = f"""
            DELETE FROM dataset 
            WHERE name='{dataset_name}'
            """
        self.engine_execute(query)

    def insert_pd_dataframe(self, df, table_name):
        output = StringIO()
        df.to_csv(output, sep='\t', header=False, encoding="utf8", index=False)
        output.seek(0)

        # connection = self.engine.raw_connection()
        cursor = self.session.connection().connection.cursor()
        cursor.copy_from(output, table_name, sep='\t', null='', columns=list(df))

    def getABTests(self, username):
        query = f'''
            select abtest_id 
            from ab_test 
            where created_by = '{username}';
            '''
        return self.session_execute_and_fetch(query)

    def getUserCount(self, dataset_name):
        query = f'''
            select count(*) 
            from customer 
            where dataset_name = '{dataset_name}';
            '''
        return self.session_execute_and_fetch(query, fetchall=False)

    def getItemCount(self, dataset_name):
        query = f'''
            select count(*) 
            from article 
            where dataset_name = '{dataset_name}';
            '''
        return self.session_execute_and_fetch(query, fetchall=False)

    def getPurchaseCount(self, dataset_name):
        query = f'''
            select count(*) 
            from purchase 
            where dataset_name = '{dataset_name}';
            '''
        return self.session_execute_and_fetch(query, fetchall=False)

    def execute(self, query, fetchall=True):

        if fetchall:
            result = self.session.execute(query).fetchall()
        else:
            result = self.session.execute(query).fetchone()

        self.session.commit()
        return result

    def getAlgorithms(self, abtest_id):
        query = f''' 
            select algorithm_id
            from algorithm 
            where abtest_id = {abtest_id};
            '''
        return self.session_execute_and_fetch(query)

    def getABTestInfo(self, abtest_id):
        query = f'''
            select abtest_id,top_k, start_date, end_date, stepsize,dataset_name,created_on,created_by
            from ab_test 
            where abtest_id = {abtest_id};
            '''
        return self.session_execute_and_fetch(query, fetchall=False)

    def getAlgorithmsInformation(self, abtest_id):
        query = f'''
            select algorithm_id, algorithm_name, parameter_name, value
            from algorithm natural join parameter 
            where abtest_id = {abtest_id};
            '''
        return self.session_execute_and_fetch(query)

    def getActiveUsers(self, start, end, dataset_name):
        query = f'''
            SELECT distinct (unique_customer_id)
            FROM purchase natural join customer
            WHERE '{start}' <= bought_on and bought_on <= '{end}' and dataset_name = '{dataset_name}'; 
        '''
        return self.session_execute_and_fetch(query)

    def getActiveUsersOverTime(self, start, end, dataset_name):
        query = f'''
            SELECT bought_on,COUNT(DISTINCT(unique_customer_id))
            FROM purchase natural join customer
            WHERE '{start}' <= bought_on and bought_on <= '{end}' and dataset_name = '{dataset_name}' 
            group by bought_on;
        '''
        return self.session_execute_and_fetch(query)

    def getPurchasesOverTime(self, start, end, dataset_name):
        query = f'''
            SELECT bought_on,COUNT(unique_article_id)
            FROM purchase natural join article
            WHERE '{start}' <= bought_on and bought_on <= '{end}' and dataset_name = '{dataset_name}' 
            group by bought_on;
        '''
        return self.session_execute_and_fetch(query)

    def getPriceExtrema(self, dataset_name):
        query = f'''
            SELECT min(price), max(price)
            FROM purchase
            WHERE dataset_name = '{dataset_name}' 
        '''
        return self.session_execute_and_fetch(query, fetchall=False)

    def getCRTOverTime(self, abtest_id):
        return self.getDynamicStepsizeVar(abtest_id, parameter_name="CTR")

    def getAttributionRateOverTime(self, abtest_id):
        return self.getDynamicStepsizeVar(abtest_id, parameter_name="ATTR_RATE")

    def getDynamicStepsizeVar(self, abtest_id, parameter_name):
        query = f'''
            SELECT date_of, algorithm_id,parameter_value
            FROM statistics NATURAL JOIN dynamic_stepsize_var NATURAL JOIN  algorithm
            WHERE abtest_id = {abtest_id} AND parameter_name = '{parameter_name}' ORDER BY date_of;
        '''
        return self.session_execute_and_fetch(query)

    def getPriceCount(self, price_interval_min, price_interval_max, dataset_name):
        query = f'''
            SELECT count(*)
            FROM purchase
            WHERE dataset_name = '{dataset_name}' and {price_interval_min} <= price and price < {price_interval_max}  
        '''
        return self.execute(query, fetchall=False)


if __name__ == '__main__':
    db_con = DatabaseConnection()
    db_con.connect(filename=getAbsPathFromProjectRoot("config-files/database.ini"))
    db_con.log_version()
