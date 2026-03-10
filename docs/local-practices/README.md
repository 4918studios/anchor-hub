# Local Practices — anchor-hub

Project-specific patterns, conventions, and gotchas that supplement `shared-practices/`.

> For generic workflow, commit standards, and review process, see `shared-practices/README.md`.

## DI / Service Factory Pattern

All services are instantiated through `src/lib/serviceFactory.ts`. The factory reads environment variables to decide between stubs and real implementations:

| Env Var | When `true` | Default |
|---------|-------------|---------|
| `AUTH_BYPASS` | Uses `authStub` (skips JWT validation) | `true` in .env |
| `USE_REAL_CLIENT_REGISTRY` | Uses DynamoDB-backed client registry | `false` |
| `USE_REAL_USER_REGISTRY` | Uses DynamoDB-backed user registry | `false` |
| `USE_REAL_AUDIT_LOGGER` | Uses DynamoDB-backed audit sink | `false` |

**Rule:** Never import a service implementation directly in a function handler. Always go through the factory.

## Audited Handler Wrapper

All HTTP function handlers use `auditedHandler()` from `src/lib/auditedHandler.ts`. This wrapper:

1. Extracts request context (correlation ID, caller identity)
2. Invokes the handler logic
3. Logs the audit event via `auditSink`
4. Catches and normalizes errors via `errorHandler`

**Rule:** Never write a raw handler — always wrap with `auditedHandler`.

## Safe Logger

`src/lib/safeLogger.ts` provides structured logging with an allowlist of safe metadata keys. This prevents accidental credential leakage.

**Rule:** Use `safeLog()` instead of `console.log` for any structured output.

## Identifiers

`src/lib/identifiers.ts` provides `newId()` which generates UUIDv7 (time-sortable) identifiers. All entity IDs should use this.

## Naming Conventions

- Types: `src/types/*.ts` — data shapes, enums, error classes
- Service interfaces: `src/services/interfaces/*.ts` — contracts
- Service stubs: `src/services/stubs/*.ts` — in-memory implementations for local dev
- Service implementations: `src/services/*.ts` — real implementations (DynamoDB, Clerk, etc.)
- Functions: `src/handlers/*.ts` — HTTP endpoint handlers
- Lambda: `src/lambda/*.ts` — AWS Lambda adapter, router, local dev server

## Lineage from anchor-log

anchor-hub was extracted from anchor-log's auth/registry/policy layer. When in doubt about design intent, consult:

- `anchor-log/docs/architecture/decisions/013-client-and-user-access-control.md`
- `anchor-log/docs/architecture/authn-authz-walkthrough.md`
- `anchor-log/docs/architecture/decisions/018-horizontal-platform-architecture.md`
