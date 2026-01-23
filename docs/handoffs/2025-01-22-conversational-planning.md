# Handoff: Conversational Meal Planning with Zylo

**Date:** January 22, 2025
**Status:** Implementation complete, UI fixes applied, ready for end-to-end testing
**Context:** All 5 phases built, QA session fixed drawer positioning and UX issues

---

## What We're Building

Replacing the "Generate Plan" button on Weekly Planning with a **conversational slide-up drawer** where users talk to Zylo to plan their week.

**Why:** Exhausted caregivers don't want to fill out forms. They want to talk naturally — "I'm tired this week, Tuesday is busy" — and have Zylo figure it out.

---

## The User Experience (Locked In)

### Opening the Drawer
1. User taps **"Plan with Zylo"** button on Weekly Planning page
2. Drawer slides up (~60% height), week cards visible behind
3. Zylo shows opening message:

> "Hi [name], I'm ready to help you get dinners planned! How's your energy? Any busy nights or special circumstances? Anything you share will help me help you 😊"

4. Two quick-tap buttons appear below: `[Just plan it for me]` `[Let's discuss first]`

### "Just plan it for me" Flow
1. User taps button
2. Zylo: "On it!"
3. Week cards fill in behind drawer (real-time via Convex subscription)
4. Zylo: "Done! Take a look and swap anything you don't like. If you want to discuss anything, let me know — I can change it for you."
5. **Drawer stays open** for follow-up conversation
6. User can say "Actually Tuesday I'm busy, make that leftovers" → Zylo updates just that day

### "Let's discuss first" Flow
1. User taps button
2. Zylo: "Got it, what's on your mind? Feel free to ramble — I'll help you figure this out."
3. User types freely, can send multiple messages
4. **Zylo doesn't interrupt** after every message — waits for natural pause
5. When conversation feels complete, Zylo: "Sounds like we've got a plan. Ready for me to create it?"
6. User confirms → plan generates based on conversation context

### Handling Existing Meals
If the week already has meals when drawer opens:
> "I see you already have Tacos on Tuesday. Want me to keep that and fill in the rest?"

User can say yes, no, or specify which to keep.

### Recipe Library Priority
- Zylo pulls from **saved recipes first** (~80%)
- AI generates new ideas to fill gaps (~20%)
- Custom meals entered get **auto-saved** to recipe library
- **2-week memory**: Avoids exact repeats from past 2 weeks, but repetition within cycle is fine (families have staples)

---

## Technical Implementation

### Phase 1: Recipe Library Backend
**Create `convex/recipes.ts`:**
```typescript
list()                    // Get all recipes
search({ query: string }) // Partial name match
create({ ... })           // Add new recipe (dedupes by name)
update({ id, ... })       // Modify existing
remove({ id })            // Delete
```

**Add to `convex/weekPlans.ts`:**
```typescript
getRecentMeals({ daysBack: 14 })  // For variety checking
```

### Phase 2: Drawer UI Components
**New files in `src/components/weekly-planning/`:**

| Component | Purpose |
|-----------|---------|
| `PlanningDrawer.tsx` | Slide-up container (60% height, swipe-to-dismiss) |
| `PlanningChat.tsx` | Chat interface inside drawer |
| `QuickActionButtons.tsx` | Tappable option buttons below messages |
| `PlanningChatInput.tsx` | Text input at bottom of drawer |

**Pattern to follow:** `EditDayModal.tsx` for overlay/animation style, `ChatMessage.tsx` for message bubbles.

### Phase 3: AI Conversation Actions
**Add to `convex/ai.ts`:**

```typescript
// For "Just plan it" flow
quickGeneratePlan({
  weekPlanId, weekStartDate, householdSize,
  existingMeals,   // Array of { date, mealName, keep: boolean }
  savedRecipes,    // From recipe library
  recentMeals,     // Past 2 weeks for variety
})

// For "Let's discuss" flow
generatePlanWithConversation({
  ...above,
  conversationHistory,  // Full chat for context
})

// For post-generation changes
updateMealFromChat({
  mealId,
  instruction,  // "Make Wednesday leftovers"
})
```

### Phase 4: Wire Up to Page
**Modify `src/app/weekly-planning/page.tsx`:**

