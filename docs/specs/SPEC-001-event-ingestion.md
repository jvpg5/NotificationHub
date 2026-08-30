# SPEC-001: Event Ingestion

| Field | Value |
|---|---|
| **ID** | SPEC-001 |
| **Status** | active |
| **Epics** | EPIC-03 (Event Ingestion), EPIC-02 (persistence prerequisites) |
| **Source** | Instructions.md §4, §5, §11, §12; business-rules.md §1, §2, §7 |

## Overview

Event ingestion is the system's entry point: it receives sensor/device readings via `POST /api/events`, validates them against the business rules, guarantees idempotency, persists valid events, and kicks off the notification pipeline by emitting `event.received`. It also exposes read endpoints for events.

## User Stories

- As a **device/simulator**, I want to submit readings via API, so that the farm can be monitored.
- As a **producer**, I want invalid readings rejected with clear errors, so that the history only contains trustworthy data.
- As a **system operator**, I want duplicate retransmissions ignored, so that the producer never receives repeated notifications.
- As a **dashboard user**, I want to browse received events, so that I can see what the farm reported.

## Functional Requirements

- **FR-1**: The system MUST expose `POST /api/events` accepting the event payload defined in [`../architecture/api.md`](../architecture/api.md).
- **FR-2**: The system MUST validate every field per [`../business/business-rules.md` §2](../business/business-rules.md#2-input-validation-rules) (V1–V8), including per-type value ranges, unit consistency, and equipment status enum.
- **FR-3**: Invalid events MUST be rejected with `400` and per-field error messages, and MUST NOT be persisted.
- **FR-4**: Events referencing an unknown farm, or a device that does not belong to the given farm, MUST be rejected with `400`.
- **FR-5**: If `eventId` already exists, the system MUST respond `200` with the stored event plus `duplicate: true`, and MUST NOT persist anything new or emit any pipeline event.
- **FR-6**: Valid, non-duplicate events MUST be persisted and answered with `201` and the stored event body.
- **FR-7**: After persisting, the system MUST emit the internal event `event.received` with the persisted event.
- **FR-8**: The system MUST expose `GET /api/events` with `limit`/`offset` pagination and optional `type` filter, ordered by `timestamp` descending.
- **FR-9**: The system MUST expose `GET /api/events/:id`, returning `404` for unknown ids.

## Non-Functional Requirements

- **NFR-1**: Validation errors list ALL failing fields in one response (not first-failure-only).
- **NFR-2**: The ingestion path performs at most one DB read (idempotency check) and one DB write per request.

## Acceptance Criteria

- [ ] **AC-1**: Given a valid sensor event, when posted, then `201` + persisted + `event.received` emitted.
- [ ] **AC-2**: Given a valid `EQUIPMENT_STATUS` event with `value: "FAILURE"`, when posted, then `201` (string values accepted).
- [ ] **AC-3**: Given each invalid variant S9–S15 (see [`../business/scenarios.md`](../business/scenarios.md)), when posted, then `400` with field-level errors and nothing persisted.
- [ ] **AC-4**: Given a previously processed `eventId`, when re-posted, then `200` + `duplicate: true` and no second notification ever appears.
- [ ] **AC-5**: Given multiple stored events, when `GET /api/events?type=AIR_TEMPERATURE&limit=10&offset=0`, then only matching events, newest first, with correct `total`.
- [ ] **AC-6**: Given an unknown event id, when `GET /api/events/:id`, then `404`.

## Out of Scope

- Authentication/authorization (open MVP API).
- Batch event submission.
- Real IoT protocols (HTTP only).

## Open Questions

- None.

## References

- [`../business/business-rules.md`](../business/business-rules.md) — §1 (types/ranges), §2 (validation), §7 (idempotency)
- [`../architecture/api.md`](../architecture/api.md) — endpoints and payloads
- [`../architecture/event-pipeline.md`](../architecture/event-pipeline.md) — pipeline position
- Scenarios: S1, S9–S16 in [`../business/scenarios.md`](../business/scenarios.md)
