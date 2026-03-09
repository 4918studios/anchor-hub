# Jupyter Notebooks for Calculations & Formulas

## Principle

**Use Jupyter notebooks (.ipynb) for documenting calculations, formulas, and complex logic.** This provides interactive, executable reference documentation that can be validated and extended over time.

## Why Use Notebooks?

1. **Executable documentation**: Readers can run and modify examples
2. **Visual validation**: See outputs alongside formulas
3. **Version controlled**: Standard `.ipynb` format works with Git
4. **Multiple rendering**: GitHub (passive), VS Code (interactive), Binder (web interactive)
5. **Maintainable**: Easy to extend with new sections as calculations grow
6. **Testable**: Examples can match test fixtures for validation

## When to Use Notebooks

Use notebooks for:
- Mathematical formulas and calculations (proration, variance, metrics)
- Complex business logic that benefits from examples
- Algorithm demonstrations with step-by-step execution
- Time-series calculations or data transformations
- Technical reference that grows over time

**Don't use notebooks for:**
- Simple API documentation (use markdown)
- Architecture decision records (use ADR template)
- Process workflows (use markdown)
- Code that belongs in the application (write tests instead)

## Structure

Organize notebook sections:

1. **Introduction**: Brief overview, links to related docs
2. **Terms & Definitions**: Glossary table for quick reference
3. **Setup**: Import libraries, define helper functions
4. **Calculation Sections**: One per formula/concept
   - Explanation in markdown
   - Formula with variables defined
   - Executable code example
   - Output/validation
5. **Extension Guide**: How to add new sections

## Notebook Template Pattern

```markdown
## N. [Calculation Name]

**Rules:**
- Rule 1
- Rule 2

**Formula:**

```
variable = calculation
result = formula(inputs)
```

**Example:**
```

Then add executable code cell with:
- Mock data setup
- Calculation execution
- Output/validation

## Rendering Options

### GitHub (Passive)
- Push `.ipynb` to GitHub
- Automatically renders (read-only)
- Shows code + outputs

### VS Code (Interactive)
- Open `.ipynb` in VS Code
- Install Jupyter extension
- Run/edit cells interactively

### Binder (Web Interactive)
- Add badge to notebook:
  ```markdown
  [![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/USER/REPO/main?filepath=path%2Fto%2Fnotebook.ipynb)
  ```
- Users can run in browser (no local setup)

## Location

Place notebooks near related documentation:
- `docs/architecture/calculations.ipynb` — calculation formulas
- `docs/api/examples.ipynb` — API usage examples
- `docs/algorithms/[name].ipynb` — specific algorithms

## Maintenance

- **Keep examples aligned with tests**: Use same mock data as test fixtures
- **Update when logic changes**: Treat notebooks as living documentation
- **Add sections incrementally**: Extend as calculations grow
- **Link from markdown docs**: Reference notebooks from ADRs, README, etc.

## Example

See [docs/architecture/calculations.ipynb](../../docs/architecture/calculations.ipynb) for the PPM calculations reference notebook.

## Git and Notebooks

Notebooks are JSON and can create merge conflicts. Tips:

- **Clear outputs before committing** (optional; some teams prefer outputs for passive viewing)
- **Use nbdiff/nbmerge tools** for better conflict resolution
- **Keep cells focused** (smaller cells = easier to merge)
- **Commit frequently** when working on notebooks

## Questions?

If you're unsure whether a notebook is appropriate, ask:
- Would this benefit from executable examples?
- Will this calculation grow over time?
- Do stakeholders need to see outputs without running code?

If yes to any, a notebook is likely a good fit.
