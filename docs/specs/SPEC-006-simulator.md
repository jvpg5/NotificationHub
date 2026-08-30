# SPEC-006: Simulator

| Field | Value |
|---|---|
| **ID** | SPEC-006 |
| **Status** | active |
| **Epics** | EPIC-08 (Frontend Pages) |
| **Source** | Instructions.md §8, §13 |

## Overview

The simulator (`/simulator`) lets a user compose and submit sensor/device events through the UI — the primary way to demonstrate the pipeline without real IoT hardware. It provides quick presets for the 7 demo events and clear feedback distinguishing the possible outcomes.

## User Stories

- As a **demo presenter**, I want one-click demo events, so that I can trigger each alert type instantly.
- As a **tester**, I want to craft arbitrary events, so that I can exercise validation and boundaries.
- As a **user**, I want clear feedback on what happened, so that I know whether an alert was generated.

## Functional Requirements

- **FR-1**: The form MUST include: device selector (from `GET /api/devices`), value input, and timestamp (defaulting to now, editable).
- **FR-2**: The event `type` and `unit` MUST be derived from the selected device; `eventId` MUST be auto-generated (e.g. `event-<uuid>`) with an editable override.
- **FR-3**: For `EQUIPMENT_STATUS` devices, the value input MUST be a select (`OK` | `FAILURE` | `MAINTENANCE`); for sensors, a numeric input.
- **FR-4**: Submitting MUST call `POST /api/events` and show one of four outcomes: **alert generated** (with the notification message), **no alert** (normal reading), **duplicate**, or **invalid** (with field errors).
- **FR-5**: The form MUST provide presets for the 7 demo events from Instructions.md §13.
- **FR-6**: Client-side validation MUST mirror the server rules (ranges, units) and server errors MUST be displayed per field.
- **FR-7**: After a successful submission, the form MUST remain usable for the next event (no full reload).

## Non-Functional Requirements

- **NFR-1**: Submit button disabled while a request is in flight; no double submission.
- **NFR-2**: Presets fill the form without submitting (user reviews, then submits).

## Acceptance Criteria

- [ ] **AC-1**: Given the preset "Temperature 38.5°C", when submitted, then feedback shows the generated alert with its message.
- [ ] **AC-2**: Given the preset "Temperature 27°C" (normal), when submitted, then feedback shows "no alert generated".
- [ ] **AC-3**: Given a manually entered out-of-range value (e.g. humidity 130), when submitted, then the server error is displayed per field and nothing is persisted.
- [ ] **AC-4**: Given an `EQUIPMENT_STATUS` device selected, then the value input is a status select, not a number.
- [ ] **AC-5**: Given a duplicate `eventId` resubmission, then the duplicate feedback is shown.

## Out of Scope

- Batch/multi-event simulation scripts.
- Scheduled/automated simulation loops.

## Open Questions

- None.

## References

- [`../architecture/api.md`](../architecture/api.md) — POST /events contract
- [`../business/business-rules.md`](../business/business-rules.md) — validation ranges
- Scenarios: S1–S16 in [`../business/scenarios.md`](../business/scenarios.md)
