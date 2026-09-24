# Contract: Database Performance & Search

> Stub. Fill this contract during Phase A of the Search module before any
> frontend or backend work begins. Use [`_template.md`](./_template.md) as the
> canonical structure.

## Status

- Phase A status: Not started. DTOs and routes already exist in code (see below).
- Last updated: TBD.
- Owners: backend, frontend.

## Linked Documents

- Backend module: [`backend-roadmap.md` → Module 2: Database Performance & Search](../backend-roadmap.md#module-2-database-performance--search).
- Frontend module: [`frontend-roadmap.md` → Module 2: High-Performance Search](../frontend-roadmap.md#module-2-high-performance-search).
- Shared types: `packages/types/src/search.ts`.

## Scope (high level)

Searchable list endpoint with filtering, sorting, full-text search, and cursor pagination. Must support an infinite-scroll UI and remain stable under concurrent inserts.

## Starting Point (already in code)

Extract the contract from these sources instead of designing from scratch ([why](../project-roadmap.md#how-this-project-deviates)):

- DTOs: [`packages/types/src/search.ts`](../../packages/types/src/search.ts)
- Routes: `real*` object in [`apps/web/src/lib/api/search.ts`](../../apps/web/src/lib/api/search.ts)

Routes the frontend calls today (relative to `NEXT_PUBLIC_API_BASE_URL`):

- `POST /api/items/search (body: filters, sort, cursor, limit)`
- `GET /api/items/:id`

Known gaps to resolve before freezing:

- [ ] Search is `POST` with a JSON body, not `GET` with query params. Keep it (complex filters) or switch (cacheable, shareable URLs); this affects M6 HTTP caching.
- [ ] The backend roadmap also wants an offset-paginated variant for comparison. Decide whether it is public API or a benchmark-only route.

## To Fill in Phase A

- [ ] Overview.
- [ ] Domain model: searchable entity, tags or categories.
- [ ] Endpoint: `POST /api/items/search` body, or a `GET` alternative (see gaps).
- [ ] Request DTO: filters, sort, cursor, limit.
- [ ] Response DTO: items, `nextCursor`, `hasMore`, `total` (optional).
- [ ] Cursor format: opaque base64 of `{ sortKey, id }`.
- [ ] Sort options.
- [ ] Filter operators: equality, range, in.
- [ ] Errors: invalid cursor, invalid filter.
- [ ] Caching policy and invalidation.
- [ ] Open questions.
