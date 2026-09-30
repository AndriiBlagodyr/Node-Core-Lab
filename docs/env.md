# Environment variables

Every variable either app reads. Keep this file in sync with each app's `.env.example`, and with `apps/api/src/config/env.ts` for the API.

`loadEnv()` in `apps/api/src/config/env.ts` validates with Zod and fails fast before the server binds a port or opens connections. Copy `.env.example` → `.env` for local work.

## `apps/api`

| Variable | Required | Default (Zod) | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | no* | `development` | `development` \| `test` \| `production` |
| `HOST` | no* | `127.0.0.1` | Bind address for Fastify |
| `PORT` | no* | `8100` | HTTP port (positive integer) |
| `LOG_LEVEL` | no* | `info` | Pino level: `fatal` \| `error` \| `warn` \| `info` \| `debug` \| `trace` \| `silent` |
| `DATABASE_URL` | yes | — | PostgreSQL connection string |
| `REDIS_URL` | yes | — | Redis connection string |

\* Defaults apply when the variable is unset. Values in `.env.example` match these defaults for local Compose.

## Local Compose ports

| Service | Port |
| --- | --- |
| Postgres | `5432` |
| Redis | `6379` |

Start infra: `docker compose up -d` from the repo root.

## `apps/web`

Copy `.env.example` → `.env.local`. `NEXT_PUBLIC_*` values are inlined at build time, so restart `next dev` after changing them.

| Variable | Default | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_MODE` | `mock` | `mock` = in-process mock adapters; `real` = call the Fastify API |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8100` | API origin used when `NEXT_PUBLIC_API_MODE=real` (HTTP, SSE, and WebSocket) |

## Planned

Add rows here when the variable is introduced, not before.

| Variable | Stage | Purpose |
| --- | --- | --- |
| `NODE_ENV=test` override or `TEST_DATABASE_URL` | Foundation | Separate DB for integration tests (Testcontainers may make this unnecessary) |
| `CORS_ORIGIN` | Module 1 | Must match the web origin (`http://localhost:7100`) for credentialed requests |
| `JWT_SECRET` (or key pair), `COOKIE_SECRET` | Module 1 | Never commit real values |
