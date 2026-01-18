> ⚠️ **SUPERSEDED** — See `DESIGN-TOKENS.md` for the locked-in font decisions (Lora + Plus Jakarta Sans).

# Typography Configuration (ORIGINAL — DO NOT USE)

## Google Fonts Import

Add to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Or in CSS:

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
```

## Font Usage

| Purpose | Font | Weights |
|---------|------|---------|
| Headings | Plus Jakarta Sans | 600, 700 |
| Body text | Plus Jakarta Sans | 400, 500 |
| Code/technical | IBM Plex Mono | 400, 500 |

## Tailwind Configuration

If using Tailwind, extend your font families:

```javascript
// In your CSS or Tailwind config
fontFamily: {
  sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
  mono: ['IBM Plex Mono', 'monospace'],
}
```

## Build-Time Decision

The current spec uses Plus Jakarta Sans. During build, you may test Nunito Sans as an alternative if a softer, rounder aesthetic is preferred. Lock in the final choice before coding begins.
