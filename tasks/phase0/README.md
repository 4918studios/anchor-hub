# Phase 0: Scaffolding — anchor-hub

**Status:** Done
**Date:** 2026-03-09

## What Was Done

### Repo Setup
- Created GitHub repo at `https://github.com/4918studios/anchor-hub.git`
- Initialized with seed docs: `PLAN.md`, `README.md`, `AGENTS.md`
- Added `shared-practices/` as git subtree from `https://github.com/4918studios/shared-practices.git`

### A1 Scaffold (AWS Lambda + API Gateway)
- Project config: `package.json`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`
- AWS Lambda adapter layer: `src/lambda/` (handler, adapter, router, local dev server)
- 7 HTTP handlers: health, me, registry-resolve, apps/(install, uninstall, list, install-manifest)
- Lib: serviceFactory, auditedHandler, auditSink, errorHandler, identifiers, requestContext, safeLogger
- Service interfaces: auth, clientRegistry, userRegistry, policy, auditLogger, errors
- Service stubs: in-memory implementations (AuthStub, ClientRegistryStub, UserRegistryStub, PolicyStub, AuditLoggerStub)
- Types: audit (anchor-hub operations catalog), errors (AnchorHubError hierarchy), client, user, policy
- `npx tsc --noEmit` passes with 0 errors

> **Note:** Originally scaffolded as Azure Functions v4 then migrated to AWS Lambda + API Gateway in the same sprint. See [ADR-001](../../docs/architecture/decisions/001-migrate-azure-to-aws.md).

### User-Admin Migration
- Moved `client-poc-apps/user-admin/` from anchor-log to `client-apps/user-admin/`
- Consent host SPA (Vite + React): ConsentPage, DashboardPage, API client

### Cross-Repo Updates
- Updated anchor-log `tasks/STATUS.md`: paused audit work, marked user-admin as moved
- Updated anchor-tds `tasks/STATUS.md`: added cross-repo section, POC scope clarification

## Key Decisions

- **New repo** (not a subtree of anchor-log or anchor-tds)
- **AWS Lambda + API Gateway** (migrated from Azure Functions v4 — see ADR-001)
- **"anchor-hub"** naming (emphasizes central coordination role)
- Auth callout source lives in anchor-hub, deploys as NATS sidecar

## Project Structure After Phase 0

```
anchor-hub/
├── AGENTS.md
├── PLAN.md
├── README.md
├── package.json, tsconfig.json, vitest.config.ts
├── src/
│   ├── handlers/       (7 endpoint handlers)
│   ├── lambda/         (adapter, router, local server)
│   ├── lib/            (7 modules)
│   ├── services/
│   │   ├── interfaces/ (6 interfaces)
│   │   └── stubs/      (5 stubs)
│   └── types/          (5 type files)
├── client-apps/
│   └── user-admin/
├── docs/
│   └── ONBOARDING.md
├── shared-practices/   (git subtree)
└── tasks/
    └── STATUS.md
```
