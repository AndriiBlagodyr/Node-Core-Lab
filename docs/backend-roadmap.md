# Backend Roadmap

## Goal

Use the backend as the main Node.js learning track. Build real backend systems with Fastify, TypeScript, PostgreSQL, Redis, streams, WebSockets, queues, security, tests, and observability. Aim for senior-level depth: not "it works" but "I can explain every layer".

## Prerequisites

Before starting Module 1, complete the foundational labs:

- [ ] [Node.js Fundamentals Roadmap](./node-fundamentals-roadmap.md): event loop, streams, workers, AsyncLocalStorage, profiling.
- [ ] [Architecture Roadmap](./architecture-roadmap.md): layering, DI, error handling, API design, caching strategy.

These two files are referenced from every module below.

## Technology Decisions

- Runtime: Node.js (LTS).
- Language: TypeScript with strict mode.
- Framework: Fastify with plugin architecture.
- Database: PostgreSQL.
- ORM/query layer: Drizzle for SQL learning, or Prisma for faster delivery.
- Validation: Zod, integrated with Fastify schemas.
- Auth: JWT access tokens + refresh token rotation in HttpOnly cookies.
- Password hashing: argon2id.
- Realtime: native WebSocket via `@fastify/websocket` or Socket.io.
- Cache and pub/sub: Redis.
- Queue: BullMQ.
- Email: provider-agnostic abstraction (SES, Resend, Postmark) with a dev SMTP fallback.
- Testing: Vitest, Supertest or Fastify `inject`, Testcontainers for Postgres and Redis.
- Profiling: `clinic.js`, `0x`, `autocannon`, `k6`.

## Foundation

Scaffold and file map: [docs/foundation.md](./foundation.md). Stubs live under `apps/api/src/`.

### Tasks

- [ ] Create Fastify app with TypeScript and strict ESLint.
- [ ] Adopt Fastify plugin architecture and encapsulation.
- [ ] Add env validation with Zod, fail fast on misconfig.
- [ ] Add typed route schemas with Fastify type providers.
- [ ] Add global error handler that maps domain errors to HTTP.
- [ ] Add Pino structured logger with redaction.
- [ ] Add `requestId` middleware and propagate via `AsyncLocalStorage`.
- [ ] Add health, readiness, and liveness endpoints.
- [ ] Add Docker Compose with PostgreSQL, Redis, and MailHog.
- [ ] Add migration workflow (Drizzle Kit or Prisma Migrate).
- [ ] Add seed scripts and test database workflow.
- [ ] Add OpenAPI generation from route schemas.
- [ ] Add a small CLI for running scripts and migrations.

### Learning Outcomes

- [ ] Explain Fastify lifecycle hooks and when to use each.
- [ ] Explain how plugin encapsulation isolates state.
- [ ] Explain how `AsyncLocalStorage` carries request context.

## Module 1: Auth & Security

- Contract: [docs/contracts/auth.md](./contracts/auth.md)
- Shared types: `packages/types/src/auth.ts`

### Data Model

- [ ] User.
- [ ] Session and refresh token family.
- [ ] Email verification token.
- [ ] Password reset token.
- [ ] TOTP secret.
- [ ] Failed login attempt log.
- [ ] Security audit event.

### API Tasks

- [ ] Register user with email verification.
- [ ] Login with email and password.
- [ ] Logout single device.
- [ ] Logout all devices.
- [ ] Refresh session.
- [ ] Get current profile.
- [ ] Update profile.
- [ ] Change password.
- [ ] Forgot password.
- [ ] Reset password.
- [ ] Enable / disable TOTP 2FA.
- [ ] Verify TOTP at login.

### Security Tasks

