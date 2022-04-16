import logging
import datetime
from config import configLogger

CONFIG_FILE = "./config/logger.ini"


class Logger:
    logging.basicConfig(format='%(levelname)s: %(message)s', level=logging.ERROR)

    params = configLogger(CONFIG_FILE)

    directory = params["directory"]
    silence_log_console = params["silence_log_console"] == "True"
    silence_log_error_console = params["silence_log_error_console"] == "True"
    log_to_file = params["log_to_file"] == "True"

    @classmethod
    def closeFile(cls):
        pass

    @classmethod
    def __logFile(cls, message):
        currtime = datetime.datetime.now()
        f = open("../logs/" + "log_" + currtime.strftime('%Y-%m-%d'), 'a')
        f.write(currtime.strftime("%H:%M:%S") + " " + message + '\n')
        f.close()

    @classmethod
    def log(cls, message):
        if cls.log_to_file:
            cls.__logFile("INFO: " + message)

        if not cls.silence_log_console:
            print("INFO: " + message)

    @classmethod
    def logError(cls, message, exception=False):
        if cls.log_to_file:
            cls.__logFile("ERROR: " + message)

        if not cls.silence_log_error_console and not exception:
            logging.error(message)
        elif not cls.silence_log_error_console:
            raise Exception(message)


if __name__ == "__main__":
    Logger.log("Log test")
    Logger.logError("Log error test")
    Logger.logError("Log error exception test", True)
