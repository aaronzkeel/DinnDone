# Dinner Bell — Product Overview

## Summary

An AI-powered meal planning companion for exhausted caregivers. It handles the mental load of "what's for dinner" — remembering your standards, learning your preferences over time, and meeting you where your energy actually is. The win condition isn't culinary greatness; it's everyone gets fed cleanly with the least possible thinking, and tomorrow is a little easier than today.

## Planned Sections

1. **Grocery List** — The shared, real-time list with categories, organic guardrails, voice capture, and check-off behavior — useful standalone from day one.

2. **Meal Helper** — The conversational AI (Zylo) for "what can I make right now?" with inventory-first conversations, effort tiers, flex-meal suggestions, and conversational pivots. Rails-first design with chat support.

3. **Weekly Planning** — AI-drafted 7-day meal plans with swap-and-drop approval, cook assignment, and pantry audit before finalizing the grocery list.

4. **Notifications** — The Gentle Nudge system: 7AM daily brief, 4PM strategic pivot, 7:30PM thaw guardian, cook reminders, and crisis day mute.

## Data Model

**Core Entities:**
- HouseholdMember — Family members with admin/viewer roles
- PlannedMeal — Individual meal assignments for specific days
- WeekPlan — Collection of 7 planned meals with status
- GroceryItem — Items on the shopping list
- Store — Shopping locations (Meijer, Costco, Aldi, etc.)
- Notification — Individual nudges with actions and status
- NotificationPreferences — Per-user notification settings

## Design System

> **See `product-plan/design-system/DESIGN-TOKENS.md` for the locked-in design decisions.**

**Typography:**
- Headings: Lora (serif, warm, peaceful)
- Body/UI: Plus Jakarta Sans (clean, readable)
- No mono font

**Colors — "Harvest Hug + Brick" palette:**
- Primary: Gold (`#E2A93B`) — Secondary buttons, accents
- Secondary: Sage Green (`#4F6E44`) — Primary "go" actions (Make it, Confirm)
- Danger: Brick Red (`#B94A34`) — Alerts, destructive actions
- Neutral: Warm earth tones for backgrounds, cards, text

**Button Semantics:**
- Green = positive action ("Make it", "Confirm")
- Gold = change action ("Swap", "Edit")
- Red = warning/destructive ("Swap ingredient" in alerts, "Delete")

## Tech Stack

- **Framework:** Next.js
- **Database:** Convex (with MCP for agent access)
- **Auth:** Convex Auth + Google OAuth
- **AI:** OpenRouter (Gemini 3 Flash for Zylo and plan generation)
- **Styling:** Tailwind CSS
- **PWA:** Offline-capable grocery list

## Key Features

- **Dinner only** for MVP (can expand later)
- **Recipe source:** Curated library (~50 family favorites) + AI-generated
- **Learning:** Implicit from usage (AI observes accept/reject patterns)
- **Accounts:** 2 admins (Aaron, Katie) + 3 viewers (kids)
- **Notifications:** Configurable per member
- **Offline mode:** PWA with offline-capable grocery list
- **Assistant name:** Zylo

## Environment Variables

See `.env.example` for required configuration:
- Convex deployment URL
- OpenRouter API key
- Google OAuth credentials
- Optional: VAPID keys for push notifications

## Implementation Sequence

Build this product in milestones:

1. **Foundation** — Set up design tokens, data model types, and application shell
2. **Grocery List** — Shared list with store grouping, organic badges, drag-and-drop
3. **Meal Helper** — Rails-first "Tonight's Plan" with chat support
4. **Weekly Planning** — 7-day vertical list with swap modal and pantry audit
5. **Notifications** — Gentle nudge system with settings and crisis day mute

Each milestone has a dedicated instruction document in `product-plan/instructions/incremental/`.

## Feature Count

**Target: ~200 features** organized across the 5 milestones with wide dependency graph for parallel execution.
