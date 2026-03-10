# A2: Wire Real DynamoDB Tables

**Status:** Done
**Date:** 2026-03-10

## Summary

Replaced the in-memory stub services with real DynamoDB-backed implementations for client registry, user registry, and audit logger. Created a 3-table design with identity link items for O(1) lookups and a service factory that toggles between stubs and real implementations via environment variables.

## Scope

- DynamoDB Document client singleton (`src/lib/dynamoClient.ts`)
- 3 real service implementations in `src/services/implementations/`
- Table creation script (`scripts/setup-tables.ts`)
- `streamCapabilities` added to `ClientRecord` (forward-looking for A7)
- Service factory updated with `useReal()` env var toggling
- `.env.example` updated with new variables

## Out of Scope

- Unit tests for DynamoDB services (deferred)
- Auth service real implementation (A3)
- Policy service real implementation (A5)

## Artifacts

- [REVIEW.md](REVIEW.md) — Checklist + code review notes
- [TESTING.md](TESTING.md) — Manual test procedures
- [RETRO.md](RETRO.md) — Retrospective + action items
