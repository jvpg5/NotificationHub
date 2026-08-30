# T-005: Root Scripts + Smoke Verification

| Field | Value |
|---|---|
| **Epic** | [EPIC-01 — Monorepo Foundation](../BOARD.md#epic-01--monorepo-foundation) |
| **Points** | 2 |
| **Status** | todo |
| **Depends on** | T-002, T-003, T-004 |
| **Parallel-safe** | no (integration) |
| **Spec** | — |

## Context

Wire the root scripts so one command runs the whole monorepo, and verify end-to-end that both apps boot and talk to each other. This is the "Fase 1 done" gate.

## Scope

**In**
- Root scripts: `dev` (backend + frontend concurrently), `dev:backend`, `dev:frontend`, `test` (all workspaces), `lint`, `typecheck`
- Lint setup (ESLint flat config, shared where practical)
- Smoke verification documented in `DEVELOPMENT_LOG.md`

**Out**
- CI (T-029), coverage (T-029)

## Acceptance Criteria

- [ ] `pnpm dev` starts backend (:3001) and frontend (:5173) together
- [ ] Frontend reaches `/api/health` through the proxy
- [ ] `pnpm test`, `pnpm lint`, `pnpm typecheck` all pass across workspaces
- [ ] PLANNING.md Fase 1 checkboxes can be honestly checked

## Validation

```bash
pnpm dev &
curl -s http://localhost:3001/api/health
pnpm test && pnpm lint && pnpm typecheck
```

## References

- [`architecture/overview.md`](../../../architecture/overview.md) — ports and layout
- [`workflow/README.md`](../../README.md) — gates
