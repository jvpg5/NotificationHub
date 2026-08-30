# T-019: NotificationsController

| Field | Value |
|---|---|
| **Epic** | [EPIC-05 — Notifications](../BOARD.md#epic-05--notifications) |
| **Points** | 2 |
| **Status** | todo |
| **Depends on** | T-018 |
| **Parallel-safe** | yes (vs frontend tickets) |
| **Spec** | [SPEC-003](../../../specs/SPEC-003-notifications.md) (FR-6, FR-7) |

## Context

Read endpoints for notifications: paginated list with `status`/`severity` filters and single-record lookup, per the API contract.

## Scope

**In**
- `notifications/notifications.controller.ts` — `GET /api/notifications` (limit/offset/status/severity), `GET /api/notifications/:id` (404)
- Response `{ data, total }`, ordered by `createdAt` desc, body per [`architecture/api.md`](../../../architecture/api.md)
- Unit tests: filters, ordering, pagination, 404

**Out**
- Frontend consumption (EPIC-07/08)

## Acceptance Criteria

- [ ] Filters `status` and `severity` work independently and combined
- [ ] Ordering: newest first; `total` reflects the filtered count
- [ ] Unknown id → 404 with the standard error body

## Validation

```bash
pnpm --filter backend test notifications
```

## References

- [`architecture/api.md`](../../../architecture/api.md) — GET /notifications
- SPEC-003 AC-3, AC-4
