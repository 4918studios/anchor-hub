# Working with AI

## Philosophy

AI agents are powerful development partners when given clear context and constraints. This project is designed for AI-assisted development.

## Before Starting Work

AI agents should:

1. **Read AGENTS.md** - Understand the workflow
2. **Read ONBOARDING.md** - Get project context
3. **Read docs/architecture/overview.md** - Architecture overview (source of truth)
4. **Read relevant ADRs** in docs/architecture/decisions/ - Understand specific decisions
5. **Read practices/** - Understand development standards

## AI Strengths for This Project

- **Scaffolding**: Creating boilerplate (API routes, tests, types)
- **Pattern application**: Applying security patterns consistently
- **Test generation**: Writing comprehensive test suites
- **Documentation**: Keeping docs in sync with code
- **Refactoring**: Safe refactoring with test coverage

## AI Limitations to Be Aware Of

- **Security intuition**: May not catch subtle security issues
- **Context limits**: May miss cross-file dependencies
- **Platform specifics**: Windows vs macOS differences
- **Sync behavior**: OneDrive/ShareDrive edge cases

## Effective Prompting

### Good Prompts

**Specific and constrained:**
```
Implement the POST /statusReports/upsert endpoint following ADR-002.
Include:
- Schema validation using Zod
- Path validation (vault sandboxing)
- Atomic file write
- Tests for security scenarios
```

**References context:**
```
Update the session token validation to implement the rolling TTL
described in ADR-003 section 4.2. Include tests for:
- Token refresh on activity
- Expiry after idle timeout
- Locked state behavior
```

### Poor Prompts

**Too vague:**
```
Add a status report feature
```

**Missing constraints:**
```
Create an API endpoint for uploading files
(Missing: security requirements, validation, vault mapping)
```

## Security-Critical Code

When working on security-critical code:

1. **Ask AI to generate attack scenarios first**
   - "What path traversal attacks should we test?"
   - "What session token attacks should we defend against?"

2. **Review AI-generated security code carefully**
   - Path validation logic
   - Session management
   - CORS configuration

3. **Request security-focused tests**
   - "Generate tests for path traversal attacks"
   - "Generate tests for OTP reuse attempts"

## Iterative Development with AI

### Pattern: Test-First with AI

1. **Human**: "We need to implement vault path validation per ADR-003"
2. **AI**: Generates security test scenarios
3. **Human**: Reviews tests, adds edge cases
4. **AI**: Implements validation logic to pass tests
5. **Human**: Reviews implementation, security audit
6. **AI**: Refactors based on feedback

### Pattern: ADR-Driven Implementation

1. **Human**: "Write ADR for session management"
2. **AI**: Drafts ADR with options
3. **Human**: Reviews, makes decision
4. **AI**: Implements based on finalized ADR
5. **Human**: Validates against ADR

## Code Review with AI

AI can help with reviews:

```
Review this path validation code for security issues:
[paste code]

Check for:
- Path traversal vulnerabilities
- Symlink handling
- Windows-specific edge cases
- Error handling
```

## Documentation with AI

AI excels at documentation:

```
Generate API documentation for these endpoints:
[paste route definitions]

Include:
- Request/response schemas
- Error codes
- Security requirements
- Example requests
```

## Common AI Pitfalls

### 1. Over-Generalization

**AI might suggest:**
```typescript
// Generic file server
app.get('/files/:path', (req, res) => {
  res.sendFile(req.params.path);
});
```

**We need:**
```typescript
// Domain-specific, vault-sandboxed
app.get('/statusReports/:nodeId/:period', async (req, res) => {
  const vaultPath = vault.resolveStatusReportPath(
    req.params.nodeId,
    req.params.period
  );
  // ... validation, security checks ...
});
```

### 2. Missing Security Checks

**AI might generate:**
```typescript
const filePath = path.join(vaultRoot, userInput);
await fs.writeFile(filePath, content);
```

**We need:**
```typescript
const filePath = vault.resolvePath(userInput); // validates vault containment
await vault.writeAtomic(filePath, content); // atomic write
```

### 3. Incomplete Error Handling

**AI might generate:**
```typescript
try {
  await vault.write(path, content);
} catch (err) {
  res.status(500).json({ error: 'Write failed' });
}
```

**We need:**
```typescript
try {
  await vault.write(path, content);
} catch (err) {
  if (err instanceof ValidationError) {
    return res.status(422).json({
      error: 'VALIDATION_FAILED',
      details: err.details
    });
  }
  if (err instanceof SecurityError) {
    logger.warn('Security violation attempt', { path, err });
    return res.status(403).json({ error: 'FORBIDDEN' });
  }
  logger.error('Write failed', { path, err });
  res.status(500).json({ error: 'INTERNAL_ERROR' });
}
```

## AI + Human Collaboration

Best results come from:
- **AI**: Generates comprehensive boilerplate, tests, docs
- **Human**: Reviews security, makes architectural decisions, handles edge cases
- **AI**: Refactors based on feedback
- **Human**: Final security audit

## Task Handoff Between AI Agents

When handing off between agents:

1. **Update PROGRESS.md** with current state
2. **Document decisions** in PROGRESS.md
3. **Link to relevant code** for context
4. **Note blockers or questions** explicitly
5. **Update STATUS.md** to reflect current phase

## Questions for AI

Good questions to ask AI:

- "What security tests should we add for this endpoint?"
- "What edge cases are we missing in this validation?"
- "Generate comprehensive tests for this security boundary"
- "What are the Windows-specific considerations for this code?"
- "Review this code for path traversal vulnerabilities"

## Questions for Humans

When AI should ask humans:

- Security architecture decisions
- Trade-offs between approaches
- Business logic clarifications
- Platform-specific deployment questions
- When stuck on a blocker

## Continuous Improvement

Document learnings:
- What prompts worked well?
- What AI-generated code needed fixes?
- What patterns should be templated?
- What should be added to practices?

Add learnings to task PROGRESS.md files.
