# Node Core Lab

A senior-level full-stack learning monorepo for practicing Node.js backend engineering against a production-like Next.js frontend.

The frontend is **already implemented** with mock APIs that mirror the contracts in [`docs/contracts/`](docs/contracts). Your job is to implement the Fastify backend module by module — flip a single env flag and the same UI will talk to your real service.

## Layout

```
apps/
  web/                Next.js App Router frontend (this repo's "ready" surface)
  api/                Fastify backend          ← you build this (Backend Roadmap)
    labs/             Standalone scripts       ← Node.js Fundamentals labs
packages/
  types/              Shared DTOs (@repo/types) — single source of truth
  config/             Shared tsconfig presets
docs/
  contracts/          Per-module API contracts (Phase A artefacts)
  adr/                Architecture Decision Records
```

## Prerequisites

- Node.js **20.11+**
- pnpm **9+** (`corepack enable` if needed)

## Install dependencies

From the repository root:

```bash
pnpm install
```

This installs all workspace packages: `apps/web`, `apps/api`, `packages/types`, and `packages/config`.

## Environment setup

### Frontend (`apps/web`)

```bash
cp apps/web/.env.example apps/web/.env.local
```

Default values in `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_MODE=mock
NEXT_PUBLIC_API_BASE_URL=http://localhost:8100
```

### Backend (`apps/api`)

The Fastify server is not implemented yet. When you bootstrap it, copy:

```bash
cp apps/api/.env.example apps/api/.env
```

Default values in `apps/api/.env`:

```env
PORT=8100
HOST=127.0.0.1
```

## Development commands

### Start frontend only (works today)

```bash
pnpm --filter @app/web dev
```

Open **http://localhost:7100**.

The app runs in **mock mode** by default — all five modules work without a backend.

### Start backend only (after you implement Fastify)

Once `apps/api` has a `dev` script (Backend Roadmap → Foundation):

```bash
pnpm --filter @app/api dev
```

API will listen on **http://localhost:8100**.

### Start frontend + backend together

Root command:

```bash
pnpm dev
```

This runs `turbo run dev` across the monorepo. **Today** only `@app/web` has a `dev` script, so Turbo starts the frontend. When you add `"dev"` to `apps/api/package.json`, the same command will start both apps in parallel.

### Node.js fundamentals labs (backend learning track — start here)

```bash
# Run a specific experiment (1–4)
pnpm --filter @app/api exec tsx labs/01-event-loop.ts 1

# Or from repo root with npx
npx tsx apps/api/labs/01-event-loop.ts 1
```

## Ports

| Service | Default port | Config |
| --- | --- | --- |
| Frontend (Next.js) | `7100` | `apps/web/package.json` → `dev` script |
| Backend (Fastify) | `8100` | `apps/api/.env` → `PORT` |
| Frontend → API URL | `8100` | `apps/web/.env.local` → `NEXT_PUBLIC_API_BASE_URL` |

## Mock vs real mode

The whole frontend talks to a single set of API adapters at `apps/web/src/lib/api/*`. Each adapter exports both a `mock*` and a `real*` implementation behind one interface:

```ts
export const authApi: AuthApi = env.apiMode === "mock" ? mockAuth : realAuth;
```

To point the UI at your real Fastify backend, update `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_MODE=real
NEXT_PUBLIC_API_BASE_URL=http://localhost:8100
```

Restart the frontend after changing env vars. The `real*` adapters call the URLs documented in each contract. Implement those routes in `apps/api` and the same pages start hitting your service.

## Module map

| Module | Frontend pages | Mock highlights | Backend track |
| --- | --- | --- | --- |
| 1 — Auth & Security | `/auth/login`, `/auth/register`, `/auth/profile`, `/auth/callback/[provider]` | Validation/conflict/lockout responses, OAuth callback flow, linked accounts | [Backend M1](docs/backend-roadmap.md#module-1-auth--security) · [Contract](docs/contracts/auth.md) |
| 2 — Search | `/search`, `/search/[id]` | 250-row deterministic dataset, cursor pagination, URL-synced filters/sort, infinite scroll | [Backend M2](docs/backend-roadmap.md#module-2-database-performance--search) · [Contract](docs/contracts/search.md) |
| 3 — Files | `/files`, `/files/upload`, `/files/[id]`, `/files/[id]/play` | Chunked uploads with pause/resume/cancel, processing status polling, signed stream URL | [Backend M3](docs/backend-roadmap.md#module-3-file-streaming--processing) · [Contract](docs/contracts/files.md) |
| 4 — Jobs | `/jobs`, `/jobs/new`, `/jobs/[id]` | Mock SSE stream (status, progress, log, completed), retry/cancel, idempotency keys | [Backend M4](docs/backend-roadmap.md#module-4-background-jobs--workers) · [Contract](docs/contracts/jobs.md) |
| 5 — Chat | `/chat`, `/chat/[id]` | Fake WebSocket bus, presence, typing indicator, optimistic sends, delivery status | [Backend M5](docs/backend-roadmap.md#module-5-real-time-chat--websockets) · [Contract](docs/contracts/chat.md) |

## Recommended workflow per backend module

1. Open the matching frontend route (already working) so you understand the UX you must support.
2. Read the mock adapter at `apps/web/src/lib/api/<module>.ts` — the `real*` object lists the exact HTTP routes to implement and the request/response shapes.
3. Fill in the contract stub at `docs/contracts/<module>.md` (Phase A) and lock it.
4. Implement the Fastify routes in `apps/api`. Reuse types from `@repo/types`.
5. Set `NEXT_PUBLIC_API_MODE=real`, hit the page, finish Phase D.
6. Tick off the Learning Outcomes in [`docs/backend-roadmap.md`](docs/backend-roadmap.md).

## Repository commands

```bash
pnpm install           # install all workspace dependencies
pnpm dev               # turbo run dev (FE today; FE + BE when api has dev script)
pnpm --filter @app/web dev    # frontend only → http://localhost:7100
pnpm --filter @app/api dev    # backend only (after Fastify foundation)
pnpm build             # turbo run build
pnpm typecheck         # turbo run typecheck (web + types)
pnpm lint              # turbo run lint
pnpm clean             # clean build artifacts and node_modules
```

## Roadmaps

- [Project Roadmap](docs/project-roadmap.md)
- [Node.js Fundamentals Roadmap](docs/node-fundamentals-roadmap.md) — start here
- [Architecture Roadmap](docs/architecture-roadmap.md)
- [Backend Roadmap](docs/backend-roadmap.md)
- [Frontend Roadmap](docs/frontend-roadmap.md)

## API Contracts

Per-module API contracts live in [`docs/contracts/`](docs/contracts). Use [`docs/contracts/_template.md`](docs/contracts/_template.md) when adding a new module during Phase A.

## Architecture Decision Records

Every non-trivial decision is captured as an ADR in [`docs/adr/`](docs/adr). The process is established by [ADR 0001](docs/adr/0001-record-architecture-decisions.md). Use [`docs/adr/_template.md`](docs/adr/_template.md) when adding a new one.
