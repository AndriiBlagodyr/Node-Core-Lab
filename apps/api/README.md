# `apps/api`

The Fastify backend: the learning track. The plan, per-step status and module tasks live in **[docs/roadmap.md](../../docs/roadmap.md)**.

```bash
cp apps/api/.env.example apps/api/.env
docker compose up -d                    # from repo root: Postgres + Redis
pnpm --filter @app/api dev              # exits with TODO(foundation) until app.ts/server.ts are filled
pnpm --filter @app/api cli help
```

## Source map

| Area | Path |
| --- | --- |
| Entry / app factory | `src/server.ts`, `src/app.ts` |
| Env (Zod) | `src/config/env.ts` · [docs/env.md](../../docs/env.md) |
| Domain errors | `src/domain/errors.ts` |
| Request context (ALS) | `src/lib/request-context.ts` |
| Plugins | `src/plugins/` (request id, error handler, swagger) |
| Routes | `src/routes/` (health first; one folder per module later) |
| DB / Redis | `src/infrastructure/` |
| CLI | `src/cli/index.ts` |

Remaining stubs are marked `TODO(foundation)`: `grep -rn "TODO(foundation)" src`.

## Labs

All 12 Node.js fundamentals labs are done. The index, run commands and Learning Outcomes are in [labs/README.md](./labs/README.md).