- [ ] Hash passwords with argon2id, tune cost parameters.
- [ ] Issue short-lived JWT access tokens.
- [ ] Implement refresh token rotation with token families.
- [ ] Detect refresh token reuse and revoke the family.
- [ ] Store refresh tokens in HttpOnly, Secure, SameSite cookies.
- [ ] Add CSRF strategy compatible with cookie auth (double-submit token or SameSite-only).
- [ ] Add rate limiting on `/login`, `/register`, `/forgot-password`.
- [ ] Add account lockout after N failed attempts.
- [ ] Add brute-force protection with exponential delay.
- [ ] Add Helmet headers and CORS policy.
- [ ] Add JWT key rotation support and a JWKS endpoint.
- [ ] Add audit log for login, logout, failed login, token reuse, password changes, 2FA changes.
- [ ] Add `npm audit` and Renovate / Dependabot in CI.

### OAuth 2.0 / OIDC Integration (Social Login)

Client-side integration only. The project does not implement its own Identity Provider; it consumes Google and GitHub as providers via the OAuth 2.0 Authorization Code flow with PKCE.

- [ ] Register OAuth applications for Google and GitHub. Document client IDs and redirect URIs.
- [ ] Add `social_account` table linking external `provider` + `providerUserId` to a local `User`.
- [ ] Implement Authorization Code flow with PKCE (`code_verifier`, `code_challenge`).
- [ ] Generate and validate `state` to prevent CSRF.
- [ ] Generate and validate `nonce` for OIDC providers.
- [ ] Exchange the authorization code for tokens at the provider's token endpoint.
- [ ] Fetch and cache the provider's JWKS, verify ID token signature and claims (`iss`, `aud`, `exp`, `nonce`).
- [ ] Resolve the user identity: link to existing `User` by verified email or create a new `User` with the linked `social_account`.
- [ ] Reject linking when the provider has not verified the user's email.
- [ ] Handle email collisions: prompt the user to log in with their existing credentials and link the social account from the profile.
- [ ] Issue local session tokens after successful OIDC login (same flow as email/password login).
- [ ] Add an endpoint to unlink a `social_account` while keeping the local user.
- [ ] Add audit log entries for `social_login`, `social_account_linked`, and `social_account_unlinked`.

#### Testing Tasks

- [ ] Test successful Google login on a new account.
- [ ] Test successful GitHub login on a new account.
- [ ] Test linking an existing local account to a social provider.
- [ ] Test rejection of unverified email from a provider.
- [ ] Test invalid `state` and invalid `nonce`.
- [ ] Test expired or wrong-issuer ID token.

#### Learning Outcomes

- [ ] Explain Authorization Code flow with PKCE and why PKCE matters even server-side.
- [ ] Explain the difference between an OAuth access token and an OIDC ID token.
- [ ] Explain JWKS rotation and why ID token signatures must be verified.
- [ ] Explain account linking pitfalls (email squatting, unverified emails).

### Testing Tasks

- [ ] Test happy-path register, verify, login, refresh, logout.
- [ ] Test invalid credentials and account lockout.
- [ ] Test expired access token.
- [ ] Test refresh rotation and reuse detection.
- [ ] Test 2FA enrollment and login.
- [ ] Test password reset full flow.
- [ ] Test protected routes with and without permissions.
- [ ] Test CSRF protection.

### OWASP Top 10 Audit

Once the module is feature-complete, walk through OWASP Top 10 (2021) against the auth surface and confirm the mitigation that exists in this project. This audit is the closing checkpoint of Module 1.

- [ ] A01 Broken Access Control: verified RBAC checks on every protected route, IDOR tests for user-owned resources.
- [ ] A02 Cryptographic Failures: argon2id parameters tuned, TLS-only cookies, JWT signing key rotation, no secrets in logs.
- [ ] A03 Injection: parameterized queries via the ORM, all inputs validated with Zod, no string-concatenated SQL.
- [ ] A04 Insecure Design: a short threat model document for the auth flow lives in `docs/adr/` or `docs/security/`.
- [ ] A05 Security Misconfiguration: Helmet enabled, CORS default-deny, generic error messages on auth failure, debug endpoints disabled in production.
- [ ] A06 Vulnerable and Outdated Components: `npm audit` clean, Renovate / Dependabot active, lockfile committed.
- [ ] A07 Identification and Authentication Failures: rate limiting, account lockout, refresh-reuse detection, 2FA available.
- [ ] A08 Software and Data Integrity Failures: lockfile integrity verified in CI, package provenance checked when consuming third-party libraries.
- [ ] A09 Security Logging and Monitoring Failures: audit log covers login, logout, failed login, token reuse, password change, 2FA change, social account linking.
- [ ] A10 Server-Side Request Forgery: outbound URLs (e.g. provider JWKS, password reset email links) are validated against an allow-list and reject private IP ranges.

