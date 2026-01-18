# Test Instructions: Grocery List

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, etc.).

## Overview

The Grocery List is a shared, real-time shopping list organized by store. Key functionality includes adding items, checking them off, filtering by store, and managing organic badges.

---

## User Flow Tests

### Flow 1: Add a Grocery Item

**Scenario:** User adds a new item to the grocery list

#### Success Path

**Setup:**
- Grocery list view is rendered with at least one store (e.g., "Meijer")
- No items exist yet

**Steps:**
1. User sees "+ Add item" button in Meijer section
2. User taps "+ Add item"
3. User types "Organic Spinach" in the input field
4. User presses Enter or taps Add button

**Expected Results:**
- [ ] New item "Organic Spinach" appears in Meijer section
- [ ] Input field clears after adding
- [ ] Item count updates if displayed

#### Failure Path: Empty Input

**Setup:**
- Add item input is focused

**Steps:**
1. User leaves input empty
2. User presses Enter

**Expected Results:**
- [ ] No item is added
- [ ] Input remains focused
- [ ] Optional: validation message appears

---

### Flow 2: Check Off an Item

**Scenario:** User marks an item as purchased while shopping

**Setup:**
- At least one unchecked item exists in the list

**Steps:**
1. User sees item with unchecked checkbox
2. User taps the checkbox

**Expected Results:**
- [ ] Checkbox shows checked state
- [ ] Item moves to "Checked" section at bottom
- [ ] Item appears with strikethrough or dimmed styling

---

### Flow 3: Uncheck an Item

**Scenario:** User realizes they still need an item they accidentally checked

**Setup:**
- At least one checked item exists in the "Checked" section

**Steps:**
1. User scrolls to Checked section
2. User taps checkbox on checked item

**Expected Results:**
- [ ] Item moves back to its original store section
- [ ] Checkbox shows unchecked state
- [ ] Item styling returns to normal

---

### Flow 4: Filter by Store

**Scenario:** User wants to see only Costco items

**Setup:**
- Items exist in multiple stores (Meijer, Costco, Aldi)
- Store filter pills are visible at top

**Steps:**
1. User taps "Costco" pill
2. User views filtered list
3. User taps "All" pill

**Expected Results:**
- [ ] Only Costco items are visible after step 2
- [ ] Other store sections are hidden
- [ ] "Costco" pill shows selected/active state
- [ ] After tapping "All", all store sections are visible again

---

## Empty State Tests

### Primary Empty State

**Scenario:** User has no grocery items yet

**Setup:**
- Grocery items array is empty (`[]`)
- Stores exist (Meijer, Costco, etc.)

**Expected Results:**
- [ ] Empty state message is visible (e.g., "Your list is empty")
- [ ] "+ Add item" option is still available
- [ ] Store filter pills may be hidden or disabled
- [ ] No blank screen — helpful guidance displayed

### Empty Store Section

**Scenario:** A specific store has no items

**Setup:**
- Items exist in Meijer
- Costco has no items

**Expected Results:**
- [ ] Costco section shows "No items" or is collapsed
- [ ] "+ Add item" is available in Costco section
- [ ] Meijer section displays its items normally

### Checked Section Empty

**Scenario:** No items have been checked off

**Setup:**
- Unchecked items exist
- No checked items

**Expected Results:**
- [ ] Checked section is hidden or shows "No checked items"
- [ ] Main list displays normally

---

## Component Interaction Tests

### GroceryListItem

**Renders correctly:**
- [ ] Displays item name "Organic Spinach"
- [ ] Shows quantity if provided (e.g., "2 bunches")
- [ ] Shows organic badge (leaf icon) for organic items
- [ ] Shows linked meal indicator if item is from a planned meal

**User interactions:**
- [ ] Tapping checkbox calls `onToggleCheck` with item id
- [ ] Tapping item name enables inline edit mode
- [ ] Tapping delete icon calls `onDeleteItem` with item id

### Store Filter Pills

**Renders correctly:**
- [ ] Shows "All" pill plus one pill per store
- [ ] Active pill has distinct styling

**User interactions:**
- [ ] Tapping pill calls `onFilterByStore` with store id
- [ ] Tapping "All" shows all stores

---

## Edge Cases

- [ ] Handles very long item names with text truncation
- [ ] Works correctly with 1 item and 100+ items
- [ ] Handles special characters in item names
- [ ] Organic badge displays correctly for items with `isOrganic: true`
- [ ] Real-time sync: item added by another user appears in list

---

## Accessibility Checks

- [ ] Checkboxes are keyboard accessible
- [ ] Store filter pills can be navigated with keyboard
- [ ] Screen reader announces checked/unchecked state changes
- [ ] Focus management after adding or deleting items

---

## Sample Test Data

```typescript
const mockStores = [
  { id: 'store-1', name: 'Meijer' },
  { id: 'store-2', name: 'Costco' },
  { id: 'store-3', name: 'Aldi' },
]

const mockItems = [
  {
    id: 'item-1',
    name: 'Organic Spinach',
    quantity: '2 bunches',
    store: 'Meijer',
    category: 'Produce',
    isOrganic: true,
    isChecked: false,
  },
  {
    id: 'item-2',
    name: 'Chicken Breast',
    quantity: '2 lbs',
    store: 'Costco',
    category: 'Meat',
    isOrganic: false,
    isChecked: false,
  },
]

const mockEmptyList = []
```
