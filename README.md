## Quick start (Docker — recommended)

**Requires:** Docker with Compose v2.20+

```sh
cp .env.example .env
docker compose up --build --wait
```

That single command starts ZITADEL, the auth service, both frontends, and the .NET API. No `npm install`, no manual PAT setup, no extra terminals.

| App | URL | What to try |
|-----|-----|-------------|
| Auth service | http://localhost:5003 | Login, manage users (admin only) |
| React app | http://localhost:5001 | Login → **Call API** button |
| Svelte app | http://localhost:5002 | Login → logout |
| ZITADEL console | http://localhost:8080 | Identity provider admin UI |

Login with `zitadel-admin@zitadel.localhost` / `Password1!` on any app.

To stop everything:

```sh
docker compose down
```

To reset ZITADEL data and start fresh:

```sh
docker compose down -v
docker compose up --build --wait
```

## Local development (without Docker)

**Requires:** Docker (for ZITADEL only), Node.js 18+, .NET SDK 10

### 1. Start ZITADEL

```sh
cd zitadel-compose
cp .env.example .env
docker compose --env-file .env up -d --wait
```

ZITADEL runs at http://localhost:8080. Default admin: `zitadel-admin@zitadel.localhost` / `Password1!`

### 2. Get your secrets

**`ZITADEL_SERVICE_ACCOUNT_TOKEN`** — a Personal Access Token (PAT) for the auth service to call ZITADEL APIs:

1. Sign in at http://localhost:8080 with the admin credentials above
2. Go to **Users → Service Users → New**
3. Create a user with **Bearer** token type
4. Open the user → **Personal Access Tokens → New** → copy the token
5. Grant the user **Org Owner** (or **IAM Owner**) so it can manage users and sessions

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
cd app1api && dotnet run --urls http://localhost:5005   # .NET API  → http://localhost:5005
```
