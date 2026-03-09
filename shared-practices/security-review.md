# Security Review Standards

## Principle

**Security is paramount.** All security-critical code requires extra scrutiny and validation.

## Security-Critical Areas

Code that touches these areas requires security review:

1. **Path Resolution and Validation**
   - Any code that resolves file paths
   - Any code that reads/writes files
   - Vault boundary checks

2. **Session Management**
   - OTP generation and validation
   - Session token generation and validation
   - Session TTL and expiry logic

3. **Network Binding**
   - Server startup and binding
   - CORS configuration
   - Origin validation

4. **Input Validation**
   - Schema validation
   - Path parameter validation
   - Query parameter validation

5. **File Operations**
   - Atomic write implementation
   - Temp file handling
   - Error cleanup

## Security Review Checklist

### Path Validation

- [ ] All paths resolved to absolute paths
- [ ] All resolved paths verified to start with vault root
- [ ] Symlinks and junctions handled (rejected if escape vault)
- [ ] `..` segments rejected
- [ ] Illegal characters rejected
- [ ] No arbitrary path parameters accepted from clients

### Session Security

- [ ] OTPs have short TTL (5 min max)
- [ ] OTPs are burned immediately after use
- [ ] OTPs cannot be reused
- [ ] Session tokens are cryptographically random
- [ ] Session tokens have rolling TTL
- [ ] Expired sessions handled gracefully
- [ ] No session tokens logged

### Network Security

- [ ] Server binds to `127.0.0.1` only (never `0.0.0.0`)
- [ ] HTTPS enforced (no HTTP fallback)
- [ ] CORS allowlist configured correctly
- [ ] Origin header validated
- [ ] No wildcard origins

### Input Validation

- [ ] All inputs validated against schema
- [ ] Validation errors return 422 with details
- [ ] No sensitive data in error messages
- [ ] No sensitive data in logs

### File Operations

- [ ] All writes use atomic pattern (temp + rename)
- [ ] Temp files cleaned up on error
- [ ] File permissions appropriate
- [ ] No race conditions in write operations

## Security Testing Requirements

All security-critical code must have tests for:

### Path Traversal Attacks

```typescript
describe('Path Traversal Security', () => {
  it('should reject ../ segments', () => {
    expect(() => vault.resolvePath('../etc/passwd')).toThrow(SecurityError);
  });
  
  it('should reject absolute paths outside vault', () => {
    expect(() => vault.resolvePath('/etc/passwd')).toThrow(SecurityError);
  });
  
  it('should reject paths with encoded ../', () => {
    expect(() => vault.resolvePath('%2e%2e%2fetc%2fpasswd')).toThrow(SecurityError);
  });
  
  it('should reject symlinks escaping vault', () => {
    // Create symlink pointing outside vault
    fs.symlinkSync('/etc/passwd', path.join(vaultRoot, 'evil'));
    expect(() => vault.resolvePath('evil')).toThrow(SecurityError);
  });
});
```

### Session Security Attacks

```typescript
describe('Session Security', () => {
  it('should reject reused OTP', async () => {
    const otp = session.generateOTP();
    await session.establishSession(otp);
    await expect(session.establishSession(otp)).rejects.toThrow('Invalid OTP');
  });
  
  it('should reject expired OTP', async () => {
    const otp = session.generateOTP();
    jest.advanceTimersByTime(OTP_TTL + 1000);
    await expect(session.establishSession(otp)).rejects.toThrow('OTP expired');
  });
  
  it('should reject forged session token', async () => {
    const forged = 'forged-token-12345';
    expect(session.validateToken(forged)).toBe(false);
  });
  
  it('should reject expired session token', async () => {
    const token = await session.establishSession(otp);
    jest.advanceTimersByTime(SESSION_TTL + 1000);
    expect(session.validateToken(token)).toBe(false);
  });
});
```

### CORS Security

```typescript
describe('CORS Security', () => {
  it('should reject requests from unauthorized origin', async () => {
    await request(app)
      .get('/projects')
      .set('Origin', 'https://evil.com')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(403);
  });
  
  it('should accept requests from authorized origin', async () => {
    await request(app)
      .get('/projects')
      .set('Origin', ALLOWED_ORIGIN)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
  });
});
```

## Security Review Process