#### Learning Outcomes

- [ ] Walk through each OWASP Top 10 category and point to the file or test that mitigates it in this project.
- [ ] Explain a realistic exploit scenario for at least three of the categories.

### Learning Outcomes

- [ ] Explain access vs refresh token roles and lifetimes.
- [ ] Explain refresh token rotation and reuse detection.
- [ ] Explain why password reset tokens must be single-use and short-lived.
- [ ] Explain TOTP and why time drift matters.
- [ ] Explain CSRF in cookie-based auth.

## Module 2: Database Performance & Search

- Contract: [docs/contracts/search.md](./contracts/search.md)
- Shared types: `packages/types/src/search.ts`

### Data Model

- [ ] Searchable item entity (e.g., `Article`, `Product`, or `Project`).
- [ ] Tags or category relations to test joins.
- [ ] Full-text search column.

### API Tasks

- [ ] Search endpoint with cursor pagination.
- [ ] Filtering by multiple fields.
- [ ] Sorting by multiple fields with deterministic tie-breaker.
- [ ] Full-text search.
- [ ] Endpoint that returns the same dataset with offset pagination, for comparison.

### Database Tasks

- [ ] Add indexes for common filters and sorts.
- [ ] Add full-text index with `tsvector` and `tsquery`.
- [ ] Add trigram index for fuzzy matching.
- [ ] Use `EXPLAIN ANALYZE` to inspect slow queries.
- [ ] Compare offset and cursor pagination on a 1M-row dataset.
- [ ] Tune connection pool size based on load tests.
- [ ] Reproduce and fix the N+1 problem.
- [ ] Run a transaction with `READ COMMITTED` and `SERIALIZABLE`, observe behavior.
- [ ] Implement optimistic locking with a `version` column.
- [ ] Implement pessimistic locking with `SELECT ... FOR UPDATE`.
- [ ] Practice a zero-downtime migration: add column, backfill, switch reads, drop old.
- [ ] Implement soft delete with a partial unique index.

### Testing Tasks

- [ ] Test pagination stability under concurrent inserts.
- [ ] Test filter and sort combinations.
- [ ] Test invalid cursor.
- [ ] Add benchmark script with `autocannon` or `k6`.
- [ ] Compare cold and warm cache results.

### Learning Outcomes

- [ ] Explain why offset pagination breaks under concurrent inserts.
- [ ] Explain how an index helps a sort.
- [ ] Explain isolation levels and the anomalies each prevents.
- [ ] Explain when to choose optimistic vs pessimistic locking.

## Module 3: File Streaming & Processing

- Contract: [docs/contracts/files.md](./contracts/files.md)
- Shared types: `packages/types/src/files.ts`

### Data Model

- [ ] File.
- [ ] File upload session.
- [ ] File chunk.
- [ ] File processing job.
- [ ] File access grant.

### API Tasks

- [ ] Initiate multipart upload.
- [ ] Upload chunk with content-range support.
- [ ] Complete upload and assemble.
- [ ] Cancel and clean up upload.
- [ ] Get upload progress.
- [ ] Stream video with HTTP range requests.
- [ ] Generate signed/private file URLs with short TTL.
- [ ] Get file processing status.

### Node.js Learning Tasks

- [ ] Use `fs.createReadStream` and `fs.createWriteStream` with `pipeline`.
- [ ] Handle backpressure correctly.
- [ ] Avoid loading large files fully into memory.
- [ ] Compute incremental SHA-256 of uploaded chunks.
- [ ] Process images with `sharp` in a worker thread.
- [ ] Process video with `ffmpeg` via `child_process.spawn` and stream output.
- [ ] Compare local FS storage and S3-compatible storage (MinIO) behind a single abstraction.

