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
- Decision: accepted
- Developer changes: (none)
