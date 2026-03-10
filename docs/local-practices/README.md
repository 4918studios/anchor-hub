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
- Service implementations: `src/services/implementations/*.ts` — real DynamoDB-backed implementations
- Functions: `src/handlers/*.ts` — HTTP endpoint handlers
- Lambda: `src/lambda/*.ts` — AWS Lambda adapter, router, local dev server

## DynamoDB Patterns

### Table Layout
Three tables with `ANCHOR_HUB_` prefix (configurable via `TABLE_PREFIX` env var):
- `anchor-hub-clients` — pk: clientId or `LINK#provider#identifier`, sk: `CLIENT` or `LINK`
- `anchor-hub-users` — pk: userId or `LINK#issuer#subject`, sk: `USER` or `LINK`
- `anchor-hub-audit` — pk: requestId. GSI `UserIdIndex` on (userId, timestamp)

### Key Conventions
- Identity link items use `LINK#provider#identifier` as pk — enables single-item point reads for resolving azp→clientId or (iss,sub)→userId
- Transactional writes: record + link items are written atomically via `TransactWriteCommand`

### TTL Cache
Real registry services use a simple in-memory TTL cache (class-level, not shared):
- **ClientRegistryService**: 5-minute TTL
- **UserRegistryService**: 1-hour TTL
- Cache is busted on mutations (`create`, `update`)

### Shared Client
`src/lib/dynamoClient.ts` exports `getDocClient()` — creates one `DynamoDBDocumentClient` singleton, configured from `DYNAMODB_ENDPOINT` env var (for DynamoDB Local) or default AWS config.

## Lineage from anchor-log

anchor-hub was extracted from anchor-log's auth/registry/policy layer. When in doubt about design intent, consult:

- `anchor-log/docs/architecture/decisions/013-client-and-user-access-control.md`
- `anchor-log/docs/architecture/authn-authz-walkthrough.md`
- `anchor-log/docs/architecture/decisions/018-horizontal-platform-architecture.md`