### Security Tasks

- [ ] Validate MIME type and magic bytes, not just extension.
- [ ] Limit file size by content-length and on-stream count.
- [ ] Prevent path traversal.
- [ ] Store files outside public directories.
- [ ] Issue signed access tokens for private files with TTL and bound to user.
- [ ] Add antivirus or hash-deny placeholder hook.

### Testing Tasks

- [ ] Test full chunk upload flow including resume.
- [ ] Test upload cancellation cleans up chunks.
- [ ] Test invalid file type rejection.
- [ ] Test range requests with various byte ranges.
- [ ] Test processing failure and recovery.

### Learning Outcomes

- [ ] Explain HTTP range requests and partial content.
- [ ] Explain backpressure end-to-end through a stream pipeline.
- [ ] Explain why content type validation by extension is unsafe.

## Module 4: Background Jobs & Workers

- Contract: [docs/contracts/jobs.md](./contracts/jobs.md)
- Shared types: `packages/types/src/jobs.ts`

### Data Model

- [ ] Job (logical record persisted in DB for the dashboard).
- [ ] Job event log.
- [ ] Generated report or output artifact.

### API Tasks

- [ ] Create background job.
- [ ] List jobs with filters.
- [ ] Get job details.
- [ ] Retry failed job.
- [ ] Cancel job.
- [ ] Stream job updates via SSE.
- [ ] Polling fallback endpoint.

### Queue Tasks

- [ ] Configure BullMQ queues, workers, and connection options.
- [ ] Implement job progress updates.
- [ ] Implement retry and exponential backoff.
- [ ] Implement dead-letter queue for permanently failed jobs.
- [ ] Implement repeatable / scheduled jobs (cron).
- [ ] Implement job priorities.
- [ ] Implement worker concurrency tuning.
- [ ] Implement rate-limited workers.
- [ ] Implement parent/child job flows with FlowProducer.
- [ ] Implement idempotency keys for jobs.
- [ ] Implement graceful worker shutdown that drains in-flight jobs.

### Node.js Learning Tasks

- [ ] Move CPU-heavy work into Worker Threads.
- [ ] Compare async I/O jobs and CPU-bound jobs in a single worker.
- [ ] Use `AbortController` to cancel long-running jobs.
- [ ] Profile worker memory and detect leaks.

### Testing Tasks

- [ ] Test job creation and completion against a real Redis (Testcontainers).
- [ ] Test retry, backoff, and DLQ.
- [ ] Test cancellation.
- [ ] Test scheduled job firing.
- [ ] Test worker graceful shutdown does not lose jobs.

### Learning Outcomes

- [ ] Explain at-least-once delivery and idempotency consequences.
- [ ] Explain how to scale workers horizontally.
- [ ] Explain when to use queues vs HTTP retries vs cron.

## Module 5: Real-time Chat & WebSockets

- Contract: [docs/contracts/chat.md](./contracts/chat.md)
- Shared types: `packages/types/src/chat.ts`

### Data Model

- [ ] Conversation.
- [ ] Conversation participant.
- [ ] Message with delivery status.
- [ ] Read receipt.
- [ ] Presence state.

### API Tasks

- [ ] Get conversations.
- [ ] Get paginated message history.
- [ ] Send message (REST fallback).
- [ ] Mark messages read.
- [ ] Get contacts.

### WebSocket Tasks

- [ ] Authenticate socket connection with short-lived token.
- [ ] Implement heartbeat with ping/pong.
- [ ] Join and leave conversation rooms.
- [ ] Send and receive messages.
- [ ] Emit typing events with throttling.
- [ ] Emit presence updates with debounce.
- [ ] Emit read receipts.
- [ ] Handle reconnect and message replay since last seen.
- [ ] Persist messages with delivery status.

### Scaling Tasks

- [ ] Add Redis pub/sub adapter for multi-instance broadcast.
- [ ] Support sticky sessions or stateless socket handling.
- [ ] Add socket event rate limiting.
- [ ] Handle backpressure for slow clients.
- [ ] Add connection cap per user.

### Testing Tasks

