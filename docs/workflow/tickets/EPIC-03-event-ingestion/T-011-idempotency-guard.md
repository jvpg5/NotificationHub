# T-011: IdempotencyGuard

| Field | Value |
|---|---|
| **Epic** | [EPIC-03 — Event Ingestion](../BOARD.md#epic-03--event-ingestion) |
| **Points** | 3 |
| **Status** | todo |
| **Depends on** | T-010 |
| **Parallel-safe** | yes (vs frontend tickets) |
| **Spec** | [SPEC-001](../../../specs/SPEC-001-event-ingestion.md) (FR-5) |

## Context

Guarantee that re-delivered events never reprocess: a guard checks `eventId` existence before the controller proceeds and short-circuits with `200` + stored event + `duplicate: true`.

## Scope

**In**
- `common/guards/idempotency.guard.ts` — reads body `eventId`, queries `Event.findUnique`, short-circuits duplicates
- Response shape: stored event + `"duplicate": true` (per [`architecture/api.md`](../../../architecture/api.md))
- Unit tests: first request passes through; duplicate returns 200 + flag; no `event.received` re-emission

**Out**
- Concurrency stress tests (unique PK is the backstop — documented, not load-tested)

## Acceptance Criteria

- [ ] Duplicate `eventId` → `200` with stored event + `duplicate: true`
- [ ] No second persistence, no second `event.received` emission
- [ ] Non-duplicate requests pass through untouched
- [ ] Scenario S16 passes

## Validation

```bash
pnpm --filter backend test idempotency
```

## References

- [`business/business-rules.md`](../../../business/business-rules.md) §7
- [`architecture/technical-decisions.md`](../../../architecture/technical-decisions.md) — AD-05
- Scenario S16
