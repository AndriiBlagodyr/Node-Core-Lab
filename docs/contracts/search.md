# Contract: Database Performance & Search

> Stub. Freeze this contract in step 1 of [Module 2](../roadmap.md#module-2-search) before writing routes. Use [`_template.md`](./_template.md) for the final structure.

## Status

- Status: Not started. DTOs and routes already exist in code (see below).
- Last updated: TBD.

## Scope (high level)

Searchable list endpoint with filtering, sorting, full-text search, and cursor pagination. Must support an infinite-scroll UI and remain stable under concurrent inserts.

## Starting Point (already in code)

- DTOs: [`packages/types/src/search.ts`](../../packages/types/src/search.ts)
- Routes: `real*` object in [`apps/web/src/lib/api/search.ts`](../../apps/web/src/lib/api/search.ts)

Routes the client calls today (relative to `NEXT_PUBLIC_API_BASE_URL`):

- `POST /api/items/search` (body: filters, sort, cursor, limit)
- `GET /api/items/:id`

## Open Questions

- [ ] Search is `POST` with a JSON body, not `GET` with query params. Keep it (complex filters) or switch (cacheable, shareable URLs); this affects HTTP caching in Module 2.
- [ ] The Module 2 drill needs an `OFFSET` variant for comparison. Decide whether it is a query flag or a benchmark-only route.

## To Fill

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
