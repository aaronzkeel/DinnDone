# Handoff: Future Development Phases

**Date:** January 21, 2025
**Branch:** `claude-qa-fixes-plan-page` (merged to main)
**Purpose:** Comprehensive guide for implementing Phases 2-4 of the Weekly Planning feature

---

## Quick Context

DinnDone is a meal planning app for exhausted caregivers. The AI assistant is named **Zylo**. The app helps families plan weekly dinners, manage grocery lists, and reduce "what's for dinner?" stress.

**Tech Stack:**
- Next.js 14 (App Router) + TypeScript (strict)
- Tailwind CSS with CSS custom properties (use `var(--color-primary)`, never raw hex)
- Convex (database + backend + real-time)
- OpenRouter API (Gemini model for Zylo AI)

**Critical Rules:**
1. No `any` types - ask what the data looks like if unclear
2. Use CSS custom properties - `var(--color-primary)`, not raw colors
3. Mobile-first - this is a phone app
4. Run `npx tsc --noEmit` before saying you're done
5. Never read `.env*` files

---

## Current State (What's Working)

### Weekly Planning Page (`src/app/weekly-planning/page.tsx`)

✅ **Working:**
- Week selector (gold pill tabs)
- Day cards showing planned meals
- Plus button creates new weeks
- "Generate Plan" calls AI (but see bug below)
- Edit modal opens on meal tap
- Change cook / toggle eaters
- "More options" → AI suggests 3 alternatives
- Custom meal entry form
- Pantry audit saves unchecked items to grocery list
- "Looks good" approves plan

❌ **Critical Bug to Fix First:**
The `generateWeekPlan` action returns meal data but **nothing saves to the database**. The page has a comment "Success: Convex will auto-update via query subscription" but no save logic was implemented. **Phase 1 must fix this first.**

### Relevant Files

| File | Purpose |
|------|---------|
| `src/app/weekly-planning/page.tsx` | Main page component with all handlers |
| `src/components/weekly-planning/EditDayModal.tsx` | Modal for editing a single day's meal |
| `src/components/weekly-planning/WeekPlanView.tsx` | Week calendar view with day cards |
| `src/components/weekly-planning/WeekSelector.tsx` | Week tabs at top |
| `convex/ai.ts` | AI actions: `chat`, `suggestAlternatives`, `generateWeekPlan` |
| `convex/weekPlans.ts` | Week plan CRUD: `create`, `addMeal`, `updateMeal`, etc. |
| `convex/schema.ts` | Database schema - see `recipes` table (unused) |
| `src/lib/meal-adapters.ts` | Type converters between Convex ↔ UI types |

---

## Phase 1: Critical Fixes (DO THIS FIRST)

### 1.1 Fix Generate Plan Bug

**Problem:** `handleGeneratePlan` in `page.tsx` calls `generateWeekPlan` but never saves the returned meals.

**Location:** `src/app/weekly-planning/page.tsx` around line 267

**Current broken code:**
```typescript
const handleGeneratePlan = async () => {
  if (!selectedWeekPlan) return;
  setIsGenerating(true);
  try {
    const result = await generateWeekPlan({
      weekStartDate: selectedWeekPlan.weekStartDate,
      householdSize: householdMembers.length,
    });
    if (!result.success) {
      console.error("Failed to generate plan:", result.error);
      alert("Failed to generate plan: " + (result.error || "Unknown error"));
    }
    // BUG: Nothing saves the meals! They just vanish.
  } catch (error) {
    // ...
  } finally {
    setIsGenerating(false);
  }
};
```

**Fix:** After getting meals, loop through and call `addMeal` mutation for each:

