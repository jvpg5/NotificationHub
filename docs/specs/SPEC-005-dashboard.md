# SPEC-005: Dashboard

| Field | Value |
|---|---|
| **ID** | SPEC-005 |
| **Status** | active |
| **Epics** | EPIC-08 (Frontend Pages) |
| **Source** | Instructions.md §8; UI/UX per `padrao-dashboard` skill |

## Overview

The dashboard is the landing page (`/`): a live overview of the farm — farm info, devices, latest events, and latest notifications with severity and delivery status. It auto-refreshes so the producer (and demo audiences) see the system working in real time.

## User Stories

- As a **producer**, I want a live overview of my farm, so that I spot problems at a glance.
- As a **demo presenter**, I want notifications appearing automatically, so that I can show the pipeline working without refreshing.

## Functional Requirements

- **FR-1**: The dashboard MUST display farm information (name, producer, phone) from `GET /api/farm`.
- **FR-2**: The dashboard MUST display the device list (label + type) from `GET /api/devices`.
- **FR-3**: The dashboard MUST display the latest events (device, type, value + unit, timestamp) from `GET /api/events`.
- **FR-4**: The dashboard MUST display the latest notifications (message, severity badge, status badge, `createdAt`/`sentAt`) from `GET /api/notifications`.
- **FR-5**: Data MUST auto-refresh via polling (5s interval) without full page reloads.
- **FR-6**: Each view MUST handle loading, empty, and error states.
- **FR-7**: The layout MUST be responsive (desktop-first, usable on tablet).

## Non-Functional Requirements

- **NFR-1**: Follows the `padrao-dashboard` skill (typography, spacing, chart/component choices).
- **NFR-2**: No layout shift on refresh (stable skeletons/placeholders).

## Acceptance Criteria

- [ ] **AC-1**: Given seeded data, when opening `/`, then farm info, 6 devices, latest events, and latest notifications render.
- [ ] **AC-2**: Given a new event posted while the dashboard is open, within ~5s the event (and its notification, if any) appears without manual refresh.
- [ ] **AC-3**: Given severity `CRITICAL`/`WARNING`/`INFO` notifications, each renders with a distinct, consistent badge.
- [ ] **AC-4**: Given the API is unreachable, an error state is shown (not a blank page), and it recovers automatically when the API returns.
- [ ] **AC-5**: Given an empty database, friendly empty states are shown.

## Out of Scope

- WebSocket/SSE real-time push (polling is enough for the MVP).
- Charts/analytics beyond the overview lists.
- Authentication.

## Open Questions

- None.

## References

- [`../architecture/api.md`](../architecture/api.md) — consumed endpoints
- Scenarios: S18 in [`../business/scenarios.md`](../business/scenarios.md)
