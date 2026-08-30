# SPEC-007: History

| Field | Value |
|---|---|
| **ID** | SPEC-007 |
| **Status** | active |
| **Epics** | EPIC-08 (Frontend Pages) |
| **Source** | Instructions.md §10 |

## Overview

The history page (`/history`) provides the full, filterable record relating every received event to its rule evaluation, generated notification, send attempt, and result — the audit trail required by the assignment (Instructions.md §10).

## User Stories

- As a **producer**, I want to review everything that happened, so that I can trust the system.
- As an **auditor**, I want the full chain event → rule → notification → send result, so that I can verify behavior.
- As a **tester**, I want filters, so that I can find specific cases quickly.

## Functional Requirements

- **FR-1**: The history MUST list events and their related notification (if any) in one view: event id, device, type, value, timestamp, and — when a rule triggered — rule, severity, message, status, `sentAt`/`failureReason`.
- **FR-2**: The history MUST support filtering by event type, notification severity, and notification status.
- **FR-3**: The history MUST support pagination (page size ≥ 20).
- **FR-4**: Events without notifications MUST be visible (normal readings are part of history).
- **FR-5**: The view MUST make the outcome explicit: *no alert*, *sent*, or *failed (reason)*.

## Non-Functional Requirements

- **NFR-1**: Server-side pagination and filtering (no full-table client rendering).
- **NFR-2**: Follows the `padrao-dashboard` skill for table styling and interaction.

## Acceptance Criteria

- [ ] **AC-1**: Given the demo dataset, when opening `/history`, then all 7 events appear; 6 show their notification (rule, severity, message, `SENT`); 1 shows "no alert".
- [ ] **AC-2**: Given filter `severity=CRITICAL`, then only the equipment-failure row is shown.
- [ ] **AC-3**: Given a failed send (S17), then the row shows `FAILED` with the reason.
- [ ] **AC-4**: Given more events than one page, then pagination controls work and filters persist across pages.

## Out of Scope

- Date-range filtering (may be added later if time permits).
- CSV export.

## Open Questions

- None.

## References

- [`../architecture/api.md`](../architecture/api.md) — list endpoints and filters
- Scenarios: S18 in [`../business/scenarios.md`](../business/scenarios.md)
