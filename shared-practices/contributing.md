# Contributing

## Welcome!

Thanks for contributing! This guide will help you get started.

## Before You Start

1. Read [ONBOARDING.md](../docs/ONBOARDING.md)
2. Review [practices/](.) to understand our standards
3. Check [tasks/STATUS.md](../tasks/STATUS.md) for available tasks

**Fresh-context principle:** This repo is designed for shoshin (beginner’s mind). Assume you are new every session. The docs and practices are the source of truth.

## Development Workflow

### 1. Pick a Task

- Check [STATUS.md](../tasks/STATUS.md) for "Ready for Pickup" tasks
- Read the task README (cover/overview)
- Claim the task (update STATUS.md and task README.md)

### 2. Validate the Plan (first step of the sprint)

- Read [PLAN.md](../tasks/_template/PLAN.md) in the task folder
- Do a quick planning pass: key reads, key questions, scope checks
- Update PLAN.md status to `validated` with a short validation summary

### 2. Create a Branch

```bash
git checkout -b feature/task-id-description
# Example: git checkout -b feature/f1-vault-structure
```

### 3. Work on the Task

- Follow [design-first.md](design-first.md) - Write ADRs before code
- Follow [tdd-workflow.md](tdd-workflow.md) - Write tests first
- Update PROGRESS.md as you work
- Create TESTING.md when tests are added
- Create REVIEW.md near sprint end (for API/mock tasks, include runnable `http` blocks for manual testing — see Task Documentation below)
- Create RETRO.md at sprint end
- Commit frequently with clear messages

### 4. Commit Standards

**Commit message format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `test`: Adding tests
- `refactor`: Code refactoring
- `security`: Security fix or improvement
- `chore`: Maintenance

**Examples:**
```
feat(vault): add path validation with symlink detection

Implements vault sandboxing per ADR-003. All paths are now validated
to ensure they stay within vault root, including symlink resolution.

Closes #12
```

```
security(session): burn OTP immediately after use

OTPs are now deleted from the store immediately after successful
session establishment to prevent reuse attacks.

Related to ADR-003 section 4.2
```

### 5. Run Tests

```bash
# Run all tests
npm test

# Run specific tests
npm test -- tests/security

# Run with coverage
npm test -- --coverage
```

### 6. Between-Task Cleanup

Run the [between-task-cleanup](between-task-cleanup.md) checklist:

- `npm test && npm run build` — verify nothing is broken
- Update STATUS.md — mark task as done
- Update PROGRESS.md — log deliverables and key decisions
- Update REVIEW.md — add manual verification steps
- Update README.md / ADRs if decisions changed
- Commit with proper format and push

### 7. Sprint Closeout (fresh eyes)

- Run a closeout pass (can be a separate task with a new context)
- Validate REVIEW.md checklist passes
- Fix formatting/links and stabilize artifacts
- Integrate learnings into docs/practices/architecture or [docs/UNPROCESSED_LEARNINGS.md](../docs/UNPROCESSED_LEARNINGS.md)
- Seed next steps into the next task’s PLAN.md
- Update [tasks/STATUS.md](../tasks/STATUS.md) and GitHub Projects

### 8. Create Pull Request

```bash
git push -u origin feature/task-id-description
```

Then create PR on GitHub with:
- **Title**: Task title (e.g., "F1: Vault Structure Definition")
- **Description**: Link to task spec + summary of changes
- **Labels**: phase, status

### 9. Address Review Feedback

- Respond to comments
- Make requested changes
- Push to same branch (PR updates automatically)
- Re-request review when ready

### 10. Merge

Once approved:
- Squash and merge (or merge commit, depending on project preference)
- Delete branch after merge

## Code Standards

### TypeScript

- Use strict mode
- Prefer interfaces over types for public APIs
- Use explicit return types for functions
- Avoid `any` (use `unknown` if needed)

### Naming Conventions

- **Files**: kebab-case (`vault-service.ts`)
- **Classes**: PascalCase (`VaultService`)
- **Functions**: camelCase (`resolvePath`)
- **Constants**: UPPER_SNAKE_CASE (`SESSION_TTL`)
- **Interfaces**: PascalCase (`IVaultService` or `VaultService`)

### Error Handling

```typescript
// Use custom error classes
throw new SecurityError('Path escape attempt');
throw new ValidationError('Invalid schema', { details });

// Handle errors appropriately
try {
  await vault.write(path, content);
} catch (err) {
  if (err instanceof ValidationError) {
    return res.status(422).json({ error: 'VALIDATION_FAILED', details: err.details });
  }
  if (err instanceof SecurityError) {
    logger.warn('Security violation', { path, err });
    return res.status(403).json({ error: 'FORBIDDEN' });
  }
  logger.error('Unexpected error', { err });
  return res.status(500).json({ error: 'INTERNAL_ERROR' });
}
```

### Logging

```typescript
// Good: No sensitive data
logger.info('Session established', { userId: session.userId });
logger.info('File written', { path: relativePath });

// Bad: Sensitive data logged
logger.info('Session established', { otp, sessionToken });
logger.info('File written', { path, content });
```

## Testing Standards

### Test Organization

```
tests/
  unit/           # Unit tests (isolated, fast)
  integration/    # Integration tests (full API flows)
  security/       # Security tests (attack scenarios)
```

### Test Coverage

- Security code: 100% required
- API endpoints: 100% required
- Validation logic: 100% required
- Overall: 85%+ target

### Test Naming

```typescript
describe('VaultService', () => {
  describe('resolvePath', () => {
    it('should resolve valid relative path', () => {
      // ...
    });
    
    it('should reject path with .. segments', () => {
      // ...
    });
    
    it('should reject absolute path outside vault', () => {
      // ...
    });
  });
});
```

## Security Standards

**Critical**: All security-related code requires:
- Security tests (attack scenarios)
- Security review
- Documentation of threat model

See [security-review.md](security-review.md) for full standards.

## Documentation Standards

### Code Comments

```typescript
/**
 * Resolves a relative path within the vault and validates containment.
 * 
 * SECURITY: Critical security boundary. All file operations must use this.
 * 
 * @param relativePath - Path relative to vault root
 * @returns Absolute path within vault
 * @throws SecurityError if path escapes vault
 */
function resolvePath(relativePath: string): string {
  // ...
}
```

### ADRs

- Write ADRs before implementing significant changes
- Use the template in `docs/architecture/decisions/_template.md`
- Update ADR index when adding new ADRs

### Task Documentation

- Validate PLAN.md before implementation
- Update PROGRESS.md as you work
- Capture testing notes in TESTING.md
- Provide a human checklist in REVIEW.md. For API or mock-server tasks, add a **Manual testing** section with runnable HTTP requests: use fenced code blocks with the `http` language tag so the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) VS Code extension can "Send Request" on each block (see e.g. `tasks/phase1/api-stubs-mock-server/REVIEW.md`). Reviewers can scroll the doc and run or tweak requests in place.
- Capture learnings in RETRO.md and integrate them during closeout

## Getting Help

If you're stuck or have questions:

1. Check existing documentation (ONBOARDING.md, practices/, ADRs)
2. Ask in the task's GitHub Issue
3. Ask the team/lead directly

## Questions?

If anything is unclear, please ask! We'd rather clarify upfront than have you spin.
