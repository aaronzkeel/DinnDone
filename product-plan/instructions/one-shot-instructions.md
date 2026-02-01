# DinnDone — Complete Implementation Instructions

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Test-Driven Development

Each section includes a `tests.md` file with detailed test-writing instructions. These are **framework-agnostic** — adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, RSpec, Minitest, PHPUnit, etc.).

**For each section:**
1. Read `product-plan/sections/[section-id]/tests.md`
2. Write failing tests for key user flows (success and failure paths)
3. Implement the feature to make tests pass
4. Refactor while keeping tests green

The test instructions include:
- Specific UI elements, button labels, and interactions to verify
- Expected success and failure behaviors
- Empty state handling (when no records exist yet)
- Data assertions and state validations

---

## Product Overview

### Summary

An AI-powered meal planning companion for exhausted caregivers. It handles the mental load of "what's for dinner" — remembering your standards, learning your preferences over time, and meeting you where your energy actually is. The win condition isn't culinary greatness; it's everyone gets fed cleanly with the least possible thinking, and tomorrow is a little easier than today.

### Planned Sections

1. **Grocery List** — The shared, real-time list with categories, organic guardrails, voice capture, and check-off behavior — useful standalone from day one.

2. **Meal Helper** — The conversational AI (Zylo) for "what can I make right now?" with inventory-first conversations, effort tiers, flex-meal suggestions, and conversational pivots. Rails-first design with chat support.

3. **Weekly Planning** — AI-drafted 7-day meal plans with swap-and-drop approval, cook assignment, and pantry audit before finalizing the grocery list.

4. **Notifications** — The Gentle Nudge system: 7AM daily brief, 4PM strategic pivot, 7:30PM thaw guardian, cook reminders, and crisis day mute.

### Data Model

**Core Entities:**
- HouseholdMember — Family members with admin/viewer roles
- PlannedMeal — Individual meal assignments for specific days
- WeekPlan — Collection of 7 planned meals with status
- GroceryItem — Items on the shopping list
- Store — Shopping locations (Meijer, Costco, Aldi, etc.)
- Notification — Individual nudges with actions and status
- NotificationPreferences — Per-user notification settings

### Design System

**Colors:**
- Primary: `yellow` (amber) — Buttons, active states, key accents
- Secondary: `lime` — Success states, flex meal indicators
- Neutral: `stone` — Backgrounds, text, borders

**Typography:**
- Heading: Plus Jakarta Sans (build-time decision: may use Nunito Sans)
- Body: Plus Jakarta Sans
- Mono: IBM Plex Mono

### Key Features

- **Dinner only** for MVP (can expand later)
- **Recipe source:** Curated library (~50 family favorites) + AI-generated
- **Learning:** Implicit from usage (AI observes accept/reject patterns)
- **Accounts:** 2 admins (Aaron, Katie) + 3 viewers (kids)
- **Notifications:** Configurable per member
- **Offline mode:** PWA with offline-capable grocery list
- **Assistant name:** Zylo

---

# Milestone 1: Foundation

## Goal

Set up the foundational elements: design tokens, data model types, routing structure, and application shell.

## What to Implement

### 1. Design Tokens

Configure your styling system with these tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind configuration
- See `product-plan/design-system/fonts.md` for Google Fonts setup

### 2. Data Model Types

Create TypeScript interfaces for your core entities:

- See `product-plan/data-model/types.ts` for interface definitions
- See `product-plan/data-model/README.md` for entity relationships

### 3. Routing Structure

| Route | Section |
|-------|---------|
| `/grocery-list` | Grocery List |
| `/meal-helper` | Meal Helper (Default/Home) |
| `/weekly-planning` | Weekly Planning |
| `/notifications` | Notifications |

### 4. Application Shell

Copy the shell components from `product-plan/shell/components/`:

- `AppShell.tsx` — Main layout wrapper
- `MainNav.tsx` — Bottom tab bar navigation
- `UserMenu.tsx` — User menu with avatar

**Layout Pattern:**
- Header: Minimal top bar with app name (left) and user avatar (right)
- Content: Full-height scrollable area
- Tab Bar: Fixed bottom navigation with 4 tabs

## Done When

- [ ] Design tokens are configured
- [ ] Data model types are defined
- [ ] Routes exist for all sections
- [ ] Shell renders with navigation
- [ ] User menu shows user info
- [ ] Responsive on mobile
- [ ] Dark mode supported

---

# Milestone 2: Grocery List

## Goal

Implement the Grocery List feature — a shared, real-time grocery list organized by store with organic guardrails.

## Overview

Shared, real-time list organized by store. Supports text and voice input, organic badges, and check-off behavior.

