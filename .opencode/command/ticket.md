---
description: Run the full ticket pipeline (plan → implement → review → PR) autonomously
agent: orchestrator
---

Run the complete ticket pipeline.

Target: $ARGUMENTS
- Empty or `next` → select the next BOARD ticket whose dependencies are all `done`
- A ticket ID (e.g. `T-009`) → run the pipeline for that ticket (verify its dependencies first)

Execute your pipeline exactly: sync board → plan → delegate to implementer → delegate to reviewer → final report. One ticket per run. Stop after the review verdict is posted — the user merges the PR on GitHub.
