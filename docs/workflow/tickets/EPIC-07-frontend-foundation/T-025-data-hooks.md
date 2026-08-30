# T-025: Data Hooks (useEvents, useNotifications)

| Field | Value |
|---|---|
| **Epic** | [EPIC-07 — Frontend Foundation](../BOARD.md#epic-07--frontend-foundation) |
| **Points** | 3 |
| **Status** | todo |
| **Depends on** | T-024 |
| **Parallel-safe** | no (integration: backend + frontend) |
| **Spec** | — |

## Context

The data layer for pages: TanStack Query hooks wrapping the API service with caching, loading/error states, and the 5s polling refresh the dashboard requires (SPEC-005 FR-5).

## Scope

**In**
- `hooks/useEvents.ts` — paginated list with type filter
- `hooks/useNotifications.ts` — paginated list with status/severity filters
- `hooks/useFarm.ts`, `hooks/useDevices.ts` — reference data
- `useCreateEvent` mutation (for the simulator)
- Query client setup (stale time, refetch interval)
- Hook tests with mocked api service

**Out**
- Page UIs (EPIC-08)

## Acceptance Criteria

- [ ] Hooks expose `{ data, isLoading, isError, error }` consistently
- [ ] Polling interval (5s) configurable per hook
- [ ] Mutation invalidates event/notification queries on success
- [ ] Hook tests pass

## Validation

```bash
pnpm --filter frontend test
```

## References

- [`specs/SPEC-005-dashboard.md`](../../../specs/SPEC-005-dashboard.md) — FR-5 (auto-refresh)
- `.claude/skills/vite-react-best-practices/SKILL.md`
