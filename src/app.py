from flask import Flask
from database_access import Database
import time

app = Flask(__name__)

db = Database()
db.connect(filename="config/database.ini")
db.logVersion()


@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}


# RUN DEV SERVER
if __name__ == "__main__":
    app.run(debug=True)
