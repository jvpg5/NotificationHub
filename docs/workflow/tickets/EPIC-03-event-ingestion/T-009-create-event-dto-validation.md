# T-009: CreateEventDto + Input Validation

| Field | Value |
|---|---|
| **Epic** | [EPIC-03 — Event Ingestion](../BOARD.md#epic-03--event-ingestion) |
| **Points** | 3 |
| **Status** | todo |
| **Depends on** | T-004, T-007 |
| **Parallel-safe** | yes (vs frontend tickets) |
| **Spec** | [SPEC-001](../../../specs/SPEC-001-event-ingestion.md) (FR-2..FR-4) |

## Context

Implement the input contract: `CreateEventDto` with class-validator decorators enforcing every rule V1–V8 from [`business/business-rules.md` §2](../../../business/business-rules.md#2-input-validation-rules) — including per-type value ranges, unit consistency, and the equipment status enum. Cross-field rules (farm/device existence) are validated in the service (T-010).

## Scope

**In**
- `events/dto/create-event.dto.ts` — field decorators + custom validators for per-type range/unit rules
- Global `ValidationPipe` (whitelist + transform) wired in `main.ts` if not already
- Unit tests: every invalid variant S9, S11–S15 rejected; valid sensor + equipment payloads accepted

**Out**
- Controller/service (T-010), idempotency (T-011), farm/device existence checks (T-010)

## Acceptance Criteria

- [ ] All V1–V8 rules enforced with clear per-field messages
- [ ] `AIR_HUMIDITY = 130` → 400 with a message naming `value`
- [ ] `AIR_TEMPERATURE` with `unit: "%"` → 400 naming `unit`
- [ ] `EQUIPMENT_STATUS` with numeric value → 400
- [ ] All failing fields reported in ONE response (NFR-1)

## Validation

```bash
pnpm --filter backend test events
```

## References

- [`business/business-rules.md`](../../../business/business-rules.md) §1–§2
- `.tmp/external-context/nestjs/validation-pipes.md`
- Scenarios S9, S11–S15
