# Design-First Development

## Principle

**Write ADRs before code.** Architectural decisions should be documented and reviewed before implementation begins.

## Why This Matters

1. **Clarity**: Forces us to think through implications before committing
2. **Communication**: Creates shared understanding across team/agents
3. **Reversibility**: Documents why we made choices (helps future changes)
4. **Quality**: Catches design issues before they become code issues
5. **Security**: Critical for security-sensitive decisions

## When to Write an ADR

Write an ADR when:
- Making a security-related decision
- Choosing between multiple valid approaches
- Introducing a new pattern or convention
- Changing existing architecture
- Making decisions with long-term implications

## ADR Template

See `docs/architecture/decisions/_template.md` for the standard template.

## Process

1. **Identify decision**: What needs to be decided?
2. **Research options**: What are the alternatives?
3. **Draft ADR**: Document context, options, decision, consequences
4. **Review**: Discuss with team/lead
5. **Finalize**: Merge ADR
6. **Implement**: Build according to ADR
7. **Update if needed**: ADRs can be amended or superseded

## Example ADRs for This Project

- **ADR-001: Vault Model** - Folder structure, ownership, artifact types
- **ADR-002: API Design** - Domain operations, OpenAPI, error semantics
- **ADR-003: Security Model** - Loopback binding, OTP, session tokens
- **ADR-004: Data Model** - Projects, portfolios, forecasts

## Security-Critical Decisions

For security-related ADRs, include:
- **Threat model**: What attacks are we defending against?
- **Security boundaries**: What are the trust boundaries?
- **Failure modes**: What happens if this fails?
- **Validation**: How do we verify this works?

## Living Documents

ADRs are living documents:
- Can be amended with new sections
- Can be superseded by new ADRs
- Should be updated when implementation reveals new insights

## Anti-Patterns

**Don't:**
- Write code first, ADR later (defeats the purpose)
- Write ADRs for trivial decisions (adds noise)
- Make ADRs too abstract (be specific and actionable)
- Skip ADRs for "obvious" security decisions (document them!)

## Questions?

If you're unsure whether something needs an ADR, ask!
