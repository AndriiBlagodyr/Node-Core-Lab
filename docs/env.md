# Environment variables

Document every variable the API reads. Keep in sync with `apps/api/.env.example` and `apps/api/src/config/env.ts`.

## `apps/api`

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | yes | — | `development` \| `test` \| `production` |
| `HOST` | yes | `127.0.0.1` | Bind address for Fastify |
| `PORT` | yes | `8100` | HTTP port |
| `LOG_LEVEL` | yes | `info` | Pino log level |
| `DATABASE_URL` | yes | — | PostgreSQL connection string |
| `REDIS_URL` | yes | — | Redis connection string |
| `SMTP_URL` | yes | — | SMTP URL (MailHog in local Compose) |

## Local Compose ports

| Service | Port |
| --- | --- |
| Postgres | `5432` |
| Redis | `6379` |
| MailHog SMTP | `1025` |
| MailHog UI | `8025` |

Start infra: `docker compose up -d` from the repo root.
