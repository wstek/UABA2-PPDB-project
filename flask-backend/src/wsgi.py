import os
import sys

# appends parent directory to the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.factories.app import create_app
from src.factories.celery import configure_celery

# RUN PRODUCTION SERVER
if __name__ == "__main__":
    app = create_app()
    configure_celery(app)
    app.run()
