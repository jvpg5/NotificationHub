# T-013: Rule Interface + RulesRegistry

| Field | Value |
|---|---|
| **Epic** | [EPIC-04 — Rules Engine](../BOARD.md#epic-04--rules-engine) |
| **Points** | 2 |
| **Status** | todo |
| **Depends on** | T-004 |
| **Parallel-safe** | yes (vs frontend tickets) |
| **Spec** | [SPEC-002](../../../specs/SPEC-002-rules-engine.md) (FR-8) |

## Context

The extensibility backbone of the rules engine: a `Rule` interface and a registry the evaluation service iterates. Adding a rule later = new class + registry entry, zero engine changes (NFR-2).

## Scope

**In**
- `rules/interfaces/rule.interface.ts` — `Rule { id, eventType, evaluate(event): RuleResult }`; `RuleResult { triggered, notification? }`
- `rules/rules.registry.ts` — injectable registry (token-based registration)
- Unit tests: registration, lookup by event type, unknown type returns no rules

**Out**
- Concrete rules (T-014, T-015), listener (T-016)

## Acceptance Criteria

- [ ] A rule can be registered and retrieved by event type
- [ ] Registry returns empty for types with no rules (no throw)
- [ ] Interface types live in/align with `shared-types`

## Validation

```bash
pnpm --filter backend test rules
```

## References

- [`specs/SPEC-002-rules-engine.md`](../../../specs/SPEC-002-rules-engine.md) — FR-8, NFR-2
- [`architecture/overview.md`](../../../architecture/overview.md) — module responsibilities
