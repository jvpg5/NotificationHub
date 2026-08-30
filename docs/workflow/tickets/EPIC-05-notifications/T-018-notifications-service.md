# T-018: NotificationsService (Lifecycle)

| Field | Value |
|---|---|
| **Epic** | [EPIC-05 — Notifications](../BOARD.md#epic-05--notifications) |
| **Points** | 3 |
| **Status** | todo |
| **Depends on** | T-016, T-017 |
| **Parallel-safe** | yes (vs frontend tickets) |
| **Spec** | [SPEC-003](../../../specs/SPEC-003-notifications.md) (FR-1..FR-5, FR-9) |

## Context

The notification lifecycle: on `notification.generated`, persist as `PENDING`, send via the provider, update to `SENT`/`FAILED` with timestamps/reasons, and emit `notification.sent`.

## Scope

**In**
- `notifications/notifications.service.ts` — `@OnEvent('notification.generated')` handler: persist → send → update → emit `notification.sent`
- `NotificationsModule` registered
- Unit tests with mocked Prisma + provider: success path (SENT + sentAt), failure path (FAILED + failureReason), provider throw contained

**Out**
- Controller (T-019), e2e (T-020)

## Acceptance Criteria

- [ ] Generated notification persisted with status `PENDING` before send
- [ ] Provider success → `SENT` + `sentAt` set
- [ ] Provider failure → `FAILED` + `failureReason` set; record kept (FR-4)
- [ ] `notification.sent` emitted with the final notification
- [ ] Provider failure does not crash the process (FR-9)

## Validation

```bash
pnpm --filter backend test notifications
```

## References

- [`architecture/event-pipeline.md`](../../../architecture/event-pipeline.md) — steps 7–12
- [`business/business-rules.md`](../../../business/business-rules.md) §8
- Scenario S17
