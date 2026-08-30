# T-030: Test Hardening (Edge Cases + Components)

| Field | Value |
|---|---|
| **Epic** | [EPIC-09 — Quality & Coverage](../BOARD.md#epic-09--quality--coverage) |
| **Points** | 5 |
| **Status** | todo |
| **Depends on** | T-029 |
| **Parallel-safe** | no |
| **Spec** | all (cross-cutting) |

## Context

Close the gaps the coverage report exposes and add the scenarios the assignment calls out: component-level frontend tests, remaining edge cases, and a final review that every scenario in [`business/scenarios.md`](../../../business/scenarios.md) is automated.

## Scope

**In**
- Scenario-to-test traceability check: every S1–S18 scenario mapped to at least one automated test; add the missing ones
- Frontend component tests for remaining components (states, interactions)
- Edge cases: empty DB, full pagination, combined filters, provider throw mid-pipeline
- Update coverage thresholds to the achieved levels

**Out**
- New features

## Acceptance Criteria

- [ ] Traceability table (scenario → test file) documented in the PR
- [ ] All scenarios S1–S18 automated
- [ ] Coverage meets or exceeds the thresholds set in T-029
- [ ] `pnpm test` + `pnpm test:coverage` green

## Validation

```bash
pnpm test && pnpm test:coverage
```

## References

- [`business/scenarios.md`](../../../business/scenarios.md) — the full scenario list
- `Instructions.md` §14 — evaluation criteria
