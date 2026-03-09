# Lost and Found

This folder is for **project-specific content from other projects** that was accidentally included in shared-practices.

## How It Works

### When You're Working on a Project

**Find content that belongs to YOUR project:**
- Just move it to your `docs/local-practices/` 
- Remove it from shared-practices
- Done.

**Find content that belongs to ANOTHER project:**
- Cut it out of shared-practices
- Save it here in lost-and-found (just drop it in a file, format doesn't matter)
- Generalize the shared-practices file
- Submit a PR to clean up shared-practices

### When You Orient to a New Project

1. Check lost-and-found for anything with your project's name or references
2. If you find your project's content, grab it
3. Integrate it into your `docs/local-practices/`
4. Delete it from lost-and-found
5. Done.

## That's It

No special tracking, no elaborate folder structures, no accountability documents. The commit history is the trail. 

## Best Practices

- **Always use PRs** for shared-practices changes (the repo will be locked to require PRs)
- **Separate PR** for shared-practices updates (don't mix with feature work)
- **Check lost-and-found** when you start working on a project
- **Keep it simple** - just save the content, note what project it's from

## Example

You're working on project-a and see this in `security-review.md`:

```markdown
### Project-B Authentication
Always validate project-b tokens using the central auth service...
```

That's not project-a, that's project-b! So:

1. Cut that section
2. Save it to `lost-and-found/project-b-auth.md`
3. Remove it from shared-practices
4. Submit PR

Later, when someone works on project-b:
1. Orient to project, check lost-and-found
2. Find `project-b-auth.md`
3. Copy to `docs/local-practices/security/auth.md` in project-b repo
4. Delete from lost-and-found
5. Done.
