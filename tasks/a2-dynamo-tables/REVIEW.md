# REVIEW — A2: Wire Real DynamoDB Tables

## Review Checklist

- [x] `npx tsc --noEmit` passes with 0 errors
- [ ] Tests pass (`npm test`) — no unit tests for DynamoDB services yet (A2 scope was wiring, not testing)
- [x] No `console.error` / `console.warn` in browser console (N/A — no browser component)
- [x] Documentation updated (ONBOARDING, architecture, local-practices)
- [x] STATUS.md updated

## Files Created

| File | Purpose |
|------|---------|
| `src/lib/dynamoClient.ts` | Shared DynamoDB Document client singleton, table name helpers, key conventions |
| `src/services/implementations/clientRegistryService.ts` | DynamoDB-backed client registry with 5-min TTL cache |
| `src/services/implementations/userRegistryService.ts` | DynamoDB-backed user registry with 1-hour TTL cache |
| `src/services/implementations/auditLoggerService.ts` | DynamoDB-backed audit logger with GSI query |
| `src/services/implementations/index.ts` | Barrel export |
| `scripts/setup-tables.ts` | Idempotent DynamoDB table creation script |

## Files Modified

| File | Change |
|------|--------|
| `src/types/client.ts` | Added `StreamCapabilities`, `DomainCapability`, `streamCapabilities` field |
| `src/lib/serviceFactory.ts` | Wires real or stub services per `USE_REAL_*` env vars |
| `package.json` | Added `db:setup`, `db:setup:local` scripts, `tsx` dev dependency |
| `.env.example` | Added `DYNAMODB_ENDPOINT` |

## Code Review Notes

- **Transactional writes**: Both client and user registries use `TransactWriteCommand` to atomically write the record + identity link items. This prevents orphaned links on partial failures.
- **TTL cache**: Follows the same pattern as anchor-log's Cosmos-backed implementations. Cache is class-level, not shared across instances.
- **Service factory** uses a `useReal()` helper to reduce env-var boilerplate. Auth and Policy services remain stubs (pending A3/A5).
- **`streamCapabilities`** was added to `ClientRecord` as a forward-looking field for NATS auth callout (A7). It's nullable and not yet consumed.

## Manual Testing

Run `scripts/setup-tables.ts` against DynamoDB Local:

```bash
# Start DynamoDB Local (Docker)
docker run -p 8000:8000 amazon/dynamodb-local

# Create tables
npm run db:setup:local

# Verify tables exist
aws dynamodb list-tables --endpoint-url http://localhost:8000
```
