# SPEC-002: Rules Engine

| Field | Value |
|---|---|
| **ID** | SPEC-002 |
| **Status** | active |
| **Epics** | EPIC-04 (Rules Engine) |
| **Source** | Instructions.md §6, §7; business-rules.md §3, §4, §5, §6 |

## Overview

The rules engine evaluates every received event against the notification rules defined in the business documentation. When a rule triggers, it builds the notification payload (rule ID, severity, rendered message) and emits `notification.generated`. When no rule triggers, the event simply remains in history.

## User Stories

- As a **producer**, I want dangerous conditions turned into clear alert messages, so that I can act quickly.
- As a **developer**, I want rules registered in a registry, so that adding a new rule never touches the evaluation engine.
- As a **system operator**, I want normal readings to stay silent, so that alerts remain meaningful.

## Functional Requirements

- **FR-1**: The system MUST evaluate every `event.received` against the rule registered for that event's type.
- **FR-2**: The 6 rules MUST implement exactly the conditions, severities, and message templates in [`../business/business-rules.md` §3](../business/business-rules.md#3-notification-rules).
- **FR-3**: Threshold comparisons MUST be strict (boundary values do not trigger — §4).
- **FR-4**: When a rule triggers, the system MUST emit `notification.generated` containing: `eventId`, `farmId`, `deviceId`, `eventType`, `eventValue`, `ruleTriggered`, `severity`, and the rendered `message`.
- **FR-5**: Message rendering MUST use the templates with `{value}` (dot decimal separator), `{deviceId}`, and `{farmName}` placeholders.
- **FR-6**: When no rule triggers (or the value is at the boundary), the system MUST NOT emit `notification.generated`.
- **FR-7**: At most one notification MUST be generated per event.
- **FR-8**: Rules MUST be registered in a `RulesRegistry` and implement a common `Rule` interface (`evaluate(event): RuleResult`); the evaluation service MUST iterate the registry, not hardcode rules.
- **FR-9**: An exception during rule evaluation MUST NOT crash the pipeline; it MUST be logged and the event remains processed.

## Non-Functional Requirements

- **NFR-1**: Rules are pure functions of the event — no I/O, no side effects (testable in isolation).
- **NFR-2**: Adding a new rule = new class + registry entry; no changes to `RulesService`.

## Acceptance Criteria

- [ ] **AC-1**: Given each alert scenario S2–S7, when the event is received, then `notification.generated` is emitted with the exact rule, severity, and message from the business rules.
- [ ] **AC-2**: Given boundary values (35.0, 30.0, 20.0, 15.0, 15.0, `OK`, `MAINTENANCE`), when evaluated, then no notification is generated.
- [ ] **AC-3**: Given a normal reading (S1), when evaluated, then no notification is generated.
- [ ] **AC-4**: Given an event of a type with no registered rule, when evaluated, then nothing happens (no error).
- [ ] **AC-5**: Given a rule that throws, when evaluated, then the error is logged and other rules/requests continue working.

## Out of Scope

- User-configurable thresholds (rules are code + docs, not data, in the MVP).
- Multi-rule matching per event type (cardinality is 1:1 by design).

## Open Questions

- None.

## References

- [`../business/business-rules.md`](../business/business-rules.md) — §3 (rules table), §4 (boundaries), §5 (normal events), §6 (cardinality)
- Scenarios: S1–S8 in [`../business/scenarios.md`](../business/scenarios.md)
