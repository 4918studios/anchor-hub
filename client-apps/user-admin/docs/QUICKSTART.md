# User-Admin App — Quickstart

Step-by-step guide to get the user-admin (consent host) app running locally
and connected to the Anchor Log API.

---

## Prerequisites

- Node.js ≥ 18
- The Anchor Log API running locally (`npm start` from repo root → `http://localhost:7071`)
- A Clerk account with the same instance used by the API
  (check `CLERK_ISSUER` in repo-root `local.settings.json`)

---

## 1. Clerk Dashboard Setup

The user-admin app is a **first-party** Clerk application — it uses
`ClerkProvider` with a publishable key, not OAuth PKCE.

### What you need from Clerk

| Value | Where to find it | Used for |
|-------|-------------------|----------|
| **Publishable key** | Clerk Dashboard → Configure → API Keys | `VITE_CLERK_PUBLISHABLE_KEY` in `.env.local` |
| **JWT `azp` claim** | Clerk Dashboard → Configure → Sessions → inspect a JWT, or decode one | Client registry `identityLinks[].identifier` |

> **Important:** For first-party Clerk sessions, the `azp` (authorized party)
> claim in the JWT is the **origin URL** of the requesting page — e.g.
> `http://localhost:3001` in local dev. This must match the `identityLinks`
> entry in the client registry for the API to recognize this app.

### Clerk JWT Template

The app calls `getToken({ template: 'anchor-log' })` to obtain JWTs. Make
sure you have a JWT template named `anchor-log` in your Clerk Dashboard:

1. Go to **Sessions → JWT Templates → Create template**
2. Name: `anchor-log`
3. Claims: include `sub`, `email`, `name` (minimum)
4. Audience: `anchor-log` (must match `AUTH_AUDIENCE` in API settings)

If you already set this up for the client-poc, it's the same template.

---

## 2. Seed the Client Registry

The API needs a client record for the user-admin app. The seed script includes
one, but the identity link's `identifier` must match your local origin.

```bash
# From the repo root:
cd /path/to/anchor-log

# Check the seed script — look for ANCHOR_USER_ADMIN_DEV
cat scripts/seed-clients.ts | grep -A 5 "User Admin"
```

