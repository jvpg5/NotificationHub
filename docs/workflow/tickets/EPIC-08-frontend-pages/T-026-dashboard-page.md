# T-026: Dashboard Page

| Field | Value |
|---|---|
| **Epic** | [EPIC-08 — Frontend Pages](../BOARD.md#epic-08--frontend-pages) |
| **Points** | 5 |
| **Status** | todo |
| **Depends on** | T-025, T-021, T-022 |
| **Parallel-safe** | no (integration) |
| **Spec** | [SPEC-005](../../../specs/SPEC-005-dashboard.md) |

## Context

The landing page: live overview of the farm — farm info, device list, latest events, latest notifications with severity/status badges, auto-refreshing every 5s.

## Scope

**In**
- `routes/Dashboard.tsx` composing: `FarmInfo`, `DeviceList`, latest events list, latest notifications list
- `components/EventCard.tsx`, `NotificationCard.tsx`, `FarmInfo.tsx`, `DeviceList.tsx`
- Severity/status badges (consistent colors: CRITICAL/WARNING/INFO; SENT/FAILED/PENDING)
- Loading skeletons, empty states, error states with auto-recovery
- Component tests (rendering, states, badge mapping)

**Out**
- Simulator (T-027), History (T-028)

## Acceptance Criteria

- [ ] SPEC-005 AC-1..AC-5 pass
- [ ] New events/notifications appear within ~5s without manual refresh
- [ ] No layout shift on refresh (stable placeholders)

## Validation

```bash
pnpm --filter frontend test
pnpm dev  # manual check against seeded + demo data
```

## References

- [`specs/SPEC-005-dashboard.md`](../../../specs/SPEC-005-dashboard.md) — FR-1..FR-7
- `padrao-dashboard` skill — UI conventions
