# Toast Notifications

Temporary messages that auto-dismiss after a timeout.

## Pattern

```tsx
const [toast, setToast] = useState<string | null>(null);

const showToast = (message: string) => {
  setToast(message);
  setTimeout(() => setToast(null), 3000);
};
```

## Rendering

Position fixed at bottom, above the nav bar:

```tsx
{toast && (
  <div className="fixed bottom-20 left-4 right-4 z-40">
    <div className="bg-[var(--color-surface)] text-[var(--color-text-primary)]
                    rounded-lg p-3 shadow-lg text-center">
      {toast}
    </div>
  </div>
)}
```

## Variants

For success/error states, add semantic colors:

```tsx
const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

// Success: bg-[var(--color-primary)]
// Error: bg-[var(--color-danger)]
```

## Examples

- `src/components/grocery-list/GroceryList.tsx` (lines 133-135, 969-978)
