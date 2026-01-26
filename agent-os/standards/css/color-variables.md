# Color Variables

Use CSS custom properties, not Tailwind colors or hex values.

```tsx
// Good
style={{ backgroundColor: "var(--color-primary)" }}
style={{ color: "var(--color-text)" }}

// Bad
className="bg-yellow-500"
style={{ backgroundColor: "#E2A93B" }}
```

## Available Variables

See `product-plan/design-system/DESIGN-TOKENS.md` for the full list. Common ones:
- `--color-primary` (Harvest Hug yellow)
- `--color-secondary` (Deep Sage green)
- `--color-text`, `--color-muted`
- `--color-bg`, `--color-card`, `--color-border`

## Why

- Custom brand colors stay locked in
- Dark/light theme switching works automatically
- Single source of truth in tokens file
