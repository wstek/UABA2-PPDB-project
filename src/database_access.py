import sqlalchemy
from sqlalchemy.orm import scoped_session, sessionmaker
from config import configDatabase
from Logger import Logger


class DatabaseEngine:
    def __init__(self):
        self.engine = None
        self.database = None

    def connect(self, filename='database.ini', section='postgresql'):
        # read connection parameters
        params = configDatabase(filename, section)

        self.engine = sqlalchemy.create_engine(f"postgresql://{params['user']}@localHost:5432/{params['dbname']}")
        self.database = scoped_session(sessionmaker(bind=self.engine))

    def getConnection(self):
        return self.engine.connect()

    def logVersion(self):
        """
        Displays the PostgreSQL database server version
        :return: None
        """
        db_version = self.database.execute("SELECT version()").fetchone()[0]
        Logger.log("PostgreSQL database version:" + db_version)


if __name__ == '__main__':
    db_con = DatabaseEngine()
    db_con.connect(filename="config/database.ini")
    db_con.logVersion()