**Key Functionality:**
- View items grouped by store
- Add items inline
- Check off items (move to bottom)
- Drag-and-drop to reorder or assign stores
- Organic badges on flagged items
- Manage stores

## What to Implement

Copy components from `product-plan/sections/grocery-list/components/`.

See `product-plan/sections/grocery-list/tests.md` for TDD instructions.

## Expected User Flows

1. **Add a Grocery Item** — Tap "+ Add item," type name, press Enter
2. **Check Off Items** — Tap checkbox, item moves to "Checked" section
3. **Move to Different Store** — Drag item to different store section
4. **Filter by Store** — Tap store pill to filter view

## Done When

- [ ] Tests written and passing
- [ ] Items can be added, checked, edited, deleted
- [ ] Store filtering and drag-and-drop work
- [ ] Organic badges display
- [ ] Real-time sync works
- [ ] Empty states display properly

---

# Milestone 3: Meal Helper

## Goal

Implement the Meal Helper feature — the "6PM rescue lane" with rails-first UI.

## Overview

Starts with Tonight's Plan card. Three primary actions: "This works," "New plan," "I'm wiped." Chat supports with flexible help.

**Key Functionality:**
- View tonight's planned meal
- Quick confirmation or swap flows
- Emergency Exit for zero-energy days
- Ingredient check and inventory

## What to Implement

Copy components from `product-plan/sections/meal-helper/components/`.

See `product-plan/sections/meal-helper/tests.md` for TDD instructions.

## Expected User Flows

1. **"This works"** — Confirm tonight's meal, view details
2. **"New plan"** — Swap for different meal from week's plan
3. **"I'm wiped"** — Zero-energy options (leftovers, freezer, takeout)
4. **Ingredient Check** — Verify what's on hand

## Done When

- [ ] Tests written and passing
- [ ] Tonight's Plan displays correctly
- [ ] All three action flows work
- [ ] Emergency Exit provides options
- [ ] Chat messages work
- [ ] Empty states display properly

---

# Milestone 4: Weekly Planning

## Goal

Implement Weekly Planning — AI-drafted 7-day meal plans with swap-and-drop approval.

## Overview

Review, approve, and customize AI-drafted plans. 80% familiar staples, 20% new ideas. Once approved, generates grocery list.

**Key Functionality:**
- View 7-day plan with day cards
- Navigate between weeks
- Swap meals with alternatives
- Reassign cooks
- Toggle who's eating
- Pantry audit before grocery list

## What to Implement

Copy components from `product-plan/sections/weekly-planning/components/`.

See `product-plan/sections/weekly-planning/tests.md` for TDD instructions.

## Expected User Flows

1. **Review and Approve** — View plan, optionally swap, tap "Looks good"
2. **Swap a Meal** — Tap day, select alternative
3. **Reassign Cook** — Tap day, tap different cook
4. **Pantry Audit** — Confirm items on hand, generate grocery list

## Done When

- [ ] Tests written and passing
- [ ] Week navigation works
- [ ] Swap, reassign, toggle flows work
- [ ] Pantry audit completes
- [ ] Grocery list generates
- [ ] Empty states display properly

---

# Milestone 5: Notifications

## Goal

Implement Notifications — the Gentle Nudge system with purposeful, actionable notifications.

## Overview

Every notification has a clear "why" and 1-click action. Crisis Day Mute silences everything for 24 hours.

**Notification Types:**
- Daily Brief (7 AM)
- Strategic Pivot (4 PM)
- Thaw Guardian (7:30 PM)
- Weekly Plan Ready (Sunday)
- Inventory SOS
- Leftover Check-In
- Cook Reminder (Evening and Morning)

## What to Implement

Copy components from `product-plan/sections/notifications/components/`.

See `product-plan/sections/notifications/tests.md` for TDD instructions.

## Expected User Flows

1. **Respond to Notification** — Tap action button, notification marked resolved
2. **Crisis Day Mute** — Toggle to pause all notifications 24 hours
3. **Configure Preferences** — Enable/disable notification types
4. **Fandom Voice** — Choose playful notification style

## Done When

- [ ] Tests written and passing
- [ ] Notification history displays
- [ ] Actions work and update status
- [ ] Crisis Day Mute works
- [ ] Preferences save correctly
- [ ] Push notifications work
- [ ] Empty states display properly

---

## Implementation Sequence Summary

1. **Foundation** — Design tokens, data model, routing, shell
2. **Grocery List** — Shared list with stores, organic badges
3. **Meal Helper** — Tonight's Plan with swap and emergency exit
4. **Weekly Planning** — 7-day plans with approval and pantry audit
5. **Notifications** — Gentle Nudge system with Crisis Day Mute
