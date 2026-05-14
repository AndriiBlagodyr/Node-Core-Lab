# Contract: Background Jobs & Workers

> Stub. Fill this contract during Phase A of the Jobs module before any
> frontend or backend work begins. Use [`_template.md`](./_template.md) as the
> canonical structure.

## Status

- Phase A status: Not started.
- Last updated: TBD.
- Owners: backend, frontend.

## Linked Documents

- Backend module: [`backend-roadmap.md` → Module 4: Background Jobs & Workers](../backend-roadmap.md#module-4-background-jobs--workers).
- Frontend module: [`frontend-roadmap.md` → Module 4: Task Queue & Background Processing](../frontend-roadmap.md#module-4-task-queue--background-processing).
- Shared types: `packages/types/src/jobs.ts`.

## Scope (high level)

Create, list, observe, retry, and cancel background jobs. Stream job state to the frontend via SSE with a polling fallback.

## To Fill in Phase A

- [ ] Overview.
- [ ] Domain model: `Job`, `JobEvent`, `Artifact` (e.g. generated report).
- [ ] Job statuses: queued, running, completed, failed, cancelled, retrying.
- [ ] Endpoints: create job, list jobs, get job, retry, cancel.
- [ ] Realtime channel: SSE endpoint contract and event shapes.
- [ ] Polling endpoint contract.
- [ ] Request and response DTOs.
- [ ] Idempotency key behavior on `create job`.
- [ ] Errors: invalid type, invalid transition, not found.
- [ ] Retry and backoff policy exposed to clients.
- [ ] Open questions.
