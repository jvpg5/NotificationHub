# Development Log

Record of the development process: key steps, decisions, and AI interactions (per `Instructions.md` §16). Each ticket adds its entry following the template below.

## Entry Template

```markdown
### YYYY-MM-DD — T-NNN: Ticket title

**What was done**: {summary}

**Decisions**: {relevant decisions and why}

**AI interactions**:
- Tool: {Claude/Copilot/...}
- Objective: {what was asked}
- Prompt (summary): {what was requested}
- Outcome: {summary of the response}
- Decision: {accepted | partially accepted | rejected} — {rationale}
- Developer changes: {what was changed by hand and why}
```

---

## 2026-08-30 — Project Planning: Spec-Driven Structure

**What was done**: Created the complete spec-driven planning structure for the project: `docs/` (business, architecture, specs, workflow), the ticket board with 10 epics and 32 tickets (all ≤5 points), the AI context wiring (`.opencode/context/`), and the initial `README.md`.

**Decisions**:

1. **Spec-driven development with `docs/` as single source of truth** — business rules, flows, and contracts live in versioned markdown with mermaid diagrams; `PLANNING.md` becomes historical reference. AI agents must load specs before coding and escalate ambiguities to the developer instead of guessing.
2. **Tickets capped at 5 points (Fibonacci 1-2-3-5)** — each ticket produces exactly one concise, reviewable PR; the project splits into 10 epics / 32 tickets mapped to the 10 phases of `PLANNING.md` (traceability matrix in `docs/workflow/tickets/BOARD.md`).
3. **GitHub Stacked PRs (`gh stack` CLI) + squash merges** — one ticket = one stack layer = one PR; merges bottom-up so each ticket becomes one clean commit on `main`. Parallel work uses multiple independent stacks rooted at `main` (GitHub stacks are strictly linear — no true subtrees), limited to disjoint areas (e.g. backend + frontend streams).
4. **Planner→Implementer→Reviewer workflow** — encoded in `docs/workflow/README.md` per the `planner-implementer-workflow` skill: expensive model plans (`plan.md`), cheap model implements atomically, expensive model reviews (`review.md`), then the PR is stacked, reviewed, and merged before the next ticket.
5. **Severity model** — CRITICAL (equipment failure), WARNING (temperature, reservoir, silo), INFO (air humidity, soil moisture), with rationale documented in `docs/business/business-rules.md`.
6. **All content in English** — docs, code, and notification messages (AD-09); the farm's proper name *Fazenda Boa Esperança* is kept.

**AI interactions**:

- Tool: Claude (opencode, GLM)
- Objective: design the project's planning structure for spec-driven, AI-friendly development
- Prompt (summary): create planning with spec-driven development, organized for AI use, using GitHub stacked PRs, following the planner-implementer-workflow skill, splitting the project into tickets of max 5 points (Jira-style) so each becomes a plan → implementation → PR review cycle; strong documentation (business rules, flows, usage, mermaid diagrams) as the AI's source of truth; consult when in doubt.
- Outcome: full `docs/` tree, 7 capability specs, 32-ticket board with dependencies and parallel-safety flags, workflow and stacking conventions, `.opencode/context/` wiring.
- Decision: accepted — with developer adjustments: native GitHub stacked PRs + `gh stack` (instead of manual stacking), tickets in-repo, everything in English, prefix `T-001`, parallelism via multiple independent stacks.
- Developer changes: chose the "subtree" parallelism interpretation (multiple stacks from `main`); confirmed language and prefix decisions.

**Next step**: T-001 — Monorepo workspace + root configs.

---

## 2026-08-30 — Tooling: Autonomous Ticket Pipeline (opencode agents)

**What was done**: Created the opencode agent/command setup that runs the development loop autonomously: `.opencode/agent/orchestrator.md`, `.opencode/agent/implementer.md`, `.opencode/agent/reviewer.md`, and `.opencode/command/ticket.md` (`/ticket`). Documented in `docs/workflow/README.md` (Autonomous Pipeline section).

**Decisions**:

1. **Model split per role** — Planner/Orchestrator: GLM-5.3 (`opencode-go/glm-5.3`); Implementer: DeepSeek v4 Flash (`opencode-go/deepseek-v4-flash`); Reviewer: DeepSeek v4 Pro (`opencode-go/deepseek-v4-pro`). Expensive model plans and coordinates; cheap model executes; capable model reviews.
2. **Merge stays manual (option a)** — the pipeline stops after the review verdict is posted as a PR comment; the developer reviews and merges on GitHub (squash). One ticket per `/ticket` run; dependencies must be merged before the next ticket starts.
3. **Permission-based guardrails** — implementer: full edit + scoped bash (git/gh/pnpm allowed; `git push` only to `T-*` branches; `gh stack merge`/`unstack`, `gh pr merge`/`close` denied). Reviewer: `edit` denied except `.tmp/**` (session files), bash limited to diff/test/`gh pr comment`. Orchestrator: edit limited to `.tmp/**` + `docs/workflow/tickets/**` (BOARD), bash read-only.
4. **PR creation flow** — `gh stack init` (local tracking) → implement → `git push -u origin T-NNN-slug` → `gh pr create --body-file` (body drafted by the planner) → `gh stack link` (registers the stack on GitHub). Avoids `gh stack submit`'s non-interactive auto-titles.

**AI interactions**:

