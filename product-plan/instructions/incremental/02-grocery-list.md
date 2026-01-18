# Milestone 2: Grocery List

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

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

Implement the Grocery List feature — a shared, real-time grocery list organized by store with organic guardrails and check-off behavior.

## Overview

The Grocery List is the first standalone feature users can benefit from. It's a shared, real-time list organized by **the store you typically buy each item at** (Meijer, Costco, Aldi, Trader Joe's). Users can add items via text or voice, check items off as they shop, and items with organic requirements display a badge.

**Key Functionality:**
- View items grouped by store (with store filter pills at top)
- Add items inline within each store section
- Check off items (move to bottom) and uncheck to re-add
- Drag-and-drop to assign items to stores or reorder
- See organic badges on flagged items
- Manage stores (add, rename, remove)
- View which planned meals an item is for

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/grocery-list/tests.md` for detailed test-writing instructions including:
- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `product-plan/sections/grocery-list/components/`:

- `GroceryListView` — Main list view with store filtering
- `GroceryListItem` — Individual item with check/edit/delete
- `StoreFilters` — Store pill filters
- `AddItemInput` — Inline item addition
- Additional helper components

### Data Layer

The components expect these data shapes:

```typescript
interface GroceryItem {
  id: string
  name: string
  quantity?: string
  store: string
  category: string
  isOrganic: boolean
  isChecked: boolean
  linkedMeals?: string[]
}

interface Store {
  id: string
  name: string
  color?: string
}
```

You'll need to:
- Create API endpoints for CRUD operations on grocery items
- Implement real-time sync for multi-user updates
- Store assignment and drag-and-drop handling

### Callbacks

Wire up these user actions:

| Callback | Description |
|----------|-------------|
| `onAddItem` | Add new item to a specific store |
| `onToggleCheck` | Mark item as checked/unchecked |
| `onEditItem` | Update item name, quantity, or store |
| `onDeleteItem` | Remove item from list |
| `onReorderItems` | Reorder items within a store |
| `onMoveToStore` | Move item to different store |
| `onManageStores` | Open store management UI |

### Empty States

Implement empty state UI for when no records exist yet:

- **No grocery items:** Show helpful message encouraging user to add first item
- **No items in filtered store:** Show message that this store has no items
- **Checked items section empty:** Can be hidden when no checked items exist

## Files to Reference

- `product-plan/sections/grocery-list/README.md` — Feature overview and design intent
- `product-plan/sections/grocery-list/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/grocery-list/components/` — React components
- `product-plan/sections/grocery-list/types.ts` — TypeScript interfaces
- `product-plan/sections/grocery-list/sample-data.json` — Test data
- `product-plan/sections/grocery-list/screenshot.png` — Visual reference

## Expected User Flows

### Flow 1: Add a Grocery Item

1. User navigates to Grocery List tab
2. User taps "+ Add item" in a store section
3. User types item name and optional quantity
4. User presses Enter or taps Add
5. **Outcome:** New item appears in that store section

### Flow 2: Check Off Items While Shopping

1. User opens Grocery List at the store
2. User taps checkbox next to an item
3. **Outcome:** Item moves to "Checked" section at bottom, stays visible for 24 hours

### Flow 3: Move Item to Different Store

1. User long-presses or drags an item
2. User drops it in a different store section (or uses edit menu)
3. **Outcome:** Item now appears under the new store

### Flow 4: Filter by Store

1. User taps a store pill at top (e.g., "Costco")
2. **Outcome:** Only Costco items are shown
3. User taps "All" to see all items again

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Items can be added, checked, edited, deleted
- [ ] Store filtering works
- [ ] Drag-and-drop reordering works
- [ ] Organic badges display correctly
- [ ] Real-time sync between users works
- [ ] Empty states display properly when no items exist
- [ ] Matches the visual design
- [ ] Responsive on mobile
