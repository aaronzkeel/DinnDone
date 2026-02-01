# Empty State

Centered layout for empty lists/screens with icon, heading, description, and call-to-action.

## Pattern

```tsx
<div className="flex flex-col items-center justify-center text-center p-8">
  {/* Icon in circular container */}
  <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10
                  flex items-center justify-center mb-4">
    <Icon className="w-8 h-8 text-[var(--color-primary)]" />
  </div>

  {/* Heading */}
  <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
    No items yet
  </h2>

  {/* Description */}
  <p className="text-[var(--color-text-secondary)] mb-6">
    Get started by adding your first item.
  </p>

  {/* Call-to-action */}
  <button className="btn-primary">
    Add Item
  </button>
</div>
```

## Key Points

- Icon uses 10% opacity background of primary color
- Text is centered with proper hierarchy (heading > description)
- CTA button is optional but encouraged
- Use `justify-center` with enough height to center vertically

## Examples

- `src/components/meal-helper/MealHelperHome.tsx` (lines 80-117)
- `src/components/grocery-list/GroceryList.tsx` (lines 586-633)
