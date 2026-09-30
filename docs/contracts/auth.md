# Contract: Auth

> Stub. Freeze this contract in step 1 of [Module 1](../roadmap.md#module-1-auth) before writing routes. Use [`_template.md`](./_template.md) for the final structure.

## Status

- Status: Not started. DTOs and routes already exist in code (see below).
- Last updated: TBD.

## Scope

Email + password registration and login, `GET`/`PATCH` of the current user, logout, and session refresh with rotating refresh tokens. The contract must cover every endpoint the client calls and every cookie the backend sets.

Out of scope: email verification, password reset, 2FA, and OAuth (see [Out of Scope](../roadmap.md#out-of-scope)).

## Starting Point (already in code)

- DTOs: [`packages/types/src/auth.ts`](../../packages/types/src/auth.ts)
- Routes: `realAuth` in [`apps/web/src/lib/api/auth.ts`](../../apps/web/src/lib/api/auth.ts)

Routes the client calls today (relative to `NEXT_PUBLIC_API_BASE_URL`):

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `GET /auth/me`
- `PATCH /auth/me`

## Open Questions

- [ ] Prefix: auth uses `/auth/*`, while every other module uses `/api/<module>/*`. Pick one and align the client.
- [ ] Error envelope: confirm the `{ error: { code, message, details } }` shape from `packages/types/src/common.ts`, and list the codes (`validation_error`, `unauthorized`, `conflict`, `rate_limited`, …).
- [ ] Cookies: names, `Path` (refresh cookie scoped to `/auth/refresh`?), `SameSite`, lifetimes.
- [ ] Where the access token lives: response body + memory, or a second HttpOnly cookie. `Session` currently returns only `accessTokenExpiresInSec`.
- [ ] CSRF defence for cookie-authenticated `POST`/`PATCH`.
- [ ] Rate limits for `login` and `register`.

## To Fill

- [ ] Endpoints with request/response DTOs and error codes.
- [ ] Refresh rotation rules: token family, reuse detection, what the client sees on reuse.
- [ ] Cookie table.
- [ ] Rate-limit table.
