# T-028: History Page

| Field | Value |
|---|---|
| **Epic** | [EPIC-08 — Frontend Pages](../BOARD.md#epic-08--frontend-pages) |
| **Points** | 3 |
| **Status** | todo |
| **Depends on** | T-025 |
| **Parallel-safe** | yes (vs T-026/T-027) |
| **Spec** | [SPEC-007](../../../specs/SPEC-007-history.md) |

## Context

The audit trail: a filterable, paginated table relating every event to its rule evaluation, notification, send attempt, and result.

## Scope

**In**
- `routes/History.tsx` — table: event id, device, type, value, timestamp, and (when present) rule, severity, message, status, sentAt/failureReason; explicit "no alert" for events without notifications
- Filters: event type, severity, status (server-side via hooks)
- Pagination controls (page size 20+), filters preserved across pages
- Component tests (rendering, filters, pagination, outcome column)

**Out**
- Date-range filter, CSV export (out of scope per SPEC-007)

## Acceptance Criteria

- [ ] SPEC-007 AC-1..AC-4 pass
- [ ] Demo dataset renders the full chain for the 6 alerts + "no alert" for the normal event

## Validation

```bash
pnpm --filter frontend test
pnpm dev  # manual check with demo data
```

## References

- [`specs/SPEC-007-history.md`](../../../specs/SPEC-007-history.md) — FR-1..FR-5
- `Instructions.md` §10
- `padrao-dashboard` skill — table conventions
