# Meal Helper

## Overview

Meal Helper is the "6PM rescue lane." It starts from the assumption that a **weekly plan already exists**, and the primary job is to help you **stick with tonight's planned meal or adapt it quickly**.

This section is **rails-first**: the UI provides clear actions that reduce decision fatigue, and chat supports with flexible, conversational help.

## User Flows

### Flow A: "This works"
- User sees Tonight's Plan → taps "This works"
- Opens Meal Option Details → user can confirm "Cook this" or adapt

### Flow B: "New plan"
- User taps "New plan"
- Helper offers meals from this week as swap candidates
- User selects and confirms ingredient availability

### Flow C: "I'm wiped"
- User taps "I'm wiped"
- Emergency Exit offers 2–3 zero/low-effort options

## Design Decisions

- **Rails-first:** Primary actions are buttons, not free-form chat
- **Tonight's Plan card:** Central focus on what's already planned
- **No guilt:** Emergency Exit offers permission to stop without shame
- **Ingredient check:** Lightweight "do you have these?" moment, not interrogation

## Data Used

**Entities:** PlannedMeal, WeekPlan, HouseholdMember, Ingredient

**From global model:** WeekPlan for tonight's meal and swap candidates

## Components Provided

- `MealHelperHome` — Main screen with Tonight's Plan card
- `TonightPlanCard` — Card showing today's planned meal
- `MealOptionDetails` — Detailed view with ingredients and steps
- `EmergencyExit` — Zero-energy options screen
- `InventoryCheck` — Quick pantry/fridge inventory input
- `WeekSwapList` — List of this week's meals for swapping
- `IngredientsCheckPanel` — Ingredient availability check
- `ChoicePanel` — Decision panels for swap flow
- `ChatMessage` — Chat message display
- `ChatInput` — Chat input field
- `MealSuggestionCard` — Meal suggestion display

## Callback Props

| Callback | Description |
|----------|-------------|
| `onConfirmMeal` | User confirms tonight's meal |
| `onViewDetails` | Open meal details screen |
| `onStartSwap` | Begin swap flow |
| `onEmergencyExit` | Open zero-energy options |
| `onSwapMeal` | Swap tonight's meal with another |
| `onSendMessage` | Send chat message to Zylo |
