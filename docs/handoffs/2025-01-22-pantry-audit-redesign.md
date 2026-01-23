# Handoff: Pantry Audit Redesign

**Date:** January 22, 2025
**Priority:** High
**Status:** Ready for implementation

---

## Objective

Replace the checklist-based Pantry Audit with a conversational/voice-based approach that matches the Home page flow. Users should be able to tell Zylo what they have on hand, and Zylo will identify missing ingredients from their meal plan.

---

## User Decisions Made

1. **Entry points:** Both pages - Plan page "Pantry Audit" button AND Home page "What's in my pantry?" button
2. **Trigger:** Manual only - user taps button when ready (not auto-triggered after approving plan)

---

## Current State (To Be Replaced)

The current `PantryAudit.tsx` component is a full-screen checklist:
- Extracts unique ingredients from meal plan
- User toggles items they have → unchecked items go to grocery list
- No AI integration, no voice support
- Feels tedious and un-Zylo-like

---

## Implementation Plan

### Phase 1: Create AI Action for Pantry Analysis

**File:** `convex/ai.ts`

Add a new action `analyzePantry`:

```typescript
export const analyzePantry = action({
  args: {
    whatUserHas: v.string(),
    mealPlanIngredients: v.array(v.string()),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    missingItems: string[];
    zyloResponse: string;
    error?: string;
  }> => {
    // System prompt for AI
    const systemPrompt = `You are Zylo, a warm and supportive meal planning assistant.

The user has a meal plan that requires these ingredients:
${args.mealPlanIngredients.join(", ")}

The user has told you what they have on hand. Your job:
1. Cross-reference what they have with what's needed
2. Identify missing ingredients
3. Respond warmly and concisely

Output format (JSON):
{
  "missingItems": ["item1", "item2"],
  "response": "Your friendly response about what's missing"
}

Keep your response SHORT (1-2 sentences). Be warm but efficient.`;

    // Call OpenRouter API with the user's input
    // Parse JSON response to extract missingItems and zyloResponse
    // Return structured response
  },
});
```

### Phase 2: Add Pantry Mode to Planning Drawer

**File:** `src/app/weekly-planning/page.tsx`

Add new state and handlers:

```typescript
// New state
const [pantryMode, setPantryMode] = useState(false);
const [missingItems, setMissingItems] = useState<string[]>([]);

// Handler for pantry button
const handlePantryAudit = () => {
  setIsDrawerOpen(true);
  setPantryMode(true);
  setChatMessages([]);

  // Get all ingredients from meal plan
  const ingredients = selectedWeekPlan?.meals.flatMap(m => m.ingredients) || [];
  const uniqueIngredients = [...new Set(ingredients)];

  addMessage("zylo", `Let's check what you need for this week's meals. Tell me what you've got on hand - fridge, freezer, pantry - whatever comes to mind.`);
};

// Handler for user message in pantry mode
const handlePantryChatMessage = async (content: string) => {
  addMessage("user", content);
  setIsAiThinking(true);

  try {
    const ingredients = selectedWeekPlan?.meals.flatMap(m => m.ingredients) || [];
    const uniqueIngredients = [...new Set(ingredients)];

    const result = await analyzePantry({
      whatUserHas: content,
      mealPlanIngredients: uniqueIngredients,
    });

    if (result.success) {
      setMissingItems(result.missingItems);
      addMessage("zylo", result.zyloResponse);
    }
  } finally {
    setIsAiThinking(false);
  }
};
```

### Phase 3: Quick Actions for Pantry Flow

When Zylo identifies missing items, show quick action buttons:

```typescript
const getPantryQuickActions = (): QuickAction[] => {
  if (missingItems.length > 0) {
    return [
      { id: "add-all", label: "Add all to list", variant: "primary" },
      { id: "have-more", label: "I have more to add", variant: "outline" },
      { id: "done", label: "Done", variant: "outline" },
    ];
  }
  return [];
};

const handlePantryQuickAction = async (actionId: string) => {
  if (actionId === "add-all") {
    // Add all missing items to grocery list
    for (const item of missingItems) {
      await addGroceryItem({
        name: item,
        category: "From Meal Plan",
        isOrganic: false,
        weekPlanId: selectedWeekId as Id<"weekPlans">,
      });
    }
    addMessage("zylo", "Done! I've added everything to your grocery list.");
    setMissingItems([]);
    setPantryMode(false);
    setIsDrawerOpen(false);
  } else if (actionId === "have-more") {
    addMessage("zylo", "Sure! What else do you have on hand?");
  } else if (actionId === "done") {
    setIsDrawerOpen(false);
    setPantryMode(false);
  }
};
```

### Phase 4: Wire Up Home Page

**File:** `src/app/page.tsx`

The Home page already has `onOpenInventoryCheck` wired to the "What's in my pantry?" button. Modify the handler to use the same conversational pattern:

```typescript
// If meal plan exists, do pantry check
// If no meal plan, suggest meals based on what they have (existing behavior)

const handleOpenInventoryCheck = () => {
  if (currentWeekPlan && currentWeekPlan.meals.length > 0) {
    // Pantry check mode - identify missing ingredients
    setCurrentView("pantry-chat");
    addZyloMessage("Tell me what you've got on hand - I'll check what you still need for this week's meals.");
  } else {
    // Existing behavior - suggest meals based on inventory
    setCurrentView("inventory");
  }
};
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `convex/ai.ts` | Add `analyzePantry` action |
| `src/app/weekly-planning/page.tsx` | Replace pantry audit with drawer chat mode |
| `src/app/page.tsx` | Wire "What's in my pantry?" to same chat flow |

