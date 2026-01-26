# Accessibility

Make components usable for everyone—screen readers, touch screens, keyboard navigation.

## Touch Targets

Buttons and interactive elements: minimum 44×44 pixels.

```tsx
// 44px touch target with negative margin to keep visual size small
<button className="w-11 h-11 -m-2 flex items-center justify-center">
  <Icon size={14} />
</button>
```

## Labels

Add `aria-label` when there's no visible text.

```tsx
<button aria-label="Delete item">
  <TrashIcon />
</button>

<button aria-label={`Check ${item.name}`}>
  <Checkbox />
</button>
```

## Expandable Menus

```tsx
<button
  aria-expanded={isOpen}
  aria-haspopup="true"
  aria-label="User menu"
>
```

## Keyboard Support

For drag-and-drop, provide arrow key alternatives.
