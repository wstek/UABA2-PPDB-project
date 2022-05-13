#!/bin/bash

celery -A src.worker worker -l INFO