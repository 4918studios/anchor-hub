# Code Review Standards

## Principle

**Review → Validate → Align → Approve**

Code reviews ensure quality, catch issues early, and maintain consistency across the codebase.

## Review Process

### 1. Source of Truth

**Verify against authoritative sources:**
- [ ] ADRs followed correctly
- [ ] Task spec requirements met
- [ ] API contracts match OpenAPI spec (when exists)
- [ ] Security model followed (ADR-003)

### 2. Completeness

**Check all deliverables:**
- [ ] All acceptance criteria met
- [ ] Tests added/updated (required)
- [ ] Documentation updated (README, ADRs, etc.)
- [ ] PROGRESS.md updated
- [ ] STATUS.md updated

### 3. Consistency

**Verify patterns and conventions:**
- [ ] Follows established patterns
- [ ] Naming conventions consistent
- [ ] Error handling consistent
- [ ] Logging consistent (no sensitive data)

### 4. Security

**Security-critical code requires extra scrutiny:**
- [ ] Path validation correct
- [ ] Session management correct
- [ ] Input validation complete
- [ ] No arbitrary path acceptance
- [ ] Security tests cover attack scenarios

See [security-review.md](security-review.md) for detailed security checklist.

### 5. Quality

**Code quality checks:**
- [ ] Tests pass
- [ ] No obvious bugs
- [ ] Error handling appropriate
- [ ] Edge cases considered
- [ ] Performance acceptable

## Review Checklist

### For All Code

- [ ] **Correctness**: Does it work as intended?
- [ ] **Tests**: Are there tests? Do they pass?
- [ ] **Security**: Any security concerns?
- [ ] **Readability**: Is it clear and maintainable?
- [ ] **Documentation**: Is it documented appropriately?

### For Security-Critical Code

- [ ] **Path validation**: All paths validated?
- [ ] **Session handling**: OTPs burned? Tokens validated?
- [ ] **Input validation**: All inputs validated?
- [ ] **Attack scenarios**: Security tests present?
- [ ] **Logging**: No sensitive data logged?

### For API Endpoints

- [ ] **Contract**: Matches OpenAPI spec (when exists)?
- [ ] **Validation**: Schema validation present?
- [ ] **Errors**: Appropriate error codes (401/403/422/500)?
- [ ] **Security**: Session token required?
- [ ] **Tests**: Integration tests present?

### For File Operations

- [ ] **Atomic writes**: Uses temp + rename pattern?
- [ ] **Cleanup**: Temp files cleaned up on error?
- [ ] **Path validation**: Paths validated before use?
- [ ] **Error handling**: Appropriate error handling?

## Review Workflow

1. **Checkout branch**: `git checkout feature/branch-name`
2. **Read context**: Task spec, PROGRESS.md, related ADRs
3. **Review code**: Apply checklists above
4. **Run tests**: `npm test`
5. **Manual testing**: Try it out (if applicable)
6. **Discuss**: Real-time conversation with author
7. **Fix issues**: Author fixes on same branch
8. **Re-review**: Verify fixes
9. **Approve**: Merge when ready

## Common Issues to Watch For

### Security Issues

- Accepting arbitrary paths from clients
- Not validating vault containment
- Not burning OTPs
- Logging sensitive data
- Binding to `0.0.0.0` instead of `127.0.0.1`

### Quality Issues

- Missing tests
- Incomplete error handling
- Magic numbers/strings
- Inconsistent naming
- Missing documentation

### Pattern Violations

- Not using atomic writes for file operations
- Not using vault service for path resolution
- Not validating schemas before writes
- Inconsistent error codes

## Giving Feedback

### Good Feedback

**Specific and actionable:**
```
In `src/agent/vault.ts:42`, the path validation doesn't check for symlinks.
This could allow escaping the vault via symlinks. Suggest adding:

const realPath = fs.realpathSync(resolved);
if (!realPath.startsWith(vaultRoot)) {
  throw new SecurityError('Symlink escape attempt');
}
```

**References standards:**
```
Per ADR-003 section 4.2, all file writes must use atomic pattern.
This write operation doesn't use temp + rename. Please refactor to use
vault.writeAtomic() instead of fs.writeFile().
```

### Poor Feedback

**Too vague:**
```
This doesn't look secure.
```

**Not actionable:**
```
I don't like this approach.
```

## Receiving Feedback

- **Assume good intent**: Reviewers are trying to help
- **Ask questions**: If feedback is unclear, ask for clarification
- **Discuss trade-offs**: If you disagree, discuss the trade-offs
- **Fix issues**: Address feedback promptly
- **Document decisions**: Update PROGRESS.md with decisions made

## When to Approve

Approve when:
- [ ] All checklists satisfied
- [ ] All issues addressed
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Security reviewed (for security-critical code)

## When to Block

Block when:
- Security issues present
- Tests missing or failing
- Requirements not met
- Pattern violations not addressed

## Questions?

If you're unsure about a review decision, discuss with the team!
