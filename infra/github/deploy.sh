#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

if [ -f .deploy-images.env ]; then
  docker compose --env-file .deploy-images.env -f docker-compose.prod.yml pull
  docker compose --env-file .deploy-images.env -f docker-compose.prod.yml up -d
  docker compose --env-file .deploy-images.env -f docker-compose.prod.yml ps
else
  docker compose -f docker-compose.prod.yml pull
  docker compose -f docker-compose.prod.yml up -d
  docker compose -f docker-compose.prod.yml ps
fi
