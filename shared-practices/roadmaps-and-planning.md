# Roadmaps and Project Planning Artifacts

A generic approach to where and how to keep roadmaps, phasing, and other project-planning documentation.

## Purpose

Projects need a place for:
- High-level phasing (e.g. Phase 0, 1, 2)
- Strategy and rationale (why we're building what, in what order)
- Alignment with other systems or repos (e.g. API contracts, upstream owners)

This practice describes **where** such artifacts can live and **how** to keep them discoverable without hard-coding paths in agent or contributor docs.

## Where Planning Artifacts Can Live

Each project chooses. Keep **one** primary place and link to it from README (and optionally STATUS). Options:

| Location | Use when |
|---------|----------|
| **README.md** | Short roadmap or "Status" section is enough; no separate doc needed |
| **docs/roadmap.md** (or **docs/planning.md**) | Dedicated roadmap/phasing doc; linked from README |
| **docs/architecture/** | Roadmap lives alongside ADRs and overview (e.g. `docs/architecture/roadmap.md`) |
| **docs/planning/** | Multiple planning docs (roadmap, strategy, release plan); link the folder from README |

**Recommendation:** Prefer a single, clearly named artifact (e.g. `roadmap.md` or `planning/README.md`) and one link from the main README. Avoid scattering "where is the roadmap?" across several files.

## Planning vs. tasks (where does execution tracking live?)

**Planning** = strategy, phasing, roadmap (the "what and why and when").  
**Tasks** = execution tracking (current work, backlog, phase task folders, STATUS).

Two common patterns:

| Pattern | Planning docs | Execution tracking | Use when |
|--------|----------------|--------------------|----------|
| **Planning in docs, tasks at root** | `docs/planning/` (e.g. roadmap.md) | `tasks/` at repo root (STATUS, phase0/, phase1/, _template/) | You want one place for strategy and one for "what we're doing now." Keeps `tasks/` easy to find; planning lives with other docs. |
| **Planning at root** | `planning/` at root (e.g. planning/roadmap.md) | `tasks/` at root | You want a visible top-level "planning" folder; tasks stay at root. |

**Recommendation:** Prefer **planning in docs** (`docs/planning/`) and **tasks at root** (`tasks/`). That way roadmap and strategy live alongside other documentation, and task tracking stays in a familiar place. Link from README to `docs/planning/` (or the main roadmap); link from `tasks/STATUS.md` to the planning doc. Do not feel obliged to put the tasks folder inside a planning folder — "planning" usually means the documents, not the execution board.

## How to Reference in AGENTS.md and Elsewhere

Keep references **generic** so the same AGENTS.md (or template) works across projects:

- **Good:** "Phasing and strategy: See README and docs (roadmap, planning, or architecture — wherever this project keeps them)."
- **Avoid:** "Phasing and strategy: `docs/roadmap.md`" (unless every project will use that exact path).

README is the entry point; README should point to the actual roadmap or planning doc for this project.

## Linking From Tasks

- **tasks/STATUS.md** should link to the project's roadmap or planning doc (whatever path the project chose).
- Phase READMEs (e.g. `tasks/phase1/README.md`) can link to the same doc for context.

## Keeping It Maintainable

- **Single source of truth:** One canonical place for phasing and strategy; other docs link to it.
- **Update when phases change:** When you add a phase or change strategy, update the roadmap and STATUS together.
- **No duplication:** Don't copy long roadmap text into README; summarize and link.

## Summary

- Projects choose where the roadmap/planning lives (README section, `docs/roadmap.md`, `docs/architecture/`, or `docs/planning/`).
- README points to it; STATUS and phase docs can link to it.
- AGENTS.md and shared references stay generic ("see README and docs for roadmap/planning").
