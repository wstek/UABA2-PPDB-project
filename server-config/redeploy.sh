#!/bin/bash

cd /home/app/Programming-project-databases/

# github pull
git pull

# install python packages
./env/bin/pip3 install -r ./flask-backend/requirements.txt

# install nodejs packages
cd react-frontend
rm -rf node_modules
npm install --legacy-peer-deps

# compile react app
npm run build

# restart services
sudo -n nginx -s reload
sudo systemctl daemon-reload

sudo systemctl restart webapp-w1.service
sudo systemctl restart webapp-w2.service
sudo systemctl restart webapp-w3.service

sudo systemctl restart celery-worker.service