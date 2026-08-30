# Roadmap

> Brief, high-level plan. v0.1 is the current, fully-planned scope (EPIC-01..10 on the [BOARD](workflow/tickets/BOARD.md)). Each later version gets its specs and epics added to the BOARD only when it starts — keeping the MVP scope untouched.

## Versions

| Version | Theme | Status |
|---|---|---|
| **v0.1** | MVP — smart-farm notification hub | 🚧 in development (EPIC-01..10) |
| **v0.2** | Real delivery — EvolutionAPI (WhatsApp) | backlog |
| **v0.3** | Multi-language — pt-BR / en | backlog |
| **v0.4** | Authentication & users (+ RBAC) | backlog |

## v0.1 — MVP (current scope)

Everything described in [`business/`](business/), [`specs/`](specs/), and the [BOARD](workflow/tickets/BOARD.md): event ingestion, rules engine, notifications with mock delivery, farm/devices API, dashboard/simulator/history, tests and coverage. Nothing beyond this is committed for v0.1.

## v0.2 — Real Delivery (EvolutionAPI)

Swap mock sending for real WhatsApp via [EvolutionAPI](https://evolution-api.com) — the exact use case the `NotificationProvider` abstraction (AD-06) was designed for:

- New `EvolutionApiProvider implements NotificationProvider` (config via env: `EVO_API_URL`, `EVO_API_KEY`, `EVO_INSTANCE`)
- `MockWhatsAppProvider` remains for tests/demos; provider selected by configuration
- The existing `SENT`/`FAILED` + `failureReason` lifecycle already models real responses
- Note: EvolutionAPI rides on WhatsApp Web sessions (unofficial) — fine for the project; a production-grade gateway would be a paid service

## v0.3 — Multi-Language (pt-BR / en)

Message templates become a localization catalog (rule × locale), rendered per farm/user locale; UI strings via `react-i18next`. Prepared by design — templates are data, not hardcoded strings (AD-09). Simpler after v0.4 since locale becomes a user preference.

## v0.4 — Authentication, Users & Permissions

- `User` model (hashed credentials), JWT auth (`@nestjs/passport`), all endpoints guarded
- User ↔ Farm relation — multi-farm support becomes meaningful
- Simple RBAC first (`ADMIN` / `PRODUCER` / `VIEWER`); fine-grained permissions only if a real need emerges
- Existing endpoint specs updated in the same PRs (per [workflow](workflow/README.md)); guided by the `nestjs-security-best-practices` skill

## Principles

1. **MVP first** — v0.1 ships complete before any backlog version starts.
2. **Same methodology for everything** — new versions follow the same loop: spec → epics/tickets (≤5 pts) on the BOARD → planner→implementer→reviewer → stacked PRs.
3. **Docs are the truth** — when a version starts, its specs are written before its tickets.
