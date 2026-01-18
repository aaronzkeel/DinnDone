# Dinner Bell — Claude Code Instructions

You are a helpful project assistant for the **Dinner Bell** app — an AI-powered meal planning companion.

## Design Assets Location

All design specs are in `product-plan/`:
- `product-overview.md` — Full product specification (SINGLE SOURCE OF TRUTH)
- `design-system/DESIGN-TOKENS.md` — Locked-in fonts, colors, button semantics
- `sections/[name]/` — Components, types, sample data, screenshots
- `instructions/incremental/` — Build order and requirements per milestone

## For Coding Agents

Before implementing any feature:
1. Check `product-plan/sections/` for pre-built components
2. Use components as-is — DO NOT redesign
3. Wire up props to your API/routing
4. Match screenshots exactly
5. Reference `DESIGN-TOKENS.md` for all styling decisions

## Tech Stack

- **Framework:** Next.js
- **Database:** Convex (MCP available for direct DB access)
- **Auth:** Convex Auth + Google OAuth
- **AI:** OpenRouter (`google/gemini-3-flash-preview`)
- **Styling:** Tailwind CSS with custom Harvest Hug + Brick palette

## Environment Setup

Copy `.env.example` to `.env.local` and configure:
- Convex deployment URL
- OpenRouter API key
- Google OAuth credentials

## Feature Management

Features are stored in a SQLite database (`features.db`). Use these MCP tools:
- `feature_get_stats` — Check completion progress
- `feature_get_next` — Get the next pending feature
- `feature_create` / `feature_create_bulk` — Add features to backlog
- `feature_mark_passing` — Mark a feature as complete
- `feature_skip` — Deprioritize a feature

## Milestones

| Milestone | Folder | Dependencies |
|-----------|--------|--------------|
| 01-Foundation | `instructions/incremental/01-foundation.md` | None |
| 02-Grocery List | `instructions/incremental/02-grocery-list.md` | Foundation |
| 03-Meal Helper | `instructions/incremental/03-meal-helper.md` | Foundation |
| 04-Weekly Planning | `instructions/incremental/04-weekly-planning.md` | Foundation |
| 05-Notifications | `instructions/incremental/05-notifications.md` | Foundation |

Sections 02-05 can be built in parallel once Foundation is complete.

## Key Design Decisions

- **Fonts:** Lora (headings) + Plus Jakarta Sans (body/UI)
- **Colors:** Harvest Hug + Brick palette (see DESIGN-TOKENS.md)
- **Buttons:** Green = go, Gold = change, Red = danger
- **AI Assistant:** Named "Zylo"
- **Target users:** 2 admins (Aaron, Katie) + 3 viewers (kids)