1. **Author**: Write security tests first (attack scenarios)
2. **Author**: Implement with defensive coding
3. **Reviewer**: Review code with security focus
4. **Reviewer**: Verify all security tests pass
5. **Reviewer**: Try to break it (manual security testing)
6. **Both**: Document security assumptions

## Common Security Pitfalls

### 1. Trusting Client Input

**Bad:**
```typescript
const filePath = path.join(vaultRoot, req.params.path);
await fs.readFile(filePath);
```

**Good:**
```typescript
const filePath = vault.resolvePath(req.params.path); // validates vault containment
await vault.read(filePath);
```

### 2. Logging Sensitive Data

**Bad:**
```typescript
logger.info('Session established', { otp, sessionToken });
```

**Good:**
```typescript
logger.info('Session established', { userId: session.userId });
```

### 3. Weak Random Generation

**Bad:**
```typescript
const otp = Math.random().toString(36).substring(7);
```

**Good:**
```typescript
const otp = crypto.randomBytes(32).toString('hex');
```

### 4. Not Burning OTPs

**Bad:**
```typescript
if (otpStore.get(otp) === true) {
  return generateSessionToken();
}
```

**Good:**
```typescript
if (otpStore.get(otp) === true) {
  otpStore.delete(otp); // Burn immediately
  return generateSessionToken();
}
```

### 5. Binding to All Interfaces

**Bad:**
```typescript
app.listen(7443, '0.0.0.0'); // Exposed to network!
```

**Good:**
```typescript
app.listen(7443, '127.0.0.1'); // Loopback only
```

## Defensive Coding Patterns

### Always Validate Paths

```typescript
function resolvePath(relativePath: string): string {
  // Resolve to absolute
  const resolved = path.resolve(vaultRoot, relativePath);
  
  // Verify vault containment
  if (!resolved.startsWith(vaultRoot)) {
    throw new SecurityError('Path escape attempt');
  }
  
  // Check for symlinks (optional, platform-dependent)
  const realPath = fs.realpathSync(resolved);
  if (!realPath.startsWith(vaultRoot)) {
    throw new SecurityError('Symlink escape attempt');
  }
  
  return resolved;
}
```

### Always Burn OTPs

```typescript
async function establishSession(otp: string): Promise<SessionToken> {
  const otpData = otpStore.get(otp);
  
  if (!otpData || otpData.expiresAt < Date.now()) {
    throw new AuthError('Invalid or expired OTP');
  }
  
  // Burn OTP immediately (before any other operations)
  otpStore.delete(otp);
  
  // Generate session token
  const token = generateSessionToken();
  sessionStore.set(token, { userId: otpData.userId, expiresAt: Date.now() + SESSION_TTL });
  
  return token;
}
```

### Always Use Atomic Writes

```typescript
async function writeAtomic(filePath: string, content: any): Promise<void> {
  const tempPath = `${filePath}.tmp.${Date.now()}`;
  
  try {
    // Write to temp file
    await fs.writeFile(tempPath, JSON.stringify(content, null, 2));
    
    // Validate written content
    const written = await fs.readFile(tempPath, 'utf-8');
    validateSchema(JSON.parse(written));
    
    // Atomic rename
    await fs.rename(tempPath, filePath);
  } catch (err) {
    // Cleanup temp file on error
    try {
      await fs.unlink(tempPath);
    } catch {}
    throw err;
  }
}
```

## Security Documentation

All security-critical code should include:

1. **Threat model**: What attacks are we defending against?
2. **Security boundaries**: What are the trust boundaries?
3. **Assumptions**: What do we assume about the environment?
4. **Failure modes**: What happens if this fails?

Example:
```typescript
/**
 * Resolves a relative path within the vault and validates containment.
 * 
 * SECURITY: This is a critical security boundary. All file operations
 * must go through this function to prevent path traversal attacks.
 * 
 * Threat model:
 * - Attacker controls relativePath (from API request)
 * - Attacker tries to escape vault using ../, absolute paths, symlinks
 * 
 * Defense:
 * - Resolve to absolute path
 * - Verify starts with vault root
 * - Reject symlinks that escape vault
 * 
 * Failure mode:
 * - Throws SecurityError if path escapes vault
 * - Caller must handle and return 403 to client
 */
function resolvePath(relativePath: string): string {
  // ...
}
```

## Questions?

If you're unsure about a security decision, **ask before implementing**. Security issues are expensive to fix later.
