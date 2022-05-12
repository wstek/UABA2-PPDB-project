#!/bin/bash

celery -A src.celeryTasks worker -l INFO