# RETRO — A2: Wire Real DynamoDB Tables

## What Went Well

- DynamoDB SDK integration was straightforward — `@aws-sdk/lib-dynamodb` marshalling handles type conversion cleanly
- anchor-log's Cosmos-backed implementations provided clear reference patterns (TTL cache, transactional writes, service factory wiring)
- Adding `streamCapabilities` early (before A7 needs it) avoids a migration later
- The `LINK#provider#identifier` key convention gives O(1) identity lookups without a secondary index

## What Could Be Better

- No unit tests were written for the DynamoDB services — testing should happen with A3/A4 or as a standalone task
- TTL cache is duplicated across client and user registry services — could extract a shared `TtlCache<K,V>` utility
- The `useReal()` helper could be even more declarative (e.g., a registry of service names → env var mappings)

## Learnings

- **Transactional writes** are critical for the record + link pattern — without them, partial failures leave inconsistent state
  → Promoted to `docs/local-practices/README.md` (DynamoDB Patterns section)
- **DynamoDB Local** works well for development but requires `DYNAMODB_ENDPOINT` to be set — the `scripts/setup-tables.ts` script handles both local and cloud
  → Promoted to `docs/local-practices/README.md`
- **`streamCapabilities`** is a new concept not present in anchor-log — it represents per-domain NATS subject permissions for a client
  → Documented in `docs/UNPROCESSED_LEARNINGS.md`, will be promoted when A7 is implemented

## Action Items

- [ ] Extract shared `TtlCache<K,V>` utility (optional refactor)
- [ ] Write unit tests for DynamoDB services (DynamoDB Local + Vitest)
- [ ] Validate `setup-tables.ts` against real AWS (not just DynamoDB Local)
