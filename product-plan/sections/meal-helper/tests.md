# Test Instructions: Meal Helper

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup.

## Overview

Meal Helper is the "6PM rescue lane" with rails-first design. Key functionality includes viewing tonight's plan, confirming or swapping meals, and accessing zero-energy options.

---

## User Flow Tests

### Flow 1: "This works" — Confirm Tonight's Meal

**Scenario:** User confirms the planned meal for tonight

**Setup:**
- Weekly plan exists with tonight's meal: "Sheet Pan Salmon"
- Cook assigned: Aaron
- Eaters: All 5 family members

**Steps:**
1. User opens Meal Helper tab
2. User sees Tonight's Plan card showing "Sheet Pan Salmon"
3. User taps "This works" button

**Expected Results:**
- [ ] Meal Option Details screen opens
- [ ] Shows meal name "Sheet Pan Salmon"
- [ ] Shows ingredients list
- [ ] Shows prep/cook time and cleanup rating
- [ ] "Cook this" button is visible

---

### Flow 2: "New plan" — Swap for Different Meal

**Scenario:** User wants to swap tonight's meal

**Setup:**
- Weekly plan exists with multiple meals
- Tonight: "Sheet Pan Salmon"
- Other days have: "Taco Tuesday", "Stir Fry", etc.

**Steps:**
1. User taps "New plan" button on home screen
2. User sees WeekSwapList with other planned meals
3. User taps "Taco Tuesday"
4. User sees ingredient list
5. User confirms "Yes, I have these"

**Expected Results:**
- [ ] Tonight's meal updates to "Taco Tuesday"
- [ ] Original "Sheet Pan Salmon" moves to Taco Tuesday's day
- [ ] Success confirmation shown
- [ ] Home screen updates with new meal

---

### Flow 3: "I'm wiped" — Zero-Energy Exit

**Scenario:** User is too exhausted to cook

**Setup:**
- Weekly plan exists with tonight's meal

**Steps:**
1. User taps "I'm wiped" button
2. User sees Emergency Exit screen

**Expected Results:**
- [ ] Emergency Exit shows 2-3 low-effort options
- [ ] Options may include: "Leftovers", "Freezer meal", "Clean takeout"
- [ ] No guilt or nagging language
- [ ] Each option has a clear action button

---

### Flow 4: Ingredient Check

**Scenario:** User checks if they have ingredients

**Setup:**
- User is viewing Meal Option Details
- Meal has 5 ingredients listed

**Steps:**
1. User taps "Check ingredients"
2. User sees ingredient checklist
3. User marks 3 ingredients as "Have it"
4. User marks 2 as "Don't have"

**Expected Results:**
- [ ] Checklist shows all ingredients
- [ ] Check states are saved
- [ ] If missing ingredients, suggestion appears: "Pick different meal" or "Stop at store"

---

## Empty State Tests

### No Weekly Plan Exists

**Scenario:** User opens Meal Helper before any plan is created

**Setup:**
- No WeekPlan exists for current week

**Expected Results:**
- [ ] Message: "No meal planned for tonight"
- [ ] CTA: "Create a weekly plan" or "Go to Weekly Planning"
- [ ] "I'm wiped" option still available
- [ ] No broken UI or errors

### No Ingredients Listed

**Scenario:** Meal exists but has no ingredient details

**Setup:**
- Tonight's meal exists
- `ingredients` array is empty

**Expected Results:**
- [ ] Meal details show meal name and effort tier
- [ ] Ingredients section shows "No ingredients listed"
- [ ] "Cook this" button still works

---

## Component Interaction Tests

### TonightPlanCard

**Renders correctly:**
- [ ] Shows meal name "Sheet Pan Salmon"
- [ ] Shows assigned cook "Aaron"
- [ ] Shows effort tier icon
- [ ] Shows eater count or avatars

**User interactions:**
- [ ] Tapping "This works" calls `onConfirmMeal`
- [ ] Tapping "New plan" calls `onStartSwap`
- [ ] Tapping "I'm wiped" calls `onEmergencyExit`

### EmergencyExit

**Renders correctly:**
- [ ] Shows empathetic heading (no shame)
- [ ] Shows 2-3 low-effort options
- [ ] Each option has description and action button

**User interactions:**
- [ ] Tapping option calls `onSelectOption` with option id
- [ ] Back button returns to home

---

## Edge Cases

- [ ] Handles meal with very long name (truncation)
- [ ] Works when only one meal planned all week
- [ ] Swap flow handles case when no other meals to swap with
- [ ] Ingredient check works with 0 ingredients
- [ ] Chat input handles long messages

---

## Accessibility Checks

- [ ] All action buttons are keyboard accessible
- [ ] Screen reader announces meal details
- [ ] Focus moves appropriately between screens
- [ ] Emergency Exit options have clear focus indicators

---

## Sample Test Data

```typescript
const mockTonightMeal = {
  id: 'meal-1',
  name: 'Sheet Pan Salmon',
  effortTier: 'medium',
  prepTime: 15,
  cookTime: 25,
  cleanupRating: 2,
  cook: { id: 'hm-001', name: 'Aaron', isAdmin: true },
  eaters: [
    { id: 'hm-001', name: 'Aaron' },
    { id: 'hm-002', name: 'Katie' },
    { id: 'hm-003', name: 'Lizzie' },
  ],
  ingredients: [
    { name: 'Salmon fillets', quantity: '1.5 lbs', isOrganic: false },
    { name: 'Broccoli', quantity: '2 cups', isOrganic: true },
    { name: 'Lemon', quantity: '1', isOrganic: true },
  ],
  steps: ['Preheat oven to 400°F', 'Season salmon', 'Roast 20 min'],
}

const mockEmptyPlan = null

const mockEmergencyOptions = [
  { id: 'leftovers', label: 'Leftovers', description: 'Heat up what you have' },
  { id: 'freezer', label: 'Freezer meal', description: 'Quick and easy' },
  { id: 'takeout', label: 'Clean takeout', description: 'No shame, just fed' },
]
```
