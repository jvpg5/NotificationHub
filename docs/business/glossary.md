# Glossary — Domain Terms

Shared vocabulary for the NotificationHub domain. Use these terms consistently in code, docs, commits, and discussions.

## Core Domain

| Term | Definition | Code Reference |
|---|---|---|
| **Farm** | A rural property monitored by the system. MVP has exactly one seeded farm: *Fazenda Boa Esperança* (`farm-001`). | `Farm` model |
| **Producer** | The farmer who owns a farm and receives notifications. MVP: João Silva (`producer-001`), phone `+5535999999999`. | `Farm.producer` |
| **Device** | A sensor or equipment installed on a farm that produces events (e.g. `sensor-temp-01`, `irrigation-pump-01`). | `Device` model |
| **Sensor** | A device that measures a numeric quantity (temperature, humidity, level...). | `Device.type` |
| **Equipment** | A device with an operational status rather than a numeric reading (e.g. irrigation pump). | `Device.type = EQUIPMENT_STATUS` |
| **Event** | A single reading produced by a device at a point in time, identified by a unique `eventId`. The atomic input of the system. | `Event` model |
| **Event Type** | The kind of information an event carries. MVP types: `AIR_TEMPERATURE`, `AIR_HUMIDITY`, `SOIL_MOISTURE`, `WATER_RESERVOIR_LEVEL`, `SILO_LEVEL`, `EQUIPMENT_STATUS`. | `EventType` enum |
| **Rule** | A named condition over an event that, when triggered, produces a notification (e.g. `AIR_TEMPERATURE > 35`). | `Rule` interface |
| **Rule Evaluation** | The process of checking an event against the rule that matches its type. | `RulesService` |
| **Notification** | A message produced for the producer when a rule triggers, with severity, status, and send result. | `Notification` model |
| **Severity** | Classification of a notification: `CRITICAL`, `WARNING`, or `INFO`. | `Severity` enum |
| **Notification Provider** | Pluggable sending mechanism behind the `NotificationProvider` interface. MVP: `MockWhatsAppProvider`. | `NotificationProvider` interface |
| **Idempotency** | Guarantee that re-delivering the same `eventId` never produces duplicate notifications. | `IdempotencyGuard` |
| **Pipeline** | The end-to-end flow: event received → validated → persisted → rules evaluated → notification generated → sent. | `event-pipeline.md` |

## Pipeline Events (internal, via `@nestjs/event-emitter`)

| Event Name | Emitted By | Consumed By | Payload |
|---|---|---|---|
| `event.received` | `EventsService` (after persisting) | `RulesService` | Persisted `Event` |
| `notification.generated` | `RulesService` (when a rule triggers) | `NotificationsService` | Notification payload (not yet persisted) |
| `notification.sent` | `NotificationsService` (after send attempt) | — (observability) | Persisted `Notification` with final status |

## Notification Lifecycle

| Status | Meaning |
|---|---|
| `PENDING` | Notification created, send not yet attempted |
| `SENT` | Provider confirmed delivery (simulated in MVP) |
| `FAILED` | Provider failed; `failureReason` records why |

## Workflow Terms

| Term | Definition |
|---|---|
| **Spec** | A capability document in `docs/specs/` with testable requirements. The contract between business and code. |
| **Ticket** | A unit of work capped at 5 points, defined in `docs/workflow/tickets/`. One ticket = one PR. |
| **Epic** | A group of tickets delivering one phase of the project (maps to a PLANNING.md phase). |
| **Points** | Effort estimate in Fibonacci (1, 2, 3, 5). Max 5 keeps PRs concise. |
| **Stack** | A linear chain of PRs managed with `gh stack`, each PR targeting the branch below it. |
| **Parallel stacks** | Multiple independent stacks rooted at `main`, used to work on independent tickets simultaneously. |
| **Planner / Implementer / Reviewer** | Roles in the development loop (see `docs/workflow/README.md`). |
