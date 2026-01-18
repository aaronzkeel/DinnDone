# Weekly Planning

## Overview

The Weekly Planning section lets users review, approve, and customize AI-drafted 7-day meal plans. Users can plan multiple weeks ahead (2-3 weeks typically) with each week as its own plan. Zylo generates plans proactively (80% familiar staples, 20% new ideas) and users can swap meals with a quick tap. Once approved, the plan auto-generates a grocery list.

## User Flows

### View Weekly Plan
- Navigate to Weekly Planning tab
- See week selector at top
- See 7-day grid with one dinner per day
- Each meal shows: name, effort tier, assigned cook, who's eating

### Swap-and-Drop Approval
- Tap a meal you don't want
- See 2-3 alternative suggestions
- Tap to swap, or "More options" for different effort levels

### Cook Assignment
- Each meal has an assigned cook (Aaron or Katie)
- Tap to reassign cook with one tap

### Approve Plan
- After reviewing/swapping, tap "Looks good"
- Triggers pantry audit, then grocery list generation

## Design Decisions

- **7-day vertical list:** Mobile-friendly format
- **Swap modal:** Keeps day cards compact, details in modal
- **Pantry audit:** Separate focused screen, not inline
- **80/20 mix:** Familiar meals + new suggestions

## Data Used

**Entities:** WeekPlan, PlannedMeal, HouseholdMember

**From global model:** All core entities for meal planning

## Components Provided

- `WeekPlanView` — Main view with week selector and day list
- `WeekSelector` — Navigate between weeks
- `DayCard` — Individual day with meal summary
- `SwapModal` — Modal for swapping meal, reassigning cook
- `PantryAudit` — Pre-grocery checklist

## Callback Props

| Callback | Description |
|----------|-------------|
| `onSelectWeek` | Navigate to different week |
| `onOpenDay` | Open swap modal for a day |
| `onSwapMeal` | Replace meal with alternative |
| `onReassignCook` | Change who's cooking |
| `onToggleEater` | Toggle family member eating |
| `onApprovePlan` | Approve week plan |
| `onConfirmPantryItem` | Mark item as on-hand |
