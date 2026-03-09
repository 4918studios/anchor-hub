# Working With Me

When I ask you to work on this project:

1. **Start with practices** - Read `shared-practices/` to understand how we work
2. **Get oriented** - Start with `README.md`, then `PLAN.md`
3. **Check current status** - See `tasks/STATUS.md` for what's in progress
4. **Understand the lineage** - This service was extracted from anchor-log's auth layer
5. **Ask before assuming** - If the task isn't clear, ask!

**Fresh-context principle**: Every session starts with beginner's mind (shoshin). The documentation is your curriculum.

## Workflow

### Building Features

1. Read `shared-practices/` (process and workflow)
2. Read `PLAN.md` (extraction plan and architecture)
3. Read `docs/ONBOARDING.md` (project context, when available)
4. Read `docs/architecture/` (how it works, ADRs)
5. Validate/create `PLAN.md` for your task
6. Work, test, commit (see `shared-practices/tdd-workflow.md`)
7. Create PR when done

### Reviewing

1. Read `shared-practices/` (review standards)
2. Check out the branch
3. Review code, docs, tests, PLAN.md
4. Apply practices as checklist
5. Discuss with human (not PR comments)
6. Fix on same branch, merge when approved

See `shared-practices/` for detailed workflows on TDD, code review, security review, etc.

## Key Context

anchor-hub was extracted from anchor-log. The canonical references for the auth model are:

- `anchor-log/docs/architecture/decisions/013-client-and-user-access-control.md` (ADR-013)
- `anchor-log/docs/architecture/authn-authz-walkthrough.md` (full auth chain reference)
- `anchor-log/docs/architecture/decisions/018-horizontal-platform-architecture.md` (ADR-018)

The auth callout service source lives here but deploys as a sidecar to the NATS server.

## Quick Reference

- **How we work**: `shared-practices/`
- **What we're building**: `README.md` and `PLAN.md`
- **Architecture decisions**: `docs/architecture/decisions/` (when created)
- **Current tasks**: `tasks/STATUS.md`
- **Templates**: `tasks/_template/`

When in doubt, ask! I'm here to help.
