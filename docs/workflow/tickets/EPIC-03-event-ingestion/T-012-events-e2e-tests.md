# T-012: Events e2e Tests

| Field | Value |
|---|---|
| **Epic** | [EPIC-03 — Event Ingestion](../BOARD.md#epic-03--event-ingestion) |
| **Points** | 2 |
| **Status** | todo |
| **Depends on** | T-011 |
| **Parallel-safe** | yes (vs frontend tickets) |
| **Spec** | [SPEC-001](../../../specs/SPEC-001-event-ingestion.md) (all ACs) |

## Context

Supertest-based e2e covering the ingestion surface end-to-end (HTTP → validation → guard → persistence), with a fresh SQLite test database per run.

## Scope

**In**
- `test/events.e2e-spec.ts` — AC-1..AC-6 from SPEC-001: valid sensor event, valid equipment event, all invalid variants (S9–S15), duplicate flow (S16), list/filter/pagination, 404
- Test DB setup/teardown (migrate + seed minimal fixtures)

**Out**
- Pipeline e2e with notifications (T-020)

## Acceptance Criteria

- [ ] All SPEC-001 acceptance criteria exercised through real HTTP calls
- [ ] Tests are isolated (no shared state between specs)
- [ ] `pnpm --filter backend test:e2e` passes

## Validation

```bash
pnpm --filter backend test:e2e
```

## References

- [`specs/SPEC-001-event-ingestion.md`](../../../specs/SPEC-001-event-ingestion.md) — ACs
- [`business/scenarios.md`](../../../business/scenarios.md) — S9–S16
- `.tmp/external-context/nestjs/testing-setup.md`, `.tmp/external-context/prisma/testing.md`
