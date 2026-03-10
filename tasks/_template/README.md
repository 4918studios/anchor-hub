---
id: task-id
title: Task Title
status: ready # ready | in_progress | blocked | done
owner: unassigned # @github-username or agent:name
depends_on: [] # [task-id-1, task-id-2]
blocks: [] # [task-id-3, task-id-4]
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# Task Title

## Goal

One sentence describing what this task accomplishes.

## Context

Brief background — why this task exists, what it enables.

## Requirements

- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

## Acceptance Criteria

**Done when:**
- Criterion 1
- Criterion 2

## Files to Read (Context)

Use relative links to existing files:
- [`src/types/client.ts`](../../src/types/client.ts) — Client type definitions
- [`docs/architecture/overview.md`](../../docs/architecture/overview.md) — Architecture context

## Files to Create/Modify

Plain text (files don't exist yet):
- `src/services/implementations/foo.ts` — Foo service implementation

## Files NOT to Touch

- `src/functions/*` — owned by different task

## Notes

Any additional context, links, or considerations.
