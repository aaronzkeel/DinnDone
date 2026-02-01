# Focus Trap Modal

Keep keyboard focus inside modals for accessibility. Tab wraps at boundaries, Escape closes.

## Pattern

```tsx
const modalRef = useRef<HTMLDivElement>(null);

const getFocusableElements = useCallback(() => {
  if (!modalRef.current) return [];
  return Array.from(
    modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  );
}, []);

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (e.key === 'Tab') {
      const focusable = getFocusableElements();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [onClose, getFocusableElements]);
```

## Modal Wrapper Structure

```tsx
<div className="fixed inset-0 z-50 bg-black/50">
  <div
    ref={modalRef}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    className="absolute inset-x-4 top-1/2 -translate-y-1/2 ..."
  >
    {/* Modal content */}
  </div>
</div>
```

## Examples

- `src/components/weekly-planning/EditDayModal.tsx`
- `src/components/grocery-list/GroceryList.tsx`
