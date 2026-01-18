# Design-OS to Autocoder Integration Guide

> **Purpose:** How to merge a Design-OS product plan with the Autocoder framework for AI-driven implementation.

---

## Overview

**Design-OS** generates rich design specifications:
- Product overview and feature descriptions
- Pre-built React components with styling
- TypeScript types and sample data
- Screenshots and visual references
- Test-writing instructions (TDD approach)
- Incremental milestone instructions

**Autocoder** provides execution infrastructure:
- Feature tracking database (SQLite via MCP tools)
- Initializer agent (creates features, sets up project)
- Coding agents (implement features one-by-one with browser verification)
- Testing agents (regression test passing features)
- Progress tracking and parallel execution support

**Together:** Design-OS handles the "what" (specs, designs, components). Autocoder handles the "how" (tracking, verification, autonomous implementation).

---

## File Structure After Integration

```
your-project/
├── CLAUDE.md                    # Unified instructions for all agents
├── product-plan/                # FROM DESIGN-OS (keep as-is)
│   ├── product-overview.md      # Single source of truth for spec
│   ├── README.md                # Design-OS usage instructions
│   ├── design-system/           # Colors, fonts, tokens
│   ├── data-model/              # TypeScript types, entity docs
│   ├── shell/                   # App shell components
│   ├── sections/                # Feature sections
│   │   └── [section-name]/
│   │       ├── README.md        # Feature overview
│   │       ├── tests.md         # Test-writing instructions
│   │       ├── types.ts         # TypeScript interfaces
│   │       ├── sample-data.json # Mock data for development
│   │       ├── components/      # Pre-built React components
│   │       └── *.png            # Screenshots
│   └── instructions/
│       └── incremental/         # Milestone-by-milestone guides
├── prompts/                     # FROM AUTOCODER (modified)
│   ├── initializer_prompt.md    # Creates features from product-plan
│   ├── coding_prompt.md         # Implements features using design assets
│   └── testing_prompt.md        # Regression tests passing features
├── features.db                  # Feature tracking (created by initializer)
└── docs/                        # Project documentation
```

---

## Integration Steps

### Step 1: Bring in Design-OS Output

Copy the entire `product-plan/` folder from Design-OS into your project root.

**Verify you have:**
- [ ] `product-plan/product-overview.md` — The product spec
- [ ] `product-plan/instructions/incremental/` — Milestone instructions
- [ ] `product-plan/sections/` — At least one section with components

### Step 2: Delete Redundant Files

Design-OS and Autocoder both generate spec files. Keep only one:

```bash
# Delete autocoder's app_spec.txt (product-overview.md is the source of truth)
rm prompts/app_spec.txt

# Delete design-os prompts folder (we'll use autocoder's prompts instead)
rm -rf product-plan/prompts/
```

### Step 3: Update CLAUDE.md

Replace the project's CLAUDE.md with unified instructions. Key sections:

```markdown
## Project Structure

- `product-plan/` — Design specs, components, and assets (from Design-OS)
- `prompts/` — Agent prompts for autonomous implementation
- `features.db` — Feature tracking database

## For Coding Agents

When implementing a feature:
1. Read the relevant section in `product-plan/sections/[section-name]/`
2. Use the pre-built components from `components/`
3. Follow types from `types.ts`
4. Reference screenshots for visual accuracy
5. Write tests based on `tests.md`

## For the Initializer Agent

Create features organized by the milestones in `product-plan/instructions/incremental/`:
1. Foundation (01-foundation.md)
2. [Section 1] (02-*.md)
3. [Section 2] (03-*.md)
... and so on
```

### Step 4: Update Initializer Prompt

Modify `prompts/initializer_prompt.md` to read from `product-plan/`:

**Change this:**
```markdown
Start by reading `app_spec.txt` in your working directory.
```

**To this:**
```markdown
Start by reading these files:
1. `product-plan/product-overview.md` — Product specification
2. `product-plan/instructions/incremental/` — All milestone files
3. `product-plan/sections/` — Section READMEs for detailed requirements
```

### Step 5: Update Coding Prompt

Modify `prompts/coding_prompt.md` to reference design assets:

**Add this section:**
```markdown
## USING DESIGN ASSETS

For each feature, check if design assets exist in `product-plan/sections/`:

1. **Components** — Pre-built React components in `components/`
   - Copy these to your project and wire up props
   - DO NOT redesign or restyle — use as-is

2. **Types** — TypeScript interfaces in `types.ts`
   - Import and use these for type safety

3. **Sample Data** — Test data in `sample-data.json`
   - Use for development, replace with real data

4. **Screenshots** — Visual references (*.png files)
   - Match the visual design exactly

5. **Tests** — TDD instructions in `tests.md`
   - Write failing tests first, then implement
```