- [ ] Test authenticated and unauthorized connections.
- [ ] Test multi-room messaging.
- [ ] Test typing and presence events.
- [ ] Test reconnect with replay.
- [ ] Test broadcast across two server instances via Redis.

### Learning Outcomes

- [ ] Explain why WebSockets need separate auth from HTTP.
- [ ] Explain horizontal scaling pitfalls for stateful connections.
- [ ] Explain heartbeat strategy and why it differs from TCP keepalive.

## Module 6: Caching

### Tasks

- [ ] Implement in-memory LRU cache.
- [ ] Implement Redis cache with consistent key naming.
- [ ] Implement cache-aside helper `getOrSet`.
- [ ] Add HTTP `ETag` and `Cache-Control` to read endpoints.
- [ ] Add stampede protection with single-flight or short distributed locks.
- [ ] Define invalidation rules per resource.
- [ ] Add cache hit/miss metrics.

### Testing Tasks

- [ ] Test cache hit, miss, and refresh behavior.
- [ ] Test TTL expiration.
- [ ] Test invalidation on write.
- [ ] Load test with and without cache.

### Learning Outcomes

- [ ] Explain cache-aside, write-through, write-behind, and read-through.
- [ ] Explain cache stampede and mitigation strategies.
- [ ] Explain when caching hurts correctness.

## Module 7: Webhooks

### Tasks

- [ ] Build outbound webhook dispatcher: persist event, deliver via worker.
- [ ] Sign payloads with HMAC-SHA256.
- [ ] Add timestamp and replay window to signatures.
- [ ] Implement retries with exponential backoff and DLQ.
- [ ] Implement inbound webhook receiver with signature verification.
- [ ] Add idempotency on receiver via event id.

### Testing Tasks

- [ ] Test signature verification.
- [ ] Test replay rejection.
- [ ] Test retry on 5xx.
- [ ] Test DLQ behavior.

### Learning Outcomes

- [ ] Explain why HMAC signatures are required for webhooks.
- [ ] Explain the difference between idempotent receivers and at-least-once delivery.

## Module 8: Scheduled Jobs

### Tasks

- [ ] Implement cron jobs via BullMQ repeatable jobs.
- [ ] Implement leader election so cron runs once across instances.
- [ ] Add job for daily report generation.
- [ ] Add job for stale session cleanup.
- [ ] Add job for soft-deleted record purging.

### Testing Tasks

- [ ] Test that cron triggers at expected time.
- [ ] Test leader election under multiple instances.

### Learning Outcomes

- [ ] Explain why naive cron breaks in multi-instance deployments.
- [ ] Explain the trade-off between BullMQ repeatable jobs and external schedulers.

## Module 9: Email & Notifications

### Tasks

- [ ] Define a provider-agnostic `Mailer` interface.
- [ ] Implement SMTP adapter for development (MailHog).
- [ ] Implement transactional provider adapter (SES, Resend, Postmark).
- [ ] Build email templates with MJML or React Email.
- [ ] Send email asynchronously through a queue.
- [ ] Track sent/failed events and store in audit log.

### Testing Tasks

- [ ] Test that registration enqueues a verification email.
- [ ] Test that password reset enqueues an email with a one-time token.
- [ ] Test failure handling and retries.

### Learning Outcomes

- [ ] Explain why email sending must never block a request.
- [ ] Explain how to keep templates testable.

## Module 10: Observability

### Tasks

- [ ] Configure Pino with redaction and pretty dev logs.
- [ ] Add `requestId`, `traceId`, `userId` to log context via `AsyncLocalStorage`.
- [ ] Integrate OpenTelemetry SDK: traces, metrics, logs.
- [ ] Export metrics to Prometheus, design 3 dashboards: API, queue, DB.
- [ ] Integrate Sentry or equivalent for error reporting.
- [ ] Add latency histograms per route.
- [ ] Add queue depth and processing time metrics.
- [ ] Add database pool metrics.
- [ ] Document basic SLOs: error rate, p95 latency.

### Testing Tasks

- [ ] Verify a failing request produces a single trace with full context.
- [ ] Verify metrics endpoint exposes expected counters.

