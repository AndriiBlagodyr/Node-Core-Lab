# Contract: <Module Name>

> Canonical template for a per-module API contract. Copy this file into a new
> `docs/contracts/<module>.md` during Phase A of the module and fill every section.
> Both frontend and backend reference this file as the single source of truth for
> the module API.

## Status

- Phase A status: Draft / In review / Frozen.
- Last updated: YYYY-MM-DD.
- Owners: backend, frontend.

## Linked Documents

- Backend roadmap section: [docs/backend-roadmap.md](../backend-roadmap.md).
- Frontend roadmap section: [docs/frontend-roadmap.md](../frontend-roadmap.md).
- Shared types: `packages/types/src/<module>.ts`.

## Overview

Short description of what this module does, who uses it, and which problems it solves. Two to four sentences. No implementation details.

## Domain Model

List the main domain entities the API talks about. Keep it abstract; do not paste DB schemas.

- `Entity` — short description, key fields.
- `Entity` — short description, key fields.

## Endpoints

Group endpoints by resource. For each endpoint specify method, path, auth, request, response, and possible errors.

### `METHOD /api/<path>`

- Auth: public / authenticated / admin.
- Idempotent: yes / no.
- Rate limit: e.g. 10 req/min per IP.
- Description: one sentence.
- Request body: link to DTO below.
- Query params: link to DTO below.
- Response 200: link to DTO below.
- Errors: list error codes that may be returned.

Repeat for every endpoint.

## Request and Response DTOs

Define request and response shapes here. These shapes must match `packages/types/src/<module>.ts` exactly.

```ts
type ExampleRequest = {
  field: string;
};

type ExampleResponse = {
  id: string;
  field: string;
  createdAt: string;
};
```

## Errors

List every domain error this module can return. Each error must have a stable string code.

| Code | HTTP | Meaning | Notes |
| ---- | ---- | ------- | ----- |
| `MODULE_NOT_FOUND` | 404 | Resource not found. | Generic. |
| `MODULE_VALIDATION` | 400 | Request failed validation. | Includes details array. |
| `MODULE_CONFLICT` | 409 | Conflicting state. | E.g. unique constraint. |
| `MODULE_FORBIDDEN` | 403 | Caller lacks permission. | |

## Events

If this module emits domain events (for queues, webhooks, or sockets), list them here.

| Event | Payload | When emitted |
| ----- | ------- | ------------ |
| `module.created` | `{ id, ... }` | After successful create. |

## Pagination

Specify the pagination strategy for list endpoints.

- Strategy: cursor / offset / none.
- Cursor format: opaque base64 / explicit fields.
- Default page size: N.
- Max page size: N.

## Idempotency

- Which endpoints accept an `Idempotency-Key` header.
- TTL of stored idempotency results.
- Behavior on key reuse with different payload.

## Realtime

If the module exposes WebSocket or SSE channels, document them here.

- Channel: `/realtime/<module>`.
- Auth: how the socket authenticates.
- Inbound events: list with payload shapes.
- Outbound events: list with payload shapes.
- Heartbeat strategy.

## Caching

- Cacheable endpoints and their TTL.
- Cache keys.
- Invalidation rules.
- HTTP cache headers used.

## Security Notes

Module-specific security considerations. Examples: which endpoints are CSRF-sensitive, rate-limit budgets, permission rules, audit log entries.

## Open Questions

Track open questions during Phase A. Resolve all of them before marking the contract Frozen.

- [ ] Question 1.
- [ ] Question 2.

## Change Log

| Date | Change | Author |
| ---- | ------ | ------ |
| YYYY-MM-DD | Initial draft. | name |
