# Architecture — Data Model

## Entity-Relationship Diagram

```mermaid
erDiagram
    FARM ||--o{ DEVICE : "has"
    FARM ||--o{ EVENT : "receives"
    DEVICE ||--o{ EVENT : "produces"
    EVENT ||--o| NOTIFICATION : "triggers (max 1)"

    FARM {
        string id PK "farm-001"
        string name "Fazenda Boa Esperança"
        string producer "João Silva"
        string phone "+5535999999999"
        datetime createdAt
    }
    DEVICE {
        string id PK "sensor-temp-01"
        string farmId FK
        string type "EventType this device produces"
        string label "Human-readable name"
        datetime createdAt
    }
    EVENT {
        string id PK "eventId from payload — idempotency key"
        string farmId FK
        string deviceId FK
        string type "EventType"
        float value "null for EQUIPMENT_STATUS"
        string textValue "FAILURE | OK | MAINTENANCE"
        string unit "C | % | null"
        datetime timestamp "reading time (from payload)"
        datetime receivedAt "server time"
    }
    NOTIFICATION {
        string id PK "uuid"
        string eventId FK "unique — 1:1 with Event"
        string farmId
        string deviceId
        string eventType
        float eventValue
        string ruleTriggered "e.g. AIR_TEMPERATURE_HIGH"
        string severity "CRITICAL | WARNING | INFO"
        string message "rendered from template"
        string status "PENDING | SENT | FAILED"
        datetime sentAt "null until sent"
        string failureReason "null unless FAILED"
        datetime createdAt
        datetime updatedAt
    }
```

## Design Decisions

| Decision | Rationale |
|---|---|
| `Event.id` = payload `eventId` | The natural idempotency key — re-delivery hits the primary key (see [business-rules.md §7](../business/business-rules.md#7-idempotency)) |
| `Notification.eventId` is `@unique` | Enforces "one event → at most one notification" at the database level |
| `value` + `textValue` on Event | Sensor events carry a number; `EQUIPMENT_STATUS` carries a string. One column would break typing. |
| Denormalized fields on Notification (`eventType`, `eventValue`, `farmId`, `deviceId`) | Notifications are immutable historical records — they must read standalone even if display needs no join |
| SQLite | Embedded, zero-config, sufficient for MVP volume |

## Indexes

| Table | Index | Purpose |
|---|---|---|
| `Event` | `farmId`, `deviceId`, `type` | Filtered history queries |
| `Notification` | `farmId`, `status`, `createdAt` | Dashboard lists + status filters |
| `Notification` | `eventId` (unique) | Cardinality guarantee |

## Seed Data

Seeded on `prisma db seed` (see `prisma/seed.ts`):

- **Farm**: `farm-001` — Fazenda Boa Esperança, João Silva, `+5535999999999`
- **Devices** (minimum):

| Device ID | Type | Label |
|---|---|---|
| `sensor-temp-01` | `AIR_TEMPERATURE` | Ambient temperature sensor |
| `sensor-humidity-01` | `AIR_HUMIDITY` | Air humidity sensor |
| `sensor-soil-01` | `SOIL_MOISTURE` | Soil moisture sensor |
| `reservoir-sensor-01` | `WATER_RESERVOIR_LEVEL` | Water reservoir level sensor |
| `silo-sensor-01` | `SILO_LEVEL` | Silo level sensor |
| `irrigation-pump-01` | `EQUIPMENT_STATUS` | Irrigation pump |

- **Demo events**: the 7 events from `Instructions.md` §13 (6 alerts + 1 normal) — optionally loaded for demos.
