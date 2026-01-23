# Handoff: Conversational Pantry Audit Implementation

**Date:** 2025-01-22
**Status:** Complete, ready for QA

## Summary

Replaced the checklist-based Pantry Audit with a conversational AI flow. Users tell Zylo what they have on hand, and Zylo identifies missing ingredients from their meal plan. Also integrated the pantry feature with the grocery list so the AI can see/modify it.

## Changes Made

### 1. New AI Action (`convex/ai.ts`)

Added `analyzePantry` action that:
- Takes user's description of what they have + list of needed ingredients
- Returns JSON with `missingItems` array and `zyloResponse` string
- Uses generous matching (e.g., "chicken" matches "chicken breast")

### 2. New Mutation (`convex/groceryItems.ts`)

Added `removeByName` mutation that:
- Removes grocery items by name (case-insensitive)
- Used when user says they have something that's on the list

### 3. Plan Page Updates (`src/app/weekly-planning/page.tsx`)

- Added `pantryMode` to planning drawer states
- `handlePantryAudit()` now opens drawer with Zylo greeting
- Queries grocery list to check for existing items from this week's plan
- Smart greeting: "I see you already have X items on your grocery list" if items exist
- Pantry-specific quick actions:
  - "Add N to list" - adds missing items to grocery
  - "I have more to add" - prompts for more input
  - "View Grocery List" - navigates to /grocery
  - "Done" - closes drawer

### 4. Home Page Updates (`src/app/page.tsx`)

- Queries full grocery list
- Filters out items already on grocery list when showing missing items
- Detects when user says "I have X" or "remove X" and removes from grocery list
- Reports remaining item count after removal

## How It Works

### Plan Page Flow
1. User taps "Pantry Audit" button
2. Drawer opens with Zylo greeting
3. If grocery items already exist: "I see you already have X items..."
4. If not: "Your meal plan needs N ingredients. Tell me what you have..."
5. User types what they have (e.g., "chicken, rice, onions")
6. Zylo responds with missing items
7. User can tap "Add N to list" to add missing items
8. User can tap "View Grocery List" to navigate there

### Home Page Flow
1. User taps "What's in my pantry?"
2. Enters ingredients they have
3. If meal plan exists: Zylo analyzes against plan, shows missing items (excluding items already on list)
4. User can say "yes" to add missing items
5. User can say "I have spinach" to remove spinach from list

## Files Modified

| File | Changes |
|------|---------|
| `convex/ai.ts` | Added `analyzePantry` action |
| `convex/groceryItems.ts` | Added `removeByName` mutation |
| `src/app/weekly-planning/page.tsx` | Pantry drawer mode, grocery list integration |
| `src/app/page.tsx` | Grocery list integration, remove items by name |

## Testing Checklist

- [ ] Plan Page: Tap Pantry Audit with no grocery items → See ingredient count greeting
- [ ] Plan Page: Add items to list → Re-open Pantry Audit → See "already have X items" greeting
- [ ] Plan Page: "View Grocery List" button navigates to /grocery
- [ ] Home Page: "What's in my pantry?" → Enter items → See missing items
- [ ] Home Page: Say "yes" → Items added to grocery list
- [ ] Home Page: Say "I have spinach" → Spinach removed from grocery list
- [ ] Home Page: Missing items don't include items already on grocery list

## Known Limitations

- The AI matching is generous but not perfect - "tomatoes" might not match "cherry tomatoes"
- The grocery list integration doesn't track which week plan an item came from on the Home page
- Voice input not yet implemented

## Next Steps

1. QA the pantry audit flow end-to-end
2. Consider adding voice input support
3. May need refinement of the AI matching logic based on user feedback
