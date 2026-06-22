#!/bin/sh
set -e

PAT_FILE="/zitadel/bootstrap/auth-service.pat"

echo "Waiting for ZITADEL auth-service PAT..."
while [ ! -s "$PAT_FILE" ]; do
	sleep 2
done

export ZITADEL_SERVICE_ACCOUNT_TOKEN="$(tr -d '\n\r' < "$PAT_FILE")"
export ZITADEL_ISSUER="${ZITADEL_ISSUER:-http://zitadel-api:8080}"
export AUTH_SECRET="${AUTH_SECRET:?AUTH_SECRET is required}"
export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-5003}"

exec npm run dev -- --host "$HOST" --port "$PORT"
