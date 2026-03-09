# Phase 0: Project Scaffolding

This guide describes how to set up a new project with our development practices.

**Philosophy**: Phase 0 is the scaffolding stage for ANY project. It establishes the operating manual (shared practices), documentation structure, and task management system before feature work begins.

---

## What is Phase 0?

Phase 0 scaffolding creates the foundational structure:
- **shared-practices/** - How we work (the operating manual) - added as git subtree
- **docs/local-practices/** - Project-specific patterns and security practices
- **docs/architecture/** - Architecture documentation and decisions
- **tasks/** - Task management and status tracking
- **Root files** - AGENTS.md, README.md, .gitignore

After Phase 0, feature work begins in Phase 1+.

---

## Phase 0 Checklist

### Core Documentation

- [ ] **README.md** - Project overview, quick links, core concepts
- [ ] **AGENTS.md** - AI agent workflow and quality checklist (use [templates/AGENTS.md.template](templates/AGENTS.md.template))
- [ ] **docs/ONBOARDING.md** - Getting started guide for developers/agents
- [ ] **.gitignore** - Git ignore patterns (node_modules, build artifacts, etc.)

### Shared Practices Setup

- [ ] **Add shared-practices as git subtree** - See [git-subtree-workflow.md](git-subtree-workflow.md)
- [ ] **Review shared-practices content** - Ensure no project-specific content leaked in
- [ ] **Create docs/local-practices/** - For project-specific patterns (see local practices README)

### Architecture Documentation

- [ ] **docs/architecture/overview.md** - Comprehensive architecture overview
- [ ] **docs/architecture/decisions/README.md** - ADR index
- [ ] **docs/architecture/decisions/_template.md** - ADR template for future use
- [ ] **docs/local-practices/README.md** - Overview of local practices (use template from shared-practices repo)

### Task Management

- [ ] **tasks/README.md** - Task management overview
- [ ] **tasks/STATUS.md** - Task status board (current state)
- [ ] **tasks/_template/** - Task specification templates (README, PLAN, PROGRESS, TESTING, REVIEW, RETRO)
- [ ] **tasks/_template/sprint-closeout/** - Sprint closeout task template
- [ ] **tasks/phase0/README.md** - Phase 0 summary (document what you did)
- [ ] **tasks/phase1/** - Prepare Phase 1 structure with initial task folders
- [ ] **docs/UNPROCESSED_LEARNINGS.md** - Inbox for learnings without clear homes

---

## Scaffolding Process

### 1. Create Core Structure

```bash
# Create directory structure
mkdir -p docs/architecture/decisions
mkdir -p docs/local-practices
mkdir -p tasks/_template/sprint-closeout
mkdir -p tasks/phase0
mkdir -p tasks/phase1
```

### 2. Add Shared Practices as Subtree

```bash
# Add shared-practices repo as git subtree
git subtree add --prefix shared-practices https://github.com/YOUR-ORG/shared-practices.git main --squash
```

See [git-subtree-workflow.md](git-subtree-workflow.md) for complete instructions.

### 3. Copy Templates

From `shared-practices/templates/`:
- Copy `AGENTS.md.template` to project root as `AGENTS.md`
- Customize project-specific sections
- Create `docs/local-practices/README.md` (template guidance in shared-practices)

### 4. Create Documentation

Write project-specific docs:
- **README.md**: What is this project? Why does it exist?
- **docs/ONBOARDING.md**: How to get started?
- **docs/architecture/overview.md**: How does it work?
- **docs/local-practices/**: Project-specific patterns and security practices

### 5. Set Up Task Management

- Create **tasks/STATUS.md** with phase structure
- Create **tasks/phase1/** folders for initial feature tasks
- Document Phase 0 work in **tasks/phase0/README.md**

### 6. Document Phase 0

In **tasks/phase0/README.md**, record:
- What was created
- Project structure
- Key decisions made
- Date and status

---

## After Phase 0

Once scaffolding is complete:

1. Commit all Phase 0 work
2. Update **tasks/STATUS.md** to mark Phase 0 complete
3. Move to Phase 1 (feature work)
4. Use task lifecycle: README → PLAN → PROGRESS → TESTING → REVIEW → RETRO → Sprint Closeout

---

## Philosophy: Fresh-Context (Shoshin)

Every session starts with beginner's mind. The scaffolding you create is the curriculum:
- **shared-practices/** = How we work (operating manual)
- **docs/local-practices/** = Project-specific patterns
- **docs/architecture/** = What we're building (context)
- **tasks/** = What needs doing (roadmap)

No institutional knowledge required—just read the docs.

---

## Example: This Repo

See [tasks/phase0/README.md](../../tasks/phase0/README.md) for how this repo's Phase 0 was executed.
