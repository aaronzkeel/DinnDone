# Milestone 1: Foundation

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** None

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

## Goal

Set up the foundational elements: design tokens, data model types, routing structure, and application shell.

## What to Implement

### 1. Design Tokens

Configure your styling system with these tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind configuration
- See `product-plan/design-system/fonts.md` for Google Fonts setup

**Colors:**
- Primary: `yellow` (amber) — Buttons, active states, key accents
- Secondary: `lime` — Success states, flex meal indicators
- Neutral: `stone` — Backgrounds, text, borders

**Typography:**
- Heading: Plus Jakarta Sans
- Body: Plus Jakarta Sans
- Mono: IBM Plex Mono

### 2. Data Model Types

Create TypeScript interfaces for your core entities:

- See `product-plan/data-model/types.ts` for interface definitions
- See `product-plan/data-model/README.md` for entity relationships

**Core Entities:**
- **HouseholdMember** — Family members with admin/viewer roles
- **WeekPlan** — 7-day meal plan with status tracking
- **Meal** — Individual meal with effort tier, cook assignment, eaters
- **Recipe** — Reusable meal template with ingredients and flex-meal support
- **GroceryItem** — Shopping list item with store, category, organic flag
- **PantryItem** — Current inventory for pantry audits
- **Preference** — Dietary rules and household standards
- **Leftover** — Tracked leftovers with remix suggestions
- **NotificationSetting** — Per-user notification configuration

### 3. Routing Structure

Create placeholder routes for each section:

| Route | Section |
|-------|---------|
| `/grocery-list` | Grocery List |
| `/meal-helper` | Meal Helper (Default/Home) |
| `/weekly-planning` | Weekly Planning |
| `/notifications` | Notifications |

### 4. Application Shell

Copy the shell components from `product-plan/shell/components/` to your project:

- `AppShell.tsx` — Main layout wrapper
- `MainNav.tsx` — Bottom tab bar navigation
- `UserMenu.tsx` — User menu with avatar

**Wire Up Navigation:**

Connect navigation to your routing:

| Tab | Route | Icon |
|-----|-------|------|
| Grocery List | `/grocery-list` | list icon |
| Meal Helper | `/meal-helper` | message-circle icon |
| Weekly Planning | `/weekly-planning` | calendar icon |
| Notifications | `/notifications` | bell icon |

**User Menu:**

The user menu expects:
- User name
- Avatar URL (optional, falls back to initials)
- Logout callback

**Layout Pattern:**
- Header: Minimal top bar with app name (left) and user avatar (right)
- Content: Full-height scrollable area between header and tab bar
- Tab Bar: Fixed bottom navigation with 4 tabs

**Responsive Behavior:**
- Mobile (< 640px): Full-width layout, tabs with icon + label stacked
- Tablet (640px - 1024px): Centered content with max-width, tabs at bottom
- Desktop (> 1024px): Centered content (max-width 768px), bottom tabs preserved for PWA consistency

## Files to Reference

- `product-plan/design-system/` — Design tokens
- `product-plan/data-model/` — Type definitions
- `product-plan/shell/README.md` — Shell design intent
- `product-plan/shell/components/` — Shell React components
- `product-plan/shell/screenshot.png` — Shell visual reference (if available)

## Done When

- [ ] Design tokens are configured (colors, typography)
- [ ] Data model types are defined
- [ ] Routes exist for all sections (can be placeholder pages)
- [ ] Shell renders with header and bottom tab navigation
- [ ] Navigation links to correct routes
- [ ] User menu shows user info
- [ ] Responsive on mobile
- [ ] Dark mode supported
