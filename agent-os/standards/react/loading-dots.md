# Loading Dots

Animated bouncing dots to show AI is thinking. Used in chat interfaces.

## Pattern

Three stacked circles with staggered animation delays create a "typing" effect.

```tsx
<div className="flex gap-1">
  <div className="w-2 h-2 rounded-full bg-[var(--color-text-secondary)] animate-bounce" />
  <div
    className="w-2 h-2 rounded-full bg-[var(--color-text-secondary)] animate-bounce"
    style={{ animationDelay: '150ms' }}
  />
  <div
    className="w-2 h-2 rounded-full bg-[var(--color-text-secondary)] animate-bounce"
    style={{ animationDelay: '300ms' }}
  />
</div>
```

## Usage Context

Wrap in a chat bubble card to match the assistant message style:

```tsx
<div className="rounded-2xl bg-[var(--color-surface)] p-4 shadow-sm">
  {/* Loading dots here */}
</div>
```

## Examples

- `src/components/meal-helper/MealHelperHome.tsx` (lines 176-207)
- `src/app/test-zylo-chat/page.tsx` (lines 116-123)
