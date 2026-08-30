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

**AI interactions**:

- Tool: opencode agents (orchestrator: GLM-5.3 planned; implementer: DeepSeek v4 Flash executed; reviewer: DeepSeek v4 Pro reviewed)
- Objective: run the T-001 pipeline (plan → implement → review → PR)
- Prompt (summary): execute plan.md literally for T-001 (monorepo workspace + root configs), then verify every acceptance criterion and post the review verdict on the PR
- Outcome: workspace + root configs created; `pnpm install` exits 0; PR opened for review
- Decision: accepted
- Developer changes: none
