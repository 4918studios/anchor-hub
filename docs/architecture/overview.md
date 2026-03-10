# Architecture Overview — anchor-hub

## Purpose

anchor-hub is the platform's centralized identity, registry, and policy engine. It was extracted from anchor-log (ADR-013, ADR-018) so that all ecosystem participants — anchor-log, anchor-tds, browser apps, agents — authenticate through a single service.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Compute | AWS Lambda + API Gateway (Node.js 20+, TypeScript) |
| Storage | DynamoDB (on-demand, multi-table: `clients`, `users`, `audit`) |
| Auth | Clerk JWKS (RS256 JWT validation) |
| NATS | Lightsail instance ($5/mo, TLS, WebSocket on 443) |
| Testing | Vitest |
| Deployment | Lambda (HTTP API) + NATS sidecar on Lightsail (auth callout) |

> **ADR-001**: [Migrate from Azure to AWS](decisions/001-migrate-azure-to-aws.md)

## What anchor-hub Owns

- **JWT validation** — Clerk JWKS, RS256 token verification
- **Client registry** — Client records, identity links (azp → clientId), capabilities, stream permissions
- **User registry** — User records, identity links (issuer+subject → userId), entitlements, installed apps
- **Scope + policy evaluation** — Coarse-grained scopes and fine-grained per-operation resource policies
- **App lifecycle** — Install/uninstall third-party apps, permission manifests
- **Identity endpoint** — `GET /me` returns the caller's resolved identity
- **Registry resolution** — `GET /registry/resolve` for NATS auth callout and delegated auth
- **User-admin app** — First-party consent host / app management SPA
- **NATS auth callout** — Issues scoped User JWTs for NATS WebSocket connections (source code here, deploys as sidecar)

## What Stays in anchor-log

- Durable entry storage (Cosmos DB)
- Entry CRUD, versioning, version history
- Working lane state machine
- Blob lifecycle
- Domain profile validation
- Audit event logging for its own operations

## API Surface

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/health` | Service health check |
| GET | `/me` | Caller's resolved identity |
| GET | `/registry/resolve` | Identity + capabilities for auth callout |
| POST | `/users/me/installed-apps` | Install a third-party app |
| DELETE | `/users/me/installed-apps/{clientId}` | Uninstall an app |
| GET | `/users/me/installed-apps` | List installed apps |
| GET | `/clients/{clientId}/install-manifest` | App permission manifest |

## Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      anchor-hub                         │
│              (AWS Lambda + API Gateway)                 │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Auth + Policy Engine                    │  │
│  │  JWT → Client Registry → User Registry            │  │
│  │  → Scope Check → Policy Evaluation                │  │
│  └────────────────────┬──────────────────────────────┘  │
│                       │                                  │
│  ┌────────────────────┴──────────────────────────────┐  │
│  │           HTTP API Endpoints                      │  │
│  │  /me  /registry/resolve  /users/me/installed-apps │  │
│  │  /clients/{id}/install-manifest  /health          │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │       Auth Callout Service (source code)          │  │
│  │  Deploys as sidecar to NATS server                │  │
│  │  $SYS.REQ.USER.AUTH → /registry/resolve           │  │
│  │  → Issues scoped NATS User JWTs                   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
        │                           │
        ▼                           ▼
  ┌───────────┐              ┌──────────────┐
  │ anchor-log│              │  anchor-tds  │
  │ Delegates │              │  NATS demo   │
  │ identity  │              │  Browser WS  │
  │ resolution│              │  connections │
  └───────────┘              └──────────────┘
```

## DI / Service Factory

All services are resolved through `getServices()` in `src/lib/serviceFactory.ts`:

| Service | Interface | Stub | Real (future) |
|---------|-----------|------|---------------|
| auth | `IAuthService` | `AuthStub` (headers/env) | `AuthService` (Clerk JWT + registries) |
| clientRegistry | `IClientRegistryService` | `ClientRegistryStub` (Map) | `ClientRegistryService` (DynamoDB) |
| userRegistry | `IUserRegistryService` | `UserRegistryStub` (Map) | `UserRegistryService` (DynamoDB) |
| policy | `IPolicyService` | `PolicyStub` (allow-all) | `PolicyService` (rule eval) |
| auditLogger | `IAuditLogger` | `AuditLoggerStub` (Map) | `AuditLoggerService` (DynamoDB) |
| errors | `IErrorHandler` | `ErrorHandlerImpl` | same |

Environment-driven: `AUTH_BYPASS=true` → stubs, otherwise real implementations.

## ADRs

anchor-hub inherits decisions from anchor-log. See [decisions/](decisions/README.md) for anchor-hub-specific ADRs and the lineage references:

- [ADR-013](https://github.com/4918studios/anchor-log/blob/main/docs/architecture/decisions/013-client-and-user-access-control.md) — Client, User, and Policy Access Control Model
- [ADR-014](https://github.com/4918studios/anchor-log/blob/main/docs/architecture/decisions/014-platform-core-profile-gateway-boundary.md) — Platform Core, Domain Profiles, and Gateway Boundary
- [ADR-018](https://github.com/4918studios/anchor-log/blob/main/docs/architecture/decisions/018-horizontal-platform-architecture.md) — Horizontal Platform Architecture
