# T-015: Equipment Status Rule

| Field | Value |
|---|---|
| **Epic** | [EPIC-04 — Rules Engine](../BOARD.md#epic-04--rules-engine) |
| **Points** | 2 |
| **Status** | todo |
| **Depends on** | T-013 |
| **Parallel-safe** | yes (vs frontend tickets) |
| **Spec** | [SPEC-002](../../../specs/SPEC-002-rules-engine.md) (FR-2, FR-3) |

## Context

The only non-threshold rule: `EQUIPMENT_FAILURE` triggers on `value = FAILURE` (string equality) with severity `CRITICAL`. `OK` and `MAINTENANCE` never trigger.

## Scope

**In**
- `rules/rules/equipment-status.rule.ts`
- Unit tests: `FAILURE` triggers (CRITICAL + message), `OK`/`MAINTENANCE` don't, message matches template

**Out**
- Listener wiring (T-016)

## Acceptance Criteria

- [ ] `FAILURE` → triggered with severity `CRITICAL` and the exact message from the rules table
- [ ] `OK` and `MAINTENANCE` → not triggered
- [ ] Scenario S7 passes at the rule level

## Validation

```bash
pnpm --filter backend test rules
```

## References

- [`business/business-rules.md`](../../../business/business-rules.md) §3 (EQUIPMENT_FAILURE row), §4
- Scenario S7
