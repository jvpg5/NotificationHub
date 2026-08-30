# T-024: API Service + Vite Proxy

| Field | Value |
|---|---|
| **Epic** | [EPIC-07 — Frontend Foundation](../BOARD.md#epic-07--frontend-foundation) |
| **Points** | 2 |
| **Status** | todo |
| **Depends on** | T-004, T-003 |
| **Parallel-safe** | yes (vs backend tickets) |
| **Spec** | — |

## Context

The typed HTTP layer: a single `api.ts` service wrapping `fetch` (or axios) for every backend endpoint, using `shared-types` for request/response types. The Vite proxy was configured in T-003 — verify it here against the real endpoints.

## Scope

**In**
- `services/api.ts` — typed functions: `createEvent`, `listEvents`, `getEvent`, `listNotifications`, `getNotification`, `getFarm`, `listDevices`
- Error normalization: HTTP errors surfaced with field messages from the API error body
- Unit tests with mocked fetch

**Out**
- Hooks/caching (T-025)

## Acceptance Criteria

- [ ] All 7 API operations typed against `shared-types`
- [ ] 400 responses surface the per-field error messages
- [ ] Unit tests pass; proxy verified against a running backend

## Validation

```bash
pnpm --filter frontend test
```

## References

- [`architecture/api.md`](../../../architecture/api.md) — full contract
- `.tmp/external-context/vite-react/proxy-configuration.md`
