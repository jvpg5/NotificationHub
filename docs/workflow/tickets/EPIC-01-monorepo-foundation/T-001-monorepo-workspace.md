# T-001: Monorepo Workspace + Root Configs

| Field | Value |
|---|---|
| **Epic** | [EPIC-01 — Monorepo Foundation](../BOARD.md#epic-01--monorepo-foundation) |
| **Points** | 2 |
| **Status** | todo |
| **Depends on** | — |
| **Parallel-safe** | no (blocks everything) |
| **Spec** | — |

## Context

Establish the pnpm monorepo skeleton per [`architecture/overview.md`](../../../architecture/overview.md): workspace definition, root package.json with shared scripts, base TypeScript config, and environment example. Everything else builds on this.

## Scope

**In**
- `pnpm-workspace.yaml` (apps/*, packages/*)
- Root `package.json` (private, workspace scripts: `dev`, `dev:backend`, `dev:frontend`, `test`, `lint`, `typecheck`)
- `tsconfig.base.json` (strict, ES2022, shared compiler options)
- `.env.example` (`DATABASE_URL`, `PORT`, `CORS_ORIGIN`)
- Update `.gitignore` (node_modules, dist, coverage, `.env`, `prisma/dev.db`)

**Out**
- Any app scaffolding (T-002, T-003, T-004)
- CI (T-029)

## Acceptance Criteria

- [ ] `pnpm install` succeeds on an empty workspace
- [ ] `pnpm-workspace.yaml` lists `apps/*` and `packages/*`
- [ ] `.env.example` documents all variables used later
- [ ] `.gitignore` covers build artifacts and local DB

## Validation

- `pnpm install` exits 0
- `git status` shows only intended files

## References

- [`architecture/overview.md`](../../../architecture/overview.md) — monorepo layout
- [`architecture/technical-decisions.md`](../../../architecture/technical-decisions.md) — AD-07
