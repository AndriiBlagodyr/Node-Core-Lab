# `@app/web`

A Next.js **test client** for the backend. It isn't a learning track: change it only when a backend module needs a small fix to be exercised (see [docs/roadmap.md](../../docs/roadmap.md)).

| Module | Folder |
| --- | --- |
| Shell | `src/app/layout.tsx`, `src/components/shell/*` |
| 1 Auth | `src/app/auth/*` (login, register, profile) |
| 2 Search | `src/app/search/*` |
| 3 Jobs | `src/app/jobs/*` (list, new, live SSE details) |
| 4 Chat | `src/app/chat/*` |

## Mock vs real

Each module has an adapter at `src/lib/api/<module>.ts` with a `mock*` and a `real*` implementation behind one interface. Set `NEXT_PUBLIC_API_MODE=real` in `.env.local` (and restart) to call the API at `NEXT_PUBLIC_API_BASE_URL`.

## Run

```bash
pnpm --filter @app/web dev        # http://localhost:7100
```