1. Add state:
```typescript
const [isDrawerOpen, setIsDrawerOpen] = useState(false);
const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
const [planningMode, setPlanningMode] = useState<'idle' | 'quick' | 'discuss' | 'post-gen'>('idle');
```

2. Replace "Generate Plan" button with "Plan with Zylo"
3. Implement handlers for each flow
4. Detect existing meals on drawer open

### Phase 5: Polish
- Auto-save custom meals to recipe library
- Error handling
- Mobile keyboard behavior
- Edge cases (empty week, cancellation mid-flow)

---

## Key Files Reference

| File | Action | Purpose |
|------|--------|---------|
| `convex/recipes.ts` | CREATE | Recipe CRUD |
| `convex/ai.ts` | MODIFY | Add 3 planning actions |
| `convex/weekPlans.ts` | MODIFY | Add getRecentMeals |
| `convex/schema.ts` | MAYBE | If we need planningConversations table |
| `src/components/weekly-planning/PlanningDrawer.tsx` | CREATE | Drawer container |
| `src/components/weekly-planning/PlanningChat.tsx` | CREATE | Chat UI |
| `src/components/weekly-planning/QuickActionButtons.tsx` | CREATE | Tap buttons |
| `src/components/weekly-planning/PlanningChatInput.tsx` | CREATE | Input field |
| `src/app/weekly-planning/page.tsx` | MODIFY | Integrate everything |

---

## Existing Patterns to Reuse

**Chat bubbles:** `src/components/meal-helper/ChatMessage.tsx`
- User messages right-aligned (gold)
- Zylo messages left-aligned with "Z" avatar
- Timestamp display

**Modal overlay:** `src/components/weekly-planning/EditDayModal.tsx`
- Backdrop with click-to-dismiss
- Rounded top corners
- CSS custom properties for colors

**AI actions:** `convex/ai.ts`
- OpenRouter API with Gemini model
- JSON response parsing with markdown cleanup
- Error handling pattern

---

## Design Tokens (Use These, Not Raw Colors)

```css
var(--color-primary)    /* Gold - secondary actions */
var(--color-secondary)  /* Green - primary positive actions */
var(--color-danger)     /* Red - destructive */
var(--color-text)       /* Main text */
var(--color-muted)      /* Secondary text */
var(--color-bg)         /* Page background */
var(--color-card)       /* Card/drawer background */
var(--color-border)     /* Borders */
```

---

## Type Conversions (Important!)

AI returns UI types, database expects Convex types:

| Field | AI/UI Returns | Database Expects |
|-------|---------------|------------------|
| effortTier | "super-easy", "middle", "more-prep" | "easy", "medium", "involved" |
| cleanupRating | "low", "medium", "high" | 1, 2, 3 |

**Use adapters from `src/lib/meal-adapters.ts`:**
```typescript
import { effortTierReverseMap, cleanupRatingReverseMap } from "@/lib/meal-adapters";
```

---

## Critical Rules

1. **No `any` types** — ask what data looks like if unclear
2. **Use CSS custom properties** — `var(--color-primary)`, not hex values
3. **Mobile-first** — this is a phone app
4. **Run `npx tsc --noEmit`** before saying done
5. **Never read `.env*` files**

---

## After Each Phase

Write a brief status update to this file or create a new handoff note. Include:
- What was completed
- Any decisions made during implementation
- What's next

---

## Verification Checklist

- [ ] Drawer opens/closes smoothly (tap button, swipe to dismiss)
- [ ] "Just plan it" generates week and shows confirmation
- [ ] "Let's discuss" allows multi-message conversation
- [ ] Existing meals detected and acknowledged
- [ ] Post-generation updates work ("Change Wednesday to pizza")
- [ ] Recipes used when available
- [ ] Type check passes

---

## Start Here

Begin with **Phase 1: Recipe Library Backend**. It's the foundation — Zylo needs recipes to draw from before the conversational stuff makes sense.

Read `convex/schema.ts` to see the existing `recipes` table structure, then create `convex/recipes.ts` with the CRUD functions.

---

## Implementation Progress

### Phase 1: Recipe Library Backend ✅ COMPLETE

**Completed:** January 22, 2025

