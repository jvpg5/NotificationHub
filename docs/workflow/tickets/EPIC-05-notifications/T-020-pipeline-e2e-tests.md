# T-020: Pipeline e2e Tests

| Field | Value |
|---|---|
| **Epic** | [EPIC-05 — Notifications](../BOARD.md#epic-05--notifications) |
| **Points** | 3 |
| **Status** | todo |
| **Depends on** | T-018, T-019 |
| **Parallel-safe** | yes (vs frontend tickets) |
| **Spec** | [SPEC-002](../../../specs/SPEC-002-rules-engine.md) + [SPEC-003](../../../specs/SPEC-003-notifications.md) (all ACs) |

## Context

The primary quality gate: the full flow `POST /api/events` → rule evaluation → notification persisted → sent, through real HTTP + real (test) database. Covers all 6 alerts, the normal case, and the send-failure path.

## Scope

**In**
- `test/pipeline.e2e-spec.ts`:
  - S2–S7: each demo alert → 201, one notification with exact rule/severity/message, status `SENT`
  - S1: normal reading → 201, zero notifications
  - S8: boundary values → no notifications
  - S17: failing provider (test override) → notification `FAILED` + `failureReason`
  - S16: duplicate → no second notification
- Test provider override mechanism (DI swap in the e2e module)

**Out**
- Coverage tooling/CI (T-029)

## Acceptance Criteria

- [ ] All scenarios above pass through real HTTP + DB
- [ ] The 6 demo alerts produce exactly 6 `SENT` notifications with the exact messages from the business rules
- [ ] Failure injection produces `FAILED` without breaking the request flow

## Validation

```bash
pnpm --filter backend test:e2e
```

## References

- [`business/scenarios.md`](../../../business/scenarios.md) — S1–S8, S16, S17
- [`architecture/event-pipeline.md`](../../../architecture/event-pipeline.md) — full sequence
