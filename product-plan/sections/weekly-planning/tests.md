# Test Instructions: Weekly Planning

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup.

## Overview

Weekly Planning allows users to review, swap, and approve AI-drafted 7-day meal plans. Key functionality includes week navigation, meal swapping, cook assignment, and pantry audit.

---

## User Flow Tests

### Flow 1: Review and Approve Weekly Plan

**Scenario:** User approves a draft weekly plan

**Setup:**
- WeekPlan exists with status "draft"
- 7 meals are planned (Mon-Sun)

**Steps:**
1. User navigates to Weekly Planning tab
2. User sees week with "Draft" status badge
3. User reviews meal for each day
4. User taps "Looks good" button

**Expected Results:**
- [ ] Plan status changes to "Approved"
- [ ] Pantry audit screen opens
- [ ] "Looks good" button disappears or changes

---

### Flow 2: Swap a Meal

**Scenario:** User wants a different meal for Tuesday

**Setup:**
- Tuesday shows "Taco Tuesday"
- Alternatives available: "Stir Fry", "Pasta Night"

**Steps:**
1. User taps Tuesday's DayCard
2. SwapModal opens showing current meal and alternatives
3. User taps "Stir Fry" alternative

**Expected Results:**
- [ ] Modal closes
- [ ] Tuesday's card now shows "Stir Fry"
- [ ] Original "Taco Tuesday" swaps to another day (or becomes alternative)

---

### Flow 3: Reassign Cook

**Scenario:** User changes who's cooking Thursday

**Setup:**
- Thursday meal assigned to Aaron
- Katie is available as alternative cook

**Steps:**
1. User taps Thursday's DayCard
2. SwapModal shows cook assignment pills (Aaron selected)
3. User taps "Katie" pill

**Expected Results:**
- [ ] Katie pill shows selected state
- [ ] Thursday's card updates to show Katie as cook
- [ ] Change persists after modal closes

---

### Flow 4: Pantry Audit and Grocery List

**Scenario:** User completes pantry audit after approving plan

**Setup:**
- Plan just approved
- Pantry audit shows: "Olive oil", "Rice", "Soy sauce"

**Steps:**
1. Pantry audit screen appears
2. User checks "Olive oil" — already have it
3. User leaves "Rice" unchecked — need to buy
4. User taps "Done"

**Expected Results:**
- [ ] Olive oil removed from grocery list
- [ ] Rice remains on grocery list
- [ ] User redirected to Grocery List tab
- [ ] Success message shown

---

## Empty State Tests

### No Week Plan Exists

**Scenario:** User opens Weekly Planning with no plans

**Setup:**
- No WeekPlan exists for any week

**Expected Results:**
- [ ] Message: "No plan yet for this week"
- [ ] CTA: "Generate Plan" button
- [ ] Week selector still functional
- [ ] Clicking "Generate Plan" starts AI generation

### No Alternatives Available

**Scenario:** User opens swap modal but no alternatives generated

**Setup:**
- Meal exists for the day
- `alternatives` array is empty

**Expected Results:**
- [ ] Modal shows current meal info
- [ ] Message: "No alternative suggestions available"
- [ ] Cook reassignment and eater toggles still work
- [ ] "I'll figure it out" option available

---

## Component Interaction Tests

### DayCard

**Renders correctly:**
- [ ] Shows day name "Tuesday"
- [ ] Shows meal name "Taco Tuesday"
- [ ] Shows effort tier indicator (dots or icon)
- [ ] Shows cook avatar/initial
- [ ] Shows eater count or avatars

**User interactions:**
- [ ] Tapping card calls `onOpenDay` with day id

### WeekSelector

**Renders correctly:**
- [ ] Shows tabs for available weeks
- [ ] Current week highlighted
- [ ] Status badge on each tab (draft dot, approved check)

**User interactions:**
- [ ] Tapping week tab calls `onSelectWeek` with week id
- [ ] "+" button calls `onAddWeek`

### SwapModal

**Renders correctly:**
- [ ] Shows current meal summary
- [ ] Shows cook assignment pills
- [ ] Shows who's eating toggles
- [ ] Shows 2-3 alternative meal options
- [ ] Shows "I'll figure it out" option

**User interactions:**
- [ ] Tapping alternative calls `onSwapMeal`
- [ ] Tapping cook pill calls `onReassignCook`
- [ ] Toggling eater calls `onToggleEater`
- [ ] Close button dismisses modal

---

## Edge Cases

- [ ] Handles week with only 1 meal planned (partial week)
- [ ] Works when all family members are eating (5/5)
- [ ] Works when only 1 family member is eating
- [ ] Swap works when swapping last meal of the week
- [ ] Week navigation works with 3+ weeks ahead

---

## Accessibility Checks

- [ ] Day cards are keyboard navigable
- [ ] Modal traps focus when open
- [ ] Escape key closes modal
- [ ] Screen reader announces day and meal info
- [ ] Cook pills have proper aria-pressed state

---

## Sample Test Data

```typescript
const mockWeekPlan = {
  id: 'week-1',
  weekStart: '2024-01-15',
  status: 'draft',
  meals: [
    {
      id: 'meal-mon',
      date: '2024-01-15',
      dayOfWeek: 'Monday',
      name: 'Sheet Pan Salmon',
      effortTier: 'medium',
      cook: { id: 'hm-001', name: 'Aaron' },
      eaters: [{ id: 'hm-001' }, { id: 'hm-002' }],
      alternatives: [
        { id: 'alt-1', name: 'Pasta Primavera', effortTier: 'easy' },
        { id: 'alt-2', name: 'Grilled Chicken', effortTier: 'medium' },
      ],
    },
    // ... more days
  ],
}

const mockEmptyWeek = {
  id: 'week-2',
  weekStart: '2024-01-22',
  status: 'draft',
  meals: [],
}

const mockPantryItems = [
  { id: 'p-1', name: 'Olive oil', checked: false },
  { id: 'p-2', name: 'Rice', checked: false },
  { id: 'p-3', name: 'Soy sauce', checked: false },
]
```