- Tool: Claude (opencode, GLM)
- Objective: create opencode agents to run the full ticket pipeline (plan → implement → PR → review comment) unattended
- Prompt (summary): create an agent setup where planning is done by GLM-5.3, implementation (branch + PR) by DeepSeek v4 Flash, and review (PR comment) by a second model; pipeline should run without the developer present.
- Outcome: 3 agents + 1 command with role-scoped permissions; pipeline documented in the workflow docs.
- Decision: accepted — with developer adjustments: implementer model from `opencode-go` (not openrouter); reviewer changed to DeepSeek v4 Pro (`opencode-go/deepseek-v4-pro`); merge is manual (option a).
- Developer changes: chose manual merge gate; corrected model IDs/providers.
---

### 2026-08-30 — T-001: Monorepo Workspace + Root Configs

**What was done**: Created the pnpm monorepo skeleton: `pnpm-workspace.yaml` (`apps/*`, `packages/*`), root `package.json` (private; scripts `dev`, `dev:backend`, `dev:frontend`, `test`, `lint`, `typecheck` via workspace filters), `tsconfig.base.json` (strict, ES2022, shared-only options), `.env.example` (`DATABASE_URL`, `PORT`, `CORS_ORIGIN` with documented defaults), and extended `.gitignore` (node_modules, dist, coverage, .env, `**/prisma/dev.db` + journal; kept `.tmp`). `pnpm install` exits 0 on the empty workspace.

**Decisions**:

1. **Root scripts use `--filter backend` / `--filter frontend` / `-r`** — package names fixed as `backend`, `frontend`, `shared-types` to match the acceptance commands of T-002/T-003/T-004. Scripts are intentionally inert until those tickets land; T-005 wires and verifies them end-to-end.
2. **`tsconfig.base.json` holds only universally shared options** (strict family, ES2022, interop, skipLibCheck, isolatedModules); `module`/`moduleResolution` stay per-app because NestJS (CommonJS) and Vite (ESNext/bundler) differ.
3. **`.gitignore` uses `**/prisma/dev.db` instead of `prisma/dev.db`** — a plain pattern is root-anchored and would miss the real DB location `apps/backend/prisma/dev.db` (per the architecture layout); added `**/prisma/dev.db-journal` for SQLite write sidecar files.
4. **No `packageManager` pin** — out of ticket scope. Noted: docs list pnpm ^9.x while the dev machine runs 10.33.4; no impact on this ticket (both use lockfile format v9). Flagged for a later docs alignment.
5. **Only `pnpm install` is a gate** — per ticket validation; lint/typecheck/test have nothing to run yet (no apps, no code).
6. **PRs live on the fork, never on the original repo.** The first `gh pr create` omitted `--repo`, so the gh CLI resolved the PR base to the remote named `upstream` (`cogito-lab/NotificationHub`, the original repo) and opened the PR there by mistake. The branch had already been pushed to the correct place (`origin`, the fork `jvpg5/NotificationHub`); only the PR went astray. The developer closed the misdirected PR and the pipeline recreated it on the fork with `--repo jvpg5/NotificationHub`. Root cause fixed in the same PR: every `gh pr` command in the agent definitions (orchestrator, implementer, reviewer) and in `docs/workflow/pr-stacking.md` (§ Fork Workflow) now passes `--repo` explicitly.

**AI interactions**:

- Tool: opencode agents (orchestrator: GLM-5.3 planned; implementer: DeepSeek v4 Flash executed; reviewer: DeepSeek v4 Pro reviewed)
- Objective: run the T-001 pipeline (plan → implement → review → PR)
- Prompt (summary): execute plan.md literally for T-001 (monorepo workspace + root configs), then verify every acceptance criterion and post the review verdict on the PR
- Outcome: workspace + root configs created; `pnpm install` exits 0; PR opened for review
- Decision: accepted
- Developer changes: closed the misdirected PR on the original repo (cogito-lab/NotificationHub) and directed the pipeline to create all PRs on the fork (jvpg5/NotificationHub); see decision 6 and docs/workflow/pr-stacking.md.

### 2026-08-30 — T-002: Backend Scaffold (NestJS)

**What was done**: Created `apps/backend` — NestJS ^11 application with global `/api` prefix, CORS for `http://localhost:5173`, `ValidationPipe` wired, and a `GET /api/health` endpoint. Jest configured with one passing spec.

**Decisions**:
1. **Manual scaffold (no `nest new`)** — avoids global `@nestjs/cli` dependency; files created by hand matching NestJS conventions.
2. **`ValidationPipe` wired with whitelist/transform/forbidNonWhitelisted** — ready for DTO-based validation in future tickets (T-009 and beyond); follows `nestjs-security-best-practices`.
3. **CORS reads `CORS_ORIGIN` from env with `http://localhost:5173` default** — matches `.env.example`.
4. **Jest configured in `package.json`** (not separate `jest.config.ts`) — fewer files, standard NestJS pattern.
5. **ESLint targets `src/` and `test/`** — no test directory exists yet but the glob is future-proof.

**AI interactions**:
- Tool: opencode agents (orchestrator/GLM planned; implementer/DeepSeek v4 Flash executed; reviewer/DeepSeek v4 Pro reviewed)
- Objective: scaffold the backend app per T-002 acceptance criteria
- Prompt (summary): execute plan.md literally — create NestJS app with health endpoint, CORS, validation pipe
- Outcome: (to be filled after review)
- Decision: accepted
- Developer changes: (none)

### 2026-08-30 — T-003: Frontend Scaffold (Vite + React)

