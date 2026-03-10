# A3: Extract Auth Service (Clerk JWT → Identity)

**Status:** Not started

## Overview

Port anchor-log's `AuthService` (Clerk JWT validation + registry lookups) into anchor-hub. This is the real `IAuthService` implementation that replaces `AuthStub`.

## Prerequisites

- A2 complete ✅ (DynamoDB-backed registries are wired)
- Clerk JWKS endpoint configured

## Key Sources (anchor-log)

| File | What to extract |
|------|-----------------|
| `src/services/implementations/authService.ts` | `AuthService` class — JWT decode, JWKS fetch, `azp` → clientId lookup, `(iss,sub)` → userId lookup |
| `src/services/interfaces/auth.ts` | `IAuthService`, `Identity` type (already ported in A1) |

## What This Task Delivers

1. **`src/services/implementations/authService.ts`** — Clerk JWT verification using JWKS
   - Fetch JWKS from Clerk's `.well-known/jwks.json` (with caching)
   - Verify RS256 signature
   - Extract `azp` claim → look up client via `clientRegistry.getByIdentityLink('clerk', azp)`
   - Extract `iss`+`sub` → look up user via `userRegistry.getByIdentityLink(iss, sub)`
   - Return `Identity { userId, clientId, userStatus, clientStatus }`

2. **Service factory update** — wire real auth when `USE_REAL_AUTH=true` (or when `AUTH_BYPASS` is not set)

3. **Dependencies** — likely needs `jose` or `@clerk/backend` for JWT/JWKS handling. Check what anchor-log uses.

## Context from A2

- Registry services are already DynamoDB-backed with TTL cache
- `getByIdentityLink()` does a point read on `LINK#provider#identifier` — this is what auth will call
- Service factory already has the `useReal()` helper pattern
- `AUTH_BYPASS=true` disables all auth (stubs) — the real auth service should not be loaded when bypass is on

## Notes

- anchor-log's auth service uses `@clerk/backend` for JWT validation — evaluate whether to keep that dependency or use `jose` directly for lighter weight
- The `Identity` type is already defined in `src/services/interfaces/auth.ts`
- Consider JWKS caching strategy (anchor-log caches for 1 hour)
