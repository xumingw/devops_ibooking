#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

test -f ../.env || {
  echo "../.env is required for production deployment"
  exit 1
}

if [ -f .deploy-images.env ]; then
  set -a
  . ./.deploy-images.env
  set +a
  compose_env_args="--env-file ../.env --env-file .deploy-images.env"
else
  compose_env_args="--env-file ../.env"
fi

api_port="${API_PORT:-3000}"
compose_project_name="${COMPOSE_PROJECT_NAME:-devops_ibooking}"

docker compose -p "$compose_project_name" $compose_env_args -f docker-compose.prod.yml pull
docker compose -p "$compose_project_name" $compose_env_args -f docker-compose.prod.yml up -d mysql redis
docker compose -p "$compose_project_name" $compose_env_args -f docker-compose.prod.yml run --rm -T api ./node_modules/.bin/prisma migrate deploy < /dev/null
docker compose -p "$compose_project_name" $compose_env_args -f docker-compose.prod.yml up -d --force-recreate --remove-orphans

for _ in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:${api_port}/api/v1/health" >/dev/null; then
    docker compose -p "$compose_project_name" $compose_env_args -f docker-compose.prod.yml ps
    exit 0
  fi
  sleep 2
done

docker compose -p "$compose_project_name" $compose_env_args -f docker-compose.prod.yml logs --tail=120 api
exit 1
