# Handoff: Onboarding Chat UI Polish

**Date:** 2025-02-02
**Status:** In Progress
**Priority:** High - UX issues blocking testing

---

## Summary

We built a conversational AI onboarding flow where Zylo (the AI assistant) chats with users to learn about their family. The core functionality works, but there are two UI/UX issues that need fixing.

---

## What Was Built

### New Files Created
- `convex/familyProfile.ts` - CRUD for family profile data
- `convex/onboardingConversation.ts` - Conversation state management
- `convex/aiOnboarding.ts` - AI actions for chat, extraction, zyloNotes generation
- `convex/aiContext.ts` - Internal queries for context injection
- `src/app/onboarding/chat/page.tsx` - Main conversational onboarding page
- `src/components/onboarding/OnboardingChat.tsx` - Chat UI component
- `src/components/onboarding/OnboardingCheckpoint.tsx` - Checkpoint components
- `src/components/onboarding/OnboardingSummary.tsx` - Final review screen

### Modified Files
- `convex/schema.ts` - Added `familyProfiles`, `onboardingConversations` tables
- `convex/userPreferences.ts` - Added `onboardingType` field
- `convex/ai.ts` - Added `buildZyloContext` action
- `src/app/onboarding/page.tsx` - Added path choice (Chat vs Quick Setup)

### Flow
1. User goes to `/onboarding` → sees choice screen
2. Clicks "Chat with Zylo" → goes to `/onboarding/chat`
3. Chats with Zylo about family, health, cooking, shopping
4. Clicks "Finish Setup" button → extraction runs
5. Goes through checkpoints (household, dietary, stores)
6. Reviews summary → confirms → redirects to `/weekly-planning`

---

## Issues to Fix

### Issue 1: "Finish Setup" Button Placement

**Problem:** The green "Finish Setup" button is a full-width floating bar that covers the last chat message. It's too prominent and obstructs the conversation.

**Current (BAD):**
```
┌─────────────────────────────────────┐
│  Header: Chat with Zylo             │
├─────────────────────────────────────┤
│                                     │
│  [Zylo] What about food preferences?│
│  Are there any types of cuisine     │
│  that...                            │
│                                     │
│  ┌─────────────────────────────────┐│
│  │  ✓ Finish Setup                 ││  ← COVERS CONTENT!
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Tell Zylo about your family... →││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  Home   Plan   Kitchen   Recipes    │
└─────────────────────────────────────┘
```

**Desired (GOOD) - Option A: Small pill button in header:**
```
┌─────────────────────────────────────┐
│  ← Chat with Zylo    [Finish Setup] │  ← Small button in header
├─────────────────────────────────────┤
│                                     │
│  [Zylo] What about food preferences?│
│  Are there any types of cuisine     │
│  that your family enjoys?           │
│                                     │
│                                     │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Tell Zylo about your family... →││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  Home   Plan   Kitchen   Recipes    │
└─────────────────────────────────────┘
```

**Desired (GOOD) - Option B: Inline button after last message:**
```
┌─────────────────────────────────────┐
│  ← Chat with Zylo                   │
├─────────────────────────────────────┤
│                                     │
│  [Zylo] What about food preferences?│
│  Are there any types of cuisine     │
│  that your family enjoys?           │
│                                     │
│         [✓ Finish Setup]            │  ← Centered inline button
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Tell Zylo about your family... →││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  Home   Plan   Kitchen   Recipes    │
└─────────────────────────────────────┘
```

**Files to modify:**
- `src/components/onboarding/OnboardingChat.tsx` - Move or restyle the button
- `src/app/onboarding/chat/page.tsx` - May need to pass props differently

**Current button code location:** `OnboardingChat.tsx` around line 165-180

---

### Issue 2: Input Auto-Focus After Sending

**Problem:** After user sends a message, the cursor doesn't return to the input field. User has to tap/click back into the input box each time.

**Desired:** After sending a message, automatically focus the textarea so user can keep typing.

**File to modify:** `src/components/onboarding/OnboardingChat.tsx`

**Fix approach:**
1. In `handleSubmit`, after `setInputValue('')`, add:
   ```typescript
   textareaRef.current?.focus()
   ```

2. Or use a `useEffect` that focuses when `isLoading` changes from `true` to `false`

---

## Key Files Reference

### OnboardingChat.tsx Structure
```typescript
// Props
interface OnboardingChatProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  onFinish: () => void  // Called when "Finish Setup" clicked
  isLoading: boolean
  disabled?: boolean
}

// Key refs
const textareaRef = useRef<HTMLTextAreaElement>(null)

// Show finish button after 3+ user messages
const userMessageCount = messages.filter((m) => m.role === 'user').length
const showFinishButton = userMessageCount >= 3
```

### Design System
- Primary color (gold): `var(--color-primary)` - `#E2A93B`
- Secondary color (green): `var(--color-secondary)` - `#4F6E44`
- Background: `var(--color-bg)`
- Card: `var(--color-card)`
- Text: `var(--color-text)`
- Muted: `var(--color-muted)`
- Border: `var(--color-border)`

### Bottom Nav Variable
- `var(--bottom-nav-total)` - Height of bottom nav bar (76px + safe area)

---

## Testing

After fixing:
1. Reset onboarding: `npx convex run userPreferences:adminResetAllOnboarding`
2. Go to `http://localhost:3002/onboarding`
3. Choose "Chat with Zylo"
4. Send 3+ messages
5. Verify:
   - [ ] Finish button doesn't obstruct chat
   - [ ] Cursor stays in input after sending
   - [ ] Clicking Finish triggers extraction flow
   - [ ] Flow completes to weekly planning

---

## Important Notes

- **Mobile-first:** This is a phone app, test on narrow viewport
- **No `any` types:** TypeScript strict mode
- **CSS variables:** Use `var(--color-*)` not raw hex values
- **Run type checker:** `npx tsc --noEmit` before saying done

---

## Questions for User (if needed)

1. Preferred button placement: Header pill vs inline after messages?
2. Should button appear earlier (after 2 messages) or later (after 4)?
