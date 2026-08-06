# Environment variables

Document every variable the API reads. Keep in sync with `apps/api/.env.example` and `apps/api/src/config/env.ts`.

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
| `SMTP_URL` | yes | — | SMTP URL (MailHog in local Compose) |

\* Defaults apply when the variable is unset. Values in `.env.example` match these defaults for local Compose.

## Local Compose ports

| Service | Port |
| --- | --- |
| Postgres | `5432` |
| Redis | `6379` |
| MailHog SMTP | `1025` |
| MailHog UI | `8025` |

Start infra: `docker compose up -d` from the repo root.
