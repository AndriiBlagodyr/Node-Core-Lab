# `apps/api` (placeholder)

This folder is the home of the Fastify backend you'll build module by module per the [Backend Roadmap](../../docs/backend-roadmap.md).

The frontend at [`apps/web`](../web) is already implemented and runs against in-process mock adapters by default. When you ship a real route, set `NEXT_PUBLIC_API_MODE=real` in `apps/web/.env.local` to wire the matching adapter.

## Suggested order

1. Start with the [Node.js Fundamentals labs](../../docs/node-fundamentals-roadmap.md) under `apps/api/labs/`. Each lab is a standalone script.
2. Bootstrap the Fastify app foundation per [Backend Roadmap → Foundation](../../docs/backend-roadmap.md#foundation).
3. Pick a module from [Frontend Roadmap](../../docs/frontend-roadmap.md), open the matching mock adapter at `apps/web/src/lib/api/<module>.ts`, and replicate the URLs / request shapes.

## Why does this folder exist already?

So `apps/api/labs/` is in version control from day one and the Fundamentals roadmap can be started without restructuring the workspace.
