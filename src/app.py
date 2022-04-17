from flask import Flask
from database_access import DatabaseEngine
import time

app = Flask(__name__)

# db_engine = DatabaseEngine()
# db_engine.connect(filename="config/database.ini")
# db_engine.logVersion()


@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}


# RUN DEV SERVER
if __name__ == "__main__":
    app.run(debug=True)