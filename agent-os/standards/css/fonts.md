# Fonts

Two fonts only. Serif headings for warmth, sans-serif for readability.

| Purpose | Font | CSS Variable |
|---------|------|--------------|
| App name, headings | Lora (serif) | `font-heading` |
| Body, buttons, labels, UI | Plus Jakarta Sans | `font-sans` |

```tsx
// Headings
<h1 className="font-heading">Weekly Plan</h1>

// App name in header
<span className="font-heading text-lg font-semibold">DinnDone</span>

// Everything else uses font-sans (default)
<button>Make it</button>
<p>Tonight we're having tacos.</p>
```

## Why

Serif headings feel warm and homey—matches the caregiver audience.

**Source:** `product-plan/design-system/DESIGN-TOKENS.md` (LOCKED)
