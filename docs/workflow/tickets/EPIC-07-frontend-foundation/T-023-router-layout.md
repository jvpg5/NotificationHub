# T-023: React Router + Layout + Navigation

| Field | Value |
|---|---|
| **Epic** | [EPIC-07 — Frontend Foundation](../BOARD.md#epic-07--frontend-foundation) |
| **Points** | 3 |
| **Status** | todo |
| **Depends on** | T-003 |
| **Parallel-safe** | yes (vs backend tickets) |
| **Spec** | — |

## Context

The app shell: routing for the three pages (Dashboard `/`, Simulator `/simulator`, History `/history`) and the layout with sidebar navigation. Pages are placeholders at this point.

## Scope

**In**
- Router setup (React Router) with the three routes
- `components/Layout.tsx` — sidebar navigation + header, active-route indication
- Placeholder page components for the three routes
- Layout component tests (rendering + navigation)

**Out**
- Page implementations (EPIC-08), API/hooks (T-024/T-025)

## Acceptance Criteria

- [ ] Navigating between the three routes works (URL + active state)
- [ ] Layout renders on every route
- [ ] Component tests pass

## Validation

```bash
pnpm --filter frontend test
```

## References

- [`architecture/overview.md`](../../../architecture/overview.md) — frontend structure
- `.tmp/external-context/vite-react/react-router-setup.md`
- `.claude/skills/vite-react-best-practices/SKILL.md`