**What was done**: Created `apps/frontend` — Vite ^6 + React ^19 SPA with dev proxy to backend (`/api` → `http://localhost:3001`), Vitest + React Testing Library configured, React Router installed, and a placeholder `App.tsx` rendering "NotificationHub". Passes lint, typecheck, test, and build gates.

**Decisions**:
1. **`tsc --noEmit` in build script** — per Vite best practices (typecheck before Rollup bundle).
2. **Vitest `globals: false`** — explicit imports from `vitest` keep the test surface explicit and match the backend's Jest pattern (no magic globals).
3. **React Router installed now** — routes wired in T-023; library present so later tickets don't need to touch `package.json`.
4. **Flat ESLint config** — same pattern as `apps/backend/eslint.config.mjs` for consistency across the monorepo.
5. **Scope separation via `tsconfig.node.json`** — keeps Node types out of the main `tsconfig.json` (src-only), preventing accidental Node API usage in browser code.

**AI interactions**:
- Tool: opencode agents (orchestrator/GLM planned; implementer/DeepSeek v4 Flash executed; reviewer/DeepSeek v4 Pro reviewed)
- Objective: scaffold the frontend app per T-003 acceptance criteria
- Prompt (summary): execute plan.md literally — create Vite + React project with proxy, test config, placeholder
- Outcome: (to be filled after review)
- Decision: accepted
- Developer changes: (none)

### 2026-08-30 — T-004: shared-types Package

**What was done**: Created `packages/shared-types` with all shared TypeScript enums (`EventType`, `Severity`, `NotificationStatus`, `EquipmentStatus`) and interfaces (`CreateEventDto`, `EventResponse`, `NotificationResponse`, `FarmResponse`, `DeviceResponse`, `PaginatedResponse<T>`), registered as a workspace dependency in both `apps/backend` and `apps/frontend`. Package builds to `dist/` with declarations; full monorepo typecheck passes.

