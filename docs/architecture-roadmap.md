# Architecture Roadmap

## Goal

Learn how to structure a non-trivial Node.js backend so it stays maintainable, testable, and replaceable. This is the bridge between "I can write a Fastify route" and "I can design a service that lives in production for years".

## How to Use This File

- This roadmap is cross-cutting. Apply its patterns inside every backend module.
- Each section has tasks that produce reusable building blocks for the rest of the project.

## 0. Decision Records (ADRs)

Every non-trivial decision is captured as an Architecture Decision Record in [`docs/adr/`](./adr). The process is established by [ADR 0001](./adr/0001-record-architecture-decisions.md) and the template lives at [`docs/adr/_template.md`](./adr/_template.md).

### Tasks

- [ ] Read [ADR 0001](./adr/0001-record-architecture-decisions.md) and the [ADR index](./adr/README.md).
- [ ] Write an ADR for the ORM choice (Drizzle vs Prisma).
- [ ] Write an ADR for the cookie and CSRF strategy.
- [ ] Write an ADR for refresh token rotation policy.
- [ ] Write an ADR for queue technology choice.
- [ ] Write an ADR for caching strategy.
- [ ] Write an ADR for OAuth/OIDC providers and account linking rules.
- [ ] Write an ADR for the observability stack.
- [ ] Write an ADR for the deployment target.
- [ ] Document supersedence rules and apply them when revisiting a past decision.
- [ ] Reference the relevant ADR from each module's roadmap section or contract file.

### Learning Outcomes

- [ ] Explain why ADRs reduce decision rot in long-lived projects.
- [ ] Explain how supersedence keeps history intact instead of overwriting decisions.
- [ ] Write an ADR that a teammate can challenge based on the alternatives listed.

## 1. Project Structure & Layered Architecture

### Tasks

- [ ] Define folder layout: `routes`, `controllers`, `services`, `repositories`, `domain`, `infrastructure`, `lib`.
- [ ] Define rule: routes call services, services call repositories, repositories own SQL.
- [ ] Define rule: domain layer must not import infrastructure.
- [ ] Add ESLint rule or import boundary check to enforce layering.
- [ ] Document where validation, authorization, and logging live.

### Learning Outcomes

- [ ] Explain why layering helps testing and onboarding.
- [ ] Explain the difference between application services and domain services.

## 2. Dependency Injection

### Tasks

- [ ] Choose a DI approach: manual factories, `awilix`, or `tsyringe`.
- [ ] Wire database, cache, queue, and logger as injected dependencies.
- [ ] Provide a test container that swaps real adapters with fakes.
- [ ] Document container lifetime: singleton vs request-scoped vs transient.

### Learning Outcomes

- [ ] Explain when DI helps and when it adds noise.
- [ ] Explain how request-scoped dependencies work with `AsyncLocalStorage`.

## 3. Repository Pattern & Data Access

### Tasks

- [ ] Define a repository interface for each aggregate (`UserRepository`, `MessageRepository`, etc.).
- [ ] Implement repositories with Drizzle or Prisma.
- [ ] Hide ORM types from callers. Return domain types only.
- [ ] Add transaction helper that lets services run multiple repository calls atomically.
- [ ] Add unit tests against an in-memory repository implementation.

### Learning Outcomes

- [ ] Explain the trade-off between ORM-leaking and abstract repositories.
- [ ] Explain how to test services without a real database.

## 4. Error Handling Strategy

### Tasks

- [ ] Define a base `AppError` class with `code`, `httpStatus`, `cause`, and `details`.
- [ ] Define domain-specific errors: `ValidationError`, `AuthError`, `NotFoundError`, `ConflictError`, `RateLimitError`, `DependencyError`.
- [ ] Add a single error mapper that converts errors into HTTP responses.
- [ ] Add structured error logs with a stable `code`.
- [ ] Distinguish operational and programmer errors.
- [ ] Decide a `Result<T, E>` strategy for service layer.

### Learning Outcomes

- [ ] Explain when to throw and when to return a `Result`.
- [ ] Explain why exposing internal errors to clients is dangerous.

## 5. API Design

### Tasks

- [ ] Define a REST resource style guide for the project.
- [ ] Define a stable response envelope: `data`, `error`, `meta`.
- [ ] Define a pagination contract: cursor-based default, optional offset.
- [ ] Define filter and sort query param conventions.
- [ ] Define an idempotency-key strategy for unsafe operations.
- [ ] Define API versioning rules: URL prefix or header.
- [ ] Generate OpenAPI from Zod schemas.
- [ ] Publish a typed client to the frontend through `@repo/types`.

### Learning Outcomes

- [ ] Explain why idempotency keys matter for retries.
- [ ] Explain backward-compatibility rules for adding/removing fields.

## 6. Validation & Contracts

### Tasks

- [ ] Define request and response Zod schemas for every route.
- [ ] Generate TypeScript types from Zod for the shared package.
- [ ] Reject unknown fields by default.
- [ ] Add custom Zod refinements for IDs, dates, and enums.
- [ ] Add contract tests that fail when the response shape changes.

### Learning Outcomes

- [ ] Explain the difference between syntactic and semantic validation.
- [ ] Explain how shared schemas reduce frontend-backend drift.

## 7. Caching Strategy

### Tasks

