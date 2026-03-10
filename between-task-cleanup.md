# Between-Task Cleanup

## Principle

**Clean close, clean start.** Every task gets a clean boundary — code committed, docs updated, progress recorded, review guide written. The next task (or the next person) starts from a known-good state.

## When to Use

Run this process **after completing each task** and **before starting the next one**. It applies whether you're working solo, with AI, or handing off to someone else.

## The Checklist

### 1. Verify the work

```bash
# Tests pass
npm test

# Build passes (catch type errors, missing imports)
npm run build

# No uncommitted changes you forgot about
git status
```

### 2. Update task tracking

- [ ] **STATUS.md** — Mark the completed task as `✅ Done`; update next task if starting it
- [ ] **PROGRESS.md** — Add an entry for the completed task:
  - Date completed
  - Deliverables (files created/modified)
  - Key decisions made
- [ ] **REVIEW.md** — Add manual verification steps so a human can check the work:
  - Commands to run
  - Expected outputs
  - Things to visually inspect
  - Files checklist

### 3. Commit with proper format

Follow the [contributing commit standards](contributing.md):

```bash
git add <files>
git commit -m "<type>(<scope>): <subject>

<body — what was done and why>"
```

Common types for task completion:
- `feat` — New feature or capability
- `refactor` — Restructuring without behavior change
- `test` — Tests only
- `docs` — Documentation only
- `chore` — Maintenance (deps, config, cleanup)

### 4. Push

```bash
git push origin <branch>
```

### 5. Sanity check

After pushing, quick gut check:
- Does the remote branch have everything?
- If someone cloned fresh right now, would they have a working project?
- Are there any secrets, temp files, or debug code left in?

## Quick Reference (Copy-Paste)

For speed, here's the minimal version:

```bash
# 1. Verify
npm test && npm run build

# 2. Update docs
# → STATUS.md: mark done
# → PROGRESS.md: log deliverables + decisions
# → REVIEW.md: add verification steps

# 3. Commit + push
git add -A
git commit -m "<type>(<scope>): <subject>"
git push origin <branch>
```

## Relationship to Code Review

This process is **complementary** to [code-review-standards.md](code-review-standards.md):

| Between-Task Cleanup | Code Review |
|----------------------|-------------|
| Self-service, after every task | Peer review, before merge |
| Quick (2-5 minutes) | Thorough (15-60 minutes) |
| "Did I finish clean?" | "Is this correct and safe?" |
| Updates PROGRESS + REVIEW | Uses REVIEW as input |
| Catches forgotten files, broken builds | Catches logic errors, security issues |

The REVIEW.md you write during cleanup becomes the **manual testing guide** for the code reviewer. Good cleanup makes good reviews faster.

## Anti-Patterns

- **Skipping docs** — "I'll update STATUS.md later" → you won't, and the next session starts confused
- **Giant commits** — If you're committing 10 files across 3 tasks, you skipped cleanup between them
- **No REVIEW.md** — If a human can't verify your work without reading every line of code, the review guide is missing
- **Pushing broken builds** — Always `npm run build` before push; don't make the next person debug your type errors

## For AI-Assisted Development

When working with an AI coding agent, this process is especially important:

- AI sessions are stateless — the cleanup docs **are** the handoff
- PROGRESS.md tells the next session what was done and why
- REVIEW.md tells you (the human) how to verify AI-generated code
- STATUS.md tells the next session where to pick up
- Clean commits make `git log` useful for understanding AI's work

See [working-with-ai.md](working-with-ai.md) for more on AI collaboration patterns.
