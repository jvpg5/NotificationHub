# T-007: PrismaModule + PrismaService

| Field | Value |
|---|---|
| **Epic** | [EPIC-02 — Data & Persistence](../BOARD.md#epic-02--data--persistence) |
| **Points** | 2 |
| **Status** | todo |
| **Depends on** | T-006 |
| **Parallel-safe** | yes (vs frontend tickets) |
| **Spec** | — |

## Context

Expose Prisma as a global NestJS module so feature modules inject `PrismaService` without re-registering it. Includes graceful shutdown hooks.

## Scope

**In**
- `src/prisma/prisma.service.ts` — extends `PrismaClient`, `onModuleInit` connects, `enableShutdownHooks`
- `src/prisma/prisma.module.ts` — `@Global()`, exports the service
- Unit test (mocked client lifecycle)

**Out**
- Any feature queries

## Acceptance Criteria

- [ ] `PrismaService` is injectable in any module without importing `PrismaModule`
- [ ] App connects on boot and disconnects on shutdown (`SIGTERM` handled)
- [ ] Unit test covers connect/shutdown lifecycle

## Validation

```bash
pnpm --filter backend test prisma
```

## References

- `.tmp/external-context/prisma/nestjs-integration.md`
- `.claude/skills/nestjs-best-practices/SKILL.md`
