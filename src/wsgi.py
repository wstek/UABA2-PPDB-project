import os
import sys

# appends parent directory to the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.app import create_app
from src.appConfig import Config

# RUN PRODUCTION SERVER
if __name__ == "__main__":
    app = create_app(Config)
    app.run()