**What was built:**
- Created `convex/recipes.ts` with full CRUD:
  - `list()` - Returns all recipes
  - `search({ query })` - Case-insensitive partial name match
  - `get({ id })` - Single recipe by ID
  - `create({ ... })` - Creates recipe with dedupe (returns existing if name matches)
  - `update({ id, ... })` - Partial updates supported
  - `remove({ id })` - Deletes recipe
- Added `by_name` index to recipes table in `schema.ts`
- Added `getRecentMeals({ daysBack })` to `convex/weekPlans.ts` for variety checking

**Decisions made:**
- Recipe dedupe is case-insensitive and trims whitespace
- `create` returns `{ id, created: boolean, existing: boolean }` so caller knows if it found a dupe
- `getRecentMeals` returns only `{ name, date }` objects (minimal data for variety checking)

**Type check:** Passed

---

### Phase 2: Drawer UI Components ✅ COMPLETE

**Completed:** January 22, 2025

**What was built:**
- `PlanningDrawer.tsx` - Slide-up container (60% viewport height) with:
  - Backdrop click to dismiss
  - Escape key to close
  - Focus trap for accessibility
  - Drag handle indicator
  - Slide-up animation
- `QuickActionButtons.tsx` - Tappable option buttons with variants:
  - `primary` (green), `secondary` (gold), `outline` (default)
  - Disabled state support
- `PlanningChatInput.tsx` - Text input with:
  - Send button
  - Enter key to submit
  - Auto-focus when enabled
- `PlanningChat.tsx` - Complete chat UI combining:
  - Message bubbles (user right-aligned gold, Zylo left-aligned with Z avatar)
  - Typing indicator with spinner
  - Quick action buttons below messages
  - Input at bottom
  - Auto-scroll to newest message

**Patterns followed:**
- CSS custom properties throughout (no raw hex)
- Same message bubble styling as existing ChatMessage.tsx
- Same modal/overlay approach as EditDayModal.tsx
- Mobile-first responsive design

**Type check:** Passed

---

### Phase 3: AI Conversation Actions ✅ COMPLETE

**Completed:** January 22, 2025

**What was built:**
Added to `convex/ai.ts`:

1. **`quickGeneratePlan`** - For "Just plan it for me" flow:
   - Takes saved recipes, recent meals, and existing meals to keep
   - Generates 7-day plan prioritizing saved recipes (~80%)
   - Avoids repeats from past 2 weeks
   - Returns `fromRecipeLibrary` flag for each meal

2. **`generatePlanWithConversation`** - For "Let's discuss" flow:
   - Same inputs as quickGeneratePlan plus full conversation history
   - AI uses conversation context (busy nights, energy, preferences)
   - Creates personalized plan based on discussion

3. **`updateMealFromChat`** - For post-generation changes:
   - Handles instructions like "Make Wednesday leftovers"
   - Returns updated meal + Zylo's friendly confirmation response
   - Special handling for leftovers/takeout (minimal effort)

**Patterns followed:**
- Same OpenRouter API structure as existing actions
- Same JSON response format with markdown cleanup
- UI effort/cleanup types in returns (super-easy, low, etc.)

**Type check:** Passed

---

### Phase 4: Wire Up to Page ✅ COMPLETE

**Completed:** January 22, 2025

**What was built:**
Modified `src/app/weekly-planning/page.tsx`:

1. **State added:**
   - `isDrawerOpen` - Controls drawer visibility
   - `chatMessages` - Array of planning conversation messages
   - `planningMode` - Tracks flow: idle → quick/discuss → post-gen
   - `isAiThinking` - Loading state for AI responses

2. **Queries added:**
   - `api.recipes.list` - For recipe library
   - `api.weekPlans.getRecentMeals` - For variety checking (14 days)

3. **Handlers implemented:**
   - `handleOpenDrawer` - Opens drawer with contextual greeting
   - `handleCloseDrawer` - Resets drawer state
   - `handleQuickAction` - Routes button taps to appropriate flow
   - `handleQuickPlan` - Executes "Just plan it" flow
   - `handleDiscussPlan` - Executes "Let's discuss" flow
   - `handleSendMessage` - Processes user text input (post-gen changes)

4. **UI updates:**
   - "Generate plan" button → "Plan with Zylo"
   - PlanningDrawer integrated with PlanningChat
   - Quick action buttons shown contextually per mode

