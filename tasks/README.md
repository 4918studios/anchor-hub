# Task Management

This folder contains task specifications and work logs for anchor-hub development.

## Structure

```
tasks/
├── STATUS.md                  # Current task status board
├── README.md                  # This file
├── _template/                 # Templates for new tasks
│   ├── README.md              # Task specification template
│   ├── PLAN.md                # Sprint plan template
│   ├── PROGRESS.md            # Progress tracking template
│   ├── TESTING.md             # Testing notes template
│   ├── REVIEW.md              # Review checklist template
│   └── RETRO.md               # Retrospective template
├── phase0/                    # Scaffolding (A1)
│   └── README.md              # Phase 0 summary
└── (future phases as tasks are created)
```

## Task Lifecycle

1. **Ready** — Task spec is complete, dependencies met, available for pickup
2. **In Progress** — Someone is actively working on it
3. **Blocked** — Waiting on something (dependency, decision, external)
4. **Done** — Completed and verified

## For Developers / Agents

### Picking Up a Task

1. Check [STATUS.md](STATUS.md) for available tasks
2. Read the task README for scope and acceptance criteria
3. Note "Files to Read" for context
4. Note "Files to Create/Modify" for scope
5. Update STATUS.md when claiming / completing

### Planning

See [PLAN.md](../PLAN.md) for the extraction roadmap (Workstreams A + B).

### Completing a Task

1. Ensure all acceptance criteria are met
2. Update PROGRESS.md with final notes
3. Create TESTING.md with test instructions
4. Create REVIEW.md with review checklist
5. Update STATUS.md
6. Create RETRO.md with learnings
