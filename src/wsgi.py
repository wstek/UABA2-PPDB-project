from app import create_app
from appConfig import Config

# RUN PRODUCTION SERVER
if __name__ == "__main__":
    app = create_app(Config)
    app.run()