- [ ] Define a cache abstraction with `get`, `set`, `del`, and `wrap`.
- [ ] Implement an in-memory LRU cache.
- [ ] Implement a Redis-backed cache.
- [ ] Add HTTP caching: `ETag`, `Cache-Control`, conditional GET.
- [ ] Add cache-aside flow for read-heavy endpoints.
- [ ] Add stampede protection with single-flight or short locks.
- [ ] Define invalidation rules per resource.

### Learning Outcomes

- [ ] Explain cache-aside, write-through, write-behind.
- [ ] Explain the cache stampede problem.
- [ ] Explain when to cache and when not to.

## 8. Domain Events & Outbox

### Tasks

- [ ] Define a domain event format with `id`, `type`, `payload`, `occurredAt`, `aggregateId`.
- [ ] Add an `outbox` table to persist events inside the same DB transaction as the state change.
- [ ] Add a worker that reads `outbox` and dispatches events to a queue.
- [ ] Add idempotent consumers.

### Learning Outcomes

- [ ] Explain why dual writes to DB and queue cause inconsistency.
- [ ] Explain how the outbox pattern guarantees at-least-once delivery.

## 9. Configuration & Secrets

### Tasks

- [ ] Define an `env.ts` module that validates env vars with Zod at startup.
- [ ] Fail fast if any required env var is missing.
- [ ] Load different configs per environment.
- [ ] Document every env var in `docs/env.md`.
- [ ] Add a secret scanning hook for commits.

### Learning Outcomes

- [ ] Explain why env validation should happen before any side effect.
- [ ] Explain rotation strategies for secrets and keys.

## 10. Observability Hooks in Architecture

### Tasks

- [ ] Add a `requestId` middleware that creates a stable ID per request.
- [ ] Propagate `requestId` and `traceId` through `AsyncLocalStorage`.
- [ ] Add structured logger that automatically includes context.
- [ ] Add a small metrics helper used in services.

### Learning Outcomes

- [ ] Explain how to debug a single failing request across layers.
- [ ] Explain why business logic should not directly import the logger transport.

## 11. Concurrency & Idempotency

### Tasks

- [ ] Define which endpoints must be idempotent.
- [ ] Add unique constraints to enforce idempotency at the DB level.
- [ ] Add optimistic locking with `version` column on critical aggregates.
- [ ] Add explicit transactions where multiple writes must succeed together.

### Learning Outcomes

- [ ] Explain optimistic vs pessimistic locking.
- [ ] Explain typical race conditions in CRUD APIs and how to fix them.

## 12. Cross-Cutting Concerns

### Tasks

- [ ] Define a feature flag abstraction.
- [ ] Define an audit-log abstraction.
- [ ] Define an internationalization (i18n) plan for error messages.
- [ ] Define a multi-tenancy stance: single-tenant first, but document the boundary.

### Learning Outcomes

- [ ] Explain why feature flags help safe rollout.
- [ ] Explain pitfalls of leaking tenant data.

## 13. Secret Management

### Tasks

- [ ] Define secret classification: low (non-sensitive config), medium (third-party API tokens), high (DB password, JWT signing key, OAuth client secrets, encryption keys).
- [ ] Document layered env loading: defaults in code, overrides via `.env.local` for development only, CI secrets via repository or organization settings, runtime secrets fetched from a secret store in production.
- [ ] Add a `secrets/README.md` that lists every secret, its classification, where it lives in each environment, and the rotation cadence.
- [ ] Plan secret rotation procedures for the JWT signing key (with overlap window), DB credentials, and provider tokens.
- [ ] Add a pre-commit hook that scans staged files for secrets (gitleaks or trufflehog).
- [ ] Document the runtime secret fetching strategy (cloud KMS, HashiCorp Vault, or `.env` for local development) without committing any actual secret.
- [ ] Add an ADR that captures the chosen secret store and rotation policy.
- [ ] Ensure logs and error reports redact secret values (already covered by Pino redaction in module 10, cross-link here).

### Learning Outcomes

- [ ] Explain why a `.env` file is not enough in production.
- [ ] Explain how to rotate a JWT signing key without invalidating live sessions.
- [ ] Explain the difference between secrets in build-time, deploy-time, and runtime contexts.

## 14. Data Privacy and PII Handling

### Tasks

- [ ] Classify every persisted field as PII or non-PII in a data dictionary.
- [ ] Encrypt high-sensitivity PII at rest with column-level encryption (e.g. email backups, government IDs, payment metadata).
- [ ] Add Pino redaction patterns for PII in logs.
- [ ] Implement GDPR right-to-access: an authenticated endpoint that exports the user's data as a downloadable JSON or ZIP.
- [ ] Implement GDPR right-to-erasure: an endpoint that deletes or anonymizes the user's data and writes an audit entry.
- [ ] Define data retention policies per entity (active, archived, expired, eligible for purge) and run a scheduled job to enforce them.
- [ ] Audit reads of PII: log who accessed which record, when, and why.
- [ ] Document the data flow diagram showing where PII enters, where it is stored, where it is processed, and where it leaves the system.

### Learning Outcomes

- [ ] Explain the practical difference between PII and non-PII fields in this project.
- [ ] Explain right-to-erasure trade-offs between hard delete, anonymization, and tombstoning.
- [ ] Explain how column-level encryption interacts with backups, search, and migrations.

## Recommended Reading

- "Domain-Driven Design Distilled" by Vaughn Vernon.
- "Patterns of Enterprise Application Architecture" by Martin Fowler.
- "Building Microservices" by Sam Newman, chapters on contracts and resilience.
- Fastify docs: plugins, hooks, encapsulation.
