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

**A1 complete** — Scaffold deployed with DI, stubs, audit wrapper, all 7 endpoints.
Migrated from Azure to AWS (ADR-001).
Next: **A2** — Wire real DynamoDB tables. See [tasks/STATUS.md](tasks/STATUS.md).

## Quick start

```bash
npm install
cp .env.example .env      # default stub config
npm start                  # local dev server on :3000
```

Endpoints are available at `http://localhost:3000/*`. All services use in-memory stubs by default (`AUTH_BYPASS=true`). See `.env.example` for toggles.

## Documentation

- [PLAN.md](PLAN.md) — Extraction plan, architecture, workstream details
- [docs/aws-setup-guide.md](docs/aws-setup-guide.md) — AWS account setup (DynamoDB, Lambda, Lightsail)
- [docs/ONBOARDING.md](docs/ONBOARDING.md) — Getting started
- [docs/architecture/overview.md](docs/architecture/overview.md) — Architecture overview
- [docs/architecture/decisions/](docs/architecture/decisions/) — ADRs (inherited + new)
- [docs/local-practices/](docs/local-practices/) — Project-specific patterns
- [tasks/STATUS.md](tasks/STATUS.md) — Current work board
- `shared-practices/` — How we work (shared across all anchor repos)

## Related repos

- [anchor-log](https://github.com/4918studios/anchor-log) — Durable entry storage
- [anchor-tds](https://github.com/4918studios/anchor-tds) — NATS browser demo