---

## Reference Components (Reuse These)

### PlanningDrawer
Location: `src/components/weekly-planning/PlanningDrawer.tsx`

A modal drawer that slides up from the bottom. Already used for planning chat. Reuse for pantry mode.

**Key props:**
```typescript
interface PlanningDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;      // e.g., "What's on hand?"
  children: ReactNode; // Render PlanningChat inside
}
```

### PlanningChat
Location: `src/components/weekly-planning/PlanningChat.tsx`

Full-featured chat component with:
- Message bubbles (user and Zylo)
- Auto-scroll to bottom
- Typing indicator while AI thinks
- Quick action buttons
- Text input

**Key props:**
```typescript
interface PlanningChatProps {
  messages: PlanningMessage[];
  quickActions?: QuickAction[];
  onQuickAction?: (actionId: string) => void;
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  inputPlaceholder?: string;
  showInput?: boolean;
}

interface PlanningMessage {
  id: string;
  role: "user" | "zylo";
  content: string;
  timestamp: string;
}
```

### QuickActionButtons
Location: `src/components/weekly-planning/QuickActionButtons.tsx`

Renders horizontal button row below messages.

**Key props:**
```typescript
interface QuickAction {
  id: string;
  label: string;
  variant?: "primary" | "secondary" | "outline";
}
```

---

## Current Integration Points

### Plan Page (`src/app/weekly-planning/page.tsx`)

Current pantry audit trigger (lines 343-356):
```typescript
const handlePantryAudit = () => {
  if (!selectedWeekPlan) return;

  const allIngredients = selectedWeekPlan.meals.flatMap((meal) => meal.ingredients);
  const uniqueIngredients = [...new Set(allIngredients)];

  const items: PantryCheckItem[] = uniqueIngredients.map((ingredient, index) => ({
    id: `pantry-${index}`,
    name: ingredient,
    alreadyHave: false,
  }));

  setPantryItems(items);
  setShowPantryAudit(true);
};
```

**Replace with:** Open drawer in pantry mode, start chat

Current pantry audit view rendering (lines 896-910):
```typescript
if (showPantryAudit) {
  return (
    <RequireAuth>
      <div ...>
        <PantryAudit
          items={pantryItems}
          onToggleItem={handleTogglePantryItem}
          onComplete={handleCompletePantryAudit}
        />
      </div>
    </RequireAuth>
  );
}
```

**Replace with:** Conditional rendering in drawer based on `pantryMode`

### Home Page (`src/app/page.tsx`)

Current inventory check (uses InventoryCheck component):
- `onOpenInventoryCheck` passed to MealHelperHome
- Sets `currentView = "inventory"`
- Shows freeform text input
- AI suggests meals based on inventory

**Modify to:** If meal plan exists, switch to pantry check mode instead

---

## Grocery List Integration

Existing mutation used by pantry audit (add items to grocery list):
```typescript
const addGroceryItem = useMutation(api.groceryItems.add);

// Usage:
await addGroceryItem({
  name: item.name,
  category: "From Meal Plan",
  isOrganic: false,
  weekPlanId: selectedWeekId as Id<"weekPlans">,
});
```

---

## User Flow Summary

### Plan Page
1. User taps "Pantry Audit" button
2. Drawer opens with title "What's on hand?"
3. Zylo: "Tell me what you've got on hand - fridge, freezer, pantry - whatever comes to mind."
4. User types: "I have chicken, rice, frozen broccoli, soy sauce, eggs"
5. Zylo cross-references with meal plan
6. Zylo: "Nice! Based on your meals this week, you'll need: ground beef, pasta, marinara sauce, milk. Add these to your grocery list?"
7. Quick actions: "Add all to list" / "I have more to add" / "Done"
8. User taps "Add all to list"
9. Items saved to grocery list, drawer closes

### Home Page
1. User taps "What's in my pantry?"
2. Same drawer/modal opens
3. Same flow as Plan page

---

## Verification Steps

1. **Plan Page Test:**
   - Navigate to Plan page with an existing meal plan
   - Tap "Pantry Audit" button
   - Drawer opens with Zylo greeting
   - Type "I have chicken, rice, and broccoli"
   - Zylo responds with missing items
   - Tap "Add all to list"
   - Navigate to Grocery page → verify items appear

2. **Home Page Test:**
   - Navigate to Home page (with meal plan for current week)
   - Tap "What's in my pantry?"
   - Same chat experience works
   - Items can be added to grocery list

3. **Type Check:**
   - Run `npx tsc --noEmit` - should pass

---

## CSS Variables Available

Already defined in `globals.css`:
```css
--color-primary
--color-secondary
--color-text
--color-muted
--color-card
--color-border
--color-bg
--color-danger
--color-danger-tint
--bottom-nav-total
```

---

## Notes

- Voice input is a future enhancement - just include the button placeholder
- The AI response parsing should be robust (handle malformed JSON gracefully)
- Keep Zylo's responses SHORT - 1-2 sentences max
- If AI fails, fall back to: "Sorry, I had trouble understanding that. Could you list what you have again?"
