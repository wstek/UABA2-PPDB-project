from flask import Flask
from database_access import DatabaseConnection
import time

app = Flask(__name__)

db_con = DatabaseConnection()
db_con.connect(filename="config/database.ini")
db_con.logVersion()


@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}


# RUN DEV SERVER
if __name__ == "__main__":
    app.run(debug=True)
