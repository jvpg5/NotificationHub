# T-008: Seed Script (Farm, Devices, Demo Events)

| Field | Value |
|---|---|
| **Epic** | [EPIC-02 — Data & Persistence](../BOARD.md#epic-02--data--persistence) |
| **Points** | 3 |
| **Status** | todo |
| **Depends on** | T-006 |
| **Parallel-safe** | yes (vs frontend tickets) |
| **Spec** | [SPEC-004](../../../specs/SPEC-004-farm-devices.md) (FR-3..FR-5) |

## Context

Provide the demo dataset required by the assignment: the farm, its 6 devices, and (optionally) the 7 demo events. The seed must be idempotent so re-running never duplicates data.

## Scope

**In**
- `apps/backend/prisma/seed.ts` — farm `farm-001`, 6 devices per [`architecture/data-model.md`](../../../architecture/data-model.md#seed-data)
- Optional demo events flag (env `SEED_DEMO_EVENTS=true`) loading the 7 events from Instructions.md §13
- `prisma.seed` configured in backend package.json

**Out**
- Farm/Devices HTTP endpoints (T-021/T-022)

## Acceptance Criteria

- [ ] `pnpm --filter backend exec prisma db seed` creates farm + 6 devices
- [ ] Running the seed twice creates no duplicates (upsert semantics)
- [ ] With `SEED_DEMO_EVENTS=true`, the 7 events exist (rule evaluation itself lands with EPIC-04/05 — seed only persists events)

## Validation

```bash
pnpm --filter backend exec prisma db seed
pnpm --filter backend exec prisma studio  # inspect
```

## References

- [`architecture/data-model.md`](../../../architecture/data-model.md#seed-data) — exact seed rows
- `Instructions.md` §3, §13
- SPEC-004 AC-1..AC-3
