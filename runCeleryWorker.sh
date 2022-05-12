#!/bin/bash

celery -A src.celeryTasks.tasks worker -l INFO