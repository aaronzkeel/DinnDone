# App Shell Layout

The app uses a fixed header/footer structure with scrollable content in between.

```
┌────────────────────────┐
│ Header (60px fixed)    │
├────────────────────────┤
│                        │
│ Main content (scrolls) │
│                        │
├────────────────────────┤
│ Bottom Nav (76px + safe area) │
└────────────────────────┘
```

## CSS Variables

```css
--header-height: 60px;
--bottom-nav-height: 76px;
--safe-area-bottom: env(safe-area-inset-bottom, 0px);
--bottom-nav-total: calc(var(--bottom-nav-height) + var(--safe-area-bottom));
```

## Usage in Pages

```tsx
// Main content needs padding at bottom for nav
<main style={{ paddingBottom: "var(--bottom-nav-total)" }}>
  {children}
</main>

// Full-height content sections
<div className="min-h-[calc(100vh-120px)]">
```

## Source

Defined in `src/app/layout.tsx` and `src/app/globals.css`.
