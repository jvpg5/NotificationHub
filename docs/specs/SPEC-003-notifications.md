# SPEC-003: Notifications

| Field | Value |
|---|---|
| **ID** | SPEC-003 |
| **Status** | active |
| **Epics** | EPIC-05 (Notifications) |
| **Source** | Instructions.md §9, §10; business-rules.md §8 |

## Overview

The notifications capability owns the notification lifecycle: persisting generated notifications, sending them through the configured provider, recording the send result (`SENT`/`FAILED`), and exposing query endpoints. Sending is abstracted behind `NotificationProvider` so a real messaging service can replace the mock without touching business logic.

## User Stories

- As a **producer**, I want every alert delivered (or its failure recorded), so that nothing is silently lost.
- As a **developer**, I want sending behind an interface, so that a real WhatsApp provider can be added later.
- As a **dashboard user**, I want to browse notifications with their status, so that I can verify delivery.

## Functional Requirements

- **FR-1**: On `notification.generated`, the system MUST persist a `Notification` with status `PENDING`.
- **FR-2**: The system MUST attempt delivery via the injected `NotificationProvider`.
- **FR-3**: On provider success, status MUST become `SENT` with `sentAt` set.
- **FR-4**: On provider failure, status MUST become `FAILED` with `failureReason` set; the notification record MUST be kept.
- **FR-5**: After the send attempt, the system MUST emit `notification.sent` with the final notification.
- **FR-6**: The system MUST expose `GET /api/notifications` with `limit`/`offset` and optional `status`/`severity` filters, ordered by `createdAt` descending.
- **FR-7**: The system MUST expose `GET /api/notifications/:id`, returning `404` for unknown ids.
- **FR-8**: `MockWhatsAppProvider` MUST simulate successful delivery (log + success result) for the MVP.
- **FR-9**: A provider failure MUST NOT affect the HTTP response of the originating `POST /api/events` (already answered) nor crash the process.

## Non-Functional Requirements

- **NFR-1**: Provider selection via DI token — swapping providers requires zero changes to `NotificationsService`.
- **NFR-2**: Send attempts are idempotent per notification (one attempt per generated notification in the MVP).

## Acceptance Criteria

- [ ] **AC-1**: Given a triggered rule, when the notification is processed, then a `Notification` row exists with the rule, severity, message, and final status `SENT` + `sentAt`.
- [ ] **AC-2**: Given a provider that fails, when the notification is processed, then status is `FAILED` with a non-empty `failureReason`, and the event remains processed.
- [ ] **AC-3**: Given notifications in mixed statuses, when `GET /api/notifications?status=FAILED`, then only failed ones, newest first, with correct `total`.
- [ ] **AC-4**: Given an unknown id, when `GET /api/notifications/:id`, then `404`.
- [ ] **AC-5**: Given the full pipeline (S2–S7), when all 6 demo alerts are posted, then 6 notifications exist, all `SENT`.

## Out of Scope

- Retry policies / scheduled re-sends.
- Real WhatsApp Business integration (extension beyond MVP).
- Read receipts / delivery confirmation from the recipient.

## Open Questions

- None.

## References

- [`../business/business-rules.md`](../business/business-rules.md) — §8 (delivery)
- [`../architecture/api.md`](../architecture/api.md) — notification endpoints and body
- [`../architecture/event-pipeline.md`](../architecture/event-pipeline.md) — lifecycle position
- Scenarios: S2–S7, S17 in [`../business/scenarios.md`](../business/scenarios.md)
