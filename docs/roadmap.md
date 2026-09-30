# Roadmap

## Goal

Go from a React developer to a full-stack developer by building a production-style **Node.js backend**. The Next.js app in `apps/web` is only a **ready-made test client**: its pages exercise each backend module, and it has no frontend learning tasks.

Depth over breadth: four modules done properly beat twelve half-done. "Done" means you can explain every layer, not just that it works.

## Status

> Update this table when a stage changes.

| # | Stage | Status |
| - | --- | --- |
| 0 | [Node.js fundamentals labs](../apps/api/labs/README.md) | ✅ Done |
| 1 | [Foundation](#1-foundation) | 🟡 In progress: `config/env.ts`, `lib/request-context.ts`, `lib/result.ts`, Compose |
| 2 | [Module 1: Auth](#module-1-auth) | ⬜ |
| 3 | [Module 2: Search](#module-2-search) | ⬜ |
| 4 | [Module 3: Jobs](#module-3-jobs) | ⬜ |
| 5 | [Module 4: Chat](#module-4-chat) | ⬜ |
| 6 | [Finish line](#finish-line) | ⬜ |

## Stack

| Area | Choice |
| --- | --- |
| Runtime, language | Node.js 20+, TypeScript strict |
| HTTP | Fastify 5 + `fastify-type-provider-zod` |
| Validation | Zod |
| Database | PostgreSQL 16 + Drizzle (installed; record the choice in an ADR) |
| Cache, pub/sub | Redis 7 via `ioredis` |
| Queue | BullMQ (Module 3) |
| Realtime | SSE (Module 3), `@fastify/websocket` (Module 4); the client uses a plain `WebSocket` |
| Logs, API docs | Pino (built into Fastify), `@fastify/swagger` |
| Tests | Vitest, Fastify `inject()`, Testcontainers, autocannon |
| Test client | `apps/web`: Next.js with mock/real adapters, already built |

## How Every Module Works

Each module is the same six-step loop. Keep one PR (or a short series) per step.

1. **Contract.** Copy the routes the client already calls (the `real*` object in `apps/web/src/lib/api/<module>.ts`) and the DTOs (`packages/types/src/<module>.ts`) into `docs/contracts/<module>.md`. Resolve its open questions and mark it `Frozen`. If a shape changes, update `@repo/types` and the mock adapter in the same PR.
2. **Build.** Routes → services → repositories. Routes validate and call services; services hold the logic; repositories own SQL. Services never touch `request` or `reply`.
3. **Test.** Integration tests with `app.inject()` against real Postgres/Redis (Testcontainers), plus unit tests for tricky service logic.
4. **Run it for real.** Set `NEXT_PUBLIC_API_MODE=real` and click through the module's pages.
5. **Break it.** Do the module's drill: cause the failure on purpose, watch it in the logs, fix it, and keep a test that proves the fix.
6. **Write it up.** Add one page in `docs/notes/<module>.md` explaining the design and the drill ("expected / happened / why", like the labs). This is how the Learning Outcomes get checked.

A module is **done** when all six steps are merged. Write an ADR ([how](./adr/README.md)) only for decisions you might later regret; the backlog is in the ADR index.

## 0. Node.js Fundamentals

✅ All 12 labs are done: event loop, thread pool, streams, buffers, workers, AsyncLocalStorage, modules, errors, networking, crypto, profiling, process signals. See [labs/README.md](../apps/api/labs/README.md). Re-read the labs a module lists before starting it.

## 1. Foundation

A bootable, tested Fastify skeleton with no product routes. Stubs are in `apps/api/src/` and marked `TODO(foundation)`.

Uses labs: 06 (ALS), 08 (errors), 12 (signals, probes).

| # | Step | Files | Status |
| - | --- | --- | --- |
| 1 | Zod env validation, fail fast | `config/env.ts`, `.env.example`, [env.md](./env.md) | ✅ |
| 2 | Error hierarchy: `AppError` + `ValidationError`, `AuthError`, `NotFoundError`, `ConflictError`, `RateLimitError` | `domain/errors.ts` | 🟡 base class only |
| 3 | Request context in ALS | `lib/request-context.ts` | ✅ |
| 4 | App factory: Pino with redaction (`authorization`, `cookie`, `password`), Zod type provider | `app.ts` | ⬜ |
| 5 | Entry point: listen, SIGINT/SIGTERM graceful shutdown | `server.ts` | ⬜ |
| 6 | Request ID plugin (header in/out, ALS, child logger) | `plugins/request-id.ts` | ⬜ |
| 7 | Error handler: `AppError` → `{ error: { code, message, details } }`, never leak internals | `plugins/error-handler.ts` | ⬜ |
| 8 | Probes: `/live` (process up), `/ready` (DB + Redis reachable) | `routes/index.ts`, `routes/health.ts` | ⬜ |
| 9 | Test harness: Vitest + an `inject()` test for `/live` | `vitest.config.ts`, `test/` | ⬜ |
| 10 | CI: install → lint → typecheck → test on every PR | `.github/workflows/ci.yml` | ⬜ |
| 11 | Postgres: Drizzle client, first migration, seed | `infrastructure/db/*`, `drizzle.config.ts` | ⬜ (Compose ✅) |
| 12 | Redis client (connect + `ping` only) | `infrastructure/redis/client.ts` | ⬜ |
| 13 | OpenAPI at `/docs`; CLI `migrate` / `seed` | `plugins/swagger.ts`, `cli/index.ts` | ⬜ |

**Drill:** send `SIGTERM` while a slow request is in flight. It must finish, `/ready` must flip to 503 first, and the process must exit cleanly. Then start with a broken `DATABASE_URL` and confirm the app refuses to boot with a clear message.

**Learning Outcomes**

- [ ] Explain Fastify's lifecycle hooks and plugin encapsulation.
- [ ] Explain how the request ID reaches a log line three `await`s deep.
- [ ] Explain liveness vs readiness, and why shutdown order matters.

## Module 1: Auth

Email + password auth with rotating refresh tokens. Pages: `/auth/login`, `/auth/register`, `/auth/profile`. Contract: [auth.md](./contracts/auth.md). Uses lab 10 (crypto).

**Tasks**

- [ ] Tables: `users`, `refresh_tokens` (family id, hash, expiry, `revoked_at`).
- [ ] Register, login, logout, `GET /me`, `PATCH /me`.
- [ ] Hash passwords with argon2id; explain the chosen cost parameters.
- [ ] Short-lived JWT access token (≈15 min) + opaque refresh token in an HttpOnly, Secure, SameSite cookie.
- [ ] Refresh rotation: every refresh issues a new token and revokes the old one. Reusing a revoked token revokes the whole family.
- [ ] `authenticate` plugin/decorator for protected routes; ownership checks on user data.
- [ ] CSRF defence for cookie auth (SameSite + origin check, or a double-submit token), documented in the contract.
- [ ] Rate-limit `login` and `register`; generic error on bad credentials.
- [ ] `@fastify/helmet` and a strict CORS allow-list (`credentials: true` for the web origin only).
- [ ] Test client: add refresh-and-retry on 401 in `apps/web/src/lib/api/http.ts` (a small change).

**Drill:** steal a refresh token (copy the cookie), let the real client rotate it, then replay the stolen one. The family must be revoked and both sessions logged out. Also try an expired access token and a tampered JWT signature.

**Learning Outcomes**

- [ ] Explain access vs refresh token roles, lifetimes and storage.
- [ ] Explain rotation and reuse detection on a whiteboard.
- [ ] Explain CSRF in cookie auth and why your defence works.
- [ ] Explain why argon2id, and what its parameters trade off.

## Module 2: Search

Postgres performance on a real dataset, plus caching. Pages: `/search`, `/search/[id]`. Contract: [search.md](./contracts/search.md).

**Tasks**

- [ ] `items` table (+ tags) seeded with ~1M rows via the CLI.
- [ ] Search endpoint: filters, multi-field sort with an `id` tie-breaker, cursor pagination.
- [ ] Full-text search (`tsvector` + GIN) and fuzzy match (`pg_trgm`).
- [ ] Indexes chosen from `EXPLAIN ANALYZE`, with before/after numbers in the write-up.
- [ ] Detail endpoint without N+1 queries.
- [ ] Redis cache-aside for item details, with invalidation on write and a key-naming convention.
- [ ] Stampede protection (single-flight) for hot keys.
- [ ] `ETag` + `If-None-Match` on detail responses.
- [ ] Benchmark with autocannon: no index vs index vs cache; tune the pool size.

**Drill:** paginate with `OFFSET` while a script inserts rows. Show the duplicates and skipped rows, then show cursor pagination staying stable. Then expire a hot cache key under load and watch the DB spike, before and after single-flight.

**Learning Outcomes**

- [ ] Explain why offset pagination breaks and how a cursor fixes it.
- [ ] Read an `EXPLAIN ANALYZE` plan and explain why an index helps a sort.
- [ ] Explain cache-aside, invalidation, and the stampede problem.

## Module 3: Jobs

Background work with BullMQ, streamed to the client over SSE. Pages: `/jobs`, `/jobs/new`, `/jobs/[id]`. Contract: [jobs.md](./contracts/jobs.md). Uses labs 05 (workers) and 08 (AbortController).

**Tasks**

- [ ] `jobs` + `job_events` tables; BullMQ queue and a separate worker process.
- [ ] Create a job with an `Idempotency-Key` (a unique constraint makes a replayed request return the same job).
- [ ] Progress updates, retries with exponential backoff, and a dead-letter state.
- [ ] Cancel via `AbortController`; retry a failed job.
- [ ] Run CPU-heavy job types in a Worker Thread, off the event loop.
- [ ] SSE endpoint `GET /api/jobs/:id/events`: the worker publishes to Redis and the API streams to the client. Handle client disconnects.
- [ ] Graceful worker shutdown that finishes or returns in-flight jobs.

**Drill:** `kill -9` the worker in the middle of a job. Find out whether the job is lost, duplicated, or retried, then make it safe (idempotent handler, stalled-job recovery). Also block the event loop with a CPU job on the main thread and measure API latency, then move it to a worker.

**Learning Outcomes**

- [ ] Explain at-least-once delivery and why handlers must be idempotent.
- [ ] Explain when to use a queue vs an HTTP retry vs doing it inline.
- [ ] Explain how SSE works over HTTP and when to prefer it over WebSockets.

## Module 4: Chat

Stateful connections that scale past one process. Pages: `/chat`, `/chat/[id]`. Contract: [chat.md](./contracts/chat.md). Uses lab 09 (networking).

**Tasks**

- [ ] `conversations`, `participants`, `messages` tables; history endpoint with cursor pagination.
- [ ] `@fastify/websocket` at `/api/chat/ws`, authenticated from the auth cookie on upgrade.
- [ ] Join/leave rooms; send, persist and broadcast messages with delivery status.
- [ ] Typing (throttled) and presence (debounced) events.
- [ ] Heartbeat ping/pong; drop dead connections.
- [ ] Reconnect with replay since the last seen message ID.
- [ ] Redis pub/sub so two API instances share rooms.
- [ ] Per-connection rate limit and slow-client backpressure (check `bufferedAmount`, then drop or disconnect).

**Drill:** run two API instances on different ports with users connected to each, and show a message crossing between them. Then simulate a slow client that never reads and watch server memory; fix it with backpressure handling.

**Learning Outcomes**

- [ ] Explain why WebSocket auth differs from HTTP auth.
- [ ] Explain what breaks when you scale stateful connections horizontally.
- [ ] Explain heartbeats vs TCP keepalive.

## Finish Line

- [ ] Multi-stage `Dockerfile` for the API (+ worker); `docker compose up` runs the whole stack.
- [ ] `/metrics` with `prom-client`: request latency histogram, queue depth, and DB pool usage.
- [ ] README walkthrough: the architecture in 15 minutes, told through the four write-ups.

You're done when you can, without notes:

- [ ] Walk someone through the architecture and every dependency in `apps/api/package.json`.
- [ ] Explain refresh rotation, cursor pagination, at-least-once delivery, and WebSocket scaling, using your own drills as examples.
- [ ] Show how a single failing request appears in the logs, found by its request ID.

## Out of Scope

Dropped on purpose to keep this finishable: file uploads/streaming, webhooks, scheduled jobs, email, OAuth/social login, 2FA, GDPR/PII tooling, a full OWASP audit, library publishing, and frontend work beyond small fixes the backend needs. Pick one up only after the finish line.
