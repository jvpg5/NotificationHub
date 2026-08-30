# SPEC-NNN: {Title}

> Copy this template to `SPEC-NNN-{kebab-case-title}.md`. Number sequentially. Keep requirements testable — if you can't write a test for it, it's not a requirement.

| Field | Value |
|---|---|
| **ID** | SPEC-NNN |
| **Status** | draft \| active \| implemented |
| **Epics** | EPIC-NN (see [`../workflow/tickets/BOARD.md`](../workflow/tickets/BOARD.md)) |
| **Source** | Instructions.md §X; business-rules.md §Y |

## Overview

{1–2 paragraphs: what this capability does, for whom, and why it exists.}

## User Stories

- As a `{role}`, I want `{capability}`, so that `{benefit}`.

## Functional Requirements

Use RFC 2119 keywords. Each FR must be independently testable.

- **FR-1**: The system MUST ...
- **FR-2**: The system MUST ...
- **FR-3**: The system SHOULD ...

## Non-Functional Requirements

- **NFR-1**: Performance / reliability / usability constraints (e.g. "p95 response time < 200ms").

## Acceptance Criteria

Given/When/Then format. These become tests.

- [ ] **AC-1**: Given ..., when ..., then ...
- [ ] **AC-2**: Given ..., when ..., then ...

## Out of Scope

- {Explicitly excluded items — prevents scope creep.}

## Open Questions

- {Unresolved decisions. If any exist, status stays `draft`.}

## References

- [`../business/business-rules.md`](../business/business-rules.md) — §...
- [`../architecture/api.md`](../architecture/api.md) — ...
- Scenarios: S... in [`../business/scenarios.md`](../business/scenarios.md)
