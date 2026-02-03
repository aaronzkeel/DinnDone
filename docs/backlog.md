# DinnDone Backlog

## High Priority

### Voice Input for Zylo
- **Location:** Home page microphone button, Zylo chat
- **Current state:** Shows "Voice input coming soon"
- **Needed:** Implement speech-to-text so users can talk to Zylo instead of typing

## Medium Priority

(Add items here as discovered)

## Low Priority / Nice to Have

(Add items here as discovered)

---

## Discovered Issues (Need Investigation)

### Meal Swap Doesn't Update Ingredients/Steps
- **Discovered:** 2026-02-03
- **Problem:** When swapping a meal via "More options" in Edit Day modal, only the name and metadata update. Ingredients and cooking directions stay from the OLD meal.
- **Example:** Swapped Quesadillas → Homemade Pizza, but directions still say "sprinkle cheese onto a tortilla"
- **Root cause:** `MealAlternative` type doesn't include ingredients/steps, and the swap function doesn't update them
- **Fix needed:** AI needs to generate full meal data for alternatives, swap needs to update ingredients/steps

