# Architecture Decision Records

This folder records every non-trivial architecture decision made in Node Core Lab. ADRs follow the template at [`_template.md`](./_template.md) and the process defined in [ADR 0001](./0001-record-architecture-decisions.md).

## How to Add a New ADR

1. Pick the next number: `NNNN = (highest existing number) + 1`, zero-padded to four digits.
2. Copy [`_template.md`](./_template.md) to `NNNN-short-kebab-title.md`.
3. Set status to `Proposed` while drafting. Move to `Accepted` once the decision is made.
4. Add a row to the index below. Keep the table sorted by number.
5. Reference the ADR from the relevant contract or the roadmap.

## Numbering and Lifecycle Rules

- Numbers are monotonic. Never reuse a number.
- An ADR is immutable once `Accepted`. To change a decision, write a new ADR that supersedes it.
- When a new ADR supersedes an old one, set the old one's status to `Superseded by ADR-NNNN` and link to the new file.
- A `Deprecated` status means the decision no longer applies but no replacement exists yet.

## Index

| Number | Title | Status | Date |
| ------ | ----- | ------ | ---- |
| [0001](./0001-record-architecture-decisions.md) | Record Architecture Decisions | Accepted | 2026-05-02 |

## Backl## Backlog

Decisions the [roadmap](../roadmap.md) needs, in order. Take the next free number when you start one.

| Decision | Needed by | Notes |
| --- | --- | --- |
| ORM: Drizzle vs Prisma | Foundation (before migrations) | Drizzle + `postgres` driver are already installed; record why |
| Route prefix and error envelope | Module 1 contract | Client calls `/auth/*` but `/api/<module>/*` elsewhere |
| Session design: cookies, CSRF, refresh rotation | Module 1 | Lifetimes, family revocation, reuse detection |
| Caching strategy | Module 2 | Redis cache-aside vs HTTP caching; invalidation rules |
| Queue technology | Module 3 | BullMQ vs alternatives |
| WebSocket library | Module 4 | `@fastify/websocket` vs Socket.io; the client uses a plain `WebSocket` |
