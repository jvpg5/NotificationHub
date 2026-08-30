# SPEC-004: Farm & Devices

| Field | Value |
|---|---|
| **ID** | SPEC-004 |
| **Status** | active |
| **Epics** | EPIC-06 (Farm & Devices), EPIC-02 (seed) |
| **Source** | Instructions.md §3, §13; data-model.md (seed data) |

## Overview

Read-only reference data for the monitored farm and its devices. The MVP ships one seeded farm (*Fazenda Boa Esperança*) and its sensor/equipment fleet; the frontend uses these endpoints to render context and to power the simulator's device picker.

## User Stories

- As a **dashboard user**, I want to see farm information, so that I know what is being monitored.
- As a **simulator user**, I want to pick from real devices, so that my simulated events are valid.

## Functional Requirements

- **FR-1**: `GET /api/farm` MUST return the seeded farm (`id`, `name`, `producer`, `phone`).
- **FR-2**: `GET /api/devices` MUST return all registered devices with `id`, `farmId`, `type`, and `label`.
- **FR-3**: The seed MUST create farm `farm-001` (Fazenda Boa Esperança, João Silva, `+5535999999999`) and the 6 devices listed in [`../architecture/data-model.md`](../architecture/data-model.md#seed-data).
- **FR-4**: The seed MUST be idempotent — running it twice must not duplicate data.
- **FR-5**: The seed SHOULD optionally load the 7 demo events from Instructions.md §13 (6 alerts + 1 normal) for demonstrations.

## Non-Functional Requirements

- **NFR-1**: Both endpoints respond from a single DB query, no N+1.

## Acceptance Criteria

- [ ] **AC-1**: Given a seeded database, when `GET /api/farm`, then the farm data matches Instructions.md §3.
- [ ] **AC-2**: Given a seeded database, when `GET /api/devices`, then 6 devices are returned, one per event type.
- [ ] **AC-3**: Given an already-seeded database, when the seed runs again, then data is unchanged (no duplicates).
- [ ] **AC-4**: Given the demo seed, when loaded, then the 7 events exist and 6 notifications were generated.

## Out of Scope

- CRUD for farms/devices (fixed reference data in the MVP).
- Multi-farm support.

## Open Questions

- None.

## References

- [`../architecture/data-model.md`](../architecture/data-model.md) — seed data tables
- [`../architecture/api.md`](../architecture/api.md) — endpoint shapes
