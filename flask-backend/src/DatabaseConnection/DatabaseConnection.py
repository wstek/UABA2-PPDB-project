from io import StringIO

import numpy
import sqlalchemy
from psycopg2.extensions import register_adapter, AsIs
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
            f"postgresql://{params['user']}@localHost:5432/{params['dbname']}")

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
        if fetchall:
            result = self.session.execute(query).fetchall()
        else:
            result = self.session.execute(query).fetchone()

        return result

    def session_query_table(self, table, query_data: dict):
        return self.session.query(table).filter_by(**query_data)

    def session_disable_trigger(self, table):
        query = f"""
            ALTER TABLE {table} DISABLE TRIGGER ALL
            """
        self.session_execute(query)

    def session_enable_trigger(self, table):
        query = f"""
            ALTER TABLE {table} ENABLE TRIGGER ALL
            """
        self.session_execute(query)

    def session_disable_all_trigger(self):
        query = f"""
            SET session_replication_role = replica;
            """
        self.session_execute(query)

    def session_enable_all_trigger(self):
        query = f"""
            SET session_replication_role = DEFAULT;
            """
        self.session_execute(query)

    def remove_dataset(self, dataset_name: str):
        query = f"""
            DELETE FROM dataset 
            WHERE name='{dataset_name}'
            """
        self.engine_execute(query)

    def session_insert_pd_dataframe(self, df, table_name):
        output = StringIO()
        df.to_csv(output, sep='\t', header=False, encoding="utf8", index=False)
        output.seek(0)

        cursor = self.session.connection().connection.cursor()
        cursor.copy_from(output, table_name, sep='\t', null='', columns=list(df))

    def engine_insert_pd_dataframe(self, df, table_name):
        output = StringIO()
        df.to_csv(output, sep='\t', header=False, encoding="utf8", index=False)
        output.seek(0)

        connection = self.engine.raw_connection()
        cursor = connection.cursor()
        cursor.copy_from(output, table_name, sep='\t', null='', columns=list(df))
        connection.commit()

    def batch_insert_pd_dataframe(self, df, table_name, size):
        row_size = df.memory_usage().sum() / len(df)
        row_limit = int(size // row_size)
        seg_num = int((len(df) + row_limit - 1) // row_limit)

        for i in range(seg_num):
            self.session_insert_pd_dataframe(df.iloc[i * row_limit: (i + 1) * row_limit], table_name)

    def getABTests(self, username):
        query = f'''
            select abtest_id 
            from ab_test 
            where created_by = '{username}'
            order by abtest_id;
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

    def getTimesRecommended(self, abtest_id):
        query = f''' 
            select date_of, unique_customer_id
            from recommendation natural join customer_specific_statistics 
                natural join statistics natural join ab_test natural join purchase
            where date_of >= start_date and date_of <= end_date and abtest_id = {abtest_id} and  unique_article_id = 100;
            '''
        return self.session_execute_and_fetch(query)

    def getTopkRecommended(self, abtest_id, start_date, end_date, top_k):
        query = f''' 
            -- take top k out
            select ranked_table.*
            from (
            -- rank on this count
                     select counted_table.*,
                            row_number() over (partition by algorithm_id order by count desc ) rank
                     from (
            --       Find the count of recommendations per algorithm for one article
                              select algorithm_id, unique_article_id, count(*) count
                              from (
                                       (select * from algorithm where abtest_id = {abtest_id})) algorithm
                                       natural join (select * from statistics where date_of between '{start_date}' and '{end_date}' ) statistics
                                       natural join customer_specific_statistics
                                       natural join recommendation
                              group by algorithm_id, unique_article_id
                              ) counted_table
                     ) ranked_table
            where ranked_table.rank <= {top_k}
            order by rank, algorithm_id;
            '''
        return self.session_execute_and_fetch(query)

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
            select algorithm_id, parameter_name, value, algorithm_type
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
            WHERE bought_on between '{start}' and '{end}' and dataset_name = '{dataset_name}' 
            group by bought_on;
        '''
        return self.session_execute_and_fetch(query)

    def getPurchasesOverTime(self, start, end, dataset_name):
        query = f'''
            SELECT bought_on,COUNT(unique_article_id)
            FROM purchase natural join article
            WHERE bought_on between '{start}' and '{end}' and dataset_name = '{dataset_name}' 
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

    def getRevenueOverTime(self, abtest_id):
        abtest = self.getABTestInfo(abtest_id)
        query = f'''
                select bought_on revenue_on, sum(price) revenue
                from purchase
                where bought_on between '{abtest.start_date}' and '{abtest.end_date}' and dataset_name = '{abtest.dataset_name}'
                group by bought_on;
            '''
        return self.session_execute_and_fetch(query)

    def getAttributionRateOverTime(self, abtest_id):
        return self.getDynamicStepsizeVar(abtest_id, parameter_name="ATTR_RATE")

    def getDynamicStepsizeVar(self, abtest_id, parameter_name):
        query = f'''
            SELECT date_of, algorithm_id,parameter_value, algorithm_name
            FROM statistics NATURAL JOIN dynamic_stepsize_var NATURAL JOIN named_algorithm NATURAL JOIN ab_test 
            WHERE abtest_id = {abtest_id} AND parameter_name = '{parameter_name}' ORDER BY date_of;
        '''
        return self.session_execute_and_fetch(query)

    def getPriceCount(self, price_interval_min, price_interval_max, dataset_name):
        query = f'''
            SELECT count(*)
            FROM purchase
            WHERE dataset_name = '{dataset_name}' and {price_interval_min} <= price and price < {price_interval_max}  
        '''
        return self.session_execute_and_fetch(query, fetchall=False)

    def makeAdmin(self, username):
        query = f'''
                    Select * 
                    from datascientist
                    where username = '{username}' 
                '''
        if self.session_execute_and_fetch(query):
            query = f'''
            insert into admin (username)
            values ('{username}')
            '''
            self.session_execute(query)

    def getTopKPurchased(self, abtest_id, start_date, end_date, top_k):
        query = f'''
            select unique_article_id, count(*)
            from (select * from ab_test where abtest_id = {abtest_id}) ab_test
                     natural join dataset
                     natural join (select * from purchase where bought_on between '{start_date}' and '{end_date}') purchase
                     natural join article              
            group by unique_article_id
            order by count(*) desc
            limit {top_k};
        '''
        return self.session_execute_and_fetch(query)

    def getPriceDistribution(self, dataset_name, intervals):
        priceExtrema = self.getPriceExtrema(dataset_name)
        diff = (priceExtrema.max - priceExtrema.min) / intervals
        zeroes = ""
        while diff < 10:
            diff *= 10
            zeroes += '0'
        query = f'''
                select width_bucket(price, 0, 0.5, {intervals}) as buckets,
                         count(price), to_char(avg(price)::float8,'FM999999999.{zeroes}') as average
                    from purchase where dataset_name='{dataset_name}'
                group by buckets
                order by buckets;
            '''
        return self.engine_execute_and_fetch(query)

    def getAllUniqueCumstomerIDs(self, dataset_name):
        query = f'''
                    SELECT unique_customer_id FROM customer where dataset_name='{dataset_name}'
            '''
        return self.session_execute_and_fetch(query)

    def getAllUniqueArticleIDs(self, dataset_name):
        query = f'''
                    SELECT unique_article_id FROM article where dataset_name='{dataset_name}'
            '''
        return self.session_execute_and_fetch(query)

    def getActiveUsersBetween(self, abtest_id, start_date, end_date):
        query = f'''
            SELECT count(distinct (unique_customer_id))
            FROM customer
                     natural join purchase
                     natural join (select dataset_name from ab_test where abtest_id = {abtest_id} ) ab_test
            where bought_on between '{start_date}' and '{end_date}';
            '''
        return self.session_execute_and_fetch(query, fetchall=False)

    def getDates(self, abtest_id):
        query = f'''
                Select distinct(date_of)
                from statistics natural join algorithm natural join ab_test 
                where abtest_id = {abtest_id}
                order by date_of
            '''
        return self.session_execute_and_fetch(query, fetchall=True)

    def getUniqueCustomerStats(self, abtest_id, start_date, end_date):
        query = f'''
            select unique_customer_id, count(*) as purchases, to_char(sum(price), '99999999990.999') as revenue, 
                    count(distinct (bought_on)) as days_active
            from customer
                     natural join (select dataset_name from ab_test where abtest_id = {abtest_id}) ab_test
                     natural join (select customer_id, dataset_name, bought_on, price
                                   from purchase
                                   where bought_on between '{start_date}' and '{end_date}') purchase
            group by unique_customer_id 
            order by days_active desc;
            '''
        return self.session_execute_and_fetch(query, fetchall=True)


if __name__ == '__main__':
    db_con = DatabaseConnection()
    db_con.connect(filename=getAbsPathFromProjectRoot("config-files/database.ini"))
    db_con.log_version()
