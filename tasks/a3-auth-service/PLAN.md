# A3: Extract Auth Service (Clerk JWT → Identity)

**Status:** Not started

## Overview

Port anchor-log's `AuthService` (Clerk JWT validation + registry lookups) into anchor-hub. This is the real `IAuthService` implementation that replaces `AuthStub`.

## Prerequisites

- A2 complete ✅ (DynamoDB-backed registries are wired)
- Clerk JWKS endpoint configured (`CLERK_ISSUER` env var)

## Source Reference (anchor-log)

anchor-log's `src/services/implementations/authService.ts` (433 lines) implements this 5-step auth flow:

1. **① JWT validation** — RS256 via `jwks-rsa` + `jsonwebtoken`, JWKS cached 10 min / 5 keys
2. **② Client lookup** — `extractClientIdentifier(decoded)` reads `azp` (session tokens) or `client_id` (OAuth at+jwt), then `clientRegistry.getClientByIdentityLink("clerk", azp)`
3. **③ User lookup** — `userRegistry.getUserByIdentityLink(iss, sub)`, auto-provisions if not found (`generateUserId()` + default entitlements)
4. **④ Install check** — third-party clients only, route-exempt for `/me`, `/installed-apps`, `/install-manifest` (bootstrap routes)
5. **⑤ Entitlement check** — `accessEnabled` + `accessUntil` expiry

### Key dependencies in anchor-log
- `jsonwebtoken` — `jwt.verify()` with custom getKey callback
- `jwks-rsa` — `jwksClient({ jwksUri, cache: true, cacheMaxAge: 600000 })`
- `@azure/functions` — only for `HttpRequest` type (we use `HubRequest` instead)

## What This Task Delivers

### 1. `src/services/implementations/authService.ts`

Copy-then-adapt from anchor-log. Key adaptations:

| anchor-log | anchor-hub | Notes |
|------------|-----------|-------|
| `HttpRequest` (Azure) | `HubRequest` | Already defined in `src/types/http.ts` |
| `import { HttpRequest } from "@azure/functions"` | `import type { HubRequest } from "../../types/http.js"` | Drop Azure dependency |
| `setRequestIdentity(request, identity)` | Remove or port | Evaluate if needed — anchor-hub's audit wrapper reads identity differently |
| `safeLogger` import path | `../../lib/safeLogger.js` | Already exists in anchor-hub |
| Error types | `UnauthorizedError`, `ForbiddenError` | Already in `src/types/errors.ts` |

Constructor needs:
- `clientRegistry: IClientRegistryService`
- `userRegistry: IUserRegistryService`

Env vars:
- `CLERK_ISSUER` — Clerk issuer URL (required)
- `AUTH_AUDIENCE` — expected `aud` claim (default: `"anchor-hub"`)
- `CONSENT_BASE_URL` — for install-required redirect hint (optional)

### 2. Service factory update (`src/lib/serviceFactory.ts`)

Current state: `const auth = new AuthStub();` (hardcoded stub).

Change to:
```typescript
const auth: IAuthService = useReal("USE_REAL_AUTH", globalStubs)
  ? new AuthService(clientRegistry, userRegistry)
  : new AuthStub();
```

**Important:** `AuthService` constructor takes registries, so it must be instantiated *after* `clientRegistry` and `userRegistry` are resolved. The current factory already resolves registries first — just wire auth after them.

### 3. Dependencies to install

```bash
npm install jsonwebtoken jwks-rsa
npm install -D @types/jsonwebtoken
```

anchor-log uses these exact packages. No need for `@clerk/backend` — the auth service does standard OIDC JWT validation directly.

### 4. Env var updates

Add to `.env.example`:
```
CLERK_ISSUER=https://your-clerk-instance.clerk.accounts.dev
AUTH_AUDIENCE=anchor-hub
USE_REAL_AUTH=false
```

## What's Already in Place (anchor-hub)

| Component | File | Status |
|-----------|------|--------|
| `IAuthService` interface | `src/services/interfaces/auth.ts` | ✅ Ported in A1 |
| `Identity` type | `src/services/interfaces/auth.ts` | ✅ includes `userId`, `clientId`, `clientType`, `scopes`, `policies`, `clerkUserId`, `clerkAzp` |
| `AuthStub` | `src/services/stubs/` | ✅ Reads from headers |
| `HubRequest` | `src/types/http.ts` | ✅ Cloud-agnostic, has `.headers.get()`, `.url` |
| `UnauthorizedError` / `ForbiddenError` | `src/types/errors.ts` | ✅ |
| `generateUserId()` | `src/lib/identifiers.ts` | ✅ `usr_<uuidv7>` |
| `safeLogger` | `src/lib/safeLogger.ts` | ✅ |
| `IClientRegistryService` | `src/services/interfaces/clientRegistry.ts` | ✅ has `getClientByIdentityLink(provider, identifier)` |
| `IUserRegistryService` | `src/services/interfaces/userRegistry.ts` | ✅ has `getUserByIdentityLink(issuer, subject)`, `hasInstalledApp()`, `createUser()` |
| `UserRecord` type | `src/types/user.ts` | ✅ has `entitlements`, `identityLinks`, `installedApps` |
| Service factory `useReal()` | `src/lib/serviceFactory.ts` | ✅ Pattern established in A2 |

## Implementation Notes

- **`isInstallExemptRoute`** uses `request.url` — `HubRequest.url` is the full URL string, so the same `new URL(request.url).pathname` pattern works
- **Auto-provision** creates a new `UserRecord` with default entitlements (`accessEnabled: true`, `tier: "standard"`) — same as anchor-log
- **`extractClientIdentifier`** handles both `azp` (Clerk session tokens) and `client_id` (OAuth access tokens) — must keep this dual parsing
- **Audience check** is manual (after verify): if `aud` is present it must match, but OAuth tokens may omit `aud` entirely
- **`setRequestIdentity`** — anchor-log stashes identity on the request for the audit wrapper. Check if anchor-hub's `auditedHandler` needs this or reads identity differently. If not needed, omit for now.

## Scope Boundary

**In scope:** Auth service implementation, service factory wiring, deps install, env vars.

**Out of scope:**
- Policy service (A5)
- `accessControl.ts` / `setRequestIdentity` port (evaluate need)
- Unit tests (track as follow-up, same as A2)
- Real Clerk credentials (will test with stubs until deployment)
