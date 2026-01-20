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
