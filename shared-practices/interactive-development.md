# Interactive Development

## Principle

**Build iteratively with rapid feedback cycles.**

Interactive development emphasizes short feedback loops, continuous validation, and incremental progress.

## The Feedback Loop

```
Design → Implement → Test → Review → Refine → Repeat
   ↑                                              ↓
   └──────────────────────────────────────────────┘
```

## For This Project

### Phase 0: Proof-of-Concept

**Goal**: Validate core architecture quickly

**Approach**:
1. **Design**: Write ADR for vault structure
2. **Implement**: Create example vault files
3. **Test**: Manually verify structure makes sense
4. **Review**: Discuss with team
5. **Refine**: Adjust based on feedback
6. **Repeat**: Move to next component (agent skeleton)

**Feedback loops**:
- ADR review: 1-2 days
- Manual testing: Minutes to hours
- Team discussion: Real-time

### Phase 1: MVP Pilot

**Goal**: Production-ready for small group

**Approach**:
1. **Design**: Write ADR for feature
2. **Implement**: TDD - write tests first
3. **Test**: Automated tests + manual testing
4. **Review**: Code review + security review
5. **Refine**: Address feedback
6. **Deploy**: Pilot with 6 users
7. **Gather feedback**: Real user feedback
8. **Repeat**: Next feature

**Feedback loops**:
- Test feedback: Seconds (automated)
- Code review: Hours to days
- User feedback: Days to weeks

## Rapid Iteration Techniques

### 1. Start Small

**Don't:**
```
Build entire vault structure + agent + all endpoints + tray app
```

**Do:**
```
1. Define vault structure (design)
2. Create agent skeleton (minimal)
3. Add one endpoint (validate approach)
4. Add tests (validate quality)
5. Iterate
```

### 2. Test Early

**Don't:**
```
Write all code → Write all tests → Debug everything
```

**Do:**
```
Write one test → Write minimal code to pass → Refactor → Repeat
```

### 3. Get Feedback Often

**Don't:**
```
Work in isolation for weeks → Submit massive PR
```

**Do:**
```
Share ADR early → Discuss approach → Submit small PRs → Iterate
```

### 4. Validate Assumptions

**Don't:**
```
Assume OneDrive sync will work → Build entire system → Test sync
```

**Do:**
```
Test OneDrive sync behavior early (F6) → Validate assumptions → Build on solid foundation
```

## Working with AI

AI excels at rapid iteration:

1. **Generate boilerplate** → Review → Refine
2. **Generate tests** → Review → Add edge cases
3. **Refactor code** → Review → Validate
4. **Generate docs** → Review → Clarify

See [working-with-ai.md](working-with-ai.md) for details.

## Manual Testing Workflow

For Phase 0 (before automated tests):

1. **Start agent**: `npm start`
2. **Test health**: `curl -k https://localhost:7443/health`
3. **Generate OTP**: Check tray app (or manual script)
4. **Establish session**: `curl -k -X POST https://localhost:7443/session/establish -d '{"otp":"..."}'`
5. **Test endpoint**: `curl -k -H "Authorization: Bearer <token>" https://localhost:7443/projects`
6. **Verify vault**: Check files written to test-vault/
7. **Verify sync**: Check OneDrive sync status

**Document results** in PROGRESS.md.

## Automated Testing Workflow

For Phase 1+ (with automated tests):

1. **Write test**: Define expected behavior
2. **Run test**: `npm test` (should fail - red)
3. **Implement**: Write minimal code to pass
4. **Run test**: `npm test` (should pass - green)
5. **Refactor**: Improve code while keeping tests green
6. **Commit**: Commit working code + tests

## Debugging Workflow

When something doesn't work:

1. **Reproduce**: Create minimal reproduction case
2. **Isolate**: Narrow down to specific component
3. **Hypothesize**: What could cause this?
4. **Test hypothesis**: Add logging, breakpoints, tests
5. **Fix**: Implement fix
6. **Verify**: Ensure fix works and doesn't break other things
7. **Document**: Update PROGRESS.md with learnings

## Integration Testing

For API endpoints:

1. **Start agent** in test mode (test vault)
2. **Run integration tests**: `npm test -- tests/integration`
3. **Verify vault state**: Check files written
4. **Verify error handling**: Test error scenarios
5. **Verify security**: Test attack scenarios

## Performance Testing

For rollup computations:

1. **Create realistic test data**: Large project hierarchy
2. **Measure baseline**: Time rollup computation
3. **Optimize**: Improve algorithm
4. **Measure again**: Verify improvement
5. **Document**: Record performance characteristics

## User Feedback Loop

For pilot phase:

1. **Deploy**: Pilot with 6 users
2. **Observe**: Watch for issues, confusion, requests
3. **Gather feedback**: Structured feedback sessions
4. **Prioritize**: What's critical vs nice-to-have?
5. **Iterate**: Implement high-priority improvements
6. **Repeat**: Next feedback cycle

## Continuous Improvement

After each task:

1. **Retro**: What went well? What didn't?
2. **Document**: Update PROGRESS.md with learnings
3. **Improve practices**: Update practices/ if needed
4. **Share**: Discuss learnings with team

## Questions?

If the feedback loop feels slow or you're stuck, ask! We can figure out how to iterate faster.
