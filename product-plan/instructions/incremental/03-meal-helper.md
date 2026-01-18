# Milestone 3: Meal Helper

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

Implement the Meal Helper feature — the "6PM rescue lane" that helps users stick with tonight's planned meal or adapt quickly.

## Overview

Meal Helper is **rails-first**: the UI provides clear actions that reduce decision fatigue, with chat support for flexible, conversational help. It starts from the assumption that a weekly plan exists, and the primary job is to help you stick with tonight's plan or adapt quickly.

**Key Functionality:**
- View tonight's planned meal with one-tap confirmation
- Quick access to "This works," "New plan," or "I'm wiped" actions
- Meal details with ingredients, steps, effort/time/cleanup ratings
- Emergency Exit for zero-energy days (leftovers, freezer, takeout)
- Ingredient check and inventory reporting
- Swap flow to pick different meals from the week's plan

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/meal-helper/tests.md` for detailed test-writing instructions including:
- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `product-plan/sections/meal-helper/components/`:

- `MealHelperHome` — Main screen with Tonight's Plan card
- `TonightPlanCard` — Card showing today's planned meal
- `MealOptionDetails` — Detailed view with ingredients and steps
- `EmergencyExit` — Zero-energy options screen
- `InventoryCheck` — Quick pantry/fridge inventory input
- `WeekSwapList` — List of this week's meals for swapping
- `IngredientsCheckPanel` — Ingredient availability check
- `ChoicePanel` — Decision panels for swap flow
- `ChatMessage` — Chat message component
- `ChatInput` — Chat input component
- `MealSuggestionCard` — Meal suggestion display

### Data Layer

The components expect these data shapes:

```typescript
interface TonightMeal {
  id: string
  name: string
  effortTier: 'easy' | 'medium' | 'involved'
  prepTime: number
  cookTime: number
  cleanupRating: 1 | 2 | 3
  cook: HouseholdMember
  eaters: HouseholdMember[]
  ingredients: Ingredient[]
  steps: string[]
}

interface WeekMeal {
  id: string
  dayOfWeek: string
  date: string
  meal: TonightMeal
}
```

You'll need to:
- Connect to weekly plan data for tonight's meal
- Implement swap/reassign logic
- Store inventory check results
- Handle AI conversation for chat support

### Callbacks

Wire up these user actions:

| Callback | Description |
|----------|-------------|
| `onConfirmMeal` | User confirms tonight's meal ("This works") |
| `onViewDetails` | Open meal details screen |
| `onStartSwap` | Begin swap flow ("New plan") |
| `onEmergencyExit` | Open zero-energy options ("I'm wiped") |
| `onSwapMeal` | Swap tonight's meal with another |
| `onReportInventory` | Submit inventory check results |
| `onSendMessage` | Send chat message to Zylo |

### Empty States

Implement empty state UI for when no records exist yet:

- **No weekly plan exists:** Prompt user to visit Weekly Planning first
- **No ingredients listed:** Show message that recipe details are minimal
- **Chat history empty:** Start with Zylo's greeting message

## Files to Reference

- `product-plan/sections/meal-helper/README.md` — Feature overview and design intent
- `product-plan/sections/meal-helper/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/meal-helper/components/` — React components
- `product-plan/sections/meal-helper/types.ts` — TypeScript interfaces
- `product-plan/sections/meal-helper/sample-data.json` — Test data
- `product-plan/sections/meal-helper/screenshot.png` — Visual reference

## Expected User Flows

### Flow 1: "This works" — Confirm Tonight's Meal

1. User opens Meal Helper tab
2. User sees Tonight's Plan card with meal name and cook
3. User taps "This works"
4. **Outcome:** Opens Meal Option Details with ingredients and steps

### Flow 2: "New plan" — Swap for Different Meal

1. User taps "New plan" on home screen
2. User sees list of other meals planned this week
3. User selects a different meal
4. User sees ingredient list and confirms availability
5. **Outcome:** Tonight's meal is swapped, plan updated

### Flow 3: "I'm wiped" — Zero-Energy Exit

1. User taps "I'm wiped" on home screen
2. User sees Emergency Exit with low-effort options:
   - Leftovers
   - Freezer meal
   - Clean takeout suggestion
3. User selects an option
4. **Outcome:** Plan updated with minimal friction

### Flow 4: Ingredient Check

1. User views Meal Option Details
2. User taps "Check ingredients"
3. User marks which ingredients they have/don't have
4. **Outcome:** Zylo responds with adaptation suggestions if needed

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Tonight's Plan displays correctly from weekly plan data
- [ ] "This works" / "New plan" / "I'm wiped" flows work
- [ ] Meal details show ingredients and steps
- [ ] Emergency Exit provides low-effort options
- [ ] Swap flow updates the weekly plan
- [ ] Chat messages display and send correctly
- [ ] Empty states display properly when no plan exists
- [ ] Matches the visual design
- [ ] Responsive on mobile
