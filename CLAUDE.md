# DinnDone

AI-powered meal planning app for exhausted caregivers. Assistant name: **Zylo**.

## Your Role

You are the main builder. You can read, write, and modify any code.

## Tech Stack

- Next.js 14 (App Router) + TypeScript (strict)
- Tailwind CSS with CSS custom properties
- Convex (database + backend)
- OpenRouter API (Gemini model for Zylo)

## Critical Rules

1. **No `any` types** - Ask what the data looks like if unclear
2. **Use CSS custom properties** - `var(--color-primary)`, not raw hex/Tailwind colors
3. **Mobile-first** - This is a phone app
4. **Run type checker** before saying you're done
5. **Follow AGENTS.md** for the multi-agent workflow (worktrees + rebase + squash merge)

## Key Docs

| Doc | Purpose |
|-----|---------|
| `product-plan/product-overview.md` | App summary, sections, data model |
| `product-plan/design-system/DESIGN-TOKENS.md` | Fonts, colors, button semantics (LOCKED) |
| `product-plan/sections/*/tests.md` | Feature specs per section |
| `docs/handoffs/` | Session handoff notes |

## Secrets Policy

**Never read `.env.local` or any `.env*` files.** If you need config values, ask for the specific non-secret value or use `.env.example`.

## Current State (Jan 2025)

- Meal Helper UI wired to Convex (household members, week plans, meals)
- AI chat working via OpenRouter
- Swap meals mutation connected to database
- Not yet done: voice input, grocery list integration
