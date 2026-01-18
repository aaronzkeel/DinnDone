# Design-OS + Autocoder Integration Checklist

> Quick-reference for merging Design-OS specs with Autocoder execution.

---

## Pre-Flight Checks

Verify Design-OS output is complete:

- [ ] `product-plan/product-overview.md` — Has overview, data model, design system
- [ ] `product-plan/instructions/incremental/01-foundation.md` — Foundation milestone
- [ ] `product-plan/instructions/incremental/02-*.md` — At least one section milestone
- [ ] `product-plan/sections/[name]/README.md` — Section requirements
- [ ] `product-plan/sections/[name]/components/` — Pre-built React components
- [ ] `product-plan/sections/[name]/tests.md` — Test instructions

---

## Cleanup Tasks

Remove duplicates and conflicts:

```bash
# 1. Delete redundant spec file
rm prompts/app_spec.txt

# 2. Delete design-os prompts (using autocoder prompts instead)
rm -rf product-plan/prompts/
```

---

## File Updates

### CLAUDE.md

Add these sections:

```markdown
## Design Assets Location

All design specs are in `product-plan/`:
- `product-overview.md` — Full product specification
- `sections/[name]/` — Components, types, sample data, screenshots
- `instructions/incremental/` — Build order and requirements

## For Coding Agents

Before implementing any feature:
1. Check `product-plan/sections/` for pre-built components
2. Use components as-is — DO NOT redesign
3. Wire up props to your API/routing
4. Match screenshots exactly
```

### prompts/initializer_prompt.md

Replace spec file reference:

```markdown
# OLD
Start by reading `app_spec.txt`

# NEW
Start by reading:
1. `product-plan/product-overview.md` — Product spec
2. `product-plan/instructions/incremental/*.md` — All milestones
3. `product-plan/sections/*/README.md` — Section requirements
```

### prompts/coding_prompt.md

Add design assets section:

```markdown
## DESIGN ASSETS (CHECK FIRST)

Before coding, check `product-plan/sections/[relevant-section]/`:

| Asset | Location | Usage |
|-------|----------|-------|
| Components | `components/*.tsx` | Copy and wire up — don't redesign |
| Types | `types.ts` | Import for type safety |
| Sample data | `sample-data.json` | Use during development |
| Screenshots | `*.png` | Visual reference |
| Tests | `tests.md` | Write tests first (TDD) |
```

---

## Feature Count

Check `product-plan/product-overview.md` for `<feature_count>` tag.

If specified, create exactly that many features in the initializer.

---

## Dependency Strategy

Map milestones to feature dependencies:

| Milestone File | Feature Dependencies |
|----------------|---------------------|
| `01-foundation.md` | None (run first) |
| `02-*.md` | Foundation features |
| `03-*.md` | Foundation features |
| `04-*.md` | Foundation + possibly earlier sections |
| `05-*.md` | Foundation + possibly earlier sections |

Create WIDE dependency graphs — sections that don't depend on each other can run in parallel.

---

## Validation

After setup, verify:

- [ ] Only ONE spec file exists (`product-plan/product-overview.md`)
- [ ] No `prompts/app_spec.txt`
- [ ] No `product-plan/prompts/` folder
- [ ] `CLAUDE.md` mentions `product-plan/`
- [ ] Initializer prompt references `product-plan/`
- [ ] Coding prompt includes design assets instructions

---

## Run Order

1. **Human:** Review and approve this integration
2. **Initializer Agent:** Create features from `product-plan/`
3. **Coding Agents:** Implement features using design assets
4. **Testing Agents:** Regression test passing features

---

*See `docs/design-os-to-autocoder-guide.md` for full documentation.*
