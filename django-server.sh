#!/bin/sh
#python3 -m pip install -U -r requirements.txt

pip3 install virtualenv

virtualenv djangoenv

source djangoenv/bin/activate

python3 manage.py runserver