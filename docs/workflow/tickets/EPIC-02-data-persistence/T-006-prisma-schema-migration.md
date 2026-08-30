# T-006: Prisma Schema + Initial Migration

| Field | Value |
|---|---|
| **Epic** | [EPIC-02 — Data & Persistence](../BOARD.md#epic-02--data--persistence) |
| **Points** | 3 |
| **Status** | todo |
| **Depends on** | T-002 |
| **Parallel-safe** | yes (vs frontend tickets) |
| **Spec** | — |

## Context

Implement the data model from [`architecture/data-model.md`](../../../architecture/data-model.md) as a Prisma schema over SQLite, with the initial migration. `Event.id` is the payload `eventId` (idempotency key) and `Notification.eventId` is unique (cardinality guarantee).

## Scope

**In**
- `apps/backend/prisma/schema.prisma` — `Farm`, `Device`, `Event`, `Notification` exactly per the data model doc (fields, indexes, relations)
- Initial migration via `prisma migrate dev`
- `DATABASE_URL` wired from `.env`

**Out**
- PrismaModule/PrismaService (T-007), seed (T-008)

## Acceptance Criteria

- [ ] `pnpm --filter backend exec prisma migrate dev` creates the migration and `dev.db`
- [ ] Schema matches the ERD: unique `Notification.eventId`, indexes on `Event(farmId, deviceId, type)` and `Notification(farmId, status, createdAt)`
- [ ] `Event.value` nullable + `textValue` for equipment status; `Notification.failureReason`/`sentAt` nullable

## Validation

```bash
pnpm --filter backend exec prisma migrate dev --name init
pnpm --filter backend exec prisma validate
```

## References

- [`architecture/data-model.md`](../../../architecture/data-model.md) — ERD and decisions
- `.tmp/external-context/prisma/` — SQLite setup, schema design, migrations
