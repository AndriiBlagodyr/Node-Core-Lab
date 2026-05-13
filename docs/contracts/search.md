# Contract: Database Performance & Search

> Stub. Fill this contract during Phase A of the Search module before any
> frontend or backend work begins. Use [`_template.md`](./_template.md) as the
> canonical structure.

## Status

- Phase A status: Not started.
- Last updated: TBD.
- Owners: backend, frontend.

## Linked Documents

- Backend module: [`backend-roadmap.md` → Module 2: Database Performance & Search](../backend-roadmap.md#module-2-database-performance--search).
- Frontend module: [`frontend-roadmap.md` → Module 2: High-Performance Search](../frontend-roadmap.md#module-2-high-performance-search).
- Shared types: `packages/types/src/search.ts`.

## Scope (high level)

Searchable list endpoint with filtering, sorting, full-text search, and cursor pagination. Must support an infinite-scroll UI and remain stable under concurrent inserts.

## To Fill in Phase A

- [ ] Overview.
- [ ] Domain model: searchable entity, tags or categories.
- [ ] Endpoint: `GET /api/<resource>` with all query params.
- [ ] Request DTO: filters, sort, cursor, limit.
- [ ] Response DTO: items, `nextCursor`, `hasMore`, `total` (optional).
- [ ] Cursor format: opaque base64 of `{ sortKey, id }`.
- [ ] Sort options.
- [ ] Filter operators: equality, range, in.
- [ ] Errors: invalid cursor, invalid filter.
- [ ] Caching policy and invalidation.
- [ ] Open questions.
