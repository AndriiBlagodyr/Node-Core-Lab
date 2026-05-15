# Contract: Auth & Security

> Stub. Fill this contract during Phase A of the Auth module before any frontend
> or backend work begins. Use [`_template.md`](./_template.md) as the canonical
> structure.

## Status

- Phase A status: Not started.
- Last updated: TBD.
- Owners: backend, frontend.

## Linked Documents

- Backend module: [`backend-roadmap.md` → Module 1: Auth & Security](../backend-roadmap.md#module-1-auth--security).
- Frontend module: [`frontend-roadmap.md` → Module 1: Auth & Security](../frontend-roadmap.md#module-1-auth--security).
- Shared types: `packages/types/src/auth.ts`.

## Scope (high level)

Authentication, session management, refresh token rotation, password reset, email verification, optional TOTP 2FA, and client-side OAuth 2.0 / OIDC social login (Google and GitHub). The contract must cover every endpoint the frontend calls plus every cookie the backend sets.

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
