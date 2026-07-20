# `@app/web`

Next.js (App Router) frontend for Node Core Lab. Implements every page from the [Frontend Roadmap](../../docs/frontend-roadmap.md) using mock adapters that mirror the contracts in [`docs/contracts/`](../../docs/contracts).

## Module → folder map

| Module | Folder | Notes |
| --- | --- | --- |
| Shell | `src/app/layout.tsx`, `src/components/shell/*` | Sidebar, topbar, providers |
| Auth | `src/app/auth/*` | Login, register, profile, OAuth callback |
| Search | `src/app/search/*` | Dashboard table + item details |
| Files | `src/app/files/*` | Library, chunked uploader, details, video player |
| Jobs | `src/app/jobs/*` | Dashboard, new job form, live SSE details |
| Chat | `src/app/chat/*` | Sidebar layout + conversation view |

## API adapter pattern

Every module has an adapter at `src/lib/api/<module>.ts` exporting a single typed object with both a `real*` and `mock*` implementation:

```ts
export const authApi: AuthApi = env.apiMode === "mock" ? mockAuth : realAuth;
```

Switch with `NEXT_PUBLIC_API_MODE=real` in `.env.local`.

## Stack

- Next.js 15 + React 18 (App Router)
- CSS Modules + design tokens (no Tailwind)
- TanStack Query for data fetching, polling, infinite scroll
- React Hook Form + Zod for form validation
- `@repo/types` — shared DTOs with the future backend

## Development

```bash
pnpm install
pnpm dev         # http://localhost:7100
pnpm typecheck
pnpm lint
pnpm build
```
