# T-002: Backend Scaffold (NestJS)

| Field | Value |
|---|---|
| **Epic** | [EPIC-01 — Monorepo Foundation](../BOARD.md#epic-01--monorepo-foundation) |
| **Points** | 3 |
| **Status** | todo |
| **Depends on** | T-001 |
| **Parallel-safe** | yes (disjoint from T-003/T-004) |
| **Spec** | — |

## Context

Scaffold the NestJS application in `apps/backend` with the global conventions already in place: `/api` global prefix, validation pipe wiring point, CORS for the frontend origin, and a health endpoint for smoke tests.

## Scope

**In**
- `apps/backend` NestJS ^11 project (package.json, tsconfig, nest-cli.json)
- `src/main.ts`: port 3001 (from env), global prefix `api`, CORS for `http://localhost:5173`
- `src/app.module.ts` (empty modules — feature modules come in later epics)
- `GET /api/health` → `{ status: "ok" }`
- Jest configured per NestJS defaults

**Out**
- Prisma (T-006/T-007), any feature module, event-emitter setup (comes with features)

## Acceptance Criteria

- [ ] `pnpm --filter backend dev` starts on :3001
- [ ] `GET /api/health` returns `200 { "status": "ok" }`
- [ ] `pnpm --filter backend test` passes (default spec)
- [ ] CORS headers present for the frontend origin

## Validation

```bash
pnpm --filter backend dev &
curl -s http://localhost:3001/api/health
pnpm --filter backend test
```

## References

- [`architecture/overview.md`](../../../architecture/overview.md) — ports, module map
- `.claude/skills/nestjs-best-practices/SKILL.md`
- `.tmp/external-context/nestjs/` — CLI setup, modules, CORS, validation pipes
