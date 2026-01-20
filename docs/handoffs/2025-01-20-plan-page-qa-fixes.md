# Handoff: Plan Page QA Fixes and AI Meal Alternatives

**Date:** January 20, 2025
**Branch:** `claude-qa-fixes-plan-page`
**Previous Session:** Wired remaining pages to Convex persistence
**Commit:** `372e380` - feat: Fix Plan page UI issues and add AI meal alternatives

---

## Summary

User reported multiple issues on the Weekly Planning (Plan) page:
1. Buttons unreadable (wrong colors)
2. Plus button did nothing
3. Cook/eater toggles didn't update UI
4. Pantry Audit didn't save to grocery list
5. No way to add custom meals
6. Meal alternatives were hardcoded

All issues have been fixed. The Plan page now has working AI-powered meal suggestions, manual meal entry, and proper Convex sync.

---

## What Was Completed This Session

### Tier 1: Critical UI Fixes

| Issue | Fix | File |
|-------|-----|------|
| "Looks good" button unreadable (gold on dark) | Changed to `--color-secondary` (green) | `WeekPlanView.tsx:79` |
| "Generate plan" button wrong color | Changed to `--color-secondary` (green) | `WeekPlanView.tsx:118` |
| "Approved" badge unreadable (20% opacity green) | Changed to solid green with white text | `WeekPlanView.tsx:45-56` |
| Week selector tab hard to read | Solid gold background with `--color-bg` text | `WeekSelector.tsx:73` |
| Plus (+) button did nothing | Wired to `api.weekPlans.create` mutation | `page.tsx:219-252` |
| Pantry Audit didn't save | Wired to `api.groceryItems.add` mutation | `page.tsx:279-297` |

### Tier 2: Core Functionality

| Feature | Implementation | File |
|---------|----------------|------|
| Cook/eater buttons not syncing | Added `useEffect` to sync `selectedMeal` with Convex data | `page.tsx:81-89` |
| AI-powered meal alternatives | New `suggestAlternatives` action in Convex | `convex/ai.ts:241-411` |
| "More options" button | Calls AI, shows loading state, displays alternatives | `page.tsx:154-201`, `EditDayModal.tsx` |
| Manual meal entry | New collapsible form with name + effort picker | `EditDayModal.tsx:413-503` |

### New Convex Action: `suggestAlternatives`

```typescript
// convex/ai.ts
export const suggestAlternatives = action({
  args: {
    currentMealName: v.string(),
    effortPreference: v.optional(v.string()),
    excludeMeals: v.optional(v.array(v.string())),
  },
  returns: v.object({
    success: v.boolean(),
    alternatives: v.optional(v.array(...)),  // 3 meal suggestions
    error: v.optional(v.string()),
  }),
});
```

Returns 3 alternatives with variety (easy, medium, involved) using Zylo AI via OpenRouter.

---

## Files Changed

| File | Changes |
|------|---------|
| `convex/ai.ts` | +176 lines - New `suggestAlternatives` action |
| `src/app/weekly-planning/page.tsx` | +115 lines - Handlers, mutations, state sync |
| `src/components/weekly-planning/EditDayModal.tsx` | +143 lines - Loading state, custom meal form |
| `src/components/weekly-planning/WeekPlanView.tsx` | ~6 lines - Button color fixes |
| `src/components/weekly-planning/WeekSelector.tsx` | ~1 line - Tab styling fix |

---

## Design Token Compliance

Per `DESIGN-TOKENS.md`:
- **Green (`--color-secondary`)** = Primary positive actions ("Looks good", "Make it", "Confirm")
- **Gold (`--color-primary`)** = Secondary/change actions ("Swap", "Edit", "More options")
- **Red (`--color-danger`)** = Destructive actions

The previous code had these reversed. Now corrected.

---

## Known Issues / Not Yet Implemented

### Still TODO on Plan Page

1. **Navigate weeks with arrows** - Left/right arrow handlers are stubs (`onNavigatePrevious`, `onNavigateNext`)
2. **Redirect to Grocery List after Pantry Audit** - Currently just closes the audit; spec says redirect
3. **Link grocery items to meals** - `linkedMealIds` field exists but not populated from Pantry Audit
4. **Voice input for custom meal** - Placeholder only

### Conversational Planning Note

The spec mentions "conversational AI for inventory-first conversations" but this is implemented on the **Home page (Meal Helper)**, not Weekly Planning. The Home page already has full Zylo chat. Weekly Planning uses structured UI (swap modal, alternatives) rather than free-form chat.

---

## Testing Checklist

