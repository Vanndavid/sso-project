#!/bin/sh
set -e

PAT_FILE="/zitadel/bootstrap/auth-service.pat"
MAX_PAT_WAIT_SECONDS="${MAX_PAT_WAIT_SECONDS:-180}"

if [ -n "$ZITADEL_SERVICE_ACCOUNT_TOKEN" ]; then
	echo "Using ZITADEL_SERVICE_ACCOUNT_TOKEN from environment."
elif [ -s "$PAT_FILE" ]; then
	export ZITADEL_SERVICE_ACCOUNT_TOKEN="$(tr -d '\n\r' < "$PAT_FILE")"
	echo "Loaded ZITADEL service account token from bootstrap volume."
else
	echo "Waiting for ZITADEL auth-service PAT (up to ${MAX_PAT_WAIT_SECONDS}s)..."
	elapsed=0
	while [ ! -s "$PAT_FILE" ]; do
		if [ "$elapsed" -ge "$MAX_PAT_WAIT_SECONDS" ]; then
			echo ""
			echo "ERROR: ${PAT_FILE} was not created."
			echo "This usually means ZITADEL was already initialized before the demo stack"
			echo "was added. Reset volumes and start fresh:"
			echo ""
			echo "  docker compose down -v"
			echo "  docker compose up --build --wait"
			echo ""
			exit 1
		fi
		sleep 2
		elapsed=$((elapsed + 2))
	done
	export ZITADEL_SERVICE_ACCOUNT_TOKEN="$(tr -d '\n\r' < "$PAT_FILE")"
	echo "Loaded ZITADEL service account token from bootstrap volume."
fi

export ZITADEL_ISSUER="${ZITADEL_ISSUER:-http://zitadel-internal}"
export AUTH_SECRET="${AUTH_SECRET:-demo-auth-secret-for-local-dev-only!!}"
export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-5003}"

# Ensure SvelteKit generated files exist (dev server needs .svelte-kit).
npm run prepare

exec npm run dev -- --host "$HOST" --port "$PORT"
