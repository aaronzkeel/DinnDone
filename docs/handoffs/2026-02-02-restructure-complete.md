# Handoff: DinnDone Reset & Restructure Complete

**Date:** February 2, 2026
**Session:** Major app restructure (Phases 0, 1, 2, 4 complete)

---

## What Was Done

### Phase 0: Cleanup
- Deleted entire `src/app/_test/` directory (57 test pages)
- Created `convex/admin.ts` with `resetAllData` mutation
  - Preserves: `householdMembers`
  - Wipes: stores, weekPlans, plannedMeals, groceryItems, pantryItems, notifications, recipes, notificationPreferences, pushSubscriptions

### Phase 1: Navigation Restructure
- **BottomNav** changed from `Home|Plan|List|Alerts` to `Home|Plan|Kitchen|Recipes`
- **Kitchen page** (`/kitchen`) with sub-tabs: Shopping | Pantry
  - Shopping tab: extracted grocery list functionality
  - Pantry tab: new inventory management (fridge/freezer/pantry locations)
- **Settings page** (`/settings`) with:
  - Dark mode toggle
  - Household members display
  - Notification settings link
  - Redo Setup option
  - Sign out with confirmation
- **Header** updated with settings icon link
- Old `/grocery-list` redirects to `/kitchen`

### Phase 2: Onboarding Flow
- Created `src/app/onboarding/page.tsx` with 5-step Zylo-guided flow:
  1. Welcome - Meet Zylo
  2. Household - Confirm family members
  3. Stores - Where you shop
  4. Preferences - Dietary restrictions, effort level
  5. Ready - Start using app
- Created `convex/userPreferences.ts` for tracking onboarding completion
- Home page checks onboarding status and redirects if needed
- Settings has "Redo Setup" to re-run onboarding

### Phase 4: Recipe Library (Core Features)
- **Recipe list page** (`/recipes`) with:
  - List/grid toggle (preference saved)
  - Search bar
  - Effort filter
  - Empty state with Zylo prompt
  - Floating add button
- **Recipe detail page** (`/recipes/[id]`) with:
  - Photo, stats, ingredients, instructions
  - Edit, print, delete actions
  - "Use in Meal Plan" button
- **Add recipe** (`/recipes/add`) - full manual entry form
- **Edit recipe** (`/recipes/[id]/edit`) - pre-populated edit form
- **Scan recipe** (`/recipes/scan`) - Coming Soon placeholder
- **Print recipe** (`/recipes/[id]/print`) - Coming Soon placeholder
- Created `RecipeCard` component for list/grid views
- Extended Convex schema and mutations for recipes

---

## Files Created/Modified

### New Files
| File | Purpose |
|------|---------|
| `convex/admin.ts` | Data reset mutation |
| `convex/pantryItems.ts` | Pantry CRUD operations |
| `convex/userPreferences.ts` | Onboarding tracking |
| `src/app/kitchen/page.tsx` | Kitchen page with sub-tabs |
| `src/app/kitchen/components/ShoppingTab.tsx` | Grocery list (extracted) |
| `src/app/kitchen/components/PantryTab.tsx` | Pantry management |
| `src/app/settings/page.tsx` | Settings page |
| `src/app/onboarding/page.tsx` | Onboarding flow |
| `src/app/recipes/page.tsx` | Recipe library |
| `src/app/recipes/[id]/page.tsx` | Recipe detail |
| `src/app/recipes/add/page.tsx` | Add recipe form |
| `src/app/recipes/[id]/edit/page.tsx` | Edit recipe form |
| `src/app/recipes/scan/page.tsx` | Scan placeholder |
| `src/app/recipes/[id]/print/page.tsx` | Print placeholder |
| `src/components/recipes/RecipeCard.tsx` | Recipe card component |

### Modified Files
| File | Change |
|------|--------|
| `src/components/BottomNav.tsx` | New nav items |
| `src/components/Header.tsx` | Added settings icon |
| `src/app/grocery-list/page.tsx` | Redirect to /kitchen |
| `convex/schema.ts` | Added userPreferences, extended recipes |
| `convex/recipes.ts` | Enhanced search, timestamps, saveFromMealPlan |

### Deleted
- Entire `src/app/_test/` directory (57 files)

---

## Phase 3: QA Checklist

**Run these steps manually in a fresh context:**

### 1. Reset Data
```bash
# Option A: Convex Dashboard
# Go to dashboard → Functions → admin:resetAllData → Run

# Option B: Temporary button (create if needed)
# Add button in Settings that calls resetAllData mutation
```

### 2. Onboarding Flow
- [ ] Fresh user redirects to `/onboarding`
- [ ] All 5 steps display correctly
- [ ] Progress bar updates
- [ ] Back button works (disabled on step 1)
- [ ] Preferences save correctly
- [ ] "Let's Go!" completes onboarding
- [ ] User lands on Home after completion
- [ ] Returning user skips onboarding

### 3. Navigation
- [ ] All 4 tabs work: Home | Plan | Kitchen | Recipes
- [ ] Kitchen sub-tabs switch: Shopping | Pantry
- [ ] Settings accessible from header icon
- [ ] Active states highlight correctly on all routes

### 4. Empty States
- [ ] Kitchen/Shopping shows empty grocery list
- [ ] Kitchen/Pantry shows empty pantry state
- [ ] Recipes shows empty library with Zylo prompt
- [ ] Plan shows appropriate empty state

### 5. Recipe Feature
- [ ] Add recipe manually - form submits
- [ ] Recipe appears in library
- [ ] Search filters recipes
- [ ] List/grid toggle works
- [ ] Effort filter works
- [ ] Recipe detail shows all fields
- [ ] Edit recipe - form pre-populates
- [ ] Edit saves correctly
- [ ] Delete recipe with confirmation
- [ ] Scan page shows "Coming Soon"
- [ ] Print page shows "Coming Soon"

### 6. Settings
- [ ] Dark mode toggle works
- [ ] Household members display
- [ ] Redo Setup navigates to onboarding
- [ ] Sign out with confirmation works

---

## Known Placeholders

### Recipe Scan (`/recipes/scan`)
- UI exists with "Coming Soon" message
- Needs: Camera capture, AI extraction, confidence scoring
- Design spec in plan doc

### Recipe Print (`/recipes/[id]/print`)
- UI exists with template options listed
- Needs: PDF generation, 4x6 card formatting
- Templates: Classic, Compact, Photo-forward, Text-only

---

## Build Status

```bash
npm run build  # ✓ Passes
npx tsc --noEmit  # ✓ No type errors
```

All routes generate correctly in build output.

---

## Next Session Priorities

1. **Run QA checklist above** - document any issues
2. **Fix issues found in QA**
3. **Implement recipe scan** - camera + AI extraction (if prioritized)
4. **Implement recipe print** - PDF generation (if prioritized)

---

## Notes

- Pantry locations are: fridge, freezer, pantry
- Recipe sources are: ai, manual, scanned
- User preferences stored per user (userId index)
- Onboarding can be re-run from Settings → Redo Setup
