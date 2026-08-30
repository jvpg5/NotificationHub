# T-021: FarmModule

| Field | Value |
|---|---|
| **Epic** | [EPIC-06 — Farm & Devices](../BOARD.md#epic-06--farm--devices) |
| **Points** | 2 |
| **Status** | todo |
| **Depends on** | T-007, T-008 |
| **Parallel-safe** | yes (vs frontend tickets) |
| **Spec** | [SPEC-004](../../../specs/SPEC-004-farm-devices.md) (FR-1) |

## Context

Read-only endpoint exposing the seeded farm information for the dashboard and simulator.

## Scope

**In**
- `farm/farm.controller.ts` — `GET /api/farm`
- `farm/farm.service.ts` — single query returning `id`, `name`, `producer`, `phone`
- `FarmModule` registered
- Unit tests (mocked Prisma)

**Out**
- Devices endpoint (T-022), seed changes (T-008)

## Acceptance Criteria

- [ ] `GET /api/farm` returns the seeded farm per [`architecture/api.md`](../../../architecture/api.md)
- [ ] SPEC-004 AC-1 passes

## Validation

```bash
pnpm --filter backend test farm
```

## References

- [`architecture/api.md`](../../../architecture/api.md) — GET /farm
- SPEC-004 FR-1
