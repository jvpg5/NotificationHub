# Architecture — API Contract

Base URL: `http://localhost:3001/api` (frontend dev server proxies `/api` here).

All request/response bodies are JSON. Timestamps are ISO 8601 with timezone offset.

## Endpoints

| Method | Route | Description | Spec |
|---|---|---|---|
| `POST` | `/events` | Submit a new sensor/device event | SPEC-001 |
| `GET` | `/events` | List events (paginated, filterable) | SPEC-001 |
| `GET` | `/events/:id` | Get a single event | SPEC-001 |
| `GET` | `/notifications` | List notifications (paginated, filterable) | SPEC-003 |
| `GET` | `/notifications/:id` | Get a single notification | SPEC-003 |
| `GET` | `/farm` | Farm information | SPEC-004 |
| `GET` | `/devices` | Registered devices | SPEC-004 |

## POST /events

**Request** (sensor event):

```json
{
  "eventId": "event-001",
  "farmId": "farm-001",
  "deviceId": "sensor-temp-01",
  "type": "AIR_TEMPERATURE",
  "value": 38.5,
  "unit": "C",
  "timestamp": "2026-08-17T14:30:00-03:00"
}
```

**Request** (equipment event):

```json
{
  "eventId": "event-006",
  "farmId": "farm-001",
  "deviceId": "irrigation-pump-01",
  "type": "EQUIPMENT_STATUS",
  "value": "FAILURE",
  "unit": null,
  "timestamp": "2026-08-17T14:35:00-03:00"
}
```

Validation rules: see [`../business/business-rules.md` §2](../business/business-rules.md#2-input-validation-rules).

**Responses**:

| Status | Meaning | Body |
|---|---|---|
| `201` | Event accepted (and persisted) | Stored event (below) |
| `200` | Duplicate — already processed | Stored event + `"duplicate": true` |
| `400` | Validation failed | Error object (below) |

**Stored event** (response body):

```json
{
  "id": "event-001",
  "farmId": "farm-001",
  "deviceId": "sensor-temp-01",
  "type": "AIR_TEMPERATURE",
  "value": 38.5,
  "textValue": null,
  "unit": "C",
  "timestamp": "2026-08-17T14:30:00.000-03:00",
  "receivedAt": "2026-08-30T12:00:00.000-03:00"
}
```

## GET /events

Query parameters:

| Param | Type | Default | Description |
|---|---|---|---|
| `limit` | int | 50 | Page size (max 100) |
| `offset` | int | 0 | Pagination offset |
| `type` | string | — | Filter by event type |

Response: `{ "data": StoredEvent[], "total": number }`, ordered by `timestamp` descending.

## GET /notifications

Query parameters:

| Param | Type | Default | Description |
|---|---|---|---|
| `limit` | int | 50 | Page size (max 100) |
| `offset` | int | 0 | Pagination offset |
| `status` | string | — | `PENDING` \| `SENT` \| `FAILED` |
| `severity` | string | — | `CRITICAL` \| `WARNING` \| `INFO` |

Response: `{ "data": Notification[], "total": number }`, ordered by `createdAt` descending.

**Notification** (response body):

```json
{
  "id": "b3e1...",
  "eventId": "event-001",
  "farmId": "farm-001",
  "deviceId": "sensor-temp-01",
  "eventType": "AIR_TEMPERATURE",
  "eventValue": 38.5,
  "ruleTriggered": "AIR_TEMPERATURE_HIGH",
  "severity": "WARNING",
  "message": "⚠️ Temperature alert: 38.5°C recorded by sensor sensor-temp-01 at Fazenda Boa Esperança.",
  "status": "SENT",
  "sentAt": "2026-08-30T12:00:01.000-03:00",
  "failureReason": null,
  "createdAt": "2026-08-30T12:00:00.000-03:00",
  "updatedAt": "2026-08-30T12:00:01.000-03:00"
}
```

## GET /farm

```json
{
  "id": "farm-001",
  "name": "Fazenda Boa Esperança",
  "producer": "João Silva",
  "phone": "+5535999999999"
}
```

## GET /devices

```json
{
  "data": [
    { "id": "sensor-temp-01", "farmId": "farm-001", "type": "AIR_TEMPERATURE", "label": "Ambient temperature sensor" }
  ]
}
```

## Error Responses

Validation errors (`400`) follow the NestJS `ValidationPipe` shape, listing every failed field:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": [
    "value must be a number between 0 and 100",
    "unit must be one of: %"
  ]
}
```

Not found (`404`):

```json
{ "statusCode": 404, "error": "Not Found", "message": "Event event-999 not found" }
```

## CORS

Backend allows `http://localhost:5173` (frontend dev server) via `enableCors` / `app.set('cors')` configuration.
