# Next Tasks for Orchestrator

## Phase 1: Bug Fixes (Do First)

### Task 1.1: Fix Grocery Item Deduplication
**Agent type:** general-purpose
**Effort:** Medium

The grocery list shows duplicate items (Chicken Breast ×2, Broccoli ×2, Soy Sauce ×2).

Files to investigate:
- `convex/groceryItems.ts` — check how items are added
- `src/components/grocery-list/` — check rendering logic

Expected fix: Either dedupe at insert time or aggregate at query time.

---

### Task 1.2: Fix Grocery Quantity Aggregation
**Agent type:** general-purpose
**Effort:** Low

Milk shows "1 gallon + 2 gallons + 2 gallons" instead of summing to "5 gallons".

Files:
- Look for where quantity strings are constructed
- Should sum numeric values, not concatenate strings

---

### Task 1.3: Fix Unplanned Day Effort Display
**Agent type:** general-purpose
**Effort:** Low

When a day has no meal assigned, it shows "Unplanned" but still displays "Medium" effort tier.

Files:
- `src/components/weekly-planning/DayCard.tsx`

Fix: Don't show effort tier when meal is null/unplanned.

---

## Phase 2: Notifications Wiring

### Task 2.1: Implement Push Notification Sending
**Agent type:** general-purpose
**Effort:** High

Notification settings UI exists but actual push notifications aren't sent.

Files to check:
- `convex/notifications.ts`
- Check for web-push integration
- VAPID keys in `.env.example`

Need to:
1. Set up service worker for push
2. Create scheduled Convex functions for each nudge type
3. Wire up the toggle states to enable/disable

---

### Task 2.2: Test Notification Timing
**Agent type:** general-purpose (with Chrome)
**Effort:** Medium

After push is working, verify:
- 7AM Daily Brief triggers correctly
- 4PM Strategic Pivot triggers correctly
- 7:30PM Thaw Guardian triggers correctly
- Weekly Plan Ready triggers when plan is generated

---

## Phase 3: Feature Completion

### Task 3.1: Recipe Library UI
**Agent type:** general-purpose
**Effort:** High

Users should be able to view/edit their saved recipes.

Check existing:
- `convex/recipes.ts` — CRUD operations exist
- Need UI at `/recipes` or similar

---

### Task 3.2: Pantry Audit Flow
**Agent type:** general-purpose
**Effort:** Medium

"Pantry Audit" button exists on Plan page but flow may be incomplete.

Test the flow:
1. Click Pantry Audit
2. Review ingredients needed
3. Mark what you have
4. Generate grocery list from missing items

---

### Task 3.3: PWA Offline Support
**Agent type:** general-purpose
**Effort:** High

Grocery list should work offline (check items, view list).

Need:
- Service worker caching
- Offline-first data strategy
- Sync when back online

---

## Phase 4: Polish

### Task 4.1: Loading States Audit
**Agent type:** Explore
**Effort:** Low

Find all places that fetch data and ensure loading states exist.

---

### Task 4.2: Mobile Keyboard UX
**Agent type:** general-purpose (with Chrome mobile viewport)
**Effort:** Low

Test chat inputs on mobile:
- Keyboard should not cover input
- Send button should remain visible

---

## Orchestrator Workflow

1. Create TaskCreate entries for each task
2. Set dependencies (Phase 1 before Phase 2, etc.)
3. Spawn agents in parallel where possible
4. Use Chrome testing to verify fixes
5. Commit after each phase

## Parallel Execution Opportunities

Can run simultaneously:
- Task 1.1, 1.2, 1.3 (all bug fixes, independent)
- Task 3.1, 3.2 (both feature work, independent)

Must be sequential:
- Task 2.1 before 2.2 (can't test notifications until they work)
