#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
until python -c "
import psycopg2, os, sys
try:
    psycopg2.connect(os.environ['DATABASE_URL'])
    print('PostgreSQL ready')
except Exception as e:
    print(f'Not ready: {e}')
    sys.exit(1)
"; do
  sleep 2
done

echo "Running database migrations..."
python -m flask db upgrade

if [ "${SEED_DB:-false}" = "true" ]; then
  echo "Seeding database..."
  python seed.py
fi

echo "Starting Gunicorn with eventlet worker..."
exec gunicorn --bind 0.0.0.0:5000 --worker-class eventlet --workers 1 --timeout 120 run:app
