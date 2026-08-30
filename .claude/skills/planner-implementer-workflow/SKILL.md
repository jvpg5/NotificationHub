---
name: planner-implementer-workflow
description: Token-efficient workflow for planner→implementer→reviewer pipeline. Use when planning complex features (4+ files) to be implemented by a cheaper model.
license: MIT
metadata:
  author: jvpg
  version: "1.0.0"
---

# Planner → Implementer → Reviewer Workflow

Cost-optimized pipeline: expensive model plans, cheap model implements, expensive model reviews.

## When to Use

- 4+ files or multi-component features
- >60min estimated work
- Tasks requiring architectural decisions

**Skip for**: trivial tasks (1-2 files, <30min) — execute directly.

## Roles

| Role | Model | Responsibility |
|------|-------|----------------|
| Planner | Expensive | Produce `plan.md` — detailed, unambiguous, atomic |
| Implementer | Cheap | Execute plan steps literally, stop on ambiguity |
| Reviewer | Expensive | Diff review against plan, run validation gates |

## Folder Structure

```
.tmp/
  sessions/{YYYY-MM-DD}-{slug}/
    context.md          # discovery output (standards, references)
    plan.md             # planner output (the contract)
    implementation.md   # implementer log (decisions, deviations)
    review.md           # reviewer verdict
  tasks/{feature}/
    task.json
    subtask_NN.json
```

## plan.md Template

```markdown
# Plan: {feature name}

## Objective
{1-2 sentences}

## Files to Touch
- {absolute/path/file.ts} — {what changes}

## Reference Patterns (imitate, don't invent)
- {src/existing/file.ts} — {what pattern to copy}

## Atomic Steps
1. {step} — done when {criterion}
2. {step} — done when {criterion}

## Acceptance Criteria
- [ ] {criterion}
- [ ] {criterion}

## Anti-patterns (do NOT)
- {explicit warning}
```

## Contract Rules

1. **Be brief and direct** — planner tokens are expensive. No prose, no "why" explanations. Only what + where + when done.
2. **Reference, don't describe** — point to existing files as patterns instead of explaining the pattern.
3. **Atomic steps** — each step is mechanical (implement, not decide). If a step needs a decision, split it.
4. **Absolute paths** — implementer is cheap, don't make it resolve relative paths.
5. **Done-when criteria** — every step has a verifiable completion condition.
6. **Anti-patterns explicit** — cheap models improvise; list what NOT to do.
7. **Stop on ambiguity** — implementer must NOT guess. If unclear, stop and report.
8. **No auto-fix** — on error, implementer stops. Reviewer decides fix.
9. **One step at a time** — implementer validates (lint/test/typecheck) before next step.
10. **Context persistence** — planner always generates `context.md`; implementer always reads it first.

## Reviewer Gate

After implementation, reviewer (expensive model):
1. Reads `plan.md` + `implementation.md` + git diff
2. Runs: `pnpm test`, `pnpm lint`, typecheck
3. Checks each acceptance criterion
4. Writes verdict to `review.md` (APPROVED / CHANGES_REQUESTED + reasons)

## When NOT to Use

- 1-2 files, straightforward
- Bug fixes with clear cause
- Formatting/refactoring tasks
