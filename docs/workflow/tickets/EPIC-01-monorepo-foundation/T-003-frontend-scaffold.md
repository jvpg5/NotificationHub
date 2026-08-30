# T-003: Frontend Scaffold (Vite + React)

| Field | Value |
|---|---|
| **Epic** | [EPIC-01 — Monorepo Foundation](../BOARD.md#epic-01--monorepo-foundation) |
| **Points** | 3 |
| **Status** | todo |
| **Depends on** | T-001 |
| **Parallel-safe** | yes (disjoint from T-002/T-004) |
| **Spec** | — |

## Context

Scaffold the Vite + React SPA in `apps/frontend` with the dev proxy to the backend already configured, so all later frontend work talks to `/api` transparently.

## Scope

**In**
- `apps/frontend` Vite ^6 + React ^19 project (TypeScript)
- `vite.config.ts`: dev server on :5173 with proxy `/api` → `http://localhost:3001`
- React Router installed (routes wired in T-023)
- Vitest + React Testing Library configured
- Placeholder `App.tsx` rendering "NotificationHub"

**Out**
- Layout/routes (T-023), API service (T-024), pages (EPIC-08)

## Acceptance Criteria

- [ ] `pnpm --filter frontend dev` starts on :5173
- [ ] With the backend running, a fetch to `/api/health` from the app succeeds (proxy works)
- [ ] `pnpm --filter frontend test` passes
- [ ] `pnpm --filter frontend build` succeeds

## Validation

```bash
pnpm --filter frontend dev &
pnpm --filter frontend test && pnpm --filter frontend build
```

## References

- [`architecture/overview.md`](../../../architecture/overview.md) — proxy, ports
- `.claude/skills/vite-react-best-practices/SKILL.md`
- `.tmp/external-context/vite-react/` — scaffolding, proxy, testing
