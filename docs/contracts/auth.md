# Contract: Auth & Security

> Stub. Fill this contract during Phase A of the Auth module before any frontend
> or backend work begins. Use [`_template.md`](./_template.md) as the canonical
> structure.

## Status

- Phase A status: Not started. DTOs and routes already exist in code (see below).
- Last updated: TBD.
- Owners: backend, frontend.

## Linked Documents

- Backend module: [`backend-roadmap.md` → Module 1: Auth & Security](../backend-roadmap.md#module-1-auth--security).
- Frontend module: [`frontend-roadmap.md` → Module 1: Auth & Security](../frontend-roadmap.md#module-1-auth--security).
- Shared types: `packages/types/src/auth.ts`.

## Scope (high level)

Authentication, session management, refresh token rotation, password reset, email verification, optional TOTP 2FA, and client-side OAuth 2.0 / OIDC social login (Google and GitHub). The contract must cover every endpoint the frontend calls plus every cookie the backend sets.

## Starting Point (already in code)

Extract the contract from these sources instead of designing from scratch ([why](../project-roadmap.md#how-this-project-deviates)):

- DTOs: [`packages/types/src/auth.ts`](../../packages/types/src/auth.ts)
- Routes: `real*` object in [`apps/web/src/lib/api/auth.ts`](../../apps/web/src/lib/api/auth.ts)

Routes the frontend calls today (relative to `NEXT_PUBLIC_API_BASE_URL`):

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/logout`
- `GET /auth/me`
- `PATCH /auth/me`
- `POST /auth/refresh`
- `GET /auth/linked-accounts`
- `POST /auth/linked-accounts/:provider`
- `DELETE /auth/linked-accounts/:provider`
- `GET /auth/oauth/:provider/start?returnTo=` (full-page redirect; the backend then redirects to the frontend `/auth/callback/[provider]`)

Known gaps to resolve before freezing:

- [ ] Prefix: auth has no `/api` prefix, unlike every other module. Decide in the route-prefix ADR, then align.
- [ ] The frontend doesn't call verify-email, forgot/reset password, TOTP, or logout-all yet. Add them to the contract before the matching frontend work.

## To Fill in Phase A

- [ ] Overview.
- [ ] Domain model: `User`, `Session`, `RefreshTokenFamily`, `SocialAccount`, etc.
- [ ] Endpoints: register, login, logout, refresh, profile, password reset, 2FA.
- [ ] OAuth/OIDC endpoints: authorize redirect, callback, link account, unlink account, list linked accounts.
- [ ] OAuth/OIDC flow: Authorization Code with PKCE, `state` and `nonce` validation, ID token verification against provider JWKS.
- [ ] Account linking rules: link by verified email only, behavior on collisions and unverified emails.
- [ ] Request and response DTOs.
- [ ] Errors with stable codes.
- [ ] Events emitted to audit log, including `social_login`, `social_account_linked`, `social_account_unlinked`.
- [ ] Cookie strategy: names, flags, paths, lifetimes.
- [ ] CSRF strategy.
- [ ] Rate limiting per endpoint.
- [ ] Open questions.
