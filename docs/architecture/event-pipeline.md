# Architecture — Event Pipeline

The core flow of the system: from a sensor reading to a delivered notification.

## Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    participant C as Client (Simulator/UI)
    participant EC as EventsController
    participant VP as ValidationPipe
    participant IG as IdempotencyGuard
    participant ES as EventsService
    participant DB as SQLite (Prisma)
    participant EE as EventEmitter
    participant RS as RulesService
    participant NS as NotificationsService
    participant P as NotificationProvider (Mock)

    C->>EC: POST /api/events
    EC->>VP: validate payload
    alt invalid payload
        VP-->>C: 400 Bad Request (field errors)
    end
    EC->>IG: check eventId
    IG->>DB: Event.findUnique(eventId)
    alt event exists (duplicate)
        IG-->>C: 200 OK (existing event, duplicate: true)
    end
    EC->>ES: processEvent(dto)
    ES->>DB: Event.create(...)
    ES->>EE: emit event.received (persisted event)
    ES-->>C: 201 Created (event)

    EE->>RS: handle event.received
    RS->>RS: evaluate rule matching event.type
    alt rule triggered
        RS->>RS: build notification (severity + message template)
        RS->>EE: emit notification.generated (payload)
    else no rule triggered
        RS-->>RS: nothing (event stays in history)
    end

    EE->>NS: handle notification.generated
    NS->>DB: Notification.create (status: PENDING)
    NS->>P: send(notification)
    alt send succeeds
        P-->>NS: SendResult ok
        NS->>DB: update status SENT + sentAt
    else send fails
        P-->>NS: SendResult error
        NS->>DB: update status FAILED + failureReason
    end
    NS->>EE: emit notification.sent (final notification)
```

## Internal Events

| Event | Emitter → Consumer | Payload | Purpose |
|---|---|---|---|
| `event.received` | `EventsService` → `RulesService` | Persisted `Event` | Decouples ingestion from rule evaluation |
| `notification.generated` | `RulesService` → `NotificationsService` | Notification payload (rule, severity, message, event snapshot) | Decouples rule evaluation from notification lifecycle |
| `notification.sent` | `NotificationsService` → (observability) | Final `Notification` | Hook for future integrations (logs, metrics) |

## Error Paths

| Failure | Behavior |
|---|---|
| Invalid payload | `400` with per-field errors; nothing persisted |
| Duplicate `eventId` | `200` with existing event + `duplicate: true`; no reprocessing |
| Unknown farm/device | `400`; nothing persisted |
| Rule evaluation throws | Event remains persisted; error logged; pipeline must not crash the request (the `201` was already returned) |
| Provider send fails | Notification persisted as `FAILED` + `failureReason`; event unaffected |

## Synchronous vs Asynchronous

- Steps 1–6 (request handling through `201 Created`) are **synchronous** — the client gets confirmation that the event was accepted.
- Rule evaluation and notification delivery happen **in-process via the event emitter**, immediately after persistence (same request lifecycle in the MVP). The emitter indirection keeps modules decoupled so an out-of-process queue could replace it later without changing module contracts.

## Query Flow (read side)

```mermaid
flowchart LR
    UI[Frontend] -->|GET /api/events| EC[EventsController]
    UI -->|GET /api/notifications| NC[NotificationsController]
    UI -->|GET /api/farm| FC[FarmController]
    UI -->|GET /api/devices| DC[DevicesController]
    EC & NC & FC & DC --> PS[PrismaService] --> DB[(SQLite)]
```
