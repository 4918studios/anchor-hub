# Tasks — anchor-hub

## Status Board

> Last updated: 2025-07-16

### Workstream A — Extract anchor-hub

| Task | Status | Notes |
|------|--------|-------|
| **A1** Scaffold Azure Functions v4 project | **Done** | Config, functions, lib, types, services, stubs — compiles clean |
| **A2** Wire real Cosmos containers (clients, users) | Not started | Shared Cosmos account, anchor-hub containers |
| **A3** Extract auth service (Clerk JWT → identity) | Not started | Port from anchor-log's AuthService |
| **A4** Extract client/user registry services | Not started | Port Cosmos-backed implementations |
| **A5** Wire real policy evaluation | Not started | Depends on A3/A4 |
| **A6** User-admin consent host app | Staged | Already in `client-apps/user-admin/` |
| **A7** NATS auth callout service | Not started | Source in anchor-hub, deploys as NATS sidecar |

### Workstream B — NATS auth callout (anchor-tds)

> Tracked in [anchor-tds/tasks/STATUS.md](../anchor-tds/tasks/STATUS.md)

| Task | Status | Notes |
|------|--------|-------|
| **B1** Static/fake registry in anchor-tds | Not started | Hard-coded user/client map |
| **B2** Auth callout handler | Not started | NATS → HTTP → auth decision |
| **B3–B6** | Not started | See anchor-tds STATUS.md |

### Cross-repo

> anchor-hub is the extracted auth/registry/policy engine.
> anchor-log retains entry CRUD and delegates identity resolution to anchor-hub.
> anchor-tds uses anchor-hub's auth callout for NATS WebSocket connections.
