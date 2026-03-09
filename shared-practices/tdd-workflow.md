# Test-Driven Development (TDD) Workflow

## Principle

**Write tests first.** Tests define the contract before implementation begins.

## Why TDD for This Project

1. **Security**: Critical for validating security boundaries
2. **Confidence**: Refactor safely knowing tests catch regressions
3. **Design**: Writing tests first improves API design
4. **Documentation**: Tests document expected behavior
5. **Quality**: Catches edge cases early

## The Red-Green-Refactor Cycle

1. **Red**: Write a failing test
2. **Green**: Write minimal code to make it pass
3. **Refactor**: Improve code while keeping tests green

## Priority Areas for TDD

### 1. Security Boundaries (CRITICAL)

**Path Validation:**
```typescript
describe('Vault Path Validation', () => {
  it('should reject paths with .. segments', () => {
    expect(() => vault.resolvePath('../etc/passwd')).toThrow(SecurityError);
  });
  
  it('should reject paths outside vault root', () => {
    expect(() => vault.resolvePath('/etc/passwd')).toThrow(SecurityError);
  });
  
  it('should accept valid relative paths', () => {
    const resolved = vault.resolvePath('finance/actuals/2026-01.json');
    expect(resolved).toStartWith(vaultRoot);
  });
});
```

**Session Management:**
```typescript
describe('Session Token Management', () => {
  it('should burn OTP after successful exchange', async () => {
    const otp = session.generateOTP();
    await session.establishSession(otp);
    await expect(session.establishSession(otp)).rejects.toThrow('Invalid OTP');
  });
  
  it('should expire sessions after TTL', async () => {
    const token = await session.establishSession(otp);
    jest.advanceTimersByTime(SESSION_TTL + 1000);
    expect(session.validateToken(token)).toBe(false);
  });
});
```

### 2. Schema Validation

```typescript
describe('Status Report Validation', () => {
  it('should accept valid status report', () => {
    const valid = {
      nodeId: 'PRJ001',
      period: '2026-07',
      health: 'green',
      narrative: 'On track'
    };
    expect(() => validateStatusReport(valid)).not.toThrow();
  });
  
  it('should reject invalid health values', () => {
    const invalid = { ...valid, health: 'invalid' };
    expect(() => validateStatusReport(invalid)).toThrow(ValidationError);
  });
});
```

### 3. API Contracts

```typescript
describe('POST /statusReports/upsert', () => {
  it('should create new status report', async () => {
    const response = await request(app)
      .post('/statusReports/upsert')
      .set('Authorization', `Bearer ${sessionToken}`)
      .send(validStatusReport)
      .expect(201);
    
    expect(response.body).toHaveProperty('nodeId', 'PRJ001');
  });
  
  it('should return 401 without valid session', async () => {
    await request(app)
      .post('/statusReports/upsert')
      .send(validStatusReport)
      .expect(401);
  });
});
```

### 4. Vault Operations

```typescript
describe('Atomic File Writes', () => {
  it('should write file atomically', async () => {
    await vault.writeAtomic('test.json', { data: 'test' });
    const content = await vault.read('test.json');
    expect(content).toEqual({ data: 'test' });
  });
  
  it('should cleanup temp file on validation failure', async () => {
    await expect(
      vault.writeAtomic('test.json', { invalid: 'schema' })
    ).rejects.toThrow();
    
    const tempFiles = await fs.readdir(vaultRoot);
    expect(tempFiles.filter(f => f.includes('.tmp'))).toHaveLength(0);
  });
});
```

## Test Organization

```
tests/
  unit/
    services/
      vault.test.ts
      session.test.ts
      validation.test.ts
    lib/
      pathUtils.test.ts
  integration/
    api/
      session.test.ts
      statusReports.test.ts
      forecasts.test.ts
  security/
    pathTraversal.test.ts
    sessionSecurity.test.ts
    corsValidation.test.ts
```

## Security Test Scenarios

Always test attack scenarios:

**Path Traversal:**
- `../../../etc/passwd`
- `/etc/passwd`
- `finance/../../admin/config.yaml`
- Symlinks pointing outside vault
- Windows UNC paths

**Session Security:**
- Reusing burned OTPs
- Expired session tokens
- Forged session tokens
- Concurrent session establishment

**CORS:**
- Requests from unauthorized origins
- Missing Origin header
- Wildcard origin attempts

## Running Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Security tests only
npm test -- tests/security
```

## Test Coverage Goals

- **Security code**: 100% coverage required
- **API endpoints**: 100% coverage required
- **Validation logic**: 100% coverage required
- **Utility functions**: 90%+ coverage
- **Overall**: 85%+ coverage

## When to Skip TDD

TDD is not required for:
- Exploratory prototypes (mark as `prototype/` folder)
- Throwaway scripts
- Documentation

But security-critical code ALWAYS requires tests first.

## Questions?

If you're unsure how to test something, ask! We can figure it out together.
