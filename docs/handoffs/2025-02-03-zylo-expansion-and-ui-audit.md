# Zylo Expansion & UI Consistency Audit

**Date:** 2025-02-03

---

## Zylo Expansion Needed

Zylo chat is currently only on:
- Home page (working)
- Kitchen > Shopping tab (just added)

### Pages That Need Zylo Added:

1. **Kitchen > Pantry tab**
   - Functionality TBD - needs design clarity
   - What should Zylo do here? Pantry management? Inventory tracking?

2. **Plan page (Weekly Planning)**
   - Functionality TBD - needs design clarity
   - Meal swapping? Adding meals? Generating new plan?

3. **Recipes page**
   - Functionality TBD - needs design clarity
   - Recipe search? Adding to meal plan? Ingredient questions?

### Design Questions to Answer:
- What actions can Zylo take on each page?
- Should Zylo context be aware of current page state?
- Shared conversation history across pages or page-specific?

---

## UI Consistency Issues - FIXED

### What Was Fixed

| Page | Issue | Fix |
|------|-------|-----|
| **Recipes** | No max-width container | Added `max-w-2xl mx-auto` wrapper |
| **Recipes** | Magic number `120px` | Now uses `var(--bottom-nav-total)` |
| **Plan** | No max-width container | Added `max-w-2xl mx-auto` wrapper |
| **Plan** | Magic number `120px` | Now uses `var(--bottom-nav-total)` |
| **Plan** | Used `var(--color-text-secondary)` | Fixed to `var(--color-muted)` |
| **Home** | Magic number `120px` | Now uses `var(--bottom-nav-total)` |
| **MealHelperHome** | Magic number `120px` | Now uses `var(--bottom-nav-total)` |

### Standardized Layout Pattern

All pages now follow this structure:
```tsx
<div
  style={{
    backgroundColor: 'var(--color-bg)',
    minHeight: '100vh',
    paddingBottom: 'var(--bottom-nav-total)',
  }}
>
  <div className="w-full max-w-2xl mx-auto">
    {/* Page content */}
  </div>
</div>
```

### Files Modified
- `src/app/recipes/page.tsx`
- `src/app/weekly-planning/page.tsx`
- `src/app/page.tsx`
- `src/components/meal-helper/MealHelperHome.tsx`

---

## Next Steps

1. **Design Zylo functionality** for each page (requires product decisions):
   - Pantry tab: What actions should Zylo take?
   - Plan page: Meal swapping? Plan generation?
   - Recipes page: Search? Add to plan?

2. **Implement Zylo** on remaining pages once functionality is defined
