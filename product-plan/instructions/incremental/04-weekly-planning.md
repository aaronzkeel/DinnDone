# Milestone 4: Weekly Planning

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, Milestone 2 (Grocery List) recommended

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

Implement the Weekly Planning feature — AI-drafted 7-day meal plans with swap-and-drop approval, cook assignment, and pantry audit.

## Overview

Weekly Planning lets users review, approve, and customize AI-drafted meal plans. Zylo generates plans proactively (80% familiar staples, 20% new ideas) and users can swap meals with a quick tap. Once approved, the plan auto-generates a grocery list.

**Key Functionality:**
- View 7-day meal plan with day cards showing meal, cook, and eaters
- Navigate between weeks (current, next, future)
- Swap meals with alternative suggestions
- Reassign cooks between Aaron and Katie
- Toggle who's eating on each day
- Approve plan to trigger grocery list generation
- Pantry audit before finalizing grocery list

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/weekly-planning/tests.md` for detailed test-writing instructions including:
- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `product-plan/sections/weekly-planning/components/`:

- `WeeklyPlanningView` — Main view with week selector and day list
- `WeekSelector` — Navigate between weeks
- `DayCard` — Individual day with meal summary
- `EditDayModal` — Modal for swapping meal, reassigning cook, toggling eaters
- `PantryAudit` — Pre-grocery checklist for items on hand
- Additional helper components

### Data Layer

The components expect these data shapes:

```typescript
interface WeekPlan {
  id: string
  weekStart: string
  status: 'draft' | 'approved' | 'in-progress' | 'completed'
  meals: PlannedMeal[]
}

interface PlannedMeal {
  id: string
  date: string
  dayOfWeek: string
  name: string
  effortTier: 'easy' | 'medium' | 'involved'
  cook: HouseholdMember
  eaters: HouseholdMember[]
  alternatives?: MealSuggestion[]
}
```

You'll need to:
- AI plan generation service (80/20 mix, cook rotation, dietary compliance)
- Week plan CRUD operations
- Swap/reassign meal logic
- Pantry audit state management
- Grocery list generation from approved plan

### Callbacks

Wire up these user actions:

| Callback | Description |
|----------|-------------|
| `onSelectWeek` | Navigate to different week |
| `onOpenDay` | Open Edit/Swap Day modal |
| `onSwapMeal` | Replace meal with alternative |
| `onReassignCook` | Change who's cooking |
| `onToggleEater` | Toggle family member eating |
| `onApprovePlan` | Approve week plan ("Looks good") |
| `onStartPantryAudit` | Begin pantry check |
| `onConfirmPantryItem` | Mark item as on-hand |
| `onGenerateGroceryList` | Create list from plan |

### Empty States

Implement empty state UI for when no records exist yet:

- **No week plan exists:** Show "Generate Plan" button with explanation
- **No alternatives available:** Show message in swap modal
- **All pantry items confirmed:** Show completion state

## Files to Reference

- `product-plan/sections/weekly-planning/README.md` — Feature overview and design intent
- `product-plan/sections/weekly-planning/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/weekly-planning/components/` — React components
- `product-plan/sections/weekly-planning/types.ts` — TypeScript interfaces
- `product-plan/sections/weekly-planning/sample-data.json` — Test data
- `product-plan/sections/weekly-planning/screenshot.png` — Visual reference

## Expected User Flows

### Flow 1: Review and Approve Weekly Plan

1. User navigates to Weekly Planning tab
2. User sees 7-day plan with meals, cooks, and eaters
3. User reviews each day, optionally swapping meals
4. User taps "Looks good" to approve
5. **Outcome:** Plan status changes to "Approved," pantry audit begins

### Flow 2: Swap a Meal

1. User taps a day card
2. Edit modal opens with current meal and alternatives
3. User taps an alternative meal
4. **Outcome:** Meal is swapped, modal closes, day card updates

### Flow 3: Reassign Cook

1. User taps a day card
2. Edit modal shows cook assignment pills (Aaron / Katie)
3. User taps different cook
4. **Outcome:** Cook is reassigned, day card updates

### Flow 4: Pantry Audit and Grocery List

1. After approving plan, pantry audit screen opens
2. User checks off items already in the house
3. User taps "Done"
4. **Outcome:** Grocery list is generated, minus pantry items, user redirected to Grocery List

## Plan States

| State | Description |
|-------|-------------|
| Draft | AI-generated, awaiting review |
| Approved | User approved, grocery list generated |
| In Progress | Current week, some meals completed |
| Completed | Week is over, history only |

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Week selector navigates between weeks
- [ ] Day cards display meal, cook, eaters correctly
- [ ] Swap modal shows alternatives and updates meal
- [ ] Cook reassignment works
- [ ] Eater toggles work
- [ ] Plan approval triggers pantry audit
- [ ] Pantry audit confirms items on hand
- [ ] Grocery list is generated from plan
- [ ] Empty states display properly when no plan exists
- [ ] Matches the visual design
- [ ] Responsive on mobile
