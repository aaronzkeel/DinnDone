# Handoff: Meal Helper Wiring Session
**Date:** January 19, 2025
**Branch:** `debugging-version-01.1`
**Last Commit:** `b30520e` - feat: Wire up Meal Helper flows with AI chat integration

---

## What This Project Is

**DinnDone** is a meal planning app for busy caregivers. The main interface is the "Meal Helper" - a chat-based assistant named **Zylo** that helps users decide what to cook tonight.

**Target users:** Parents, caregivers - people who are exhausted and need low-friction meal decisions.

**Tech stack:**
- Next.js 14 with App Router
- TypeScript (strict - no `any` types allowed)
- Tailwind CSS with CSS custom properties for theming
- Convex for backend/database
- OpenRouter API with Gemini model for AI chat

---

## What Was Just Completed

### 1. Wired Up All Home Page Buttons
The three main action buttons now work:

| Button | What It Does | View State |
|--------|--------------|------------|
| **This works** | Opens ingredient checklist to confirm user has everything | `"ingredients-check"` |
| **New plan** | Opens WeekSwapList to swap tonight's meal with another | `"swap"` |
| **I'm wiped** | Opens EmergencyExit with zero-energy options | `"emergency"` |

### 2. AI Chat Integration
- Zylo (the AI assistant) now responds via OpenRouter/Gemini
- System prompt includes meal context and Zylo's personality
- Messages stored in component state (not persisted to DB yet)
- Loading indicator shows while waiting for AI response

### 3. Fixed ChatInput Positioning
- Chat input now fixed above the bottom nav bar
- Uses `bottom: calc(80px + env(safe-area-inset-bottom))` for proper mobile spacing
- Content has `pb-24` padding to not hide behind input

### 4. Complete User Flows

**Ingredient Check Flow:**
1. User taps "This works"
2. IngredientsCheckPanel shows ingredient checklist
3. User checks off items they have
4. "Have everything" → confirms meal
5. "Missing some" → shows missing items with options:
   - "Add to grocery list & cook this"
   - "Pick a different meal" → opens swap list

**Swap Flow:**
1. User taps "New plan"
2. WeekSwapList shows other meals from the week
3. User selects a meal to swap
4. Ingredient confirmation for new meal
5. Swap finalizes

**Inventory Check:**
1. User taps "Check what we've got"
2. InventoryCheck component opens
3. User brain-dumps what's in fridge/pantry
4. Submits to Zylo for meal suggestions based on ingredients

---

## Key Files to Know

### Main Orchestration
**`src/app/page.tsx`** - The brain of Meal Helper
- View state management (`useState<ViewState>`)
- All handler functions for user actions
- AI chat integration
- Mock data (meals, household members)

View states:
```typescript
type ViewState =
  | "home"           // Default - TonightPlanCard + chat
  | "details"        // MealOptionDetails - full meal with directions
  | "swap"           // WeekSwapList - pick different meal
  | "emergency"      // EmergencyExit - zero-energy options
  | "ingredients-check"  // IngredientsCheckPanel - checklist
  | "missing-choice"     // Missing ingredients - add to list or swap?
  | "swap-ingredients"   // Confirm ingredients for swap meal
  | "inventory"          // InventoryCheck - brain dump pantry
```

### Components (all in `src/components/meal-helper/`)

| Component | Purpose |
|-----------|---------|
| `MealHelperHome.tsx` | Main home view with TonightPlanCard, buttons, chat |
| `TonightPlanCard.tsx` | Shows tonight's meal summary (clickable name) |
| `ChatInput.tsx` | Fixed input bar for messaging Zylo |
| `ChatMessage.tsx` | Individual chat bubble |
| `MealOptionDetails.tsx` | Full meal card with directions |
| `WeekSwapList.tsx` | List of meals to swap with |
| `EmergencyExit.tsx` | Zero-energy meal options |
| `IngredientsCheckPanel.tsx` | Ingredient checklist |
| `InventoryCheck.tsx` | Pantry brain dump textarea |
| `MealSuggestionCard.tsx` | AI meal suggestion (not currently used) |

### Types
**`src/types/meal-helper.ts`** - All TypeScript interfaces
- `TonightMeal`, `HouseholdMember`, `ChatMessage`
- Component props interfaces

### AI Integration
**`convex/ai.ts`** - Convex action for AI chat
- Uses OpenRouter API
- Model: `google/gemini-2.0-flash-001`
- Expects `OPENROUTER_API_KEY` in environment

---

## What's NOT Done Yet (Gaps from Product Plan)

### Priority 1: Persistence
Currently using mock data and local state. Need to:
- Connect to actual Convex database for meals
- Persist chat messages
- Save user meal confirmations/swaps

### Priority 2: Voice Input
The mic button exists but `onVoiceInput` is a placeholder:
```typescript
onVoiceInput={() => console.log("Voice input")}
```
Need to implement speech-to-text.

### Priority 3: MealSuggestionCard
Component exists but isn't used. Should appear when:
- Zylo suggests a meal in chat
- User asks "what should I cook?"

### Priority 4: Email Authentication
Currently only Google OAuth. See `docs/future-features.md` for notes on adding email/password auth with Clerk.

### Priority 5: Grocery List Integration
"Add to grocery list" button exists but doesn't actually add items anywhere.

---

## Gotchas and Things to Know

### 1. No `any` Types
Aaron's rule: Never use TypeScript `any`. If you're unsure of a type, ask or look it up.

### 2. CSS Custom Properties
The app uses CSS variables for theming, not Tailwind colors directly:
```css
var(--color-primary)
var(--color-bg)
var(--color-card)
var(--color-text)
var(--color-muted)
var(--color-border)
```

### 3. Mobile-First
This is a mobile app. All UI decisions should prioritize phone screens.

### 4. Bottom Nav Height
The bottom nav bar is ~80px. Any fixed-bottom elements need to account for this:
```css
bottom: calc(80px + env(safe-area-inset-bottom))
```

### 5. Message Format
Chat messages use this structure:
```typescript
interface ChatMessage {
  id: string;
  role: "user" | "zylo";
  content: string;
  timestamp: Date;
}
```

### 6. Convex Environment
Make sure `.env.local` has:
- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL`
- `OPENROUTER_API_KEY`

---

## Product Plan Location

The product specification lives in:
```
product-plan/
├── sections/
│   └── meal-helper/
│       ├── tests.md      # Feature specs and test cases
│       └── ...
```

Read `tests.md` to understand intended behavior for each feature.

---

## Recent Commits for Context

```
b30520e feat: Wire up Meal Helper flows with AI chat integration
ed5cb02 Update components and configurations, add test screenshots
8003e52 docs: Add regression test screenshot for Feature #2 - Google Fonts
ab8a683 feat: Add test page for notification settings access
```

---

## Suggested Next Steps

1. **Connect to real data** - Replace mock `tonightMeal` and `weekMeals` with Convex queries
2. **Persist chat messages** - Store in Convex so they survive page refresh
3. **Implement grocery list** - Wire up "Add to grocery list" functionality
4. **Voice input** - Add speech-to-text for the mic button
5. **Testing** - Run through all flows manually and fix edge cases

---

## How Aaron Works

From his CLAUDE.md:
- Prefers concise responses, no fluff
- Ask clarifying questions BEFORE starting work
- No acronyms without explanation
- Mobile-first, accessible design
- Run linter/type checker before saying you're done

Good luck!
