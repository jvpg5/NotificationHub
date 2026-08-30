# Ticket Board

> **Source of truth for what to do next.** Update statuses as you work (see [`../README.md`](../README.md)).

## Rules

- **Max 5 points per ticket** (Fibonacci: 1, 2, 3, 5). If a ticket grows beyond 5, split it.
- **One ticket = one PR = one squash commit.**
- Take the first `todo` ticket whose dependencies are all `done`.
- `parallel-safe` = can be developed simultaneously with another `parallel-safe` ticket **from a different epic** in an independent stack (disjoint files). See [`../pr-stacking.md#parallel-stacks-working-on-multiple-tickets-at-once`](../pr-stacking.md#parallel-stacks-working-on-multiple-tickets-at-once).
- Ticket files live in `tickets/EPIC-NN-slug/T-NNN-slug.md`.

## Status Legend

`todo` · `in-progress` · `in-review` · `done` · `blocked`

## Epic Overview

| Epic | Title | Tickets | Points | Spec | Maps to PLANNING.md |
|---|---|---|---|---|---|
| [EPIC-01](tickets/EPIC-01-monorepo-foundation/) | Monorepo Foundation | 5 | 12 | — | Fase 1 |
| [EPIC-02](tickets/EPIC-02-data-persistence/) | Data & Persistence | 3 | 8 | SPEC-004 (seed) | Fase 2 |
| [EPIC-03](tickets/EPIC-03-event-ingestion/) | Event Ingestion | 4 | 11 | SPEC-001 | Fase 3 |
| [EPIC-04](tickets/EPIC-04-rules-engine/) | Rules Engine | 4 | 10 | SPEC-002 | Fase 4 |
| [EPIC-05](tickets/EPIC-05-notifications/) | Notifications | 4 | 10 | SPEC-003 | Fase 5 |
| [EPIC-06](tickets/EPIC-06-farm-devices/) | Farm & Devices | 2 | 4 | SPEC-004 | Fase 6 |
| [EPIC-07](tickets/EPIC-07-frontend-foundation/) | Frontend Foundation | 3 | 8 | SPEC-005–007 (base) | Fase 7 |
| [EPIC-08](tickets/EPIC-08-frontend-pages/) | Frontend Pages | 3 | 13 | SPEC-005, 006, 007 | Fase 8 |
| [EPIC-09](tickets/EPIC-09-quality-coverage/) | Quality & Coverage | 2 | 8 | all | Fase 9 |
| [EPIC-10](tickets/EPIC-10-final-documentation/) | Final Documentation | 2 | 4 | — | Fase 10 |
| | **Total** | **32** | **88** | | |

## EPIC-01 — Monorepo Foundation

| ID | Ticket | Pts | Depends on | Parallel-safe | Status |
|---|---|---|---|---|---|
| [T-001](tickets/EPIC-01-monorepo-foundation/T-001-monorepo-workspace.md) | Monorepo workspace + root configs | 2 | — | no | done |
| [T-002](tickets/EPIC-01-monorepo-foundation/T-002-backend-scaffold.md) | Backend scaffold (NestJS) | 3 | T-001 | yes (vs T-003/T-004) | done |
| [T-003](tickets/EPIC-01-monorepo-foundation/T-003-frontend-scaffold.md) | Frontend scaffold (Vite + React) | 3 | T-001 | yes (vs T-002/T-004) | done |
| [T-004](tickets/EPIC-01-monorepo-foundation/T-004-shared-types-package.md) | `shared-types` package | 2 | T-001 | yes (vs T-002/T-003) | done |
| [T-005](tickets/EPIC-01-monorepo-foundation/T-005-root-scripts-verification.md) | Root scripts + smoke verification | 2 | T-002, T-003, T-004 | no | done |

## EPIC-02 — Data & Persistence

| ID | Ticket | Pts | Depends on | Parallel-safe | Status |
|---|---|---|---|---|---|
| [T-006](tickets/EPIC-02-data-persistence/T-006-prisma-schema-migration.md) | Prisma schema + initial migration | 3 | T-002 | yes (vs frontend) | done |
| [T-007](tickets/EPIC-02-data-persistence/T-007-prisma-module-service.md) | PrismaModule + PrismaService | 2 | T-006 | yes (vs frontend) | done |
| [T-008](tickets/EPIC-02-data-persistence/T-008-seed-script.md) | Seed script (farm, devices, demo events) | 3 | T-006 | yes (vs frontend) | done |

## EPIC-03 — Event Ingestion

| ID | Ticket | Pts | Depends on | Parallel-safe | Status |
|---|---|---|---|---|---|
| [T-009](tickets/EPIC-03-event-ingestion/T-009-create-event-dto-validation.md) | CreateEventDto + input validation | 3 | T-004, T-007 | yes (vs frontend) | done |
| [T-010](tickets/EPIC-03-event-ingestion/T-010-events-service-controller.md) | EventsService + EventsController | 3 | T-009 | yes (vs frontend) | done |
| [T-011](tickets/EPIC-03-event-ingestion/T-011-idempotency-guard.md) | IdempotencyGuard | 3 | T-010 | yes (vs frontend) | done |
| [T-012](tickets/EPIC-03-event-ingestion/T-012-events-e2e-tests.md) | Events e2e tests | 2 | T-011 | yes (vs frontend) | done |

## EPIC-04 — Rules Engine

| ID | Ticket | Pts | Depends on | Parallel-safe | Status |
|---|---|---|---|---|---|
| [T-013](tickets/EPIC-04-rules-engine/T-013-rule-interface-registry.md) | Rule interface + RulesRegistry | 2 | T-004 | yes (vs frontend) | done |
| [T-014](tickets/EPIC-04-rules-engine/T-014-threshold-rules.md) | Threshold rules (5 sensor rules) | 3 | T-013 | yes (vs frontend) | done |
| [T-015](tickets/EPIC-04-rules-engine/T-015-equipment-status-rule.md) | Equipment status rule | 2 | T-013 | yes (vs frontend) | done |
| [T-016](tickets/EPIC-04-rules-engine/T-016-rules-service-listener.md) | RulesService listener | 3 | T-014, T-015 | yes (vs frontend) | done |

## EPIC-05 — Notifications

| ID | Ticket | Pts | Depends on | Parallel-safe | Status |
|---|---|---|---|---|---|
| [T-017](tickets/EPIC-05-notifications/T-017-notification-provider-mock.md) | NotificationProvider + MockWhatsAppProvider | 2 | T-004 | yes (vs frontend) | todo |
| [T-018](tickets/EPIC-05-notifications/T-018-notifications-service.md) | NotificationsService (lifecycle) | 3 | T-016, T-017 | yes (vs frontend) | todo |
| [T-019](tickets/EPIC-05-notifications/T-019-notifications-controller.md) | NotificationsController | 2 | T-018 | yes (vs frontend) | todo |
| [T-020](tickets/EPIC-05-notifications/T-020-pipeline-e2e-tests.md) | Pipeline e2e tests | 3 | T-018, T-019 | yes (vs frontend) | todo |

## EPIC-06 — Farm & Devices

| ID | Ticket | Pts | Depends on | Parallel-safe | Status |
|---|---|---|---|---|---|
| [T-021](tickets/EPIC-06-farm-devices/T-021-farm-module.md) | FarmModule | 2 | T-007, T-008 | yes (vs frontend) | done |
| [T-022](tickets/EPIC-06-farm-devices/T-022-devices-module.md) | DevicesModule | 2 | T-007, T-008 | yes (vs frontend) | done |

## EPIC-07 — Frontend Foundation

| ID | Ticket | Pts | Depends on | Parallel-safe | Status |
|---|---|---|---|---|---|
| [T-023](tickets/EPIC-07-frontend-foundation/T-023-router-layout.md) | React Router + Layout + navigation | 3 | T-003 | yes (vs backend) | done |
| [T-024](tickets/EPIC-07-frontend-foundation/T-024-api-service-proxy.md) | API service + Vite proxy | 2 | T-004, T-003 | yes (vs backend) | done |
| [T-025](tickets/EPIC-07-frontend-foundation/T-025-data-hooks.md) | Data hooks (useEvents, useNotifications) | 3 | T-024 | no (integration) | done |

## EPIC-08 — Frontend Pages

| ID | Ticket | Pts | Depends on | Parallel-safe | Status |
|---|---|---|---|---|---|
| [T-026](tickets/EPIC-08-frontend-pages/T-026-dashboard-page.md) | Dashboard page | 5 | T-025, T-021, T-022 | no (integration) | done |
| [T-027](tickets/EPIC-08-frontend-pages/T-027-simulator-page.md) | Simulator page | 5 | T-025 | yes (vs T-026/T-028) | todo |
| [T-028](tickets/EPIC-08-frontend-pages/T-028-history-page.md) | History page | 3 | T-025 | yes (vs T-026/T-027) | todo |

## EPIC-09 — Quality & Coverage

| ID | Ticket | Pts | Depends on | Parallel-safe | Status |
|---|---|---|---|---|---|
| [T-029](tickets/EPIC-09-quality-coverage/T-029-coverage-ci.md) | Coverage report + CI workflow | 3 | T-012, T-020 | no | todo |
| [T-030](tickets/EPIC-09-quality-coverage/T-030-test-hardening.md) | Test hardening (edge cases + components) | 5 | T-029 | no | todo |

## EPIC-10 — Final Documentation

| ID | Ticket | Pts | Depends on | Parallel-safe | Status |
|---|---|---|---|---|---|
| [T-031](tickets/EPIC-10-final-documentation/T-031-readme.md) | README.md (run/test instructions) | 2 | T-028 | no | todo |
| [T-032](tickets/EPIC-10-final-documentation/T-032-development-log.md) | DEVELOPMENT_LOG.md finalization | 2 | T-031 | no | todo |

## Spec ↔ Epic Traceability

| Spec | Epics | Verifying tickets |
|---|---|---|
| SPEC-001 Event Ingestion | EPIC-03 | T-009, T-010, T-011, T-012 |
| SPEC-002 Rules Engine | EPIC-04 | T-013, T-014, T-015, T-016 |
| SPEC-003 Notifications | EPIC-05 | T-017, T-018, T-019, T-020 |
| SPEC-004 Farm & Devices | EPIC-02, EPIC-06 | T-008, T-021, T-022 |
| SPEC-005 Dashboard | EPIC-08 | T-026 |
| SPEC-006 Simulator | EPIC-08 | T-027 |
| SPEC-007 History | EPIC-08 | T-028 |

## Suggested Execution Order (single stream)

```
T-001 → T-002 → T-003 → T-004 → T-005 → T-006 → T-007 → T-008
→ T-009 → T-010 → T-011 → T-012 → T-013 → T-014 → T-015 → T-016
→ T-017 → T-018 → T-019 → T-020 → T-021 → T-022
→ T-023 → T-024 → T-025 → T-026 → T-027 → T-028
→ T-029 → T-030 → T-031 → T-032
```

**Two-stream alternative** (parallel stacks): once T-001–T-005 are done, run a backend stream (T-006 → ... → T-022) and a frontend stream (T-023 → T-024) simultaneously; join at T-025.
