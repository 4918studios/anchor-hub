# User-Admin App

First-party app for managing installed third-party applications and hosting
the consent screen for the Anchor Log platform.

## Purpose

1. **Consent host** — When a third-party app tries to access data without user
   consent, the API returns `403` with a `consent_url` pointing here. The user
   reviews permissions and accepts/declines.

2. **App management** — Dashboard showing installed apps with uninstall buttons.

3. **Account self-service** — (Future) Clerk `<UserProfile />` for account settings.

## Setup

```bash
cd client-poc-apps/user-admin
cp .env.example .env.local
# Edit .env.local with your Clerk publishable key and API URL
npm install
npm run dev
# → http://localhost:3001
```

## Auth Model

This app uses `ClerkProvider` directly (first-party Clerk session), **not**
OAuth PKCE. When users arrive from a third-party app's consent redirect, Clerk
SSO auto-authenticates them since they share the same Clerk instance.

## Consent Flow

```
Third-party app → API returns 403 app_not_installed
  → includes consent_url: https://user-admin.example.com/consent?client_id=X
  → app redirects browser to consent_url (appends &return_url=<current-url>)

User-admin consent page:
  1. Fetches install manifest
  2. Shows permissions (can/cannot)
  3. User clicks Allow → installs → redirects back to return_url
  4. User clicks Decline → shows declined message
```

## Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Dashboard | List installed apps, uninstall |
| `/consent?client_id=X&return_url=Y` | Consent | Review & accept/decline app permissions |

## See Also

- [Quickstart Guide](docs/QUICKSTART.md) — step-by-step setup with Clerk, registry seeding, and troubleshooting
- [ADR-017: Route-Based Install Exemption & Consent Architecture](../../docs/architecture/decisions/017-route-based-install-exemption-and-consent-architecture.md)
- [P15 Task Spec](../../tasks/phase4/p15-user-admin-app/README.md)
