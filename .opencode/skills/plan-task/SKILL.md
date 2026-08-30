---
name: plan-task
description: Plans and starts a new task efficiently. Uses graphify for context when available, ponytail methodology for reuse, analyzes Figma/Backend gaps, and proposes architecture. Use when starting a new task, planning a feature, or analyzing requirements. Optional CLIs, with a fallback for each: graphify, rtk.
metadata:
  author: Amara Liz
---

# Plan Task

## Prerequisites

This skill leans on two external CLIs. Check what is available before starting,
and follow the fallback for whatever is missing. Do not install anything without
asking the user first.

| Tool | Check | Needed for |
|---|---|---|
| `graphify` | `graphify --version` and `graphify-out/graph.json` exists | step 1, gathering context |
| `rtk` | `rtk --version` | keeping command output small, all steps |

**`graphify` missing, or `graphify-out/` not generated for this repo.** Say so in
one line, then gather context with Grep, Glob and Read instead. Expect to miss
cross-file and inferred dependencies that the graph would have surfaced, so widen
the search and confirm the architecture with the user before step 4.

**`rtk` missing.** Run the commands directly. Output gets more verbose, nothing
breaks. Read narrower ranges and prefer `--oneline` and `--stat` to compensate.

"Ponytail" in step 2 is a methodology, not a tool. The three checks are spelled
out below, so nothing needs to be installed for it.

## Quick Start

When beginning a new task, planning a feature, or analyzing a requirement, follow this structured workflow. 

**Important:** When `rtk` is available, use it to reduce verbose outputs from commands (e.g., when fetching PRs, reading terminals, executing shell tools, etc. Keep the communication concise).

## 1. Gather Context (Graphify)

With `graphify` available, do NOT explore the codebase blindly with Grep or Glob before consulting the knowledge graph.
- Run `graphify query "<question>"` to get a scoped subgraph for the task.
- Run `graphify explain "<concept>"` to gather related context.
- Run `graphify path "<A>" "<B>"` to understand dependencies between symbols.

Without it, fall back as described in Prerequisites.

## 2. Methodology (Ponytail)

Apply the "Ponytail" (lazy senior dev) methodology at all times. Before proposing the plan, check:
1. **YAGNI**: Does this actually need to be built?
2. **Reuse**: Does it already exist in the codebase? (Helpers, utils, UI components, etc.)
3. **Simplicity**: What is the shortest working diff? Avoid boilerplate and unnecessary abstractions.

## 3. Gap Analysis

Analyze and document the gaps before writing any code:
- **Figma Gaps**: What is missing, inconsistent, or unclear in the Figma design in relation to the task scope?
- **Backend (B.E) Gaps**: What is missing in the API/backend in relation to both the Figma design and the task scope? (e.g., missing fields, endpoints that don't exist yet, etc.)

## 4. Suggested Architecture

Propose the architecture for the task following the project's exact patterns (especially Vercel React Best Practices and Composition Patterns):
- **Folders & Files**: Detail the exact folder structure and files to be created/modified.
- **Naming Conventions**: Specify the names for components, functions, imports, and exports.
- **Component Design**: Ensure the plan uses compound components or providers instead of boolean prop proliferation when applicable.

## 5. Execution

Only proceed to write code or create files after the architecture and gap analysis have been reviewed and approved by the user.
