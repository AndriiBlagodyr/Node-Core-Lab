# `apps/api` (placeholder)

This folder is the home of the Fastify backend you'll build module by module per the [Backend Roadmap](../../docs/backend-roadmap.md).

The frontend at [`apps/web`](../web) is already implemented and runs against in-process mock adapters by default. When you ship a real route, set `NEXT_PUBLIC_API_MODE=real` in `apps/web/.env.local` to wire the matching adapter.

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

Lab 07 includes supporting files under `labs/07-module-systems/`.

## Suggested order

1. Start with the [Node.js Fundamentals labs](../../docs/node-fundamentals-roadmap.md) under `apps/api/labs/`. Each lab is a standalone script.
2. Bootstrap the Fastify app foundation per [Backend Roadmap → Foundation](../../docs/backend-roadmap.md#foundation).
3. Pick a module from [Frontend Roadmap](../../docs/frontend-roadmap.md), open the matching mock adapter at `apps/web/src/lib/api/<module>.ts`, and replicate the URLs / request shapes.

## Why does this folder exist already?

So `apps/api/labs/` is in version control from day one and the Fundamentals roadmap can be started without restructuring the workspace.
