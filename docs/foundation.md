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
| Migrations | `infrastructure/db/*`, `drizzle.config.ts` | Write ADR: Drizzle vs Prisma first |
| Seeds + test DB | `infrastructure/db/seed.ts`, `.env` / Compose overrides | Separate `DATABASE_URL` for tests later |
| OpenAPI | `plugins/swagger.ts` | From route schemas; serve `/docs` |
| CLI | `src/cli/index.ts` | `pnpm --filter @app/api cli migrate` etc. |

## Suggested fill-in order

1. `config/env.ts` + expand `.env.example` / `docs/env.md`
2. `domain/errors.ts` + `lib/request-context.ts`
3. `app.ts` + `server.ts` (boot without DB)
4. `plugins/request-id.ts` + `plugins/error-handler.ts`
5. `routes/health.ts` (liveness first; readiness after DB)
6. Compose + `infrastructure/db/*` + migrations
7. Redis + mail stubs (connect only; no product use yet)
8. Swagger + CLI

## Out of scope for Foundation

- Auth, Search, Files, Jobs, Chat routes
- Full DI container (Architecture roadmap — wire gradually)
- Production deployment / CI (later modules)

## Related docs

- [Backend Roadmap — Foundation](./backend-roadmap.md#foundation)
- [Architecture Roadmap](./architecture-roadmap.md) — layering, errors, env, ADRs
- [Project Roadmap — Milestone 1](./project-roadmap.md)
