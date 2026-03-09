# Shared Development Practices

This repository contains **shared, reusable practices** that apply across multiple projects. These are workflow and process guidelines, not project-specific implementation details.

## What Are Shared Practices?

Shared practices are:
- **Reusable workflows**: TDD, code review, design-first processes
- **General standards**: Security review approaches, quality checklists
- **Templates**: AGENTS.md, task structures, documentation templates
- **Process documentation**: How we work, not what we build

Shared practices are **NOT**:
- Project-specific security patterns (those go in `docs/local-practices/`)
- Implementation details tied to specific codebases
- Technology-specific patterns (e.g., "how to use React hooks")
- Architecture Decision Records for specific projects

## Integration: Git Subtree

This repo is designed to be integrated into projects as a **git subtree**. This allows:
- Projects to pull updates from shared practices
- Projects to push improvements back
- Clean separation between shared and local practices

See [git-subtree-workflow.md](git-subtree-workflow.md) for setup instructions.

## Shared vs Local: Decision Framework

When adding a practice, ask yourself:

| Question | Shared Practices | Local Practices |
|----------|-----------------|-----------------|
| Would this apply to other projects? | ✅ Yes | ❌ No |
| Is this about workflow or implementation? | Workflow ✅ | Implementation ❌ |
| Does it mention specific code/APIs/domain? | ❌ No | ✅ Yes |

**Default to breaking things apart:** Extract the general workflow (shared) from the specific implementation (local).

## Lost and Found

If you find project-specific content in shared-practices:

1. Copy it to `shared-practices/lost-and-found/[date]-[project]/`
2. Document what was found and why it doesn't belong
3. Generalize the shared version
4. Push cleanup back to shared-practices repo
5. Move project-specific parts to your `docs/local-practices/`

See [git-subtree-workflow.md](git-subtree-workflow.md) for details.

## Philosophy

In software development, we strive to adopt practices that adapt to change and enable continuous improvement. Security and data integrity are paramount.

## Core Principles

1. **Security First**: All decisions prioritize security (loopback-only, vault sandboxing, validation)
2. **Design Before Code**: ADRs document decisions before implementation
3. **Test-Driven Development**: Write tests first, especially for security-critical code
4. **Iterative Development**: Work in small, incremental cycles
5. **Collaboration**: Communicate openly and effectively
6. **Simplicity**: Always strive for the simplest effective solution
7. **Quality Focus**: Deliver quality work through testing and review
8. **Fresh-Context (Shoshin)**: Every session assumes beginner's mind; practices are the curriculum

## Current Practices

### 0. Phase 0: Project Scaffolding
How to set up a new project with our practices.

**See:** [phase0-scaffolding.md](phase0-scaffolding.md)

### 1. Design-First Development
Write ADRs before implementing significant features or changes.

**See:** [design-first.md](design-first.md)

### 2. Test-Driven Development (TDD)
Write tests before implementing functionality, especially for:
- Security boundaries (path validation, OTP handling)
- Schema validation
- API contracts
- Vault operations

**See:** [tdd-workflow.md](tdd-workflow.md)

### 3. Security Review Standards
All security-related code requires extra scrutiny:
- Path validation logic
- Session management
- OTP handling
- CORS configuration
- Vault sandboxing

**See:** [security-review.md](security-review.md)

### 4. Code Review Standards
Conduct thorough reviews before merging code.

**See:** [code-review-standards.md](code-review-standards.md)

### 5. Working with AI
Guidelines for AI-assisted development in this project.

**See:** [working-with-ai.md](working-with-ai.md)

### 6. Interactive Development
Iterative, feedback-driven development approach.

**See:** [interactive-development.md](interactive-development.md)

### 7. Roadmaps and Project Planning
Where to keep roadmaps, phasing, and strategy docs; keep AGENTS.md and references generic.

**See:** [roadmaps-and-planning.md](roadmaps-and-planning.md)

### 8. Jupyter Notebooks for Calculations
Use interactive Jupyter notebooks to document formulas, calculations, and complex logic with executable examples.

**See:** [jupyter-notebooks-for-calculations.md](jupyter-notebooks-for-calculations.md)

### 9. Contributing
How to contribute to the project.

**See:** [contributing.md](contributing.md)

### 10. Manual Testing with REST Client
Use the VS Code REST Client extension to exercise APIs, validate mock data, and facilitate code reviews.

**See:** [manual-testing-with-rest-client.md](manual-testing-with-rest-client.md)

## Using Shared Practices in Your Project

### Setup

1. Add this repo as a git subtree: `git subtree add --prefix shared-practices ...`
2. Create `docs/local-practices/` for project-specific patterns
3. Update your `AGENTS.md` to reference both locations
4. Review shared-practices for any project-specific leakage

See [git-subtree-workflow.md](git-subtree-workflow.md) for complete instructions.

### When to Use What

- **Start with shared-practices/** for workflow and process
- **Move to docs/local-practices/** for implementation details
- **Bias toward shared**: Default to generalizing and pushing upstream
- **Don't be lazy**: Don't dump everything in local just because it's easier

### Keeping It Clean

Projects using shared-practices are responsible for:
- Reporting project-specific content that snuck into shared
- Using the lost-and-found process to help clean up
- Contributing improvements back via git subtree push
- Splitting learnings into shared (workflow) vs local (implementation)

## Project-Specific Practices

Project-specific security and implementation rules belong in your project's local documentation (for example, under `docs/local-practices/` or `docs/architecture/`). Keep these shared practices focused on reusable workflow and standards so they can be shared across projects.

**Bias toward shared:** When you learn something, take the time to split it into shared (reusable workflow) and local (specific implementation). Push the shared parts upstream!

## How to Use This

Follow the practices listed here to guide your development work. When in doubt, ask!

## Evolution

Our practices will evolve over time as we learn and adapt. Document learnings in task PROGRESS.md files and propose practice updates via PRs.

## Questions?

If a practice is unclear or you think we need a new one, let's discuss!