```typescript
if (result.success && result.meals) {
  // Get first household member as default cook
  const defaultCookId = householdMembersData?.[0]?._id;
  const allMemberIds = householdMembersData?.map(m => m._id) ?? [];

  for (const meal of result.meals) {
    await addMealMutation({
      weekPlanId: selectedWeekPlan.id as Id<"weekPlans">,
      date: meal.date,
      dayOfWeek: meal.dayOfWeek,
      name: meal.mealName,
      effortTier: effortTierReverseMap[meal.effortTier],
      prepTime: meal.prepTime,
      cookTime: meal.cookTime,
      cleanupRating: cleanupRatingReverseMap[meal.cleanupRating],
      cookId: defaultCookId,
      eaterIds: allMemberIds,
      ingredients: meal.ingredients.map(name => ({ name, quantity: "as needed" })),
      steps: [],
      isFlexMeal: meal.isFlexMeal,
    });
  }
}
```

**Need to add:** Import `addMeal` mutation at top of file:
```typescript
const addMealMutation = useMutation(api.weekPlans.addMeal);
```

### 1.2 Show Week Meals as Quick Swaps

**Problem:** When opening the edit modal, the `alternatives` array is empty. Users expect to see other meals from the week as instant swap options.

**Location:** `src/app/weekly-planning/page.tsx` - `handleSelectMeal` function

**Fix:** When opening modal, populate alternatives with other meals from same week:

```typescript
const handleSelectMeal = (mealId: string) => {
  const meal = selectedWeekPlan?.meals.find((m) => m.id === mealId);
  if (meal) {
    setSelectedMeal(meal);

    // Populate alternatives with OTHER meals from the week
    const otherMeals = selectedWeekPlan?.meals
      .filter((m) => m.id !== mealId)
      .map((m, index) => ({
        id: `week-${m.id}`,
        mealName: m.mealName,
        effortTier: m.effortTier,
        prepTime: m.prepTime,
        cookTime: m.cookTime,
        cleanupRating: m.cleanupRating,
        briefDescription: `Swap with ${m.dayOfWeek}'s meal`,
        isFlexMeal: m.isFlexMeal,
      })) ?? [];
    setAlternatives(otherMeals);

    setIsModalOpen(true);
  }
};
```

Then update `handleSelectAlternative` to handle both week-swap IDs and AI-generated IDs.

### 1.3 Make Meal Fields Editable

**Problem:** Users can't edit a meal after it's created (fix typos, change effort level).

**Location:** `src/components/weekly-planning/EditDayModal.tsx`

**Change "Current Meal" section (lines 174-231) from read-only display to editable fields:**

1. Add state for edited values:
```typescript
const [editedName, setEditedName] = useState(currentMeal.mealName);
const [editedEffort, setEditedEffort] = useState(currentMeal.effortTier);
```

2. Add new prop to EditDayModal:
```typescript
onUpdateMeal?: (updates: { name?: string; effortTier?: string }) => void;
```

3. Change the meal name from `<h4>` to `<input>`:
```typescript
<input
  type="text"
  value={editedName}
  onChange={(e) => setEditedName(e.target.value)}
  onBlur={() => {
    if (editedName !== currentMeal.mealName) {
      onUpdateMeal?.({ name: editedName });
    }
  }}
  className="font-semibold bg-transparent border-b border-transparent focus:border-primary"
  style={{ color: "var(--color-text)" }}
/>
```

4. Change effort dots to clickable buttons.

---

## Phase 2: Recipe Library

### Overview

Let users save meals for reuse. The `recipes` table already exists in the schema but has no queries/mutations.

### 2.1 Create `convex/recipes.ts`

```typescript
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all recipes
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("recipes").collect();
  },
});

// Search recipes by name
export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, { searchTerm }) => {
    const recipes = await ctx.db.query("recipes").collect();
    const term = searchTerm.toLowerCase();
    return recipes.filter(r => r.name.toLowerCase().includes(term));
  },
});

