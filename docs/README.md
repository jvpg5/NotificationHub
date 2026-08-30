# NotificationHub — Documentation

> **Single source of truth for development.**
> When code and docs disagree, docs win — fix the code, or update the docs in the same PR that changes the behavior.

**NotificationHub** is an MVP smart-farm notification system: it receives events from IoT sensors and devices, validates them, evaluates notification rules, and delivers alerts to the producer (simulated WhatsApp sending for the MVP).

## Documentation Map

| Area | Path | What it contains |
|---|---|---|
| **Business** | [`business/`](business/) | Domain glossary, notification rules, scenarios — **WHAT** the system does |
| **Architecture** | [`architecture/`](architecture/) | Components, data model, event pipeline, API contracts, technical decisions — **HOW** it is built |
| **Specs** | [`specs/`](specs/) | One spec per capability, with testable functional requirements and acceptance criteria |
| **Workflow** | [`workflow/`](workflow/) | Development loop (planner→implementer→reviewer), stacked PR conventions, ticket board |
| **Roadmap** | [`ROADMAP.md`](ROADMAP.md) | Version plan: v0.1 (MVP) → EvolutionAPI → i18n → auth |

## Reading Order (for AI agents and new contributors)

1. [`business/glossary.md`](business/glossary.md) — speak the domain language
2. [`business/business-rules.md`](business/business-rules.md) — the 6 notification rules, severity, messages, validation
3. [`architecture/overview.md`](architecture/overview.md) — the big picture
4. [`architecture/event-pipeline.md`](architecture/event-pipeline.md) — the core flow
5. The **SPEC** for the capability you are touching ([`specs/`](specs/))
6. [`workflow/README.md`](workflow/README.md) — **before writing any code**

## Rules for AI-Assisted Development

1. **Docs before code.** Load the relevant spec and business rules before implementing anything.
2. **Docs are the contract.** If requirements are unclear or docs conflict, **STOP and ask the user** — never guess.
3. **Docs change with code.** Any behavior change ships in the same PR as the doc update.
4. **One ticket, one PR.** Tickets are capped at 5 points to keep PRs concise and easy to review. See [`workflow/README.md`](workflow/README.md).
5. **Log AI interactions.** Relevant AI usage is recorded in `DEVELOPMENT_LOG.md` (project requirement).

## Source Documents

| Document | Status |
|---|---|
| [`Instructions.md`](../Instructions.md) | Original assignment spec (requirements source, in Portuguese) |
| [`PLANNING.md`](../PLANNING.md) | Initial architecture plan — **historical**; where it diverges from `docs/`, `docs/` is canonical |
| `docs/` | **Canonical** project documentation (this tree) |
