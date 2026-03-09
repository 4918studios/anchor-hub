# anchor-hub

Platform identity, registry, and policy engine for the anchor ecosystem.

## What is this?

anchor-hub is the central coordination service that manages:

- **Authentication** — JWT validation (Clerk JWKS) and identity resolution
- **Client registry** — Client records, identity links, capabilities, stream permissions
- **User registry** — User records, entitlements, installed apps
- **Policy evaluation** — Scope enforcement, fine-grained resource policies
- **App lifecycle** — Install/uninstall third-party apps, permission manifests
- **NATS auth callout** — Issues scoped User JWTs for NATS WebSocket connections

All participants in the anchor ecosystem (anchor-log, browser apps, agents) authenticate
through anchor-hub. The service resolves identity, evaluates policy, and issues credentials.

## How it fits

```
anchor-hub (this repo)          — identity, registry, policy, auth callout
anchor-log                      — durable entry storage (a participant)
anchor-tds                      — NATS browser demo (validates stream architecture)
```

anchor-hub was extracted from anchor-log's auth layer (ADR-013, ADR-014, ADR-018).
See [PLAN.md](PLAN.md) for the full extraction plan and architecture.

## Status

**Pre-scaffold** — Plan written, repo seeded. See [PLAN.md](PLAN.md) for next steps.

## Quick start

```bash
# Coming soon — scaffold in progress
npm install
npm run build
npm start
```

## Documentation

- [PLAN.md](PLAN.md) — Extraction plan, architecture, workstream details
- `docs/ONBOARDING.md` — Getting started (coming soon)
- `shared-practices/` — How we work (shared across all anchor repos)

## Related repos

- [anchor-log](https://github.com/4918studios/anchor-log) — Durable entry storage
- [anchor-tds](https://github.com/4918studios/anchor-tds) — NATS browser demo
