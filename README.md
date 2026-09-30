# Node Core Lab

A learning monorepo for becoming a full-stack developer by building a production-style **Node.js backend** (Fastify, Postgres, Redis).

The Next.js app in `apps/web` is only a **ready-made test client**. Its pages run on mocks today; implement a backend module, flip one env flag, and the same pages call your API.

**Plan and status: [docs/roadmap.md](docs/roadmap.md).** Labs ✅ · Foundation 🟡 · Auth → Search → Jobs → Chat ⬜

## Layout

```
apps/
  api/            Fastify backend        ← the learning track
    labs/         Node.js fundamentals labs (done)
  web/            Next.js test client    ← already built, no FE tasks
packages/
  types/          Shared DTOs (@repo/types), used by both apps
  config/         Shared tsconfig presets
docs/
  roadmap.md      The plan
  contracts/      One API contract per module
  adr/            Architecture Decision Records
  env.md          Environment variables
  notes/          Write-ups per lab/module
```

## Setup

Requires Node.js **20.11+** and pnpm **9+** (`corepack enable`).

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
docker compose up -d          # Postgres + Redis
pnpm dev                      # web → http://localhost:7100, api → http://localhost:8100
```

Until Foundation is implemented, the API task exits with a `TODO(foundation)` error while the web app keeps running on mocks.

## Mock vs real mode

Each module's client has one adapter in `apps/web/src/lib/api/<module>.ts` with a `mock*` and a `real*` implementation:

```ts
export const authApi: AuthApi = env.apiMode === "mock" ? mockAuth : realAuth;
```

Set `NEXT_PUBLIC_API_MODE=real` in `apps/web/.env.local` and restart `next dev` to call the API. The `real*` object lists the exact routes a module must implement.

| Module | Pages | Contract |
| --- | --- | --- |
| 1 Auth | `/auth/login`, `/auth/register`, `/auth/profile` | [auth.md](docs/contracts/auth.md) |
| 2 Search | `/search`, `/search/[id]` | [search.md](docs/contracts/search.md) |
| 3 Jobs | `/jobs`, `/jobs/new`, `/jobs/[id]` | [jobs.md](docs/contracts/jobs.md) |
| 4 Chat | `/chat`, `/chat/[id]` | [chat.md](docs/contracts/chat.md) |

## Commands

```bash
pnpm dev                          # both apps
pnpm --filter @app/api dev        # API only
pnpm --filter @app/api lab:03 5   # run lab 03, experiment 5
pnpm --filter @app/api cli help   # migrate / seed
pnpm typecheck                    # all workspaces
pnpm lint
pnpm build
```

Environment variables for both apps: [docs/env.md](docs/env.md). Decisions: [docs/adr/](docs/adr).