The dev record's `identityLinks[0].identifier` defaults to
`http://localhost:3000`. **Update it to `http://localhost:3001`** (the
user-admin's Vite port) before seeding:

```typescript
// In scripts/seed-clients.ts, ANCHOR_USER_ADMIN_DEV.identityLinks:
identifier: "http://localhost:3001",   // ← must match user-admin's origin
```

Then seed:

```bash
npx tsx scripts/seed-clients.ts --env dev
```

> **Why the port matters:** Clerk sets the JWT's `azp` claim to the browser's
> origin. The API resolves the client by matching `azp` against
> `identityLinks[].identifier`. If these don't match, you'll get 403.

---

## 3. Configure Environment

```bash
cd client-poc-apps/user-admin
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Clerk publishable key (same Clerk instance as the API)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here

# Anchor Log API (default for local Functions host)
VITE_API_BASE_URL=http://localhost:7071
```

---

## 4. Install & Run

```bash
npm install
npm run dev
```

The app starts at **http://localhost:3001**.

---

## 5. Configure CONSENT_BASE_URL (API side)

For the consent redirect flow to work, the API needs to know where to
send users for consent. Add to `local.settings.json` (repo root):

```json
{
  "Values": {
    "CONSENT_BASE_URL": "http://localhost:3001"
  }
}
```

Restart the API after this change.

When a third-party app hits a 403 `app_not_installed`, the response will
include:

```json
{
  "error": "app_not_installed",
  "details": {
    "consent_url": "http://localhost:3001/consent?client_id=<clientId>"
  }
}
```

---

## 6. Verify It Works

### Sign in

1. Open http://localhost:3001
2. Click **Sign In** → authenticate via Clerk
3. You should see the **Dashboard** with installed apps (empty initially)

### Test consent flow (end-to-end)

1. Start the API: `npm start` (repo root)
2. Start user-admin: `npm run dev` (this directory)
3. Start client-poc: `npm run dev` (`client-poc-apps/client-poc/`)
4. Sign in to the client-poc with an OAuth profile
5. If the app is not installed, the client-poc should redirect to the
   user-admin consent page
6. Review permissions → click **Allow & Continue**
7. You should be redirected back to the client-poc, now authenticated

### Test dashboard

1. Navigate to http://localhost:3001
2. The dashboard should show the app you just installed
3. Click **Uninstall** to remove it
4. Return to the client-poc — it should trigger the consent flow again

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  client-poc      │     │  user-admin       │     │  Anchor Log API │
│  :5173           │     │  :3001            │     │  :7071          │
│  (third-party)   │     │  (first-party)    │     │                 │
│  OAuth PKCE      │     │  ClerkProvider    │     │                 │
└────────┬─────────┘     └────────┬──────────┘     └────────┬────────┘
         │                        │                         │
         │ 1. GET /api/entries    │                         │
         │───────────────────────────────────────────────►  │
         │                        │       2. 403 consent_url│
         │◄──────────────────────────────────────────────── │
         │                        │                         │
         │ 3. Redirect to         │                         │
         │    consent_url ────────►                         │
         │                        │                         │
         │                        │ 4. GET install-manifest │
         │                        │────────────────────────►│
         │                        │                         │
         │                        │ 5. POST install         │
         │                        │────────────────────────►│
         │                        │                         │
         │ 6. Redirect back       │                         │
         │◄────────────────────── │                         │
         │                        │                         │
         │ 7. GET /api/entries (now installed)               │
         │───────────────────────────────────────────────►  │
         │                        │           8. 200 OK     │
         │◄──────────────────────────────────────────────── │
```

---

## Ports & Services

| Service | Port | Auth Mode |
|---------|------|-----------|
| Anchor Log API | 7071 | JWT validation (Clerk issuer) |
| client-poc | 5173 | OAuth PKCE (third-party) |
| user-admin | 3001 | ClerkProvider (first-party) |

---

## Troubleshooting

### "Missing VITE_CLERK_PUBLISHABLE_KEY"

You forgot to create `.env.local` or the key is empty. Copy `.env.example`
and fill in your Clerk publishable key.

### 403 on API calls from user-admin

The client registry doesn't recognize the user-admin app. Check:

1. **`identityLinks[].identifier`** in the seed script matches
   `http://localhost:3001` (or wherever you're running)
2. You've run the seed script: `npx tsx scripts/seed-clients.ts --env dev`
3. The API is running with `USE_REAL_CLIENT_REGISTRY=true`

### Consent page says "Missing client_id parameter"

The consent page requires `?client_id=X` in the URL. This is normally
provided by the API's 403 response. For manual testing:

```
http://localhost:3001/consent?client_id=19JXZgASj7D9y3xy&return_url=http://localhost:5173
```

### CORS errors

Make sure the API's `Host.CORS` in `local.settings.json` allows all
origins (`"*"`) or specifically includes `http://localhost:3001`.

### JWT template not found

If `getToken({ template: 'anchor-log' })` returns null, the JWT template
doesn't exist in your Clerk Dashboard. Create one named `anchor-log`
(see step 1 above).

---

## See Also

- [User-Admin README](../README.md) — app overview and consent flow
- [ADR-017: Route-Based Install Exemption & Consent](../../docs/architecture/decisions/017-route-based-install-exemption-and-consent-architecture.md)
- [P15 Task Spec](../../tasks/phase4/p15-user-admin-app/README.md)
- [Testing Auth with POC](../../docs/setup/testing-auth-with-poc.md)
- [Seed Script](../../scripts/seed-clients.ts) — client registry seeding
