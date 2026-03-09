# Git Subtree Workflow

This document describes how to integrate this shared-practices repository as a git subtree in your project.

## Overview

Git subtree allows you to:
- Keep shared practices synced across multiple projects
- Edit practices directly in either repo
- Maintain a clean history without submodule complexity

## Initial Setup

Add this shared-practices repo as a subtree in your project:

```bash
# Navigate to your project root
cd /path/to/your-project

# Add the subtree (one-time setup)
git subtree add --prefix shared-practices https://github.com/YOUR-ORG/shared-practices.git main --squash
```

Replace:
- `YOUR-ORG` with your GitHub organization/user
- `shared-practices` with your shared practices repo name

## Common Operations

### Pull Updates from shared-practices

When the shared-practices repo has updates:

```bash
git subtree pull --prefix shared-practices https://github.com/YOUR-ORG/shared-practices.git main --squash
```

### Push Changes Back to shared-practices

If you edit files in `shared-practices/` within your project:

```bash
# Commit your changes first
git add shared-practices/
git commit -m "Update shared practices: [description]"

# Push back to the shared-practices repo
# Note: This will create a PR if the repo is protected
git subtree push --prefix shared-practices https://github.com/YOUR-ORG/shared-practices.git main
```

**Best Practice:** Always use a separate commit (and PR) for shared-practices changes. Don't mix with feature work. This makes it clear what's shared vs project-specific.

**Note:** The shared-practices repo should be protected to require PRs. If you try to push directly to main, you'll need to push to a branch and create a PR instead.

### Pushing to a Branch (for PR workflow)

When the shared-practices repo requires PRs:

```bash
# Push to a feature branch instead of main
git subtree push --prefix shared-practices https://github.com/YOUR-ORG/shared-practices.git feature/update-practices

# Then create a PR from that branch on GitHub
```

### Using Remote Shortcuts

To avoid typing the URL repeatedly:

```bash
# Add a remote (one-time setup)
git remote add shared-practices-upstream https://github.com/YOUR-ORG/shared-practices.git

# Then use the remote name
git subtree pull --prefix shared-practices shared-practices-upstream main --squash
git subtree push --prefix shared-practices shared-practices-upstream main
```

## Shared vs Local Practices

### What Goes Where?

- **Shared practices** (`shared-practices/`): 
  - Reusable workflows (TDD, code review, design-first)
  - General standards that apply across projects
  - Templates (AGENTS.md, task structures)
  - Process documentation
  
- **Local practices** (`docs/local-practices/`):
  - Project-specific security patterns
  - Implementation details tied to this codebase
  - Technology-specific patterns (e.g., vault sandboxing, OTP handling)

### Decision Framework

When adding a practice, ask:

1. **"Would this apply to other projects?"**
   - Yes → `shared-practices/`
   - No → `docs/local-practices/`

2. **"Is this about workflow or implementation?"**
   - Workflow → `shared-practices/`
   - Implementation → `docs/local-practices/`

3. **"Does it mention specific code, APIs, or this project's domain?"**
   - Yes → `docs/local-practices/`
   - No → `shared-practices/`

### Philosophy: Default to Shared

**Bias toward breaking things apart** rather than keeping them together:
- When you learn something new, take a moment to split it into shared vs local
- Push reusable patterns upstream to `shared-practices/`
- Don't be lazy and dump everything in `docs/local-practices/`
- Don't leave project-specific details in `shared-practices/`

The goal: Make shared-practices genuinely reusable across all your projects.

## Lost and Found

**For your project's content:** Just move it to `docs/local-practices/` and remove from shared-practices. Done.

**For another project's content:** If you find references to a different project (e.g., you're on folder-vault and see anchor-log references):

1. Cut it out of shared-practices
2. Save it in `shared-practices/lost-and-found/[project-name]-something.md`
3. Generalize the shared-practices file
4. Submit a PR

**When orienting to a project:** Check lost-and-found for your project's content, grab it if found, integrate into your `docs/local-practices/`, delete from lost-and-found.

See [lost-and-found/README.md](lost-and-found/README.md) for details and examples.

## Integrating into Existing Projects

If you're adding shared-practices to a project that already has a `practices/` folder:

### Integration Checklist

- [ ] **Add the subtree**: `git subtree add --prefix shared-practices ...`
- [ ] **Review shared-practices**: Check for any project-specific content that snuck in
  - If found, use lost-and-found process to extract it
- [ ] **Review your existing practices**: Go through your `practices/` folder
  - **Reusable workflows?** → Push to shared-practices via subtree push
  - **Project-specific?** → Move to `docs/architecture/` or appropriate location
  - **Mix of both?** → Split into reusable (shared) and specific (project docs)
- [ ] **Archive old practices folder**: `mv practices _old-practices` (backup)
- [ ] **Update AGENTS.md**: Use `shared-practices/templates/AGENTS.md.template` as reference
- [ ] **Update references**: Search for `practices/` and update to `shared-practices/` or project paths
- [ ] **Test**: Make sure everything still makes sense and is findable
- [ ] **Delete backup**: Remove `_old-practices/` once confident

### Quick Command

Tell an agent:
```
I just added shared-practices as a subtree. Can you follow the integration 
checklist in shared-practices/git-subtree-workflow.md and help migrate our 
existing practices folder?
```

The agent will systematically review, split, and integrate the content.

## New Project Setup

When setting up shared-practices in a brand new project (no existing practices):

- [ ] Add subtree: `git subtree add --prefix shared-practices ...`
- [ ] Copy `shared-practices/templates/AGENTS.md.template` to `AGENTS.md`
- [ ] Update project's README to reference shared-practices
- [ ] Follow `shared-practices/phase0-scaffolding.md` for project setup
- [ ] Review shared-practices for any project-specific content
- [ ] Create project structure per scaffolding guide

## Troubleshooting

### Merge Conflicts

If you get conflicts during `git subtree pull`:

1. Resolve conflicts in `shared-practices/` files
2. Commit the resolution
3. The next pull should be cleaner

### Accidentally Pushed Project-Specific Content

If you accidentally pushed project-specific content to shared-practices:

1. Use the lost-and-found process above
2. Create a PR to clean up the shared repo
3. Communicate with other projects using the shared repo

### Split History Confusion

Git subtree maintains separate histories. Use `git log shared-practices/` to see just the subtree history.