### Button Colors
- [ ] "Looks good" button is green (not gold)
- [ ] "Generate plan" button is green
- [ ] "Approved" badge is solid green with white text
- [ ] Week selector shows gold pill for selected week with readable text

### Plus Button
- [ ] Click + creates new week (check Convex dashboard)
- [ ] New week appears in selector
- [ ] New week auto-selects

### Cook/Eater Sync
- [ ] Open meal modal
- [ ] Click a different cook → UI updates immediately
- [ ] Toggle an eater → UI updates immediately
- [ ] Close and reopen modal → Changes persisted

### AI Alternatives
- [ ] Click "More options" → Shows "Finding options..." loading
- [ ] After ~2s, shows 3 meal alternatives
- [ ] Click an alternative → Modal closes, meal updates

### Custom Meal Entry
- [ ] Click "Enter your own meal" → Form expands
- [ ] Type meal name, pick effort tier
- [ ] Click "Use this meal" → Modal closes, meal updates

### Pantry Audit
- [ ] Approve a plan → Pantry audit opens
- [ ] Check some items (already have)
- [ ] Click "Done" → Unchecked items appear in Grocery List page

---

## Architecture Notes

### selectedMeal Sync Pattern

The EditDayModal receives `selectedMeal` as a prop, but mutations update Convex (not local state). Without sync, the modal shows stale data.

**Solution:**
```typescript
// page.tsx
useEffect(() => {
  if (selectedMeal && selectedWeekPlan) {
    const updatedMeal = selectedWeekPlan.meals.find((m) => m.id === selectedMeal.id);
    if (updatedMeal && JSON.stringify(updatedMeal) !== JSON.stringify(selectedMeal)) {
      setSelectedMeal(updatedMeal);
    }
  }
}, [selectedWeekPlan, selectedMeal]);
```

This re-derives `selectedMeal` from the Convex query whenever it updates.

### AI Alternatives Flow

```
User clicks "More options"
  → handleMoreOptions() called
  → setIsLoadingAlternatives(true)
  → suggestAlternatives({ currentMealName, excludeMeals })
  → AI returns 3 alternatives
  → setAlternatives(newAlternatives)
  → setIsLoadingAlternatives(false)
  → EditDayModal renders alternatives list
```

---

## Next Session Suggestions

1. **Test all fixes manually** - Refresh app and walk through checklist above
2. **Wire week navigation arrows** - The handlers exist but are stubs
3. **Add grocery item meal linking** - Pass `linkedMealIds` when creating from Pantry Audit
4. **Consider empty state UX** - What happens when user creates a new week with no meals?

---

## Branch Status

```
Branch: claude-qa-fixes-plan-page
Base: claude-qa-fixes (which is based on main)
Status: Ready for testing/merge
```

No conflicts expected. All TypeScript checks pass.

---

# Round 2: Manual QA Findings and Implementation Plan

**Date:** January 20, 2025 (later session)
**Status:** PLANNING COMPLETE - Ready to implement in new chat

---

## QA Issues Found

### Critical Bug: Generate Plan Doesn't Save Meals
The `generateWeekPlan` AI action returns meal data, but **nothing saves it to the database**.
- Code has comment "Success: Convex will auto-update via query subscription" but save logic was never implemented
- User clicks button, sees spinner, nothing happens
- **Must fix:** After `generateWeekPlan` returns, call `addMeal` mutation for each meal

### UX Issue: "No Quick Swap Options" Confusion
The `alternatives` state starts empty (intentional - fetched on-demand via "More options"). But users expect to see other meals from the week as quick swap options.

### Missing: Edit Custom Meals After Entry
Users can enter a custom meal but can't edit it after (fix typo, add ingredients). Current flow only allows full replacement.

### Missing: Recipe Library
Custom meals are not saved anywhere for reuse. The `recipes` table exists in Convex schema but is unused.

### Missing: Chat with Zylo in Modal
User wants conversational option to describe meals, not just buttons/forms.

### Correction: Conversational Planning
The app is a **HYBRID** - structured UI (Rails) plus chat everywhere. Users should be able to talk to Zylo from any screen, including the Edit Day modal.

---

## Implementation Plan (4 Phases)

### Phase 1: Critical Fixes (NEXT SESSION)

**1.1 Fix Generate Plan Bug**
- Location: `src/app/weekly-planning/page.tsx` handleGeneratePlan()
- After `generateWeekPlan` returns, loop through meals and call `addMeal` mutation
- Show success message when complete

**1.2 Show Week Meals as Quick Swaps**
- When modal opens, populate `alternatives` with other meals from same week
- This is instant (no API call) - just filter `selectedWeekPlan.meals`
- Keep "More options" button for AI suggestions

