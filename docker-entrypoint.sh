#!/bin/sh
set -e

echo "Running database migrations..."
node /app/scripts/migrate.mjs

echo "Starting server..."
exec node /app/server.js
