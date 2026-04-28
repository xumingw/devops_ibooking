#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
