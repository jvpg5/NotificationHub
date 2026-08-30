# Code Quality Standards — NotificationHub

> Pointer document: the real standards live in `docs/` and the project skills. This file tells AI agents where to look before writing any code.

## Non-Negotiables

1. **Docs before code.** Read the relevant SPEC (`docs/specs/`) and business rules (`docs/business/business-rules.md`) before implementing. Docs are the contract — when code and docs disagree, docs win.
2. **Follow the dev loop.** `docs/workflow/README.md` defines the planner→implementer→reviewer cycle, session folders, and the Definition of Done. One ticket (≤5 points) = one PR.
3. **Stop on ambiguity.** Unclear or conflicting requirements → ask the user. Never guess. No auto-fix on test/build failures — report, propose, get approval.
4. **Tests are part of the work.** Every ticket ships with tests covering its acceptance criteria. Gates: `pnpm lint`, `pnpm typecheck`, `pnpm test`.

## Language & Stack Standards

- **Language**: TypeScript strict everywhere; all content (docs, code, messages) in English (AD-09).
- **Backend (NestJS)**: follow `.claude/skills/nestjs-best-practices/SKILL.md` — modular architecture, DI, validation pipes, testing patterns.
- **Frontend (Vite + React)**: follow `.claude/skills/vite-react-best-practices/SKILL.md` — performance, structure, SPA conventions.
- **Dashboards/tables/UI**: follow `.claude/skills/padrao-dashboard/SKILL.md`.
- **Commits**: conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`).
- **PRs**: stacked via `gh stack`, squash merges — see `docs/workflow/pr-stacking.md`.

## Domain Rules

- Business behavior (event types, validation ranges, the 6 notification rules, severity, messages, idempotency) is defined **only** in `docs/business/business-rules.md`. Never hardcode a threshold or message without checking it first.
- API shapes are defined in `docs/architecture/api.md`; shared types live in `packages/shared-types`.

## Review Gates

Before any PR: run the review skills when appropriate — `code-review-subagent`, `review-bugbot`, `review-security` — and record the verdict in the session's `review.md`.
