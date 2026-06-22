# ZITADEL Multi-App Demo

Two frontends (React + SvelteKit) share one auth service backed by [ZITADEL](https://zitadel.com). A .NET API validates JWTs from the auth service.

**Requires:** Docker, Node.js 18+, .NET SDK 10

## Quick start

### 1. Start ZITADEL

```sh
cd zitadel-compose
cp .env.example .env
docker compose --env-file .env up -d --wait
```

ZITADEL runs at http://localhost:8080. Default admin: `zitadel-admin@zitadel.localhost` / `Password1!`

### 2. Get your secrets

**`ZITADEL_SERVICE_ACCOUNT_TOKEN`** — on first startup, ZITADEL creates a `login-client` service user and writes its PAT to a bootstrap file. Copy it:

```sh
cd zitadel-compose
docker compose --env-file .env exec zitadel-api cat /zitadel/bootstrap/login-client.pat
```

Paste the output into `ZITADEL_SERVICE_ACCOUNT_TOKEN` in your `.env`.

**`AUTH_SECRET`** — a random string used to sign JWTs. Generate one:

```sh
openssl rand -base64 32
```

Use the **same value** for the .NET API (`Auth:Secret`).

### 3. Configure env files

```sh
cp example.env .env
cp app1/example.env app1/.env
cp app2/example.env app2/.env
```

Edit `.env` in the repo root:

```env
ZITADEL_ISSUER=http://localhost:8080
ZITADEL_SERVICE_ACCOUNT_TOKEN=<your-pat>
AUTH_SECRET=<your-generated-secret>
```

The `app1/.env` and `app2/.env` defaults are fine for local dev.

Set the same secret on the .NET API:

```sh
cd app1api
dotnet user-secrets set "Auth:Secret" "<your-generated-secret>"
```

### 4. Install and run

```sh
npm install && npm install --prefix app1 && npm install --prefix app2
dotnet restore app1api/App1Api.csproj
```

Start each service in a separate terminal:

```sh
npm run dev -- --port 5003                          # Auth service  → http://localhost:5003
npm run dev --prefix app1 -- --port 5001            # React app     → http://localhost:5001
npm run dev --prefix app2 -- --port 5002            # Svelte app    → http://localhost:5002
cd app1api && dotnet run                            # .NET API      → http://localhost:5005
```

### 5. Test

| App | URL | What to try |
|-----|-----|-------------|
| Auth service | http://localhost:5003/login | Login, manage users (admin only) |
| React app | http://localhost:5001 | Login → **Call API** button |
| Svelte app | http://localhost:5002 | Login → logout |

Login with `zitadel-admin@zitadel.localhost` / `Password1!` on any app.
