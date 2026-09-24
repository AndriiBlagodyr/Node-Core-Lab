# Architecture Decision Records

This folder records every non-trivial architecture decision made in Node Core Lab. ADRs follow the template at [`_template.md`](./_template.md) and the process defined in [ADR 0001](./0001-record-architecture-decisions.md).

## How to Add a New ADR

1. Pick the next number: `NNNN = (highest existing number) + 1`, zero-padded to four digits.
2. Copy [`_template.md`](./_template.md) to `NNNN-short-kebab-title.md`.
3. Set status to `Proposed` while drafting. Move to `Accepted` once the decision is made.
4. Add a row to the index below. Keep the table sorted by number.
5. Reference the ADR from the relevant module roadmap or contract file.

## Numbering and Lifecycle Rules

- Numbers are monotonic. Never reuse a number.
- An ADR is immutable once `Accepted`. To change a decision, write a new ADR that supersedes it.
- When a new ADR supersedes an old one, set the old one's status to `Superseded by ADR-NNNN` and link to the new file.
- A `Deprecated` status means the decision no longer applies but no replacement exists yet.

## Index

| Number | Title | Status | Date |
| ------ | ----- | ------ | ---- |
| [0001](./0001-record-architecture-decisions.md) | Record Architecture Decisions | Accepted | 2026-05-02 |

## Backlog

Decisions the roadmaps need, in the order the [Stage Map](../project-roadmap.md#stage-map) reaches them. Take the next free number when you start one.

| Decision | Needed by | Notes |
| --- | --- | --- |
| ORM: Drizzle vs Prisma | Foundation (before migrations) | Drizzle + `postgres` driver are already installed; record why |
| API route prefix and versioning | M1 contract | Frontend calls `/auth/*` but `/api/<module>/*` elsewhere |
| Error envelope and error-code format | M1 contract | Shape the error handler returns; codes used in every contract |
| Cookie strategy and CSRF approach | M1 | |
| Refresh token rotation policy | M1 | Lifetimes, family revocation, reuse detection |
| OAuth/OIDC providers and account linking | M1 | Google + GitHub; link by verified email only |
| Caching strategy | M6 | In-memory vs Redis vs HTTP cache |
| Queue technology | M4 | BullMQ vs alternatives |
| WebSocket library | M5 | `@fastify/websocket` vs Socket.io; frontend uses a plain `WebSocket` |
| Observability stack | M10 | |
| Secret store and rotation | M12 | See Architecture §13 |
| Deployment target | M12 | |