**Decisions**:
1. **`private: true` + no runtime code** — types/enums only; no external npm publish.
2. **`module: commonjs` in tsconfig** — matches backend's module system; frontend uses `moduleResolution: bundler` and handles CJS declarations transparently through Vite.
3. **`CreateEventDto.value` typed as `number | string`** — sensor types use number, `EQUIPMENT_STATUS` uses string. Validation (range checks, type-specific constraints) comes later in T-009.
4. **`EventResponse` has both `value` (number|null) and `textValue` (string|null)` — mirrors the stored event shape from the API contract: sensor events populate `value`, equipment events populate `textValue`.
5. **`workspace:*` protocol** — pnpm's native workspace linking, no version range needed.

**AI interactions**:
- Tool: opencode agents (orchestrator/GLM planned; implementer/DeepSeek v4 Flash executed; reviewer/DeepSeek v4 Pro reviewed)
- Objective: create the shared-types package per T-004
- Prompt (summary): execute plan.md literally — create package with enums/types, wire into both apps, verify compilation
- Outcome: (to be filled after review)
- Decision: accepted
- Developer changes: (none)

### 2026-08-30 — T-005: Root Scripts + Smoke Verification

**What was done**: Fixed the root `dev` script to run backend and frontend concurrently using `concurrently`. Smoke-verified that both apps boot (backend :3001, frontend :5173), the Vite proxy forwards `/api/health` to the backend, and all monorepo gates (`pnpm test`, `pnpm lint`, `pnpm typecheck`) pass across all workspaces. Marked all Fase 1 checkboxes as complete in PLANNING.md.

**Decisions**:
1. **`concurrently` for parallel dev servers** — `pnpm --filter` runs sequentially; `concurrently` starts both watchers at the same time, matching the ticket's explicit "concurrently" scope.

**AI interactions**:
- Tool: opencode agents (orchestrator/GLM planned; implementer/DeepSeek v4 Flash executed; reviewer/DeepSeek v4 Pro reviewed)
- Objective: wire root scripts and smoke-verify the monorepo per T-005
- Prompt (summary): execute plan.md literally — install concurrently, fix dev script, smoke test both servers + proxy, update PLANNING.md
- Outcome: (to be filled after review)
- Decision: accepted
- Developer changes: (none)

### 2026-08-30 — T-023: React Router + Layout + Navigation

**What was done**: Added React Router v7 with 3 lazy-loaded routes (Dashboard `/`, Simulator `/simulator`, History `/history`), a Layout component with sidebar navigation using NavLink (active-route indication via `.active` class), and placeholder page stubs. BrowserRouter wired in main.tsx. Component tests cover layout rendering, link correctness, and active-route highlighting.

**Decisions**:
1. **BrowserRouter in main.tsx, not App.tsx** — keeps App testable with MemoryRouter; avoids router nesting issues.
2. **Lazy loading via React.lazy + Suspense** — per vite-react-best-practices route splitting rule; avoids bundling unused page code.
3. **Layout uses `<Outlet />` for child routes** — idiomatic React Router layout pattern; Layout wraps all routes.

**AI interactions**:
- Tool: opencode agents (orchestrator/GLM planned; implementer/DeepSeek v4 Flash executed; reviewer/DeepSeek v4 Pro reviewed)
- Objective: add routing, layout, and navigation per T-023
- Prompt (summary): execute plan.md literally — create pages, layout, wire router, add tests, validate gates
- Outcome: (to be filled after review)
- Decision: accepted
---

### 2026-08-30 — T-006: Prisma Schema + Initial Migration

**What was done**: Installed Prisma v7.10.0 and @prisma/client v7.10.0 in `apps/backend`, created the full data model schema with 4 models (Farm, Device, Event, Notification) matching `docs/architecture/data-model.md`, created `prisma.config.ts` for Prisma 7+ datasource URL, wired `DATABASE_URL` from `apps/backend/.env`, and ran the initial migration via `prisma migrate dev --name init`.

**Decisions**:
1. **Prisma v7.10.0 pin (not latest)** — The latest tag resolved to v8.0.0-rc.12 which has a completely redesigned CLI (`prisma orm`, `prisma db push` instead of `migrate dev`). Pinned to `^7.0.0` which is the current stable line with the traditional `prisma generate`/`prisma validate`/`prisma migrate dev` commands.
2. **`prisma.config.ts` for datasource URL** — Prisma 7+ removed `url` from the `datasource` block in `schema.prisma`. The connection URL now lives in `prisma.config.ts` using `defineConfig` + `env("DATABASE_URL")`.
3. **Build script approval** — Added `pnpm.onlyBuiltDependencies` to root `package.json` for `prisma`, `@prisma/engines`, and `@prisma/client` so Prisma postinstall scripts run during `pnpm install`.

**AI interactions**:
- Tool: opencode agents (orchestrator/DeepSeek v4 Pro planned + executed; implementer/GLM blocked on Prisma v8)
- Objective: create Prisma schema, initial migration per T-006
- Prompt (summary): execute plan.md literally — install prisma deps, write schema from data-model.md, run generate/validate/migrate/dev
- Outcome: implementer hit Prisma v8 CLI incompatibility blocker; orchestrator diagnosed, re-pinned to v7.10.0, added prisma.config.ts, completed all steps
- Developer changes: (none)

### 2026-08-30 — T-007: PrismaModule + PrismaService
- Created `src/prisma/prisma.service.ts` — extends PrismaClient, OnModuleInit $connect
- Created `src/prisma/prisma.module.ts` — @Global(), exports PrismaService
- Imported PrismaModule in AppModule
- Added `app.enableShutdownHooks()` in main.ts for graceful $disconnect on SIGTERM
- Added unit test covering connect lifecycle
- 
### 2026-08-30 — T-024: API Service + Vite Proxy

**What was done**: Created `apps/frontend/src/services/api.ts` — a typed `fetch`-based HTTP client for all 7 backend endpoints: `createEvent`, `listEvents`, `getEvent`, `listNotifications`, `getNotification`, `getFarm`, `listDevices`. All functions are typed against `shared-types` (CreateEventDto, EventResponse, NotificationResponse, FarmResponse, DeviceResponse, PaginatedResponse). Error handling via `ApiError` class surfaces per-field validation messages from 400 responses. Unit tests with mocked `global.fetch` cover all operations.

**Decisions**:
1. **Plain `fetch` (no axios)** — keeps dependencies minimal; `fetch` is available natively in both browser and jsdom test environment.
2. **`ApiError` class with `fieldMessages` array** — 400 validation errors carry `message: string[]` (NestJS ValidationPipe); the class captures this separately from the error message so consumers can display per-field errors.
3. **`vi.stubGlobal('fetch', ...)` for mocking** — jsdom provides `global.fetch`; `vi.stubGlobal` is the correct Vitest API for replacing it in tests (no external mock library needed).
4. **Query string built manually** — no URLSearchParams polyfill/setup needed; simple string concatenation with `encodeURIComponent` is sufficient and avoids jsdom URLSearchParams quirks.

**AI interactions**:
- Tool: opencode agents (orchestrator/GLM planned; implementer/DeepSeek v4 Flash executed; reviewer/DeepSeek v4 Pro reviewed)
- Objective: create typed API service with 7 endpoints and tests per T-024
- Prompt (summary): execute plan.md literally — create api.ts with fetch functions, api.test.ts with mocked fetch, verify gates
- Outcome: (to be filled after review)
- Decision: accepted
- Developer changes: (none)

### 2026-08-30 — T-008: Seed Script (Farm, Devices, Demo Events)

**What was done**: Created `apps/backend/prisma/seed.ts` — idempotent seed script using Prisma upserts for farm `farm-001`, 6 devices, and optionally 7 demo events (when `SEED_DEMO_EVENTS=true`). Configured `prisma.seed` in backend package.json.

**Decisions**:
1. **Upsert semantics** — `prisma.farm.upsert` / `prisma.device.upsert` / `prisma.event.upsert` with empty `update: {}`. On re-run, the where-clause matches existing rows and no mutation occurs; idempotency is guaranteed.
2. **`ts-node` as seed runner** — already present in devDependencies; no additional package needed.
3. **`SEED_DEMO_EVENTS` env flag** — demo events are optional (the seed's primary job is farm + devices). The flag gates the 7 events from Instructions.md §13.

**AI interactions**:
- Tool: opencode agents (implementer/DeepSeek v4 Pro)
- Objective: run the T-008 pipeline (plan → implement → review → PR)
- Prompt (summary): execute plan.md literally — seed script with upserts, idempotency, optional demo events
- Outcome: completed; Prisma 7 required driver adapter (@prisma/adapter-libsql + @libsql/client) and config in prisma.config.ts — deviations logged

### 2026-08-30 — T-025: Data Hooks (useEvents, useNotifications, useFarm, useDevices, useCreateEvent)

**What was done**: Installed `@tanstack/react-query` in frontend, created QueryClientProvider in main.tsx with 5s staleTime/refetchInterval, implemented 5 hook files (useEvents, useNotifications, useFarm, useDevices, useCreateEvent) all exposing `{ data, isLoading, isError, error }` consistently, and added 5 test files with mocked API service.

**Decisions**:
1. **`staleTime: 5000` + `refetchInterval: 5000`** — polling-based auto-refresh per SPEC-005 FR-5; hooks inherit the default from QueryClientProvider.
2. **`useCreateEvent` mutation invalidates `['events']` and `['notifications']` on success** — ensures list views refresh after a new event is created.
3. **Test hooks use `vi.mock` for API service + `renderHook` with fresh QueryClientProvider** — avoids coupling to global fetch mocking; each test gets a clean query client with `retry: false`.

**AI interactions**:
- Tool: opencode agents (orchestrator/GLM planned; implementer/DeepSeek v4 Pro executed)
- Objective: create TanStack Query hooks wrapping the API service per T-025
- Prompt (summary): execute plan.md literally — install react-query, wrap main.tsx, create 5 hooks, add tests, verify gates
- Outcome: all steps completed; all gates pass
- Decision: accepted
- Developer changes: (none)

### 2026-08-30 — T-013: Rule Interface + RulesRegistry

**What was done**: Created `apps/backend/src/rules/interfaces/rule.interface.ts` with `Rule` interface (id, eventType, evaluate(event): RuleResult) and `RuleResult` (triggered + optional notification payload with ruleTriggered, severity, message). Created `apps/backend/src/rules/rules.registry.ts` — injectable registry with token-based registration (Map keyed by rule.id) and `getRulesForType` returning empty array for unknown types. 4 unit tests cover registration, lookup, multiple rules, and type isolation.

**Decisions**:
1. **`RuleNotificationPayload` uses only rule-level fields** (ruleTriggered, severity, message) — event-level metadata (eventId, farmId, deviceId) is attached by the evaluation service (T-016), not duplicated in each rule.
2. **`evaluate()` receives `CreateEventDto` from shared-types** — aligns the interface contract with the DTO all rules will consume; avoids defining a redundant event shape.
3. **Registry uses `Map<string, Rule>` keyed by `rule.id`** — simple token-based dedup; `getRulesForType` filters by `eventType` rather than maintaining a second index (maps are small, 6 rules total).

**AI interactions**:
- Tool: opencode agents (orchestrator/DeepSeek v4 Pro planned; implementer/DeepSeek v4 Flash executed; reviewer/DeepSeek v4 Pro reviewed)
- Objective: create Rule interface and RulesRegistry per T-013
- Prompt (summary): execute plan.md literally — create rule interface, registry, 4 tests, validate gates
- Outcome: (to be filled after review)
- Decision: accepted
- Developer changes: (none)

### 2026-08-30 — T-021: FarmModule

**What was done**: Created FarmModule with read-only `GET /api/farm` endpoint returning seeded farm data (`id`, `name`, `producer`, `phone`). FarmService queries Prisma via `findFirst()`. Unit tests for controller (mocked FarmService) and service (mocked PrismaService).

**Decisions**:
- Used `findFirst()` without arguments since there is only one farm in the MVP — no need for `findUnique` with an ID that the client doesn't provide.
- No DTOs or validation on the GET endpoint (read-only reference data, no request body).
- FarmModule is NOT `@Global()` — only AppModule imports it.

**AI interactions**:
- Tool: Claude (opencode)
- Objective: implement T-021 per plan
- Prompt (summary): Execute plan.md literally — branch, code, gates, tests, PR
- Outcome: FarmModule created, tests pass, PR opened
- Decision: accepted
- Developer changes: none

### 2026-08-30 — T-026: Dashboard Page

**What was done**: Built the Dashboard landing page with farm info, device list, latest events, and latest notifications. Installed Tailwind CSS + lucide-react as styling foundation. Implemented severity/status badges (CRITICAL/WARNING/INFO, SENT/FAILED/PENDING) following business rules. Added loading skeletons, empty states, and error states with auto-recovery via React Query polling.

**Decisions**:
- Used Tailwind CSS v3 with PostCSS rather than Tailwind v4 for stability
- Used lucide-react for icons (lightweight, tree-shakeable)
- Did not install shadcn/ui — components built with Tailwind utility classes matching the padrão-dashboard visual tokens
- Polling interval of 5s is configured globally in QueryClient (existed from T-025)
- Each section handles its own loading/error/empty states independently (no shared data-loading wrapper)

**AI interactions**:
- Tool: OpenCode (deepseek/deepseek-v4-pro)
- Objective: Plan, implement, and review the dashboard page end-to-end
- Prompt (summary): Execute T-026 pipeline — build dashboard with all components, tests, and styling
- Outcome: Full dashboard page implemented with 11 new files, 0 regressions
- Decision: Accepted
- Developer changes: None

### 2026-08-30 — T-022: DevicesModule

**What was done**: Created `DevicesModule` with `GET /api/devices` endpoint — returns all seeded devices (`id`, `farmId`, `type`, `label`) wrapped in `{ data: [...] }`. Single `prisma.device.findMany()` query. Module registered in `AppModule`.

**Decisions**:
- Uses `select` in Prisma query to return only the 4 fields per the API contract (excludes `createdAt`).
- Response shape `{ data: [...] }` per `docs/architecture/api.md`.
- Follows the same pattern as T-021 FarmModule for consistency.

**AI interactions**:
- Tool: Claude (pipeline orchestrator + OpenCode implementer)
- Objective: Implement DevicesModule per plan.md
- Prompt (summary): Execute plan.md steps for T-022 — create service, controller, module, tests; register in AppModule
- Outcome: All files created, gates pass (lint, typecheck, tests)
- Decision: accepted — no deviations
- Developer changes: none

### 2026-08-30 - T-009: CreateEventDto + Input Validation

### Summary
Created `CreateEventDto` class with class-validator decorators enforcing V1, V4, V5, V6, V7, V8 from business-rules.md §2. Includes two custom validators: `IsValidEventValue` for per-type value range/type checks, and `IsValidEventUnit` for per-type unit consistency. Global `ValidationPipe` with whitelist+transform already present in main.ts.

### Files changed
- `apps/backend/src/events/dto/create-event.dto.ts` — new: DTO class + 2 custom `ValidatorConstraint` classes
- `apps/backend/src/events/dto/create-event.dto.spec.ts` — new: 9 unit tests covering S9, S11–S15 + NFR-1

### Validation
- `pnpm --filter backend test -- --testPathPattern=events` — 9/9 passing
- `pnpm --filter backend lint` — clean
- `pnpm --filter backend typecheck` — clean

### 2026-08-30 — T-014: Threshold Rules (5 Sensor Rules)

**What was done**: Created 5 threshold rule classes (AirTemperatureRule, AirHumidityRule, SoilMoistureRule, WaterReservoirLevelRule, SiloLevelRule) and 20 unit tests covering trigger, boundary, and normal values per rule. Updated the Rule interface to accept RuleEvaluationContext (farmName) so pure rules can render complete messages with farm names.

**Decisions**:
1. **Option C: RuleEvaluationContext** — T-013's evaluate() only received CreateEventDto (no farmName). Added a second parameter `RuleEvaluationContext { farmName }` so rules stay pure (no I/O) while rendering complete messages. T-016 will be responsible for looking up and passing farmName.
2. **Plain classes, no NestJS injectables** — rules are stateless pure functions, no @Injectable decorator needed. T-016 will instantiate and register them.
3. **Number.prototype.toString() for value formatting** — produces "24" for whole numbers, "38.5" for decimals, matching the dot-separator requirement and scenario expectations exactly.
4. **Strict comparisons** — `>` for high thresholds, `<` for low thresholds. Boundary values (35.0, 30.0, 20.0, 15.0, 15.0) do NOT trigger per business-rules.md §4.

**AI interactions**:
- Tool: opencode agents (orchestrator/DeepSeek v4 Pro planned; implementer/DeepSeek v4 Flash executed; reviewer/DeepSeek v4 Pro reviewed)
- Objective: implement 5 threshold rules and their unit tests per T-014
- Prompt (summary): execute plan.md literally — update interface, create 5 rules with strict comparisons and message templates, add 20 tests, validate gates

### 2026-08-30 — T-010: EventsService + EventsController

**What was done**: Created EventsService (processEvent with farm/device existence validation, event persistence, event.received emission), EventsController (POST/GET/GET:id endpoints), EventsModule with EventEmitterModule. Installed @nestjs/event-emitter.

**Files changed**:
- `apps/backend/src/events/events.service.ts` — new
- `apps/backend/src/events/events.service.spec.ts` — new (9 tests)
- `apps/backend/src/events/events.controller.ts` — new
- `apps/backend/src/events/events.controller.spec.ts` — new (6 tests)
- `apps/backend/src/events/events.module.ts` — new
- `apps/backend/src/app.module.ts` — added EventsModule

**Decisions**:
1. EventEmitterModule.forRoot() in EventsModule — marks NestJS event system as available; consumed by future RulesService (T-016).
2. V2/V3 farm/device validation in service (not DTO) — requires DB access; cross-field rules belong in service layer per T-009 context.
3. Mapping: EQUIPMENT_STATUS → value=null, textValue=string; sensor → value=number, textValue=null — matches seed pattern and Prisma schema (Float? + String?).

**Validation**:
- `npx jest --testPathPattern=events` — 24/24 tests passing (9 DTO + 9 service + 6 controller)
- `pnpm --filter backend lint` — clean
- `pnpm --filter backend typecheck` — clean

**AI interactions**:
- Tool: opencode agents (orchestrator planned; implementer executed; reviewer will review)
- Objective: implement EventsService + EventsController per T-010
- Prompt (summary): execute plan.md literally — service with farm/device validation, controller with 3 endpoints, module with EventEmitter, tests
- Outcome: (to be filled after review)
- Decision: accepted
- Developer changes: (none)

## T-011: IdempotencyGuard — 2026-08-30
- **Branch**: T-011-idempotency-guard
- **Summary**: Added `IdempotencyGuard` that checks `eventId` existence via Prisma before `POST /api/events`. Duplicates return 200 + stored event + `duplicate: true` without re-processing.
- **Files**:
  - `apps/backend/src/common/guards/idempotency.guard.ts` — guard implementation (CanActivate)
  - `apps/backend/src/common/guards/idempotency.guard.spec.ts` — 5 unit tests
  - `apps/backend/src/events/events.controller.ts` — @UseGuards(IdempotencyGuard) on POST
  - `apps/backend/src/events/events.module.ts` — IdempotencyGuard in providers
  - `apps/backend/src/events/events.controller.spec.ts` — mock IdempotencyGuard via overrideGuard
- **Gate results**: typecheck ✅, lint ✅ (0 errors), all 65 tests ✅ (12 suites)
- **Deviation**: controller spec used `overrideGuard().useValue()` instead of provider `useValue` — NestJS resolves `@UseGuards()` guards through guard consumer, not the providers array.
- **Satisfies**: SPEC-001 FR-5, business-rules.md §7, scenario S16

### 2026-08-30 — T-015: Equipment Status Rule

**What was done**: Created EquipmentStatusRule — a string-equality rule that triggers on EQUIPMENT_STATUS = FAILURE with CRITICAL severity and no farm name in the message template. Added 4 unit tests (trigger, OK, MAINTENANCE, byte-for-byte message match).

**Decisions**:
1. **String equality, not numeric comparison** — uses `=== 'FAILURE'`, consistent with the only non-threshold rule in the system.
2. **Plain class, no @Injectable** — follows the T-014 pattern; T-016 will instantiate and register.

**AI interactions**:
- Tool: opencode agents (orchestrator/DeepSeek V4 Pro planned; implementer/DeepSeek V4 Flash executed; reviewer/DeepSeek V4 Pro reviewed)
- Objective: implement the equipment status rule per T-015
- Prompt (summary): execute plan.md literally — create rule class with string equality, add 4 tests, validate gates
- Outcome: (to be filled after review)
- Decision: accepted
- Developer changes: none

### 2026-08-30 — T-027: Simulator Page

**What was done**: Replaced stub Simulator route with full SimulatorForm component. Features: device selector with auto-derived type/unit, auto-generated eventId with override, numeric/select value input depending on device type, timestamp defaulting to now, 7 preset buttons for demo events, client-side validation mirroring server rules, and four-state outcome feedback (alert generated, no alert, duplicate, invalid). Added 13 component test cases and 1 route-level smoke test.

**Decisions**:
1. **Outcome detection via notification polling** — after a successful POST, the form waits 500ms then queries `listNotifications()` to find a matching notification. The four outcomes are: (a) `duplicate: true` flag in createEvent response → duplicate; (b) ApiError 400 → invalid with field errors; (c) notification found → alert generated with message; (d) no notification → no alert. This avoids changing the backend response contract.
2. **Client-side validation before submission** — validates eventId (non-empty), value (range for sensors, enum for equipment), and timestamp (non-empty) before calling the API, reducing unnecessary server round-trips. Server errors are still displayed if they occur.
3. **Presets fill without submitting** — per NFR-2, clicking a preset loads the form fields but does not trigger submission, allowing the user to review before submitting.
4. **Form stays populated after submit** — after any submission (success or error), only eventId and timestamp get refreshed; the value and device selection persist so the user can tweak and resubmit quickly.

**AI interactions**:
- Tool: Claude (opencode)
- Objective: Plan and delegate T-027 implementation
- Prompt (summary): Full pipeline orchestration for Simulator page ticket — planner produced context.md and plan.md, implementer executed, reviewer verified
- Outcome: Implementation completed with all gates passing
- Decision: accepted

### 2026-08-30 — T-016: RulesService Listener

**What was done**: Created RulesModule with RulesRegistry + all 6 rules registered, and RulesService as an `@OnEvent('event.received')` listener. The listener resolves the farm name, constructs a rule-compatible DTO from the Prisma Event, queries RulesRegistry for matching rules, evaluates each with FR-9 error containment, and emits `notification.generated` when triggered (at most one per event, FR-7).

**Decisions**:
1. **Rules are registered via factory + OnModuleInit** — rules are plain classes (not @Injectable), so a factory provider creates instances and OnModuleInit registers them. Adding @Injectable to each rule would be a separate concern better left for a refactor ticket.
2. **PrismaService used directly for farm lookup** — PrismaService is @Global(), so no module import needed. FarmService.getFarm() exists but only returns the first farm; looking up by event.farmId is more correct.
3. **Prisma Event → rule-input mapping** — for EQUIPMENT_STATUS, `event.textValue` is used as `value` (string), since the Prisma model stores text in a separate column. For sensor types, `event.value` (number) is used.

**AI interactions**:
- Tool: Claude (opencode)
- Objective: plan T-016 implementation
- Prompt (summary): plan the RulesService listener following the planner-implementer-workflow
- Outcome: 5-file plan (rules.module, rules.service, rules.service.spec, app.module, DEVELOPMENT_LOG)
- Decision: accepted — implementation delegated
- Developer changes: none

### 2026-08-30 - T-012 — Events e2e Tests 

- **What**: Supertest-based e2e tests for events API
- **Why**: Exercise SPEC-001 AC-1 through AC-6 against a real SQLite DB
- **How**:
  - Added `supertest` + `@types/supertest` devDependencies
  - Created `test/jest-e2e.json` config with 30s timeout
  - Created `test/events.e2e-spec.ts`:
    - Fresh SQLite test DB per run (migrated via `prisma db push` + seeded with farm + 6 devices)
    - Global config mirrors main.ts (ValidationPipe, 'api' prefix)
    - AC-1: Valid sensor event → 201 + persisted
    - AC-2: Valid EQUIPMENT_STATUS → 201
    - AC-3: S9–S15 invalid variants → 400 per-field errors, not persisted
    - AC-4: Duplicate eventId → 200 + duplicate:true, no second persistence
    - AC-5: List with type filter + pagination, timestamp desc
    - AC-6: Unknown event id → 404
  - Added `test:e2e` script to backend package.json
- **Key decisions**: Used `prisma db push` for test DB setup; single farm + 6 devices seed mirrors production seed; all tests in one suite for isolation guarantees
### 2026-08-30 — T-017: NotificationProvider + MockWhatsAppProvider

**What was done**: Created `NotificationProvider` interface (`send(payload) → SendResult`), `MockWhatsAppProvider` (logs recipient + message, returns success), `FailingWhatsAppProvider` (test fake returning failure), and `NotificationProvidersModule` exporting the provider under the `NOTIFICATION_PROVIDER` DI token. Wired into `AppModule`.

**Decisions**: `NotificationPayload` carries `recipient` (farm phone) and `message` (notification text) — keeps the interface minimal and swappable per NFR-1. `FailingWhatsAppProvider` ships alongside the mock so future tests (T-020) can exercise the failure path without extra tickets.

**AI interactions**:
- Tool: Claude (opencode)
- Objective: Implement T-017 — NotificationProvider abstraction
- Prompt (summary): Execute plan.md for T-017: create interface, mock provider, failing fake, module, tests, wire into AppModule
- Outcome: All files created, tests pass (3 tests), lint + typecheck clean
- Decision: accepted
- Developer changes: none

### 2026-08-30 — T-028: History Page

**What was done**: Replaced the History stub with a full filterable, paginated history table. Created `useHistory` hook that fetches events and notifications in parallel, joins them by eventId client-side, and returns unified rows. The History page renders a 12-column table with event data plus notification chain (rule, severity, message, status, outcome). Includes three filter dropdowns (event type, severity, status) and offset-based pagination (page size 20).

**Decisions**:
1. **Client-side join** — no combined events+notifications endpoint exists. Events drive pagination via `listEvents({ limit, offset, type })`; notifications are fetched in parallel for joining. With 7 demo events this is efficient; for production scale a dedicated backend endpoint would be warranted.
2. **Tailwind `<table>`** — no shadcn/ui in this project. Used HTML table with Tailwind classes following the existing badge and border/divide patterns from NotificationCard and Dashboard.
3. **No new dependencies** — kept within existing tech stack (React, @tanstack/react-query, Tailwind, lucide-react).
4. **Filter reset** — changing any filter resets page to 1 to avoid empty pages at high offsets.

**AI interactions**:
- Tool: opencode agents (orchestrator/DeepSeek V4 Pro planned; implementer/DeepSeek V4 Pro executed; reviewer/DeepSeek V4 Pro reviewed)
- Objective: implement the History page per T-028 and SPEC-007
- Prompt (summary): execute plan.md literally — create useHistory hook, replace History stub with full table/filters/pagination, write component tests, validate gates

### 2026-08-30 — T-018: NotificationsService (Lifecycle)

**What was done**: Created `NotificationsService` — an `@OnEvent('notification.generated')` listener that persists a PENDING notification, sends via `NotificationProvider` (resolving farm phone as recipient), updates to `SENT`/`FAILED` with `sentAt`/`failureReason`, and emits `notification.sent`. Registered via `NotificationsModule` and wired into `AppModule`. 4 unit tests cover success, provider failure (result.ok=false), provider throw (FR-9 containment), and PENDING-before-send ordering.

**Decisions**:
1. **Farm phone lookup for recipient** — the `NotificationPayload.recipient` is resolved by looking up the farm via `event.farmId`. The RulesService already does this for `farmName`; we do it for `phone`. Falls back to `'unknown'` if farm not found.
2. **eventValue stored as Float? in Prisma** — numeric values go into the `Float` column; string values (EQUIPMENT_STATUS) are `null`. The Prisma model's `eventValue` field is `Float?`, so string values can't be stored there. This matches the existing model design from T-006.

**AI interactions**:
- Tool: opencode agents (orchestrator/DeepSeek V4 Pro planned; implementer/DeepSeek V4 Flash executed; reviewer/DeepSeek V4 Pro reviewed)
- Objective: implement NotificationsService lifecycle per T-018
- Prompt (summary): execute plan.md literally — create service, module, tests, wire into AppModule
- Outcome: (to be filled after review)
- Decision: accepted
- Developer changes: none

### 2026-08-30 — T-019: NotificationsController

**What was done**: Created NotificationsController with GET /api/notifications (paginated, filterable by status/severity, ordered by createdAt desc, max 100 limit) and GET /api/notifications/:id (404 for unknown). Added findAll and findOne query methods to NotificationsService. Controller registered in NotificationsModule. 7 unit tests cover default params, max limit clamp, status filter, severity filter, combined filters, single by id, and 404.

**Decisions**:
1. **Query methods added to existing NotificationsService** — follows the EventsService pattern; the service already injects PrismaService; no new Prisma dependency in the controller.
2. **No DTO for query params** — follows EventsController pattern (plain string query params for optional filters); status and severity are free text, not validated by the controller (Prisma where clause is a simple string match).
3. **PrismaNotification return type (no mapping)** — the controller returns Prisma notification rows directly. Unlike EventsService (which maps `toResponse`), NotificationsService returns raw Prisma rows since the Notification response shape matches the Prisma model columns exactly per the API contract.

**AI interactions**:
- Tool: opencode agents (orchestrator/DeepSeek V4 Pro planned; implementer executed; reviewer reviewed)
- Objective: implement NotificationsController per T-019
- Prompt (summary): execute plan.md literally — add service methods, create controller + spec, register module, validate gates
- Outcome: (to be filled after review)
- Decision: accepted
- Developer changes: (none)