### Step 6: Initialize Features

Run the initializer agent to create features in the database:

```
# Features should map to:
# - Foundation items from 01-foundation.md
# - Each section's requirements from product-plan/sections/[name]/README.md
# - Test cases from product-plan/sections/[name]/tests.md
```

The initializer should create features with dependencies that reflect the milestone order:
- Foundation features have no dependencies
- Section features depend on Foundation
- Later sections may depend on earlier sections

---

## Feature Creation Strategy

When creating features from Design-OS specs, organize by:

### 1. Foundation Features (Priority 1-20)
From `product-plan/instructions/incremental/01-foundation.md`:
- Design tokens configured
- Data model types defined
- Routes created
- App shell renders
- Navigation works
- Dark mode supported

### 2. Section Features (Priority 21+)
For each section in `product-plan/sections/`:

**From README.md:**
- Core functionality features
- User interaction features
- Data persistence features

**From tests.md:**
- Unit test features
- Integration test features
- Edge case features

**From components/:**
- Component renders correctly
- Component handles empty state
- Component handles loading state
- Component handles error state

### 3. Cross-Section Features (Later Priority)
- Integration between sections
- End-to-end workflows
- Performance requirements
- Accessibility requirements

---

## Dependency Mapping

Design-OS milestones map to feature dependencies:

| Milestone | Depends On |
|-----------|------------|
| 01-foundation | (none) |
| 02-[first-section] | 01-foundation |
| 03-[second-section] | 01-foundation |
| 04-[third-section] | 01-foundation, possibly 02 or 03 |
| 05-[fourth-section] | 01-foundation, possibly earlier sections |

**Wide graph pattern:** Multiple sections can often be built in parallel after Foundation is complete, since they're independent features.

---

## Agent Workflow Summary

```
┌─────────────────────────────────────────────────────────┐
│                    YOU (Human)                          │
│  • Review Design-OS output in product-plan/             │
│  • Answer clarifying questions                          │
│  • Approve/reject agent work                            │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│               INITIALIZER AGENT (Run Once)              │
│  • Reads product-plan/product-overview.md               │
│  • Reads product-plan/instructions/incremental/*.md     │
│  • Creates ~N features in features.db                   │
│  • Sets up project structure                            │
│  • Creates init.sh                                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│            CODING AGENTS (Run in Parallel)              │
│  • Call feature_get_next to get work                    │
│  • Read product-plan/sections/[name]/ for assets        │
│  • Implement feature using pre-built components         │
│  • Verify with browser automation                       │
│  • Call feature_mark_passing when done                  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│            TESTING AGENTS (Run Periodically)            │
│  • Call feature_get_for_regression                      │
│  • Verify feature still works                           │
│  • Fix regressions if found                             │
│  • Update feature status                                │
└─────────────────────────────────────────────────────────┘
```

---

## Checklist: Ready for Autocoder

Before running the initializer agent, verify:

- [ ] `product-plan/product-overview.md` exists and is complete
- [ ] `product-plan/instructions/incremental/` has all milestone files
- [ ] `product-plan/sections/` has at least one section with README.md
- [ ] `prompts/app_spec.txt` is deleted (avoid duplicate specs)
- [ ] `product-plan/prompts/` is deleted (using autocoder prompts instead)
- [ ] `CLAUDE.md` references both systems correctly
- [ ] `prompts/initializer_prompt.md` points to `product-plan/`
- [ ] `prompts/coding_prompt.md` includes design asset instructions

---

## Common Issues

### "Agent isn't using the pre-built components"
**Fix:** Add explicit instructions in CLAUDE.md and coding_prompt.md to check `product-plan/sections/[name]/components/` first.

### "Features don't match the design spec"
**Fix:** Ensure the initializer creates features from the actual section READMEs, not just the product overview.

### "Too many/few features created"
**Fix:** Design-OS specs often specify a `feature_count` in the product overview. Match this number by breaking down sections appropriately.

### "Agents are confused about which spec to read"
**Fix:** Delete `prompts/app_spec.txt` — there should be ONE source of truth: `product-plan/product-overview.md`.

### "Components don't match the screenshot"
**Fix:** The pre-built components ARE the design. If they don't match screenshots, the Design-OS output may be inconsistent — flag for human review.

---

## Future: Claude Code Skill

This guide can become a Claude Code skill that:

1. Detects when a `product-plan/` folder exists
2. Automatically merges with autocoder prompts
3. Validates the integration checklist
4. Offers to run the initializer

**Skill trigger:** `/integrate-design-os` or detecting `product-plan/README.md` with "Generated by Design OS" footer.
