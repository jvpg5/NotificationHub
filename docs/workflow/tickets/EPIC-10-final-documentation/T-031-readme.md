# T-031: README.md (Run/Test Instructions)

| Field | Value |
|---|---|
| **Epic** | [EPIC-10 — Final Documentation](../BOARD.md#epic-10--final-documentation) |
| **Points** | 2 |
| **Status** | todo |
| **Depends on** | T-028 |
| **Parallel-safe** | no |
| **Spec** | — |

## Context

The project's front door: how to install, run, seed, demo, and test the application — the deliverable checklist from `Instructions.md` §17.

## Scope

**In**
- Root `README.md`: project overview, architecture summary (link to `docs/`), prerequisites, setup (`pnpm install`, env, migrate, seed), running (`pnpm dev`), demo script (7 preset events), testing (`pnpm test`, `pnpm test:coverage`), project structure pointer
- Keep it lean — details live in `docs/`

**Out**
- DEVELOPMENT_LOG.md finalization (T-032)

## Acceptance Criteria

- [ ] A fresh clone + README instructions = running app with seeded data
- [ ] Test execution and coverage instructions are reproducible
- [ ] Links to `docs/` for architecture and business rules

## Validation

```bash
# simulate fresh setup in a clean clone
git clone <repo> /tmp/opencode/nh-check && cd /tmp/opencode/nh-check
# follow README literally
```

## References

- `Instructions.md` §17 — delivery checklist
- [`docs/README.md`](../../../README.md)
