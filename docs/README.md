# Docs

Start with the **[Project Roadmap](./project-roadmap.md)**. Its *Current Status* and *Stage Map* tell you where the project is and what comes next.

## Map

| Doc | Purpose | Update when |
| --- | --- | --- |
| [project-roadmap.md](./project-roadmap.md) | Goal, status, stack, stage order, delivery workflow | A stage changes state or a stack decision is made |
| [node-fundamentals-roadmap.md](./node-fundamentals-roadmap.md) | Stage 0: runtime labs (`apps/api/labs/`) | You revisit a lab |
| [foundation.md](./foundation.md) | Stage 1: file map and fill-in order for `apps/api/src/` | A Foundation stub is implemented |
| [backend-roadmap.md](./backend-roadmap.md) | Tasks and Learning Outcomes per backend module | Work is merged |
| [architecture-roadmap.md](./architecture-roadmap.md) | Cross-cutting patterns, applied inside modules | A pattern is applied |
| [frontend-roadmap.md](./frontend-roadmap.md) | What the Next.js app implements and what's missing | Frontend changes |
| [env.md](./env.md) | Every environment variable (api + web) | `env.ts` or `.env.example` changes |
| [contracts/](./contracts) | One API contract per module (Phase A) | Before any Phase C work on that module |
| [adr/](./adr) | Architecture Decision Records and backlog | A non-trivial decision is made |
| [notes/](./notes) | Optional reference notes from labs | — |

## Conventions

- **One source of truth per fact.** The stack lives in the project roadmap, env vars in `env.md`, and routes in contracts. Other docs link to them instead of copying.
- **Checkboxes mean merged code.** `[x]` on a task means it's on `main`. `[x]` on a Learning Outcome means you can explain it without notes.
- **Module IDs are stable.** M1…M13 anchor names are referenced across files. Don't renumber them; change the order in the Stage Map instead.