### Learning Outcomes

- [ ] Explain logs vs metrics vs traces and what each is best for.
- [ ] Explain how distributed tracing connects services.
- [ ] Explain SLO, SLI, and error budgets at a high level.

## Module 11: Testing Strategy

### Tasks

- [ ] Build unit tests for services with fake repositories.
- [ ] Build integration tests for API routes via Fastify `inject`.
- [ ] Build database integration tests with Testcontainers.
- [ ] Build queue worker tests with Testcontainers Redis.
- [ ] Build WebSocket integration tests.
- [ ] Build contract tests against `@repo/types`.
- [ ] Build load tests with `k6` or `autocannon`, store baseline numbers.
- [ ] Optional: mutation tests with Stryker on critical modules.
- [ ] Add coverage gates in CI.
- [ ] Add a flaky-test policy.

### Learning Outcomes

- [ ] Explain the test pyramid for backend services.
- [ ] Explain why integration tests on real Postgres beat mocks.
- [ ] Explain when load tests catch real regressions.

## Module 12: Deployment & CI

### Tasks

- [ ] Add multi-stage Dockerfile.
- [ ] Add `.dockerignore`.
- [ ] Add GitHub Actions pipeline: lint, typecheck, test, build, image build.
- [ ] Add migration deployment strategy with backwards-compatible steps.
- [ ] Add health, readiness, liveness probe documentation.
- [ ] Document graceful shutdown timing.
- [ ] Add Renovate or Dependabot.
- [ ] Add a release workflow with changelog.
- [ ] Document required environment variables and secrets.
- [ ] Write a production readiness checklist.

### Learning Outcomes

- [ ] Explain readiness vs liveness probes.
- [ ] Explain blue-green and rolling deploy at a high level.
- [ ] Explain why migrations must be backwards compatible during deploy.

## Module 13: Library Publishing Lab

A side quest that turns one piece of internal code into a properly published Node.js library. The target registry is GitHub Packages; switching to public npm later is a small extra step.

### Tasks

- [ ] Pick a small, self-contained utility from the monorepo. Good candidates: the env config loader, the `Result` type and helpers, the HTTP error mapper, or the `AsyncLocalStorage` request-context helper.
- [ ] Move it into a new package `packages/lib-<name>` with its own `package.json`, `tsconfig.json`, and `README.md`.
- [ ] Configure a dual ESM and CJS build with `tsup` (or `unbuild`).
- [ ] Generate `.d.ts` type declarations and verify type resolution from a consumer.
- [ ] Configure the `exports` field with conditional exports for `import`, `require`, and `types`.
- [ ] Add `engines.node` and document the minimum supported Node version.
- [ ] Add a `CHANGELOG.md` and adopt semantic versioning. Use `changesets` or manual entries; document the choice.
- [ ] Configure GitHub Packages publishing: scope the package name as `@<org>/<name>`, set `publishConfig.registry` to `https://npm.pkg.github.com`.
- [ ] Add a publish workflow at `.github/workflows/publish.yml` that runs on tag push and uses `GITHUB_TOKEN` with `packages: write` permission.
- [ ] Document consumer setup: `npm login --registry=https://npm.pkg.github.com`, `.npmrc` with `@<org>:registry=https://npm.pkg.github.com`, and access token scopes.
- [ ] Consume the package from `apps/api` via the GitHub Packages registry to prove the publish round-trip.
- [ ] Optional: enable npm provenance and document why it matters.

### Testing Tasks

- [ ] Add unit tests for the library.
- [ ] Add a small smoke consumer in the repo (a tiny `examples/` script) that imports the published package.
- [ ] Verify both ESM and CJS imports work.
- [ ] Verify types resolve in a TypeScript consumer.

### Learning Outcomes

- [ ] Explain semantic versioning and what triggers a major, minor, or patch bump.
- [ ] Explain the dual package hazard and how the `exports` field prevents it.
- [ ] Explain how GitHub Packages authenticates publishers and consumers.
- [ ] Explain why npm provenance and lockfile integrity matter for supply chain security.
