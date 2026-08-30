# T-004: `shared-types` Package

| Field | Value |
|---|---|
| **Epic** | [EPIC-01 — Monorepo Foundation](../BOARD.md#epic-01--monorepo-foundation) |
| **Points** | 2 |
| **Status** | todo |
| **Depends on** | T-001 |
| **Parallel-safe** | yes (disjoint from T-002/T-003) |
| **Spec** | — |

## Context

Create `packages/shared-types` — the single source for the TypeScript types and enums shared by backend and frontend: event types, severity, notification status, equipment status, DTO shapes, and API response envelopes.

## Scope

**In**
- `packages/shared-types` (package.json, tsconfig, src/)
- `EventType`, `Severity`, `NotificationStatus`, `EquipmentStatus` enums
- `CreateEventDto`, `EventResponse`, `NotificationResponse`, `FarmResponse`, `DeviceResponse`, `Paginated<T>` types
- Types match [`architecture/api.md`](../../../architecture/api.md) exactly

**Out**
- Any runtime code (types/enums only)

## Acceptance Criteria

- [ ] Package builds (`tsc`) and is importable from both apps
- [ ] Enums match the business rules (6 event types; 3 severities; 3 statuses; 3 equipment states)
- [ ] `apps/backend` and `apps/frontend` both list `shared-types` as a workspace dependency

## Validation

```bash
pnpm --filter shared-types build
pnpm -r typecheck
```

## References

- [`architecture/api.md`](../../../architecture/api.md) — response shapes
- [`business/business-rules.md`](../../../business/business-rules.md) — enums and ranges
- [`architecture/technical-decisions.md`](../../../architecture/technical-decisions.md) — AD-07
