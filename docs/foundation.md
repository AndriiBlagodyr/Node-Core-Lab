# Monorepo Foundation — Implementation Map

Scaffold for [Backend Roadmap → Foundation](./backend-roadmap.md#foundation).
Fill in the stubs under `apps/api/src/`; do not invent product routes yet (Auth comes later).

## Target layout

```
apps/api/
  src/
    server.ts                 # process entry: load env → build app → listen → signals
    app.ts                    # build Fastify instance, register plugins + routes
    config/
      env.ts                  # Zod env validation; fail fast
    domain/
      errors.ts               # AppError hierarchy (shared by error handler)
    lib/
      request-context.ts      # AsyncLocalStorage (requestId, logger bindings)
      result.ts               # optional Result/Either helper
    plugins/
      request-id.ts           # assign/propagate request id
      error-handler.ts        # map domain errors → HTTP
      swagger.ts              # OpenAPI from route schemas
    routes/
      index.ts                # encapsulating plugin that mounts route plugins
      health.ts               # /health, /ready, /live
    infrastructure/
      db/
        client.ts             # Drizzle (or Prisma) connection
        schema.ts             # SQL schema definitions
        migrate.ts            # apply migrations
        seed.ts               # seed scripts
      redis/
        client.ts             # Redis connection (ready later for cache/queues)
      mail/
        client.ts             # Mailer abstraction + MailHog SMTP in dev
    cli/
      index.ts                # small CLI: migrate | seed | …
  drizzle.config.ts           # Drizzle Kit config (if choosing Drizzle)
  eslint.config.js
  docker-compose.yml          # Postgres + Redis + MailHog (also at repo root)
```

Repo root also has `docker-compose.yml` so `pnpm`/`docker compose up` works from the workspace root.

## What to implement where

| Foundation task | Where | Notes |
| --- | --- | --- |
| Fastify + TypeScript + ESLint | `src/app.ts`, `src/server.ts`, `eslint.config.js`, `package.json` scripts | `dev` → `tsx watch src/server.ts` |
| Plugin architecture / encapsulation | `src/plugins/*`, `src/routes/index.ts` | Register via `app.register`; keep secrets/decorators scoped |
| Env validation (Zod) | `src/config/env.ts` | Parse once at startup; export typed `env` |
| Typed route schemas | each `routes/*.ts` + Fastify Zod type provider | Wire in `app.ts` |
| Global error handler | `plugins/error-handler.ts` + `domain/errors.ts` | Map `AppError` → status + stable `code` |
| Pino + redaction | `app.ts` logger config | Redact `authorization`, `cookie`, passwords |
| requestId + AsyncLocalStorage | `plugins/request-id.ts` + `lib/request-context.ts` | Same idea as lab 06 |
| Health / readiness / liveness | `routes/health.ts` | live = process up; ready = DB (+ Redis) reachable |
| Docker Compose | `docker-compose.yml` (root + `apps/api`) | Postgres `5432`, Redis `6379`, MailHog `1025`/`8025` |
| Migrations | `infrastructure/db/*`, `drizzle.config.ts` | Write ADR 0002 first (Drizzle is already installed) |
| Seeds + test DB | `infrastructure/db/seed.ts`, `.env` / Compose overrides | Separate `DATABASE_URL` for tests later |
| OpenAPI | `plugins/swagger.ts` | From route schemas; serve `/docs` |
| CLI | `src/cli/index.ts` | `pnpm --filter @app/api cli migrate` etc. |
| Tests + CI | `vitest.config.ts`, `test/*.test.ts`, `.github/workflows/ci.yml` | `inject()` tests; no port binding |

## Fill-in order and status

Each step should leave `pnpm --filter @app/api dev` in a runnable state. Update the status column as you merge.

| # | Step | Files | Status |
| - | --- | --- | --- |
| 1 | Env validation | `config/env.ts`, `.env.example`, [env.md](./env.md) | ✅ Done |
| 2 | Errors + request context | `domain/errors.ts`, `lib/request-context.ts`, `lib/result.ts` | 🟡 `AppError` base, ALS, and `Result` done; error subclasses TODO |
| 3 | Boot without DB | `app.ts`, `server.ts` (listen + SIGINT/SIGTERM, like lab 12) | ⬜ |
| 4 | Core plugins | `plugins/request-id.ts`, `plugins/error-handler.ts` | ⬜ |
| 5 | Probes | `routes/index.ts`, `routes/health.ts` (`/live` first; `/ready` after DB) | ⬜ |
| 6 | Test harness + CI | Vitest, `app.inject()` test for `/live`, `.github/workflows/ci.yml` | ⬜ |
| 7 | Database | ADR 0002 (ORM), `drizzle.config.ts`, `infrastructure/db/*`, first migration | ⬜ (Compose ✅) |
| 8 | Redis + mail | `infrastructure/redis/client.ts`, `infrastructure/mail/client.ts` (connect only) | ⬜ |
| 9 | Swagger + CLI | `plugins/swagger.ts` (`/docs`), `cli/index.ts` (`migrate`, `seed`) | ⬜ |

Foundation is done when `/live`, `/ready`, and `/docs` respond, CI is green, and `pnpm --filter @app/api db:migrate` works against Compose.

## Out of scope for Foundation

- Auth, Search, Files, Jobs, Chat routes
- Full DI container (Architecture roadmap — wire gradually)
- Production deployment, Docker images, release workflow (M12). A minimal lint/typecheck/test CI *is* in scope.

## Related docs

- [Backend Roadmap — Foundation](./backend-roadmap.md#foundation)
- [Architecture Roadmap](./architecture-roadmap.md) — layering, errors, env, ADRs
- [Project Roadmap — Stage Map](./project-roadmap.md#stage-map)
