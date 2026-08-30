# T-027: Simulator Page

| Field | Value |
|---|---|
| **Epic** | [EPIC-08 — Frontend Pages](../BOARD.md#epic-08--frontend-pages) |
| **Points** | 5 |
| **Status** | todo |
| **Depends on** | T-025 |
| **Parallel-safe** | yes (vs T-026/T-028) |
| **Spec** | [SPEC-006](../../../specs/SPEC-006-simulator.md) |

## Context

The interactive demo surface: a form to compose and submit events, with presets for the 7 demo events and outcome feedback distinguishing alert / no alert / duplicate / invalid.

## Scope

**In**
- `routes/Simulator.tsx` + `components/SimulatorForm.tsx`
- Device selector (from `useDevices`); type/unit derived from device; `eventId` auto-generated with override
- Numeric input for sensors; status select (`OK`/`FAILURE`/`MAINTENANCE`) for equipment
- Timestamp input defaulting to now
- Presets for the 7 demo events (fill form, don't submit)
- Outcome feedback panel: alert generated (with message), no alert, duplicate, invalid (per-field errors)
- Client-side validation mirroring server rules
- Component tests (form logic, feedback states, presets)

**Out**
- History (T-028)

## Acceptance Criteria

- [ ] SPEC-006 AC-1..AC-5 pass
- [ ] Submit disabled while in flight; no double submission
- [ ] Form stays usable after submission

## Validation

```bash
pnpm --filter frontend test
pnpm dev  # manual: run the 7 presets against the backend
```

## References

- [`specs/SPEC-006-simulator.md`](../../../specs/SPEC-006-simulator.md) — FR-1..FR-7
- [`business/business-rules.md`](../../../business/business-rules.md) §1–§2 — ranges for client validation
- `Instructions.md` §13 — demo events
