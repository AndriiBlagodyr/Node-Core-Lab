# `apps/api`

Fastify backend learning track. Fundamentals labs live under `labs/`. Foundation stubs live under `src/` — fill them in per [docs/foundation.md](../../docs/foundation.md) and [Backend Roadmap → Foundation](../../docs/backend-roadmap.md#foundation).

The frontend at [`apps/web`](../web) runs against mocks by default. When real routes exist, set `NEXT_PUBLIC_API_MODE=real` in `apps/web/.env.local`.

## Foundation (current milestone)

| Area | Path |
| --- | --- |
| Entry / app factory | `src/server.ts`, `src/app.ts` |
| Env (Zod) | `src/config/env.ts` |
| Domain errors | `src/domain/errors.ts` |
| Request context (ALS) | `src/lib/request-context.ts` |
| Plugins | `src/plugins/` |
| Health routes | `src/routes/health.ts` |
| DB / Redis / Mail | `src/infrastructure/` |
| CLI | `src/cli/index.ts` |
| Compose | `docker-compose.yml` (also at repo root) |
| Env docs | [docs/env.md](../../docs/env.md) |

```bash
cp apps/api/.env.example apps/api/.env
docker compose up -d                    # from repo root
pnpm --filter @app/api dev              # throws until stubs are filled
pnpm --filter @app/api cli help
```

Implementation map and fill-in order: **[docs/foundation.md](../../docs/foundation.md)**.

## Fundamentals labs

Each script matches a section in [Node.js Fundamentals Roadmap](../../docs/node-fundamentals-roadmap.md). Pass an experiment number as the first argument (where applicable).

| Lab | Script | Run |
|-----|--------|-----|
| 01 Event Loop | `labs/01-event-loop.ts` | `pnpm --filter @app/api lab:01 <n>` |
| 02 libuv / Thread Pool | `labs/02-libuv-thread-pool.ts` | `pnpm --filter @app/api lab:02 <n>` |
| 03 Streams | `labs/03-streams.ts` | `pnpm --filter @app/api lab:03 <n>` |
| 04 Buffers | `labs/04-buffers.ts` | `pnpm --filter @app/api lab:04 <n>` |
| 05 Concurrency | `labs/05-concurrency.ts` | `pnpm --filter @app/api lab:05 <n>` |
| 06 AsyncLocalStorage | `labs/06-async-local-storage.ts` | `pnpm --filter @app/api lab:06 <n>` |
| 07 Module Systems | `labs/07-module-systems.ts` | `pnpm --filter @app/api lab:07 <n>` |
| 08 Error Handling | `labs/08-error-handling.ts` | `pnpm --filter @app/api lab:08 <n>` |
| 09 Networking | `labs/09-networking.ts` | `pnpm --filter @app/api lab:09 <n>` |
| 10 Crypto | `labs/10-crypto.ts` | `pnpm --filter @app/api lab:10 <n>` |
| 11 Profiling | `labs/11-profiling.ts` | `pnpm --filter @app/api lab:11 <n>` |
| 12 Process & OS | `labs/12-process-os.ts` | `pnpm --filter @app/api lab:12 <n>` |

Example: `pnpm --filter @app/api lab:06 1`

## Suggested order

1. ~~Fundamentals labs~~ under `labs/`.
2. **Foundation** — fill stubs in `src/` ([docs/foundation.md](../../docs/foundation.md)).
3. Architecture patterns + Auth module ([backend-roadmap](../../docs/backend-roadmap.md)).