// Create a new recipe
export const create = mutation({
  args: {
    name: v.string(),
    effortTier: v.union(v.literal("easy"), v.literal("medium"), v.literal("involved")),
    prepTime: v.number(),
    cookTime: v.number(),
    cleanupRating: v.union(v.literal(1), v.literal(2), v.literal(3)),
    ingredients: v.array(v.object({
      name: v.string(),
      quantity: v.string(),
      isOrganic: v.optional(v.boolean()),
    })),
    steps: v.array(v.string()),
    isFlexMeal: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check if recipe with same name exists
    const existing = await ctx.db
      .query("recipes")
      .filter(q => q.eq(q.field("name"), args.name))
      .first();

    if (existing) {
      // Update existing instead of creating duplicate
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("recipes", args);
  },
});

// Update a recipe
export const update = mutation({
  args: {
    id: v.id("recipes"),
    name: v.optional(v.string()),
    effortTier: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("involved"))),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    cleanupRating: v.optional(v.union(v.literal(1), v.literal(2), v.literal(3))),
    ingredients: v.optional(v.array(v.object({
      name: v.string(),
      quantity: v.string(),
      isOrganic: v.optional(v.boolean()),
    }))),
    steps: v.optional(v.array(v.string())),
    isFlexMeal: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, cleanUpdates);
    return await ctx.db.get(id);
  },
});

// Delete a recipe
export const remove = mutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
```

### 2.2 Auto-Save Custom Meals as Recipes

**Location:** `src/app/weekly-planning/page.tsx` - `handleCustomMeal` function

After updating the planned meal, also save to recipes:

```typescript
const handleCustomMeal = async (mealName: string, effortTier: "super-easy" | "middle" | "more-prep") => {
  if (!selectedMeal) return;
  try {
    // Update the planned meal
    await updateMeal({
      id: selectedMeal.id as Id<"plannedMeals">,
      name: mealName,
      effortTier: effortTierReverseMap[effortTier],
      isFlexMeal: true,
    });

    // Also save to recipe library for reuse
    await createRecipe({
      name: mealName,
      effortTier: effortTierReverseMap[effortTier],
      prepTime: 15, // default
      cookTime: 20, // default
      cleanupRating: 2, // medium default
      ingredients: [],
      steps: [],
      isFlexMeal: true,
    });

    handleCloseModal();
  } catch (error) {
    console.error("Failed to set custom meal:", error);
  }
};
```

### 2.3 Add "From My Recipes" Section to EditDayModal

**Location:** `src/components/weekly-planning/EditDayModal.tsx`

Add new prop and section:

```typescript
// New prop
recipes?: Array<{
  id: string;
  name: string;
  effortTier: string;
  prepTime: number;
  cookTime: number;
}>;
onSelectRecipe?: (recipeId: string) => void;

// New section between "Swap with Alternative" and "Custom Meal Entry"
{recipes && recipes.length > 0 && (
  <div>
    <h3 className="text-xs font-semibold uppercase mb-2" style={{ color: "var(--color-muted)" }}>
      From My Recipes
    </h3>
    <div className="flex flex-wrap gap-2">
      {recipes.slice(0, 5).map((recipe) => (
        <button
          key={recipe.id}
          onClick={() => onSelectRecipe?.(recipe.id)}
          className="px-3 py-2 rounded-lg text-sm"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
        >
          {recipe.name}
        </button>
      ))}
    </div>
  </div>
)}
```

---

## Phase 3: Generate Plan Redesign

### Overview

Improve the "Generate Plan" flow with pre-generation questions and user preferences.

### 3.1 Create Questions Modal Component

**New file:** `src/components/weekly-planning/GeneratePlanModal.tsx`

```typescript
"use client";

import { useState } from "react";
import { X, Sparkles } from "lucide-react";

export interface GeneratePlanModalProps {
  onGenerate: (options: {
    energyLevel: "low" | "medium" | "high";
    notes?: string;
    anchoredMeals?: string[];
  }) => void;
  onClose: () => void;
  existingMeals?: Array<{ id: string; name: string; dayOfWeek: string }>;
}

