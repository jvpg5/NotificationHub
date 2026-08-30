# T-017: NotificationProvider + MockWhatsAppProvider

| Field | Value |
|---|---|
| **Epic** | [EPIC-05 — Notifications](../BOARD.md#epic-05--notifications) |
| **Points** | 2 |
| **Status** | todo |
| **Depends on** | T-004 |
| **Parallel-safe** | yes (vs frontend tickets) |
| **Spec** | [SPEC-003](../../../specs/SPEC-003-notifications.md) (FR-8, NFR-1) |

## Context

The sending abstraction: `NotificationProvider` interface with a DI token, plus the MVP mock implementation that simulates successful WhatsApp delivery (logs the message and returns success).

## Scope

**In**
- `notification-providers/interfaces/notification-provider.interface.ts` — `send(notification): Promise<SendResult>`; `SendResult { ok: boolean; error?: string }`
- `notification-providers/providers/mock-whatsapp.provider.ts` — logs recipient + message, returns success
- `NotificationProvidersModule` exporting the provider under a DI token
- Unit tests: mock returns ok; a configurable failing fake exists for later tests

**Out**
- NotificationsService (T-018)

## Acceptance Criteria

- [ ] Provider injectable via token (NFR-1 — swapping requires no service changes)
- [ ] Mock logs recipient (`+5535999999999`) and message, returns `{ ok: true }`
- [ ] Unit tests pass

## Validation

```bash
pnpm --filter backend test notification-providers
```

## References

- [`architecture/technical-decisions.md`](../../../architecture/technical-decisions.md) — AD-06
- `Instructions.md` §9
