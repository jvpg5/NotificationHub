# T-010: EventsService + EventsController

| Field | Value |
|---|---|
| **Epic** | [EPIC-03 — Event Ingestion](../BOARD.md#epic-03--event-ingestion) |
| **Points** | 3 |
| **Status** | todo |
| **Depends on** | T-009 |
| **Parallel-safe** | yes (vs frontend tickets) |
| **Spec** | [SPEC-001](../../../specs/SPEC-001-event-ingestion.md) (FR-1, FR-4, FR-6..FR-9) |

## Context

The ingestion core: persist valid events, emit `event.received`, and expose the read endpoints. Also validates farm/device existence (V2/V3) — unknown references are rejected with 400.

## Scope

**In**
- `events/events.controller.ts` — `POST /api/events`, `GET /api/events` (limit/offset/type), `GET /api/events/:id` (404)
- `events/events.service.ts` — `processEvent()` (validate refs → persist → emit `event.received`), `findAll()`, `findOne()`
- `EventsModule` registered in `AppModule`; `EventEmitterModule` wired
- Unit tests with mocked Prisma + emitter

**Out**
- Idempotency (T-011), e2e (T-012)

## Acceptance Criteria

- [ ] Valid event → 201 + stored body (per [`architecture/api.md`](../../../architecture/api.md))
- [ ] Unknown farmId or device-from-another-farm → 400, nothing persisted
- [ ] `event.received` emitted with the persisted event
- [ ] `GET /api/events` paginates, filters by type, orders by timestamp desc, returns `{ data, total }`
- [ ] Unknown id → 404

## Validation

```bash
pnpm --filter backend test events
```

## References

- [`architecture/event-pipeline.md`](../../../architecture/event-pipeline.md) — steps 1–6
- [`architecture/api.md`](../../../architecture/api.md) — POST/GET contracts
- `.tmp/external-context/nestjs/event-emitter.md`
