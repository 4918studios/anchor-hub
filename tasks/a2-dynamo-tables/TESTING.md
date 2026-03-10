# TESTING — A2: Wire Real DynamoDB Tables

## Test Coverage

| Area | Tests | Status |
|------|-------|--------|
| Unit: ClientRegistryService | `tests/unit/services/clientRegistry.test.ts` | Not written |
| Unit: UserRegistryService | `tests/unit/services/userRegistry.test.ts` | Not written |
| Unit: AuditLoggerService | `tests/unit/services/auditLogger.test.ts` | Not written |
| Unit: dynamoClient | `tests/unit/lib/dynamoClient.test.ts` | Not written |
| Integration: setup-tables | Manual (DynamoDB Local) | Verified manually |

> A2 scope was wiring services with correct DynamoDB calls and type-checking. Unit tests should be added alongside A3/A4 or as a dedicated test pass.

## How to Run

```bash
npm test
```

## Manual Testing

### 1. Start DynamoDB Local

```bash
docker run -d --name dynamo-local -p 8000:8000 amazon/dynamodb-local
```

### 2. Create Tables

```bash
npm run db:setup:local
```

Expected output: 3 tables created (or "already exists" if re-running).

### 3. Verify Tables

```bash
aws dynamodb list-tables --endpoint-url http://localhost:8000
```

Expected: `anchor-hub-clients`, `anchor-hub-users`, `anchor-hub-audit`

### 4. Toggle Real Services

Set in `.env`:
```
DYNAMODB_ENDPOINT=http://localhost:8000
USE_REAL_CLIENT_REGISTRY=true
USE_REAL_USER_REGISTRY=true
USE_REAL_AUDIT_LOGGER=true
```

Then `npm start` and exercise endpoints to verify DynamoDB reads/writes.

## Edge Cases to Test (future)

- Create client with duplicate identity link (should fail gracefully)
- Create user with duplicate identity link
- TTL cache expiry (mock timers)
- `getByIdentityLink` when link item exists but target record has been deleted
- Concurrent `addInstalledApp` / `removeInstalledApp` calls
- `TransactWriteCommand` failure handling (ConditionalCheckFailed)
