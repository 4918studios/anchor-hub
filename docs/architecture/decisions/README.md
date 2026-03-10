# Architecture Decision Records (ADRs)

This folder contains decision records documenting significant architectural and design choices for anchor-hub.

## What's an ADR?

An Architecture Decision Record captures:
- **Context** — Why a decision was needed
- **Decision** — What was decided
- **Consequences** — Trade-offs and implications

ADRs are numbered sequentially and never deleted (superseded decisions are marked as such).

## Inherited Decisions

anchor-hub was extracted from anchor-log. These ADRs from anchor-log are foundational:

| ID | Title | Relevance |
|----|-------|-----------|
| [ADR-013](https://github.com/4918studios/anchor-log/blob/main/docs/architecture/decisions/013-client-and-user-access-control.md) | Client, User, and Policy Access Control Model | Auth chain, registries, policy model |
| [ADR-014](https://github.com/4918studios/anchor-log/blob/main/docs/architecture/decisions/014-platform-core-profile-gateway-boundary.md) | Platform Core, Domain Profiles, and Gateway Boundary | Service boundary definition |
| [ADR-018](https://github.com/4918studios/anchor-log/blob/main/docs/architecture/decisions/018-horizontal-platform-architecture.md) | Horizontal Platform Architecture | Extraction rationale |

## anchor-hub Decisions

| ID | Title | Status | Date |
|----|-------|--------|------|
| _(none yet — first ADR will be created when A2+ requires a design decision)_ | | | |

## Creating a New ADR

1. Copy [_template.md](_template.md)
2. Number sequentially (e.g., `001-your-decision.md`)
3. Fill out all sections
4. Update the [Architecture Overview](../overview.md) to reflect the decision
5. Update this README with the new row
6. Submit PR for review
