# Unprocessed Learnings

Drop raw observations, surprises, and "TIL" notes here during work sessions. Periodically review and promote useful items into local-practices, ADRs, or onboarding docs.

---

<!-- Add new learnings at the top -->

### 2026-03-10 — A2: Wire DynamoDB tables

- **DynamoDB transactional writes** are essential when creating a record + identity link atomically. `TransactWriteCommand` ensures either both items land or neither does. Without this, a crash between the two `PutItem` calls would leave an orphaned link or orphaned record.

- **TTL cache granularity matters**: 5 min for clients (rarely change) vs. 1 hour for users (change more often with app installs). anchor-log used the same pattern with Cosmos DB.

- **`LINK#provider#identifier` key convention** — using a composite partition key for identity links avoids needing a secondary index for the most common lookup (azp→clientId, iss+sub→userId). Single-item point reads are fast and cheap.

- **`resetDocClient()` for testing** — exposing a reset function on the shared DynamoDB client singleton lets tests swap in a fresh client between test suites without leaking state.

- **Service factory `useReal()` helper** — checking `USE_REAL_*` env vars inline was getting verbose. The `useReal(envVar)` helper centralizes the boolean parse and keeps the factory readable.

- **`streamCapabilities` on ClientRecord** — added to support NATS auth callout (A7). Each client can declare per-domain capabilities (which subjects they can publish/subscribe to). This was not in anchor-log's original model — it's new for anchor-hub.

- **DynamoDB Local via `DYNAMODB_ENDPOINT`** — the `scripts/setup-tables.ts` script works against both DynamoDB Local (for dev) and real AWS (via default credential chain). The idempotent `tableExists` check prevents errors on re-runs.
