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

api_port_env="${API_PORT:-}"
compose_project_name="${COMPOSE_PROJECT_NAME:-devops_ibooking}"

read_env_value() {
  env_file="$1"
  env_key="$2"
  awk -F= -v key="$env_key" '
    /^[[:space:]]*#/ || /^[[:space:]]*$/ { next }
    {
      name = $1
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", name)
      if (name == key) {
        sub(/^[^=]*=/, "")
        gsub(/^[[:space:]]+|[[:space:]]+$/, "")
        gsub(/^"|"$/, "")
        print
        exit
      }
    }
  ' "$env_file"
}

resolve_api_health_port() {
  api_port_value="$1"
  case "$api_port_value" in
    *:*)
      api_host="${api_port_value%:*}"
      api_port_number="${api_port_value##*:}"
      case "$api_host" in
        127.0.0.1|localhost|0.0.0.0) ;;
        *)
          echo "API_PORT host must be 127.0.0.1, localhost, or 0.0.0.0 when using host:port. Current value: $api_port_value" >&2
          return 1
          ;;
      esac
      ;;
    *)
      api_port_number="$api_port_value"
      ;;
  esac

  case "$api_port_number" in
    ''|*[!0-9]*)
      echo "API_PORT must be a numeric port between 1 and 65535, or a localhost host:port binding. Current value: $api_port_value" >&2
      return 1
      ;;
  esac

  if ! printf '%s\n' "$api_port_number" | awk '
    length($0) > 5 { exit 1 }
    {
      port = $0 + 0
      if (port < 1 || port > 65535) exit 1
    }
  '; then
    echo "API_PORT must be between 1 and 65535. Current value: $api_port_value" >&2
    return 1
  fi

  printf '%s\n' "$api_port_number"
}

API_PORT="${api_port_env:-$(read_env_value ../.env API_PORT)}"
API_PORT="${API_PORT:-3000}"
api_health_port="$(resolve_api_health_port "$API_PORT")"

docker compose -p "$compose_project_name" $compose_env_args -f docker-compose.prod.yml pull
docker compose -p "$compose_project_name" $compose_env_args -f docker-compose.prod.yml up -d mysql redis
docker compose -p "$compose_project_name" $compose_env_args -f docker-compose.prod.yml run --rm -T api ./node_modules/.bin/prisma migrate deploy < /dev/null
docker compose -p "$compose_project_name" $compose_env_args -f docker-compose.prod.yml up -d --force-recreate --remove-orphans

for _ in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:${api_health_port}/api/v1/health" >/dev/null; then
    docker compose -p "$compose_project_name" $compose_env_args -f docker-compose.prod.yml ps
    exit 0
  fi
  sleep 2
done

docker compose -p "$compose_project_name" $compose_env_args -f docker-compose.prod.yml logs --tail=120 api
exit 1
