# T-022: DevicesModule

| Field | Value |
|---|---|
| **Epic** | [EPIC-06 — Farm & Devices](../BOARD.md#epic-06--farm--devices) |
| **Points** | 2 |
| **Status** | todo |
| **Depends on** | T-007, T-008 |
| **Parallel-safe** | yes (vs frontend tickets) |
| **Spec** | [SPEC-004](../../../specs/SPEC-004-farm-devices.md) (FR-2) |

## Context

Read-only endpoint listing registered devices — powers the dashboard device list and the simulator's device picker.

## Scope

**In**
- `devices/devices.controller.ts` — `GET /api/devices`
- `devices/devices.service.ts` — single query, no N+1 (NFR-1)
- `DevicesModule` registered
- Unit tests (mocked Prisma)

**Out**
- Frontend consumption (EPIC-07/08)

## Acceptance Criteria

- [ ] `GET /api/devices` returns all devices with `id`, `farmId`, `type`, `label`
- [ ] SPEC-004 AC-2 passes (6 seeded devices)

## Validation

```bash
pnpm --filter backend test devices
```

## References

- [`architecture/api.md`](../../../architecture/api.md) — GET /devices
- SPEC-004 FR-2
