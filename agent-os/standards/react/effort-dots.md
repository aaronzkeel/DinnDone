# Effort Dots

Visual indicator showing effort level (1-3) with filled/unfilled dots.

## Pattern

```tsx
const effortDots: Record<string, number> = {
  'minimal': 1,
  'moderate': 2,
  'involved': 3,
};

const dots = effortDots[effortTier] || 2;

<div className="flex gap-1" aria-label={`Effort: ${effortTier}`}>
  {Array.from({ length: 3 }).map((_, i) => (
    <div
      key={i}
      className={`w-2 h-2 rounded-full ${
        i < dots
          ? 'bg-[var(--color-primary)]'
          : 'bg-[var(--color-text-secondary)]/30'
      }`}
    />
  ))}
</div>
```

## Key Points

- Always render 3 dots for consistency
- Filled dots use primary color
- Unfilled dots use secondary text at 30% opacity
- Add `aria-label` for screen readers
- Effort tiers: `minimal` (1), `moderate` (2), `involved` (3)

## Examples

- `src/components/weekly-planning/DayCard.tsx` (lines 114-127)
- `src/components/weekly-planning/EditDayModal.tsx` (lines 196-209)
- `src/components/meal-helper/MealSuggestionCard.tsx`
