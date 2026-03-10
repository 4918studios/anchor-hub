# ADR-001: Migrate from Azure to AWS

**Status:** Accepted
**Date:** 2026-03-09

## Context

anchor-hub was initially scaffolded on Azure Functions v4 + Cosmos DB to match anchor-log's stack. However, the project is pre-production with no deployed infrastructure, no data, and all services running against in-memory stubs. This is the optimal moment to evaluate cloud provider choice before A2 (wiring real database containers) commits us to a platform.

Key factors:
- anchor-hub needs: compute (HTTP API), document storage (client/user registries), and a place to run NATS
- The auth callout service runs as a sidecar to NATS, not as a serverless function
- anchor-log remains on Azure for now — the two services communicate via HTTP API, so cloud coupling is minimal
- The team has more experience with AWS and the broader ecosystem

## Summary

Migrate anchor-hub from Azure Functions v4 + Cosmos DB to AWS Lambda + API Gateway + DynamoDB. Run NATS on a Lightsail instance. The migration is mechanical because all service logic is behind interfaces — only the compute wrapper and database implementation change.

## Decision

### Compute: Azure Functions v4 → AWS Lambda + API Gateway

- Replace `@azure/functions` with plain Lambda handlers behind API Gateway
- Each function file becomes a Lambda handler with standard `(event, context) => response` signature
- API Gateway provides routing, CORS, and the HTTP interface
- Use AWS SAM or CDK for infrastructure-as-code (decided in a future ADR)

### Storage: Cosmos DB → DynamoDB

- Multi-table design (mirrors existing container structure):
  - `anchor-hub-clients` table — PK: `clientId`, GSI1: `provider#identifier`
  - `anchor-hub-users` table — PK: `userId`, GSI1: `issuer#subject`
  - `anchor-hub-audit` table — PK: `userId`, SK: `timestamp`, GSI1: `requestId`
- On-demand capacity mode (pay per request — ideal for pre-production)
- No RU planning, no partition key hot-spot tuning

### NATS: Lightsail instance

- $5/mo (1 GB RAM, 1 vCPU) — more than sufficient for NATS
- Static IP, TLS via Let's Encrypt, WebSocket on port 443
- Auth callout sidecar runs on same instance (or as container)
- Lightsail SSD encryption at rest by default

### What doesn't change

- Clerk for authentication (cloud-agnostic)
- Service interfaces, stubs, types — all cloud-agnostic
- Audit pipeline (auditSink, auditedHandler)
- Error hierarchy, identifiers, request context
- anchor-tds and anchor-log — unaffected by this change

## Consequences

### Positive

- **Lower operational complexity** — DynamoDB on-demand eliminates RU capacity planning; Lambda free tier covers early usage
- **Simpler NATS hosting** — Lightsail is a single VM with static IP, no Kubernetes or container orchestration
- **Larger ecosystem** — more community resources, tooling, and documentation for Lambda + DynamoDB
- **Cost** — at pre-production scale, AWS free tier + Lightsail $5/mo is cheaper than Azure Functions + Cosmos DB RUs
- **Clean break** — anchor-hub has no Azure infrastructure to decommission

### Negative

- **Two clouds** — anchor-log stays on Azure (for now), anchor-hub moves to AWS. Cross-cloud HTTP calls add ~10-20ms latency
- **DynamoDB query model** — less flexible than Cosmos DB SQL queries. Identity link lookups require Global Secondary Indexes
- **Learning curve** — SAM/CDK setup and API Gateway configuration are new infrastructure concerns
- **Migration cost** — A1 scaffold needs rework (compute wrapper, package.json dependencies, local dev setup)

### Neutral

- **anchor-log migration** — this decision doesn't commit anchor-log to move. It can stay on Azure indefinitely since the integration is HTTP-based
- **Local development** — shifts from Azure Functions Core Tools to SAM CLI or plain Node.js. Stubs work the same either way

## Alternatives Considered

| Alternative | Why not chosen |
|-------------|----------------|
| Stay on Azure | Works, but no production infrastructure exists yet. The migration cost only grows over time. AWS ecosystem advantages justify the switch now. |
| Migrate both anchor-hub and anchor-log to AWS simultaneously | Too much scope. anchor-log has working Cosmos DB queries, blob storage, and tested infrastructure. Migrate independently when ready. |
| Use Fargate/ECS instead of Lambda | Over-engineered for the current scale. Lambda is simpler to deploy and cheaper at low volume. Can revisit if cold starts become a problem. |
| DynamoDB single-table design | More complex data modeling for marginal query savings. Multi-table maps 1:1 to existing interfaces and is easier to reason about. Can consolidate later. |

## References

- [PLAN.md](../../PLAN.md) — Extraction plan (updated to reflect AWS)
- [ADR-018](https://github.com/4918studios/anchor-log/blob/main/docs/architecture/decisions/018-horizontal-platform-architecture.md) — Horizontal Platform Architecture (extraction rationale)
- [ADR-013](https://github.com/4918studios/anchor-log/blob/main/docs/architecture/decisions/013-client-and-user-access-control.md) — Access control model (unchanged by this migration)
