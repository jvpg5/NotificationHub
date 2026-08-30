# T-029: Coverage Report + CI Workflow

| Field | Value |
|---|---|
| **Epic** | [EPIC-09 — Quality & Coverage](../BOARD.md#epic-09--quality--coverage) |
| **Points** | 3 |
| **Status** | todo |
| **Depends on** | T-012, T-020 |
| **Parallel-safe** | no |
| **Spec** | all (cross-cutting) |

## Context

Make quality reproducible: coverage reports for both apps and a GitHub Actions CI workflow running lint + typecheck + tests on every PR (including each layer of a stack — see [`../pr-stacking.md`](../../pr-stacking.md#ci-notes)).

## Scope

**In**
- Jest coverage config (backend) + Vitest coverage (frontend); `pnpm test:coverage` root script
- `.github/workflows/ci.yml` — on `pull_request` (targeting any branch): install, lint, typecheck, test, coverage summary
- Coverage thresholds (initial: backend 80%, frontend 60% — adjust to reality, never lower without discussion)

**Out**
- Additional tests (T-030)

## Acceptance Criteria

- [ ] `pnpm test:coverage` produces reports for both apps
- [ ] CI runs green on a sample PR (including a stacked PR layer)
- [ ] Coverage summary visible in the CI logs

## Validation

```bash
pnpm test:coverage
```

## References

- `Instructions.md` §14 — coverage requirements
- [`../pr-stacking.md`](../../pr-stacking.md) — CI notes for stacks
