# T-016: RulesService Listener

| Field | Value |
|---|---|
| **Epic** | [EPIC-04 — Rules Engine](../BOARD.md#epic-04--rules-engine) |
| **Points** | 3 |
| **Status** | todo |
| **Depends on** | T-014, T-015 |
| **Parallel-safe** | yes (vs frontend tickets) |
| **Spec** | [SPEC-002](../../../specs/SPEC-002-rules-engine.md) (FR-1, FR-4, FR-6, FR-7, FR-9) |

## Context

The evaluation engine: listens to `event.received`, looks up rules for the event type in the registry, evaluates, and emits `notification.generated` when a rule triggers. Exceptions are contained (FR-9).

## Scope

**In**
- `rules/rules.service.ts` — `@OnEvent('event.received')` handler: registry lookup → evaluate → build payload → emit `notification.generated`
- `RulesModule` registered; all 6 rules registered in the registry
- Unit tests with mocked emitter: trigger → payload emitted; no trigger → nothing; throwing rule → error logged, no crash; unknown type → no-op

**Out**
- Notification persistence/sending (EPIC-05)

## Acceptance Criteria

- [ ] Triggered rule → `notification.generated` emitted with `eventId`, `farmId`, `deviceId`, `eventType`, `eventValue`, `ruleTriggered`, `severity`, `message`
- [ ] No rule triggered → no emission
- [ ] Throwing rule → logged, pipeline continues (FR-9)
- [ ] At most one emission per event (FR-7)

## Validation

```bash
pnpm --filter backend test rules
```

## References

- [`architecture/event-pipeline.md`](../../../architecture/event-pipeline.md) — internal events table
- [`specs/SPEC-002-rules-engine.md`](../../../specs/SPEC-002-rules-engine.md) — FR-1..FR-9