**1.3 Make Meal Fields Editable**
- In EditDayModal, change "Current Meal" section from read-only to editable:
  - Meal name → text input
  - Effort tier → picker buttons
  - Prep/cook time → number inputs (optional)
  - Ingredients → add/remove list
- Save on blur or explicit save button

### Phase 2: Recipe Library

**2.1 Create `convex/recipes.ts`**
```typescript
// Queries
api.recipes.list        // Get all user recipes
api.recipes.search      // Search by name

// Mutations
api.recipes.create      // Save new recipe
api.recipes.update      // Edit recipe
api.recipes.delete      // Remove recipe
```

**2.2 Auto-Save Custom Meals**
When user saves a custom meal, also call `recipes.create` to save it for future use.

**2.3 Browse Recipes in Modal**
Add "From my recipes" section in EditDayModal showing saved recipes.

### Phase 3: Generate Plan Flow Redesign

**3.1 Quick Questions Modal**
When "Generate Plan" clicked, show modal with:
- "How's your energy this week?" (Low / Medium / High)
- "Anyone joining or away?" (text input or skip)
- "Any meals you definitely want?" (pick from recipes to anchor)

**3.2 Anchor Meals**
Let users pick 1-3 meals to lock in before generating.
- AI fills remaining days around anchored meals
- Anchored meals show lock icon in UI

**3.3 Settings/Preferences Page**
Create or enhance Settings with:
- Household size
- Dietary restrictions / allergies
- Cuisine preferences
- Default effort level
- Zylo can update these via chat (with confirmation)

### Phase 4: Chat with Zylo in Modal

**4.1 Inline Chat Input**
Add small chat input at bottom of EditDayModal:
- Placeholder: "Ask Zylo for suggestions..."
- Responses appear inline below input
- Can request specific meals conversationally
- Uses existing `api.ai.chat` action with meal context

---

## Files to Modify by Phase

### Phase 1
| File | Changes |
|------|---------|
| `src/app/weekly-planning/page.tsx` | Fix handleGeneratePlan to save meals, populate alternatives on modal open |
| `src/components/weekly-planning/EditDayModal.tsx` | Make meal fields editable |
| `convex/weekPlans.ts` | May need to update addMeal for batch inserts |

### Phase 2
| File | Changes |
|------|---------|
| `convex/recipes.ts` | NEW - Recipe CRUD operations |
| `src/app/weekly-planning/page.tsx` | Query recipes, call create on custom meal |
| `src/components/weekly-planning/EditDayModal.tsx` | Add "From my recipes" section |

### Phase 3
| File | Changes |
|------|---------|
| `src/components/weekly-planning/GeneratePlanModal.tsx` | NEW - Questions modal |
| `src/app/settings/page.tsx` | NEW or enhance - Preferences UI |
| `convex/preferences.ts` | NEW - User preferences storage |
| `convex/ai.ts` | Update generateWeekPlan to accept preferences/anchors |

### Phase 4
| File | Changes |
|------|---------|
| `src/components/weekly-planning/EditDayModal.tsx` | Add inline chat input |
| `src/app/weekly-planning/page.tsx` | Add chat handler using api.ai.chat |

---

## Verification Steps

### Phase 1 Testing
1. Click "Generate Plan" on empty week → Meals should appear on the calendar
2. Open meal modal → Should see other week meals as swap options immediately
3. Edit meal name in modal → Should save and persist after closing
4. Add ingredient to meal → Should save and show in pantry audit

### Phase 2 Testing
1. Enter custom meal → Check it appears in "My Recipes"
2. Open modal on different day → "From my recipes" shows saved meals
3. Select a recipe → Meal updates to that recipe

### Phase 3 Testing
1. Click Generate Plan → Questions modal appears first
2. Answer questions → AI generates appropriate plan based on answers
3. Anchor "Taco Tuesday" → That meal stays locked, AI fills other days
4. Check Settings → Preferences persist across sessions

### Phase 4 Testing
1. Type "suggest something easy" in modal chat → Zylo responds with suggestions
2. Type "use the pasta one" → Meal updates to pasta suggestion
3. Ask about ingredients → Zylo lists what's needed

---

## Data Model Notes

**Existing tables (unused):**
- `pantryItems` - for tracking fridge/freezer/pantry inventory (skip for now)
- `recipes` - for saved meal recipes (Phase 2)

**Table to create:**
- `preferences` - user/household preferences for AI (Phase 3)

---

## Priority Order

1. **Phase 1** - Most critical, fixes broken functionality
2. **Phase 2** - High value, enables reuse of meals
3. **Phase 3** - Medium, improves AI generation quality
4. **Phase 4** - Nice to have, adds conversational option
