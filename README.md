# NotificationHub

NotificationHub is an MVP smart-farm notification system: it receives events from IoT sensors and devices, validates them, evaluates notification rules, and delivers alerts to the producer (simulated WhatsApp sending for the MVP).

## Architecture

Monorepo (pnpm workspaces): **NestJS backend** (`apps/backend`, port 3001) + **React/Vite frontend** (`apps/frontend`, port 5173) + **shared-types package** (`packages/shared-types`). SQLite via Prisma. Modules communicate through `@nestjs/event-emitter` for a decoupled pipeline.

Full architecture: [`docs/architecture/overview.md`](docs/architecture/overview.md)

## Prerequisites

- **Node.js** 18+ (target: ES2022)
- **pnpm** 9+

## Setup

```bash
# 1. Clone and install
git clone <repo-url> NotificationHub
cd NotificationHub
pnpm install

# 2. Environment
cp .env.example .env
# Defaults work out of the box: SQLite at apps/backend/prisma/dev.db, API on :3001

# 3. Database
pnpm --filter backend prisma migrate dev
# Creates the SQLite database and applies the schema

# 4. Seed
pnpm --filter backend prisma db seed
# Seeds farm "Boa Esperanca" (farm-001) + 6 devices

# Optional: seed demo events (7 preset events that trigger notifications)
SEED_DEMO_EVENTS=true pnpm --filter backend prisma db seed
```

## Running

```bash
pnpm dev
```

- **Backend API**: http://localhost:3001 (all routes under `/api`)
- **Frontend**: http://localhost:5173 (proxies `/api` → `:3001`)
- **API docs**: [`docs/architecture/api.md`](docs/architecture/api.md)

Open the frontend to see the dashboard, simulate events, and browse history.

## Demo

Without the seed demo events flag, you can send the 7 preset events via curl to trigger all 6 notification rules plus one normal reading:

```bash
# Temperature alert (HIGH)
curl -s -X POST http://localhost:3001/api/events \
  -H 'Content-Type: application/json' \
  -d '{"eventId":"event-001","farmId":"farm-001","deviceId":"sensor-temp-01","type":"AIR_TEMPERATURE","value":38.5,"unit":"C","timestamp":"2026-08-17T14:30:00-03:00"}'

# Humidity alert (LOW)
curl -s -X POST http://localhost:3001/api/events \
  -H 'Content-Type: application/json' \
  -d '{"eventId":"event-002","farmId":"farm-001","deviceId":"sensor-humidity-01","type":"AIR_HUMIDITY","value":24,"unit":"%","timestamp":"2026-08-17T14:31:00-03:00"}'

# Soil moisture alert (LOW)
curl -s -X POST http://localhost:3001/api/events \
  -H 'Content-Type: application/json' \
  -d '{"eventId":"event-003","farmId":"farm-001","deviceId":"sensor-soil-01","type":"SOIL_MOISTURE","value":17,"unit":"%","timestamp":"2026-08-17T14:32:00-03:00"}'

# Water reservoir alert (LOW)
curl -s -X POST http://localhost:3001/api/events \
  -H 'Content-Type: application/json' \
  -d '{"eventId":"event-004","farmId":"farm-001","deviceId":"reservoir-sensor-01","type":"WATER_RESERVOIR_LEVEL","value":12,"unit":"%","timestamp":"2026-08-17T14:33:00-03:00"}'

# Silo level alert (LOW)
curl -s -X POST http://localhost:3001/api/events \
  -H 'Content-Type: application/json' \
  -d '{"eventId":"event-005","farmId":"farm-001","deviceId":"silo-sensor-01","type":"SILO_LEVEL","value":10,"unit":"%","timestamp":"2026-08-17T14:34:00-03:00"}'

# Equipment failure alert (CRITICAL)
curl -s -X POST http://localhost:3001/api/events \
  -H 'Content-Type: application/json' \
  -d '{"eventId":"event-006","farmId":"farm-001","deviceId":"irrigation-pump-01","type":"EQUIPMENT_STATUS","value":"FAILURE","unit":null,"timestamp":"2026-08-17T14:35:00-03:00"}'

# Normal reading — no notification generated
curl -s -X POST http://localhost:3001/api/events \
  -H 'Content-Type: application/json' \
  -d '{"eventId":"event-007","farmId":"farm-001","deviceId":"sensor-temp-01","type":"AIR_TEMPERATURE","value":27,"unit":"C","timestamp":"2026-08-17T14:36:00-03:00"}'
```

Events 1–6 each generate a notification visible on the Dashboard and History pages. Event 7 is a normal reading stored in history but produces no alert.

You can also use the **Simulator** page in the frontend to send events interactively.

## Testing

```bash
# All tests (backend + frontend)
pnpm test

# Coverage report (backend: 75%/70% thresholds, frontend: vitest coverage)
pnpm test:coverage

# Backend end-to-end tests (full pipeline)
pnpm --filter backend test:e2e

# Lint all packages
pnpm lint

# Type-check all packages
pnpm typecheck
```

## Project Structure

```
notificationhub/
├── apps/
│   ├── backend/        # NestJS API (port 3001)
│   └── frontend/       # React + Vite SPA (port 5173)
├── packages/
│   └── shared-types/   # Shared TypeScript types + enums
├── docs/               # Canonical documentation
│   ├── business/       # Domain glossary, notification rules, scenarios
│   ├── architecture/   # Components, data model, API contracts
│   ├── specs/          # Capability specs with functional requirements
│   └── workflow/       # Development workflow, ticket board, PR conventions
├── .env.example        # Environment template
├── DEVELOPMENT_LOG.md  # Development process record
├── Instructions.md     # Original assignment (Portuguese)
└── PLANNING.md         # Initial architecture plan (historical)
```

## Documentation

| Area | Link |
|---|---|
| Business rules & notification rules | [`docs/business/business-rules.md`](docs/business/business-rules.md) |
| Architecture overview | [`docs/architecture/overview.md`](docs/architecture/overview.md) |
| API contracts | [`docs/architecture/api.md`](docs/architecture/api.md) |
| Event pipeline | [`docs/architecture/event-pipeline.md`](docs/architecture/event-pipeline.md) |
| Data model | [`docs/architecture/data-model.md`](docs/architecture/data-model.md) |
| Specs (functional requirements) | [`docs/specs/`](docs/specs/) |
| Ticket board | [`docs/workflow/tickets/BOARD.md`](docs/workflow/tickets/BOARD.md) |
| Development workflow | [`docs/workflow/README.md`](docs/workflow/README.md) |
| Roadmap | [`docs/ROADMAP.md`](docs/ROADMAP.md) |
| Development log | [`DEVELOPMENT_LOG.md`](DEVELOPMENT_LOG.md) |

## License

MIT — see [`LICENSE`](LICENSE).