# T-014: Threshold Rules (5 Sensor Rules)

| Field | Value |
|---|---|
| **Epic** | [EPIC-04 — Rules Engine](../BOARD.md#epic-04--rules-engine) |
| **Points** | 3 |
| **Status** | todo |
| **Depends on** | T-013 |
| **Parallel-safe** | yes (vs frontend tickets) |
| **Spec** | [SPEC-002](../../../specs/SPEC-002-rules-engine.md) (FR-2, FR-3, FR-5) |

## Context

Implement the 5 numeric threshold rules exactly per [`business/business-rules.md` §3](../../../business/business-rules.md#3-notification-rules): `AIR_TEMPERATURE_HIGH`, `AIR_HUMIDITY_LOW`, `SOIL_MOISTURE_LOW`, `WATER_RESERVOIR_LOW`, `SILO_LEVEL_LOW` — strict comparisons, severities, and message templates.

## Scope

**In**
- `rules/rules/air-temperature.rule.ts`, `air-humidity.rule.ts`, `soil-moisture.rule.ts`, `water-reservoir-level.rule.ts`, `silo-level.rule.ts`
- Message rendering with `{value}` (dot decimal), `{deviceId}`, `{farmName}`
- Unit tests per rule: triggering value, boundary value (no trigger), normal value, message content

**Out**
- Equipment rule (T-015), listener wiring (T-016)

## Acceptance Criteria

- [ ] Each rule triggers exactly per its condition (strict comparison)
- [ ] Boundary values (35.0, 30.0, 20.0, 15.0, 15.0) do NOT trigger
- [ ] Rendered messages match the templates byte-for-byte for the S2–S6 inputs
- [ ] Rules are pure functions (no I/O)

## Validation

```bash
pnpm --filter backend test rules
```

## References

- [`business/business-rules.md`](../../../business/business-rules.md) §3–§4 — rules table + boundaries
- Scenarios S2–S6, S8
