# Architecture — Technical Decisions

ADR-lite record: each decision with context, choice, and consequences. Decisions are immutable history — superseding a decision adds a new entry, never edits an old one.

| ID | Decision | Status |
|---|---|---|
| AD-01 | NestJS for the backend | Accepted |
| AD-02 | Vite + React SPA for the frontend | Accepted |
| AD-03 | Prisma + SQLite for persistence | Accepted |
| AD-04 | Decoupled pipeline via `@nestjs/event-emitter` | Accepted |
| AD-05 | Idempotency via `eventId` primary-key lookup | Accepted |
| AD-06 | `NotificationProvider` abstraction with `MockWhatsAppProvider` | Accepted |
| AD-07 | pnpm monorepo with `shared-types` package | Accepted |
| AD-08 | Severity model: CRITICAL / WARNING / INFO | Accepted |
| AD-09 | All content in English (docs, code, notification messages) | Accepted |
| AD-10 | Stacked PRs (`gh stack`) + squash merges | Accepted |
| AD-11 | `docs/` as the single source of truth for AI-driven development | Accepted |

---

## AD-01 — NestJS for the backend

- **Context**: Modular pipeline (events → rules → notifications → providers) with validation and testability requirements.
- **Decision**: NestJS ^11 with class-validator pipes, DI, and `@nestjs/event-emitter`.
- **Consequences**: First-class DI makes the provider mock trivial; validation is declarative; team familiarity maximizes velocity.

## AD-02 — Vite + React SPA for the frontend

- **Context**: Dashboard/simulator/history UI; no SSR need; monorepo with fast feedback.
- **Decision**: Vite ^6 + React ^19 SPA with React Router and TanStack Query; dev proxy `/api` → `:3001`.
- **Consequences**: Instant HMR; simple static build; API stays the only backend surface.

## AD-03 — Prisma + SQLite for persistence

- **Context**: MVP with modest data volume; zero-ops requirement (no external DB service).
- **Decision**: Prisma ^6 over SQLite (`prisma/dev.db`), migrations via `prisma migrate`.
- **Consequences**: Type-safe queries and schema-as-code; trivially replaceable by Postgres later if needed.

## AD-04 — Decoupled pipeline via event emitter

- **Context**: Ingestion, rule evaluation, and notification delivery must evolve independently.
- **Decision**: Modules communicate via internal events (`event.received`, `notification.generated`, `notification.sent`) instead of direct service calls.
- **Consequences**: Adding rules or providers touches one module; an out-of-process queue can replace the emitter later without changing contracts. Trade-off: in-process events are not durable — acceptable for the MVP.

## AD-05 — Idempotency via `eventId` primary-key lookup

- **Context**: IoT retransmissions must not duplicate notifications (Instructions.md §12).
- **Decision**: Payload `eventId` is the `Event` primary key; an `IdempotencyGuard` checks existence before processing and returns `200` with the stored event on replay.
- **Consequences**: No extra idempotency table; the guarantee is enforced by the PK itself; race conditions on concurrent duplicates are handled by the unique constraint.

## AD-06 — `NotificationProvider` abstraction

- **Context**: Real WhatsApp integration is out of MVP scope but must be pluggable later.
- **Decision**: `NotificationProvider` interface (`send(notification): Promise<SendResult>`); MVP ships `MockWhatsAppProvider` which marks `SENT` and logs.
- **Consequences**: A real provider is a new class + DI binding; tests inject failing providers to exercise the `FAILED` path.

## AD-07 — pnpm monorepo with `shared-types`

- **Context**: Backend and frontend need the same enums/types (event types, severity, DTO shapes).
- **Decision**: pnpm workspaces with `apps/backend`, `apps/frontend`, `packages/shared-types`.
- **Consequences**: Single source for types; no drift between consumer and producer of the API contract.

## AD-08 — Severity model

- **Context**: The assignment allows severity classification; rules need explicit levels.
- **Decision**: `CRITICAL` (equipment failure), `WARNING` (temperature, reservoir, silo), `INFO` (air humidity, soil moisture). Rationale in [`../business/business-rules.md` §3](../business/business-rules.md#severity-classification-rationale).
- **Consequences**: UI can badge notifications consistently; severity is data, not logic.

## AD-09 — All content in English

- **Context**: Mixed-language project (assignment in Portuguese, team decision).
- **Decision**: Documentation, code, identifiers, and notification messages in English. The farm's proper name (*Fazenda Boa Esperança*) is kept as a proper noun.
- **Consequences**: Consistent codebase and docs; message templates are data in one table, trivially localizable later.

## AD-10 — Stacked PRs + squash merges

- **Context**: Tickets are capped at 5 points; development must flow without waiting on reviews; PRs must stay concise.
- **Decision**: GitHub Stacked PRs managed with `gh stack`; one ticket = one layer = one PR; squash-merge bottom-up. Parallel work uses multiple independent stacks rooted at `main`.
- **Consequences**: Linear, reviewable history (one commit per ticket); `gh stack` handles `rebase --onto` after squash merges. See [`../workflow/pr-stacking.md`](../workflow/pr-stacking.md).

## AD-11 — `docs/` as single source of truth

- **Context**: Development is AI-assisted; agents need an authoritative, structured knowledge base.
- **Decision**: `docs/` (business, architecture, specs, workflow) is canonical; `PLANNING.md` is historical; behavior changes require same-PR doc updates.
- **Consequences**: AI agents load specs before coding; ambiguity escalates to the user instead of guessing.
