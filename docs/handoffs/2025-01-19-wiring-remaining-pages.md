# Handoff: Wiring Remaining Pages to Convex

**Date:** January 19, 2025
**Branch:** `claude-wiring-up-features`
**Previous Session:** Wired up home page (`/`) with Convex persistence

---

## Summary

The home page Meal Helper is now connected to Convex. Three other main pages still need wiring:
1. **Grocery List** - full wiring needed
2. **Weekly Planning** - full wiring needed
3. **Notifications** - partial (preferences don't persist)

There's also a duplicate `/meal-helper` page that should be deleted or redirected.

---

## What Was Completed This Session

### Home Page (`src/app/page.tsx`) - DONE ✅

- Created type adapters (`src/lib/meal-adapters.ts`) to convert between Convex and UI types
- Added `getCurrentWeekWithMeals` query to `convex/weekPlans.ts`
- Replaced mock data with `useQuery` hooks
- Wired up `swapMeals` mutation
- Handles null meal gracefully (empty week plan state)

**Key commits:**
- `cd36fdd` - feat: Wire up Meal Helper with Convex persistence
- `26849a9` - docs: Update CLAUDE.md current state

---

## Remaining Work (Priority Order)

### 1. Grocery List (`src/app/grocery-list/page.tsx`) - HIGH PRIORITY

**Current State:** All mock data, local state only

**Backend Already Built:** `convex/groceryItems.ts` (12KB) has:
```typescript
// Queries
api.groceryItems.list        // Get all items
api.groceryItems.getByStore  // Get items for a store

// Mutations
api.groceryItems.create      // Add item
api.groceryItems.update      // Update item
api.groceryItems.delete      // Delete item
api.groceryItems.toggleChecked  // Check/uncheck
api.groceryItems.moveToStore    // Change store
api.groceryItems.reorder        // Reorder within store
api.groceryItems.clearChecked   // Clear all checked items
api.groceryItems.addMissingIngredients  // Add from meal
```

Also `convex/stores.ts`:
```typescript
api.stores.list    // Get all stores
api.stores.create  // Add store
api.stores.update  // Rename store
api.stores.delete  // Delete store
```

**What to Wire:**

| Handler | Replace With |
|---------|--------------|
| `handleAddItem` | `useMutation(api.groceryItems.create)` |
| `handleToggleChecked` | `useMutation(api.groceryItems.toggleChecked)` |
| `handleDeleteItem` | `useMutation(api.groceryItems.delete)` |
| `handleUpdateItem` | `useMutation(api.groceryItems.update)` |
| `handleMoveItem` | `useMutation(api.groceryItems.moveToStore)` |
| `handleAddStore` | `useMutation(api.stores.create)` |
| `handleRenameStore` | `useMutation(api.stores.update)` |
| `handleDeleteStore` | `useMutation(api.stores.delete)` |
| `stores` state | `useQuery(api.stores.list)` |
| `items` state | `useQuery(api.groceryItems.list)` |

**Type Gaps to Handle:**
- UI uses `GroceryItem` with `mealSources` array
- Convex uses `linkedMealIds` (array of meal IDs)
- May need adapters similar to `meal-adapters.ts`

**Files to Check:**
- `src/types/grocery.ts` - UI types
- `convex/schema.ts` - Convex types (lines 131-146)

---

### 2. Weekly Planning (`src/app/weekly-planning/page.tsx`) - HIGH PRIORITY

**Current State:** Mock data from January 2024, all handlers are stubs

**Backend Already Built:** `convex/weekPlans.ts` has:
```typescript
// Queries
api.weekPlans.list                    // All week plans
api.weekPlans.get                     // Single plan by ID
api.weekPlans.getByWeekStart          // Plan by start date
api.weekPlans.getMeals                // Meals for a plan
api.weekPlans.getWithMeals            // Plan + meals combined
api.weekPlans.getCurrentWeekWithMeals // Current week (added this session)

// Mutations
api.weekPlans.create          // Create week plan
api.weekPlans.updateStatus    // Change status (draft/approved/etc)
api.weekPlans.addMeal         // Add meal to plan
api.weekPlans.updateMeal      // Update meal details
api.weekPlans.deleteMeal      // Remove meal
api.weekPlans.swapMeals       // Swap two meals
api.weekPlans.seedSampleWeekPlan  // Seed test data
```

**What's Broken:**
1. `availableWeeks` is hardcoded with 2024 dates
2. `weekPlans` record is hardcoded mock data
3. `householdMembers` is hardcoded
4. All these handlers are `console.log` stubs:
   - `handleChangeCook`
   - `handleToggleEater`
   - `handleSelectAlternative`
   - `handleUnplan`
5. `handleApprovePlan` only updates local state
6. Week selector doesn't fetch real weeks

**What to Wire:**

| Data/Handler | Replace With |
|--------------|--------------|
| `householdMembers` const | `useQuery(api.householdMembers.list)` |
| `availableWeeks` const | Build from `useQuery(api.weekPlans.list)` |
| `weekPlans` record | `useQuery(api.weekPlans.getWithMeals)` |
| `handleChangeCook` | `useMutation(api.weekPlans.updateMeal)` |
| `handleToggleEater` | `useMutation(api.weekPlans.updateMeal)` |
| `handleSelectAlternative` | `useMutation(api.weekPlans.swapMeals)` or `updateMeal` |
| `handleApprovePlan` | `useMutation(api.weekPlans.updateStatus)` |

**Type Gaps:**
- UI uses `effortTier: "super-easy" | "middle" | "more-prep"`
- Convex uses `effortTier: "easy" | "medium" | "involved"`
- UI uses `cleanupRating: "low" | "medium" | "high"`
- Convex uses `cleanupRating: 1 | 2 | 3`

**Reuse the adapters!** The `src/lib/meal-adapters.ts` file has:
- `toPlannedMealSummary()` - converts Convex meal to UI format
- `toHouseholdMember()` - converts Convex member to UI format
- `getDayLabel()` - generates day labels from dates
- `getTodayDateString()` - gets today as YYYY-MM-DD

You may need to add a `toWeekSummary()` adapter for the week selector.

**Files to Check:**
- `src/types/weekly-planning.ts` - UI types
- `src/components/weekly-planning/` - Components

---

### 3. Notifications Preferences (`src/app/notifications/page.tsx`) - MEDIUM PRIORITY

**Current State:** List works, preferences are local state only

**What Already Works:**
```typescript
// These are wired ✅
const convexNotifications = useQuery(api.notifications.list);
const markDone = useMutation(api.notifications.markDone);
```

**What's NOT Wired:**
- `preferences` state (quiet hours, enabled types, fandom voice)
- `crisisDayMute` state

**Backend Needed:** Check if `notificationPreferences` queries/mutations exist in Convex. The schema has the table (lines 177-190 in `convex/schema.ts`) but I didn't see a `notificationPreferences.ts` file.

**May need to create:**
```typescript
// convex/notificationPreferences.ts
api.notificationPreferences.get      // Get user's preferences
api.notificationPreferences.update   // Update preferences
api.notificationPreferences.toggleCrisisMute  // Toggle mute
```

---

### 4. Delete Duplicate `/meal-helper` Page - LOW PRIORITY

**File:** `src/app/meal-helper/page.tsx`

This is a duplicate of the home page functionality but still using mock data. Options:
1. Delete it entirely
2. Redirect to `/`
3. Wire it up (wasteful since home page already does this)

**Recommendation:** Delete or redirect. The home page IS the meal helper.

---

## Key Patterns to Follow

### Pattern 1: Data Fetching

```typescript
// Get today for date-based queries
const today = getTodayDateString();

// Fetch data with useQuery
const householdMembersData = useQuery(api.householdMembers.list);
const weekData = useQuery(api.weekPlans.getCurrentWeekWithMeals, { today });

// Handle loading state
const isDataLoading = householdMembersData === undefined || weekData === undefined;
```

### Pattern 2: Type Conversion with useMemo

```typescript
const householdMembers = useMemo(() => {
  if (!householdMembersData || householdMembersData.length === 0) {
    return [];
  }
  return householdMembersData.map(toHouseholdMember);
}, [householdMembersData]);
```

### Pattern 3: Mutations with Error Handling

```typescript
const swapMealsMutation = useMutation(api.weekPlans.swapMeals);

const handleSwap = async () => {
  try {
    await swapMealsMutation({
      mealId1: meal1.id as Id<"plannedMeals">,
      mealId2: meal2.id as Id<"plannedMeals">,
    });
    // Success feedback
  } catch (error) {
    console.error("Swap error:", error);
    // Error feedback to user
  }
};
```

### Pattern 4: Loading States

```typescript
// Show loading while auth OR data is loading
const isDataLoading = someQuery === undefined;
if (isLoading || (isAuthenticated && isDataLoading)) {
  return <LoadingSpinner />;
}
```

---

## Critical Rules (from CLAUDE.md)

1. **No `any` types** - Ask what the data looks like if unclear
2. **Use CSS custom properties** - `var(--color-primary)`, not raw hex
3. **Mobile-first** - This is a phone app
4. **Run type checker** before saying you're done
5. **Never read `.env*` files** - Ask for specific values if needed

---

## Files Quick Reference

| Purpose | File |
|---------|------|
| Type adapters | `src/lib/meal-adapters.ts` |
| Convex schema | `convex/schema.ts` |
| Grocery backend | `convex/groceryItems.ts`, `convex/stores.ts` |
| Week plans backend | `convex/weekPlans.ts` |
| Notifications backend | `convex/notifications.ts` |
| Household backend | `convex/householdMembers.ts` |
| UI types - grocery | `src/types/grocery.ts` |
| UI types - weekly | `src/types/weekly-planning.ts` |
| UI types - notifications | `src/types/notifications.ts` |
| UI types - meal helper | `src/types/meal-helper.ts` |

---

## Testing After Wiring

1. **Run type checker:** `npx tsc --noEmit`
2. **Run linter:** `npm run lint`
3. **Run build:** `npm run build`
4. **Manual test:** Check pages in browser after `npm run dev`

**To seed test data** (if database is empty):
- Use Convex dashboard to run `weekPlans.seedSampleWeekPlan`
- Use Convex dashboard to run `householdMembers.seedZinkFamily`

---

## Suggested Order of Work

1. **Grocery List** - Straightforward wiring, good backend
2. **Weekly Planning** - Similar pattern, reuse adapters
3. **Notifications Preferences** - May need to create backend functions
4. **Delete `/meal-helper`** - Quick cleanup

Good luck!
