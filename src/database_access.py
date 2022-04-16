import psycopg2
from src.config import configDatabase
from src.Logger import Logger


class DatabaseConnection:
    def __init__(self):
        self.connection = None

    def __del__(self):
        # self.disconnect()
        pass

    def connect(self, filename='database.ini', section='postgresql'):
        try:
            # read connection parameters
            params = configDatabase(filename, section)

            # connect to the PostgreSQL server
            Logger.log("Connecting to the PostgreSQL database...")
            self.connection = psycopg2.connect(f"dbname={params['dbname']} user={params['user']}")

        except (Exception, psycopg2.DatabaseError) as error:
            Logger.logError(error)

    def disconnect(self):
        if self.connection is not None:
            self.connection.close()
            Logger.log("Database connection closed.")

    def getConnection(self):
        return self.connection

    def createCursor(self):
        return self.connection.cursor()

    def commit(self):
        return self.connection.commit()

    def rollback(self):
        return self.connection.rollback()

    def logVersion(self):
        """
        Displays the PostgreSQL database server version
        :return: None
        """
        cur = self.createCursor()

        cur.execute('SELECT version()')

        db_version = cur.fetchone()
        Logger.log("PostgreSQL database version:" + db_version[0])

        cur.close()


if __name__ == '__main__':
    db_con = DatabaseConnection()
    db_con.connect(filename="config/database.ini")
    db_con.logVersion()
    db_con.disconnect()
