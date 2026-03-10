# Plan: anchor-hub — Platform Identity, Registry & Gateway Service

## Goal

Extract and elevate anchor-log's authn/authz layer into a standalone **anchor-hub** service
that becomes the platform's identity, registry, and policy engine. Both anchor-log and
anchor-tds (and future participants) call anchor-hub for identity resolution, capability
lookups, and credential issuance.

Two parallel workstreams that converge:

- **Workstream A**: Extract auth/registry/policy from anchor-log into anchor-hub
- **Workstream B**: Wire NATS auth callout in anchor-tds with static registry, then swap in
  anchor-hub's API

---

## What anchor-hub owns

- JWT validation (Clerk JWKS, RS256 — currently in anchor-log's `authService.ts`)
- Client registry (client records, identity links, capabilities — `clientRegistryService.ts`)
- User registry (user records, identity links, entitlements — `userRegistryService.ts`)
- Scope + policy evaluation (`accessControl.ts`, `policyEvaluation.ts`, `policyService.ts`)
- App lifecycle (install, uninstall, manifest — `apps/*.ts`)
- Identity endpoint (`/api/me`)
- **user-admin app** — first-party consent host / app management SPA (moved from anchor-log)
- **New**: Registry resolution endpoint (`/api/registry/resolve`) for NATS auth callout
- **New**: NATS auth callout service source (deploys as sidecar to NATS server)
- **New**: `streamCapabilities` on ClientRecord (canPost, canReceive, domains)

## What stays in anchor-log

- Durable entry storage (Cosmos DB)
- Entry CRUD operations (create, get, list, update, delete)
- Entry versioning and version history
- Working lane state machine (promote, state transitions)
- Blob lifecycle (staged vs. linked, SAS URL generation)
- Domain profile validation (conversation, coaching, etc.)
- Audit event logging for its own operations

## What anchor-tds gets

- NATS operator/account model with auth callout
- Browser gateway tab (sole publisher, envelope stamping)
- Sub-only participant JWTs (scoped to userId+domainId)
- Subject hierarchy: `tds.<userId>.<domainId>.<topic>`
- `connect(endpoint, token)` helper

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        anchor-hub                           │
│              (AWS Lambda + API Gateway)                      │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Auth + Policy Engine                     │  │
│  │  JWT validation → Client registry → User registry     │  │
│  │  → Scope check → Policy evaluation                    │  │
│  │  (extracted from anchor-log ADR-013 chain)            │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────┴──────────────────────────────┐  │
│  │              HTTP API Endpoints                        │  │
│  │  GET  /api/me                                          │  │
│  │  GET  /api/registry/resolve?token=<jwt>   ← NEW       │  │
│  │  POST /api/users/me/installed-apps                     │  │
│  │  DELETE /api/users/me/installed-apps/{clientId}        │  │
│  │  GET  /api/users/me/installed-apps                     │  │
│  │  GET  /api/clients/{clientId}/install-manifest         │  │
│  │  GET  /health                                          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Auth Callout Service (source code)             │  │
│  │  Deploys as sidecar to NATS server, NOT as a Function  │  │
│  │  Subscribes to $SYS.REQ.USER.AUTH                      │  │
│  │  Calls GET /api/registry/resolve for identity          │  │
│  │  Issues scoped User JWTs (nats-jwt + nkeys)            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
    ┌───────────┐                 ┌──────────────┐
    │ anchor-log│                 │  anchor-tds  │
    │ (participant)               │  (NATS demo) │
    │ Delegates auth              │  Browser tabs│
    │ to anchor-hub               │  connect via │
    │ for identity                │  auth callout│
    └───────────┘                 └──────────────┘
```

---

## Workstream A: Extract auth layer into anchor-hub

### A1: Scaffold anchor-hub repo

- New GitHub repo (`4918studios/anchor-hub`)
- AWS Lambda + API Gateway (Node/TS): `package.json`, `tsconfig.json`, `vitest.config.ts`
- Copy `shared-practices/` subtree (git subtree, same as anchor-log and anchor-tds)
- Create `AGENTS.md`, `README.md`, `docs/ONBOARDING.md`, `tasks/STATUS.md`
- Set up DI pattern: `serviceFactory.ts`, interfaces/implementations/stubs

### A2: Extract types and pure functions

Copy from anchor-log → anchor-hub (copy-then-evolve, not shared packages):

| Source (anchor-log) | Destination (anchor-hub) | Notes |
|---|---|---|
| `src/types/client.ts` | `src/types/client.ts` | Add `streamCapabilities` field |
| `src/types/user.ts` | `src/types/user.ts` | As-is |
| `src/types/policy.ts` | `src/types/policy.ts` | As-is |
| `src/types/errors.ts` | `src/types/errors.ts` | Auth-related errors |
| `src/lib/policyEvaluation.ts` | `src/lib/policyEvaluation.ts` | Pure functions, no deps |
| `src/lib/accessControl.ts` | `src/lib/accessControl.ts` | Scope checks, identity stamping |
| `src/lib/identifiers.ts` | `src/lib/identifiers.ts` | `usr_`, `cli_` generators |
| `src/lib/installManifest.ts` | `src/lib/installManifest.ts` | Permission manifest builder |

### A3: Extract service interfaces + implementations

| Source (anchor-log) | Destination (anchor-hub) | Notes |
|---|---|---|
| `src/services/interfaces/auth.ts` | `src/services/interfaces/auth.ts` | `IAuthService` + `Identity` |
| `src/services/interfaces/clientRegistry.ts` | `src/services/interfaces/clientRegistry.ts` | `IClientRegistryService` |
| `src/services/interfaces/userRegistry.ts` | `src/services/interfaces/userRegistry.ts` | `IUserRegistryService` |
| `src/services/interfaces/policy.ts` | `src/services/interfaces/policy.ts` | `IPolicyService` |
| `src/services/implementations/authService.ts` | `src/services/implementations/authService.ts` | Clerk JWT validation + registry |
| `src/services/implementations/clientRegistryService.ts` | `src/services/implementations/clientRegistryService.ts` | Cosmos-backed + TTL cache |
| `src/services/implementations/userRegistryService.ts` | `src/services/implementations/userRegistryService.ts` | Cosmos-backed + TTL cache |
| `src/services/implementations/policyService.ts` | `src/services/implementations/policyService.ts` | Registry-backed policy eval |
| `src/services/stubs/*` | `src/services/stubs/*` | Corresponding stubs |

Supporting infrastructure to copy:
- `safeLogger.ts`, `requestContext.ts`, `errorHandler.ts`
- `auditedHandler.ts`, `auditSink.ts` (pattern duplicated — both services need audit)
- `serviceFactory.ts` (adapted for anchor-hub's service set)

### A4: Create HTTP endpoints

Extracted from anchor-log's function handlers:

| Endpoint | Source | Purpose |
|---|---|---|
| `GET /health` | `health.ts` | Service health |
| `GET /api/me` | `me.ts` | Identity resolution |
| `POST /api/users/me/installed-apps` | `apps/install.ts` | App install |
| `DELETE /api/users/me/installed-apps/{clientId}` | `apps/uninstall.ts` | App uninstall + revoke |
| `GET /api/users/me/installed-apps` | `apps/list.ts` | List installed apps |
| `GET /api/clients/{clientId}/install-manifest` | `apps/install-manifest.ts` | Permission manifest |
| **`GET /api/registry/resolve`** | **New** | Registry resolution for auth callout |

The `/api/registry/resolve` endpoint:
- Accepts `Authorization: Bearer <jwt>` header
- Validates JWT signature (Clerk JWKS)
- Resolves ClientRecord + UserRecord from registries
- Returns: `{ userId, clientId, status, domains: [{domainId, canPost, canReceive}] }`
- Called by NATS auth callout service and by anchor-log's delegated auth

### A5: Wire anchor-log to delegate auth

- anchor-log's `authService.ts` becomes a thin HTTP client
- Calls `GET /api/registry/resolve` on anchor-hub instead of doing JWT + registry locally
- anchor-log keeps domain-level authorization (entry type checks, state machine, blob ownership)
- anchor-log's `/api/me` and app lifecycle endpoints redirect or proxy to anchor-hub
- New env var: `ANCHOR_HUB_URL` in anchor-log's `local.settings.json`

### A6: User-admin app (moved from anchor-log)

- `client-apps/user-admin/` — Vite + React SPA, first-party Clerk session auth
- Consent host: renders install manifest, handles Accept/Decline for third-party apps
- App management dashboard: list/uninstall installed apps
- All endpoints it calls live in anchor-hub: `/api/me`, `/api/users/me/installed-apps`, `/api/clients/{clientId}/install-manifest`
- Previously `anchor-log/client-poc-apps/user-admin/`, tracked as P15

### A7: Auth callout service (source in anchor-hub)

- `src/callout/authCallout.ts` — small Node process (~100 lines)
- Connects to NATS, subscribes to `$SYS.REQ.USER.AUTH`
- On connect attempt: calls `GET /api/registry/resolve?token=<jwt>` on anchor-hub
- Issues scoped User JWTs using `nats-jwt` + NKey signing
- Separate `Dockerfile` and start script — deploys alongside NATS server
- `docker-compose.yml` at repo root: `nats-server` + `auth-callout` containers
- For POC/dev: can run with static registry (no anchor-hub HTTP dependency)

---

## Workstream B: NATS auth callout in anchor-tds (parallel)

Progress anchor-tds Phase 2 with a static registry. Validates the NATS auth model
without waiting for anchor-hub.

### B1: NATS operator/account setup

- Run `nsc` to generate: operator, 3 accounts (PARTICIPANTS, GATEWAY, AUTH), signing keys
- Update `nats.conf` for operator model with `resolver: MEMORY` and auth callout block
- Store credentials in `config/` (gitignored seed files, committed JWTs)

### B2: Static-registry auth callout

- `src/services/authCallout.ts` in anchor-tds
- Hardcoded `STATIC_REGISTRY` map (token → `{ userId, status, domains }`)
- Issues User JWTs via `nats-jwt`/`nkeys`
- Participants: `sub.allow` scoped to userId+domainId, `pub.allow: []`
- Gateway: full pub rights

### B3: NatsContext token auth

- Update `NatsContext.tsx`: `wsconnect({ servers: [url], user: getSessionToken() })`
- Simple token input in UI (or sessionStorage) for POC

### B4: Subject hierarchy migration

- `js.demo` → `tds.<userId>.<domainId>.<topic>` in `Js.tsx`
- KV buckets: `demo_messages`/`demo_states` → `tds_body`/`tds_state`
- Keys scoped by userId+domainId

### B5: Gateway tab

- `src/components/Gateway.tsx` — `?mode=gateway` route
- Sole publisher: envelope stamping, KV writes, stream publish
- Receives publish requests from participant tabs (BroadcastChannel or gateway inbox subject)

### B6: connect() helper

- `src/lib/connect.ts` — `connect(endpoint, token)` returning `{ subscribe, post, updateStatus }`
- Hides all NATS plumbing from participants

---

## Convergence

Once both workstreams reach critical mass:

1. Replace anchor-tds's static registry with HTTP call to anchor-hub's `/api/registry/resolve`
2. Move anchor-tds's auth callout source into anchor-hub's `src/callout/`
3. anchor-log's POC apps (user-admin, client-poc) point to anchor-hub for identity/app endpoints
4. anchor-log connects to NATS as a participant (stream capabilities in ClientRecord)

---

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Service name | **anchor-hub** | Connotes coordination hub; avoids confusion with shared lib ("core") or API gateway infra ("gateway") |
| Repo strategy | **New standalone repo** | Clean boundary; both anchor-log and anchor-tds depend on it |
| Runtime | **AWS Lambda + API Gateway (Node/TS)** | Simpler, better ecosystem, lower cost at pre-production scale (ADR-001) |
| Code sharing | **Copy-then-evolve** | Faster than premature npm extraction; revisit when contracts stabilize |
| Auth callout hosting | **Source in anchor-hub, deploys as NATS sidecar** | Code lives with auth layer; runs next to NATS server |
| First move | **Both workstreams in parallel** | Scaffold anchor-hub while NATS auth callout progresses with static registry |
| Cosmos DB | **DynamoDB (multi-table, on-demand)** | anchor-hub uses its own tables (`clients`, `users`, `audit`); anchor-log retains Cosmos DB |

---

## Verification checklist

### anchor-hub

- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] `GET /api/me` returns resolved identity for valid JWT
- [ ] `GET /api/registry/resolve` returns capabilities for valid JWT
- [ ] App lifecycle endpoints (install, uninstall, list, manifest) work
- [ ] Existing anchor-log integration tests adapted and passing
- [ ] Auth callout service issues scoped User JWTs in dev mode

### anchor-tds

- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] NATS auth callout grants scoped JWTs (static registry)
- [ ] Participant tabs can subscribe but NOT publish
- [ ] Gateway tab can publish, stamp envelopes, write KV
- [ ] Subject hierarchy uses `tds.<userId>.<domainId>.<topic>`
- [ ] `nats stream del` reset works

### anchor-log (after delegation)

- [ ] Auth delegation to anchor-hub works end-to-end
- [ ] Entry CRUD unchanged (same tests pass)
- [ ] POC apps (user-admin, client-poc) work against anchor-hub endpoints

---

## Key references

| Document | Location |
|---|---|
| Gateway service plan (detailed) | `anchor-log/tasks/plan-gateway-service.md` |
| Auth callout + browser gateway POC | `anchor-tds/tasks/plan-auth-callout-gateway-poc.md` |
| ADR-013: Client, User, Policy Access Control | `anchor-log/docs/decisions/013-client-and-user-access-control.md` |
| ADR-014: Platform Core/Profile/Gateway Boundary | `anchor-log/docs/decisions/014-platform-core-profile-gateway-boundary.md` |
| ADR-018: Horizontal Platform Architecture | `anchor-log/docs/decisions/018-horizontal-platform-architecture.md` |
| TDS vision | `anchor-log/docs/architecture/vision-trusted-domain-stream.md` |
| Authn/authz walkthrough | `anchor-log/docs/architecture/authn-authz-walkthrough.md` |
| anchor-tds architecture | `anchor-tds/docs/architecture/overview.md` |
| ADR-002: Subject hierarchy + auth callout | `anchor-tds/docs/architecture/decisions/ADR-002-subject-hierarchy-auth-callout.md` |