export function GeneratePlanModal({ onGenerate, onClose, existingMeals }: GeneratePlanModalProps) {
  const [energyLevel, setEnergyLevel] = useState<"low" | "medium" | "high">("medium");
  const [notes, setNotes] = useState("");
  const [anchoredMealIds, setAnchoredMealIds] = useState<string[]>([]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl p-6 space-y-6"
        style={{ backgroundColor: "var(--color-card)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
            Plan Your Week
          </h2>
          <button onClick={onClose} className="p-1">
            <X size={20} style={{ color: "var(--color-muted)" }} />
          </button>
        </div>

        {/* Energy Level */}
        <div>
          <label className="text-sm font-medium block mb-2" style={{ color: "var(--color-text)" }}>
            How's your energy this week?
          </label>
          <div className="flex gap-2">
            {(["low", "medium", "high"] as const).map((level) => (
              <button
                key={level}
                onClick={() => setEnergyLevel(level)}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-medium capitalize"
                style={{
                  backgroundColor: energyLevel === level ? "var(--color-primary)" : "var(--color-border)",
                  color: energyLevel === level ? "white" : "var(--color-text)",
                }}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
            {energyLevel === "low" && "I'll suggest simpler, quicker meals"}
            {energyLevel === "medium" && "A good mix of easy and moderate meals"}
            {energyLevel === "high" && "I can include some more involved recipes"}
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium block mb-2" style={{ color: "var(--color-text)" }}>
            Anything else? (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., 'Kids have soccer Tuesday and Thursday' or 'Trying to use up chicken this week'"
            rows={3}
            className="w-full px-3 py-2 rounded-lg text-sm resize-none"
            style={{
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
          />
        </div>

        {/* Anchor Meals (if any exist) */}
        {existingMeals && existingMeals.length > 0 && (
          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: "var(--color-text)" }}>
              Keep any existing meals? (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {existingMeals.map((meal) => (
                <button
                  key={meal.id}
                  onClick={() => {
                    setAnchoredMealIds(prev =>
                      prev.includes(meal.id)
                        ? prev.filter(id => id !== meal.id)
                        : [...prev, meal.id]
                    );
                  }}
                  className="px-3 py-1.5 rounded-lg text-sm"
                  style={{
                    backgroundColor: anchoredMealIds.includes(meal.id) ? "var(--color-secondary)" : "var(--color-border)",
                    color: anchoredMealIds.includes(meal.id) ? "white" : "var(--color-text)",
                  }}
                >
                  {meal.dayOfWeek}: {meal.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={() => onGenerate({ energyLevel, notes: notes || undefined, anchoredMeals: anchoredMealIds })}
          className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          style={{ backgroundColor: "var(--color-secondary)", color: "white" }}
        >
          <Sparkles size={18} />
          Generate My Plan
        </button>
      </div>
    </div>
  );
}
```

### 3.2 Update AI Action for Preferences

**Location:** `convex/ai.ts` - Update `generateWeekPlan` args and prompt

Add new args:
```typescript
args: {
  weekStartDate: v.string(),
  householdSize: v.number(),
  dietaryPreferences: v.optional(v.string()),
  energyLevel: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
  additionalNotes: v.optional(v.string()),
  anchoredMeals: v.optional(v.array(v.object({
    dayOfWeek: v.string(),
    mealName: v.string(),
  }))),
},
```

Update system prompt to use energy level:
```typescript
const energyGuidance = {
  low: "Focus on super-easy meals (15 min or less prep). Lots of one-pot meals, sheet pan dinners, and quick options.",
  medium: "Mix of easy and medium effort. 3-4 easy meals, 2-3 moderate ones.",
  high: "Include 1-2 more involved weekend meals. Can have some recipes that take more time.",
};

const systemPrompt = `...
Energy level: ${energyLevel || "medium"} - ${energyGuidance[energyLevel || "medium"]}
${additionalNotes ? `Additional notes from user: ${additionalNotes}` : ""}
${anchoredMeals?.length ? `Keep these meals locked in: ${anchoredMeals.map(m => `${m.dayOfWeek}: ${m.mealName}`).join(", ")}` : ""}
...`;
```

### 3.3 User Preferences Table (Optional Enhancement)

**Add to schema if needed later:**
```typescript
// convex/schema.ts
userPreferences: defineTable({
  userId: v.id("users"),
  householdSize: v.optional(v.number()),
  dietaryRestrictions: v.optional(v.array(v.string())),
  cuisinePreferences: v.optional(v.array(v.string())),
  defaultEnergyLevel: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
}).index("by_user", ["userId"]),
```

---

## Phase 4: Chat with Zylo in Modal

### Overview

Add a small chat input to the EditDayModal so users can describe what they want conversationally.

### 4.1 Add Chat to EditDayModal

**Location:** `src/components/weekly-planning/EditDayModal.tsx`

Add new props:
```typescript
onChat?: (message: string) => Promise<string>; // Returns Zylo's response
```

Add state and UI:
```typescript
const [chatInput, setChatInput] = useState("");
const [chatResponse, setChatResponse] = useState("");
const [isChatting, setIsChatting] = useState(false);

const handleChat = async () => {
  if (!chatInput.trim() || !onChat) return;
  setIsChatting(true);
  try {
    const response = await onChat(chatInput);
    setChatResponse(response);
    setChatInput("");
  } finally {
    setIsChatting(false);
  }
};

// Add this section before "Action Buttons"
<div>
  <h3 className="text-xs font-semibold uppercase mb-2" style={{ color: "var(--color-muted)" }}>
    Ask Zylo
  </h3>
  {chatResponse && (
    <div
      className="p-3 rounded-lg mb-2 text-sm"
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
    >
      {chatResponse}
    </div>
  )}
  <div className="flex gap-2">
    <input
      type="text"
      value={chatInput}
      onChange={(e) => setChatInput(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleChat()}
      placeholder="e.g., 'suggest something with chicken'"
      className="flex-1 px-3 py-2 rounded-lg text-sm"
      style={{
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-border)",
        color: "var(--color-text)",
      }}
    />
    <button
      onClick={handleChat}
      disabled={!chatInput.trim() || isChatting}
      className="px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50"
      style={{ backgroundColor: "var(--color-primary)", color: "white" }}
    >
      {isChatting ? "..." : "Ask"}
    </button>
  </div>
</div>
```

### 4.2 Wire Up in Page

**Location:** `src/app/weekly-planning/page.tsx`

```typescript
const handleModalChat = async (message: string): Promise<string> => {
  const result = await chatAction({
    messages: [
      {
        role: "system",
        content: `You are Zylo, helping plan dinner. Current meal: ${selectedMeal?.mealName}.
        Day: ${selectedMeal?.dayOfWeek}.
        Suggest specific meals when asked. Keep responses to 1-2 sentences.
        If they want to use a suggestion, say "Would you like me to use [meal name]?" so they can confirm.`,
      },
      { role: "user", content: message },
    ],
    maxTokens: 150,
  });

  return result.content || "Sorry, I couldn't process that. Try again?";
};

// Pass to modal
<EditDayModal
  // ... existing props
  onChat={handleModalChat}
/>
```

---

## Type Mappings Reference

The UI and Convex use different values for some fields. Always use the adapters in `src/lib/meal-adapters.ts`:

| Field | UI Type | Convex Type | Adapter |
|-------|---------|-------------|---------|
| effortTier | "super-easy" \| "middle" \| "more-prep" | "easy" \| "medium" \| "involved" | `effortTierMap` / `effortTierReverseMap` |
| cleanupRating | "low" \| "medium" \| "high" | 1 \| 2 \| 3 | `cleanupRatingMap` / `cleanupRatingReverseMap` |

**Converting UI → Convex (for mutations):**
```typescript
import { effortTierReverseMap, cleanupRatingReverseMap } from "@/lib/meal-adapters";
const convexEffort = effortTierReverseMap[uiEffort]; // "super-easy" → "easy"
```

**Converting Convex → UI (for display):**
```typescript
import { effortTierMap, cleanupRatingMap } from "@/lib/meal-adapters";
const uiEffort = effortTierMap[convexEffort]; // "easy" → "super-easy"
```

---

## Testing Checklist

### Phase 1
- [ ] Click "Generate Plan" on empty week → Meals appear on calendar
- [ ] Open edit modal → Other week meals show as swap options
- [ ] Edit meal name in modal → Saves and persists

### Phase 2
- [ ] Enter custom meal → Appears in "My Recipes"
- [ ] Open modal on different day → Can select from saved recipes
- [ ] Recipe search works

### Phase 3
- [ ] Click Generate Plan → Questions modal appears first
- [ ] Select "Low energy" → Generated meals are simpler
- [ ] Anchor a meal → That meal stays, others fill in

### Phase 4
- [ ] Type in chat input → Zylo responds
- [ ] Ask for suggestion → Get relevant meal idea

---

## Design Token Colors

From `DESIGN-TOKENS.md`:

| Token | Use For |
|-------|---------|
| `--color-primary` (gold) | Secondary actions, highlights |
| `--color-secondary` (green) | Primary positive actions ("Confirm", "Save") |
| `--color-danger` (red) | Destructive actions |
| `--color-text` | Main text |
| `--color-muted` | Secondary text, labels |
| `--color-bg` | Page background |
| `--color-card` | Card backgrounds |
| `--color-border` | Borders, dividers |

---

## File Structure Reference

```
src/
├── app/
│   └── weekly-planning/
│       └── page.tsx          # Main page with handlers
├── components/
│   └── weekly-planning/
│       ├── EditDayModal.tsx  # Edit single day
│       ├── WeekPlanView.tsx  # Week calendar
│       ├── WeekSelector.tsx  # Week tabs
│       ├── DayCard.tsx       # Single day card
│       └── PantryAudit.tsx   # Ingredient check
├── lib/
│   └── meal-adapters.ts      # Type converters
└── types/
    └── weekly-planning.ts    # UI type definitions

convex/
├── schema.ts                 # Database schema
├── ai.ts                     # AI actions (chat, suggest, generate)
├── weekPlans.ts              # Week plan CRUD
├── recipes.ts                # TO CREATE in Phase 2
└── _generated/               # Auto-generated, don't edit
```

---

## Common Patterns

### Convex Query with Conditional Args
```typescript
const data = useQuery(
  api.weekPlans.getWithMeals,
  selectedWeekId ? { id: selectedWeekId as Id<"weekPlans"> } : "skip"
);
```

### Mutation with Error Handling
```typescript
const mutation = useMutation(api.something.create);

const handleCreate = async () => {
  try {
    await mutation({ ...args });
  } catch (error) {
    console.error("Failed:", error);
  }
};
```

### Syncing Local State with Convex
```typescript
useEffect(() => {
  if (localState && convexData) {
    const updated = convexData.find((d) => d.id === localState.id);
    if (updated && JSON.stringify(updated) !== JSON.stringify(localState)) {
      setLocalState(updated);
    }
  }
}, [convexData, localState]);
```

---

## Questions to Ask User

Before starting Phase 3 (preferences), clarify:
1. Should preferences be per-user or per-household?
2. What dietary restrictions matter most? (vegetarian, gluten-free, allergies?)
3. Do they want cuisine preferences? (Mexican, Italian, Asian, etc.)

Before Phase 4 (chat in modal), clarify:
1. Should Zylo be able to directly update the meal, or just suggest?
2. Any specific conversational flows they want?

---

Good luck! Start with Phase 1 to fix the critical generate bug, then proceed through the phases in order.