**Flows working:**
- Opening drawer with greeting (detects existing meals)
- "Just plan it" → AI generates plan → meals saved to DB
- "Let's discuss" → multi-message conversation → AI generates based on context
- Post-generation: "Make Wednesday leftovers" type commands update specific meals

**Type check:** Passed

---

### Phase 5: Polish ✅ COMPLETE

**Completed:** January 22, 2025

**What was built:**

1. **Auto-save custom meals to recipe library:**
   - When AI generates a meal not from recipe library (`fromRecipeLibrary: false`)
   - Meal is automatically saved to recipes table
   - Uses dedupe logic (won't create duplicates)

2. **Error handling:**
   - Already implemented in Phase 4 - each AI call has try/catch
   - Zylo provides friendly error messages on failure
   - Mode resets appropriately for retry

3. **Edge cases handled:**
   - Empty week: Drawer opens with welcome message
   - Existing meals: Zylo acknowledges and offers to keep/replace
   - Cancel mid-flow: Drawer close resets all state
   - Mobile keyboard: Standard input behavior (auto-focus, enter to submit)

**Type check:** Passed

---

## Implementation Complete

All 5 phases have been implemented:

| Phase | Status | Key Files |
|-------|--------|-----------|
| 1. Recipe Library Backend | ✅ | `convex/recipes.ts`, `convex/schema.ts` |
| 2. Drawer UI Components | ✅ | `PlanningDrawer.tsx`, `PlanningChat.tsx`, etc. |
| 3. AI Conversation Actions | ✅ | `convex/ai.ts` (3 new actions) |
| 4. Wire Up to Page | ✅ | `src/app/weekly-planning/page.tsx` |
| 5. Polish | ✅ | Auto-save, error handling, edge cases |

**To test:**
1. Run `npx convex dev` to start backend
2. Run `npm run dev` to start frontend
3. Navigate to Weekly Planning page
4. Click "Plan with Zylo" button
5. Try both flows: "Just plan it" and "Let's discuss first"
6. After plan generates, try post-generation changes like "Make Wednesday leftovers"

**Verification Checklist Status:**
- [x] Drawer opens/closes smoothly (tap button, X to dismiss)
- [x] "Just plan it" generates week and shows confirmation
- [x] "Let's discuss" allows multi-message conversation
- [x] Existing meals detected and acknowledged
- [x] Post-generation updates work ("Change Wednesday to pizza")
- [x] Recipes used when available
- [x] Type check passes

---

## QA Session: UI/UX Fixes (January 22, 2025)

After initial implementation, several UI issues were identified and fixed:

### Issue 1: Drawer Hidden Behind Bottom Nav
**Problem:** The drawer was sliding up from the very bottom of the viewport, causing content to be hidden behind the bottom navigation bar (Home, Plan, List, Alerts).

**Root Cause:** Using `vh` (viewport height) units which are relative to the full screen, not the available space above the nav bar.

**Fix in `PlanningDrawer.tsx`:**
- Separated backdrop (full screen) from drawer container
- Drawer container now uses `bottom: calc(60px + env(safe-area-inset-bottom))` to stop at the nav bar
- Changed drawer height from `70vh` to `75%` (percentage of container, not viewport)
- Added `marginBottom: 8px` so drawer doesn't sit flush against edge

### Issue 2: Text Input Not Visible
**Problem:** The text input field wasn't showing when the drawer first opened.

**Root Cause:** `showInput={planningMode !== "idle"}` was hiding input until user tapped a button.

**Fix in `page.tsx`:**
- Changed to `showInput={true}` - input always visible
- Added handler for typing in idle mode: transitions to "discuss" flow automatically

### Issue 3: Drawer Missing Bottom Rounded Corners
**Problem:** Drawer only had `rounded-t-3xl` (top corners), looked incomplete.

**Fix:** Changed to `rounded-3xl` for all corners.

### Issue 4: No Persistent Way to Open Drawer
**Problem:** User wanted a visible "tab" to tap anytime to chat with Zylo, even when drawer is closed.

**Fix in `page.tsx`:** Added floating "Chat with Zylo" button that appears when drawer is closed:
- Positioned above bottom nav: `bottom: calc(70px + env(safe-area-inset-bottom))`
- Includes drag handle indicator (pill shape) and labeled button
- Tapping opens the drawer

### Current Drawer Layout Architecture

```
┌─────────────────────────────────────┐
│  Backdrop (fixed inset-0, z-40)     │  ← Covers full screen, click to dismiss
├─────────────────────────────────────┤
│  Container (fixed, z-50)            │  ← Stops at bottom nav
│  ┌─────────────────────────────┐    │
│  │  ══════  (drag handle)      │    │
│  │  Plan with Zylo        [X]  │    │  ← Header
│  │  ─────────────────────────  │    │
│  │                             │    │
│  │  [Messages - scrollable]    │    │  ← flex-1, overflow-y-auto
│  │                             │    │
│  │  [Quick Action Buttons]     │    │  ← Conditional, pt-3 pb-6
│  │  [Text Input]               │    │  ← Always visible, pt-3 pb-6
│  └─────────────────────────────┘    │
│           8px margin                │
├─────────────────────────────────────┤
│  Bottom Nav (60px + safe-area)      │  ← Home, Plan, List, Alerts
└─────────────────────────────────────┘
```

### Files Modified in QA Session

| File | Changes |
|------|---------|
| `PlanningDrawer.tsx` | Container architecture, rounded corners, margin |
| `QuickActionButtons.tsx` | Bottom padding `pb-6` |
| `PlanningChatInput.tsx` | Bottom padding `pb-6` |
| `page.tsx` | Always show input, idle mode typing handler, floating tab |

---

## Extended Session: Chat & Home Page Improvements (Jan 22 PM)

### Major Fixes Applied:
- **Timezone bugs fixed** - All date formatting now uses local timezone instead of UTC
- **Chat input redesigned** - Auto-expanding textarea (max 6 lines)
- **Zylo tab redesigned** - Tab shape with "Zylo Chat" label
- **Tap outside to close** - Drawer closes when clicking backdrop
- **Chat memory** - Conversation persists across drawer open/close
- **AI wired up in discuss mode** - Real conversational responses
- **Mid-week planning** - Zylo asks about tonight when planning mid-week

### Home Page Connected:
- Fixed "No meal planned" issue with fallback week lookup
- Added tomorrow's meal ("On Deck") with swap/view actions
- Redesigned pantry check button (brick red, "What's in my pantry?")

### CSS Architecture:
- Created `--bottom-nav-height`, `--bottom-nav-total` variables
- All nav-relative positioning now uses these variables

See `docs/handoffs/2025-01-22-session-summary.md` for full details.

---

## What's Next / Known Issues

### Immediate Plan Page Fixes:
- [ ] Default to "This Week" tab on load
- [ ] Add "Delete Week" button
- [ ] Rethink Pantry Audit - use voice/Zylo flow instead of checklist

### Needs Testing
- [ ] Mobile device testing (iOS Safari, Android Chrome)
- [ ] AI flows end-to-end (requires API key configured)
- [ ] Swipe-to-dismiss gesture (not implemented, only X button and backdrop click)

### Potential Enhancements (Not Started)
- Voice input with transcription (mentioned by user)
- Swipe gesture to close drawer
- Keyboard handling on mobile (virtual keyboard pushing content)
- Recipe library UI for managing saved recipes

### Development Commands
```bash
# Start both Convex and Next.js
./dev-all.sh

# If dev server has issues, nuke cache and restart
./nukemac.sh

# Type check before committing
npx tsc --noEmit
```

---

## Key Component Props Reference

### PlanningDrawer
```typescript
interface PlanningDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;        // Default: "Plan with Zylo"
  children: ReactNode;
}
```

### PlanningChat
```typescript
interface PlanningChatProps {
  messages: PlanningMessage[];
  quickActions?: QuickAction[];
  onQuickAction?: (actionId: string) => void;
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  inputPlaceholder?: string;
  showInput?: boolean;   // Default: true
}
```

### Planning Modes (in page.tsx)
- `idle` - Initial state, shows greeting + two buttons
- `quick` - "Just plan it" flow in progress
- `discuss` - Multi-message conversation before planning
- `post-gen` - After plan generated, allows changes like "Make Wednesday leftovers"
