# Onboarding — anchor-hub

## What is anchor-hub?

anchor-hub is the platform identity, registry, and policy engine for the anchor ecosystem. It was extracted from anchor-log to serve as the single source of truth for:

- **Client registry** — which apps can access the platform
- **User registry** — who users are and what they've installed
- **Identity resolution** — JWT validation → canonical (userId, clientId) pair
- **Policy evaluation** — fine-grained, per-operation authorization rules
- **NATS auth callout** — translating HTTP identity into NATS account/permissions

## Architecture

```
Browser/Client
  │
  ├── JWT (Clerk) ──→ anchor-hub /api/me, /api/registry/resolve
  │                      │
  │                      ├── Clerk JWKS ──→ JWT validation
  │                      ├── Cosmos `clients` ──→ azp → clientId
  │                      ├── Cosmos `users` ──→ (iss,sub) → userId
  │                      └── Policy rules ──→ authorization
  │
  ├── JWT (Clerk) ──→ anchor-log (delegates identity to anchor-hub)
  │
  └── WebSocket ──→ NATS server
                       │
                       └── auth callout ──→ anchor-hub /api/registry/resolve
```

## Project Structure

```
anchor-hub/
├── src/
│   ├── functions/          # Azure Functions endpoints
│   │   ├── index.ts        # Entry point — imports all functions
│   │   ├── health.ts       # GET /health
│   │   ├── me.ts           # GET /me (identity)
│   │   ├── registry-resolve.ts  # GET /registry/resolve (NATS auth callout)
│   │   └── apps/           # App lifecycle (install, uninstall, list, manifest)
│   ├── lib/                # Shared infrastructure
│   │   ├── serviceFactory.ts    # DI container (env-driven stubs/real)
│   │   ├── auditedHandler.ts    # Audit wrapper for all handlers
│   │   ├── auditSink.ts         # Pluggable audit dispatch
│   │   ├── errorHandler.ts      # Error → HTTP response mapping
│   │   ├── identifiers.ts       # UUID generators (usr_, cli_, evt_, req_)
│   │   ├── requestContext.ts    # Request metadata capture
│   │   └── safeLogger.ts        # Structured logging with redaction
│   ├── services/
│   │   ├── interfaces/     # Service contracts (auth, registries, policy, audit)
│   │   └── stubs/          # In-memory implementations for dev/test
│   └── types/              # Shared types (audit, client, user, policy, errors)
├── client-apps/
│   └── user-admin/         # Consent host SPA (Vite + React)
├── shared-practices/       # Git subtree from 4918studios/shared-practices
├── tasks/                  # Work tracking
│   └── STATUS.md
└── docs/                   # Documentation
```

## Getting Started

### Prerequisites

- Node.js ≥ 20
- Azure Functions Core Tools v4 (`npm i -g azure-functions-core-tools@4`)

### Setup

```bash
npm install
```

### Run locally (stubs mode)

```bash
npm start
```

This builds TypeScript and starts Azure Functions locally. All services use in-memory stubs by default (`AUTH_BYPASS=true` in `local.settings.json`).

### Type-check

```bash
npx tsc --noEmit
```

### Test

```bash
npm test
```

## Key Patterns

### Service Factory (DI)

All services are resolved through `getServices()` in `src/lib/serviceFactory.ts`. Environment variables control stub vs. real:

- `AUTH_BYPASS=true` → all stubs (default for local dev)
- `USE_REAL_AUTH=true` → override individual service to use real implementation

### Audit Pipeline

Every request produces one audit event:

1. Handler is wrapped with `createAuditedHandler(operation, handler)`
2. Wrapper captures request context, runs handler, infers ALLOW/DENY
3. Audit event dispatched to registered sink (fire-and-forget)

### Error Hierarchy

Custom errors extend `AnchorHubError` with typed `code` and `httpStatus`. The `ErrorHandlerImpl` maps them to HTTP responses automatically.

## Lineage

This service was extracted from anchor-log's auth layer. The canonical references are:

- [ADR-013: Client and User Access Control](../anchor-log/docs/architecture/decisions/013-client-and-user-access-control.md)
- [ADR-018: Horizontal Platform Architecture](../anchor-log/docs/architecture/decisions/018-horizontal-platform-architecture.md)
- [Auth Chain Walkthrough](../anchor-log/docs/architecture/authn-authz-walkthrough.md)
