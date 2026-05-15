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

## Suggested First ADRs to Write

These decisions should be captured as ADRs early in the project. They are listed for reference; create them as the corresponding modules begin.

- ORM choice (Drizzle vs Prisma).
- Cookie strategy and CSRF approach.
- Refresh token rotation policy.
- Queue technology (BullMQ vs alternatives).
- Caching strategy (in-memory vs Redis vs HTTP cache).
- OAuth/OIDC providers list.
- Observability stack.
- Deployment target.
