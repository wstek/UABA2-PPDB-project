from datetime import timedelta

import redis

from src.utils.pathParser import getAbsPathFromProjectRoot


class Config(object):
    # session
    SECRET_KEY = "changeme"
    SESSION_TYPE = 'redis'
    SESSION_PERMANENT = True
    SESSION_REDIS = redis.from_url('redis://localhost:6379')
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = "None"
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=60)

    # server side event
    REDIS_URL = "redis://localhost:6379"

    # file upload
    MAX_CONTENT_LENGTH = 1024 * 1024 * 10000
    UPLOAD_EXTENSIONS = ['.csv']
    UPLOAD_PATH = getAbsPathFromProjectRoot("uploaded-files")

    # celery
    CELERY_BROKER_URL = "redis://localhost:6379"
    RESULT_BACKEND = "redis://localhost:6379"
    RESULT_EXTENDED = True
