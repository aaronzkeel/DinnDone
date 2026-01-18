# Dinner Bell — Design Tokens (LOCKED)

> **Status:** ✅ FINAL — Do not modify without product owner approval
> **Last Updated:** January 2025

---

## Fonts

| Purpose | Font | Weights |
|---------|------|---------|
| **App name, headings** | Lora | 400, 500, 600, 700 |
| **Body text, buttons, labels, UI** | Plus Jakarta Sans | 400, 500, 600, 700 |
| **Mono** | ❌ None | — |

### Google Fonts Import

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Tailwind Config

```javascript
fontFamily: {
  heading: ['Lora', 'Georgia', 'serif'],
  sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
}
```

### Usage

```css
/* App name "Dinner Bell" */
.app-name { font-family: var(--font-heading); font-weight: 700; }

/* Section headings */
h1, h2, h3 { font-family: var(--font-heading); }

/* Everything else */
body, button, input { font-family: var(--font-sans); }
```

---

## Color Palette — "Harvest Hug + Brick"

### Light Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#E2A93B` | Gold — secondary buttons, accents, bullets |
| `--color-secondary` | `#4F6E44` | Sage Green — primary "go" actions |
| `--color-danger` | `#B94A34` | Brick Red — alerts, destructive actions |
| `--color-danger-deep` | `#8E3524` | Darker red for text on red tint backgrounds |
| `--color-danger-tint` | `#F1D1C7` | Light red background for alert cards |
| `--color-bg` | `#FAF3E6` | Page background |
| `--color-card` | `#F3E8D6` | Card backgrounds |
| `--color-text` | `#2B221A` | Primary text |
| `--color-muted` | `#6B5C4D` | Secondary/muted text |
| `--color-border` | `#D8CBB6` | Borders, dividers |

### Dark Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#E2A93B` | Gold (same) |
| `--color-secondary` | `#6F8F5E` | Sage Green (lighter for dark bg) |
| `--color-danger` | `#B94A34` | Brick Red (same) |
| `--color-danger-deep` | `#8E3524` | Darker red |
| `--color-danger-tint` | `#3A1B1B` | Dark red tint for alert cards |
| `--color-bg` | `#17120E` | Page background |
| `--color-card` | `#221A14` | Card backgrounds |
| `--color-text` | `#F6EDE0` | Primary text |
| `--color-muted` | `#CBBBA3` | Secondary/muted text |
| `--color-border` | `#3A2D23` | Borders, dividers |

### Evening Soft Mode (Optional)

| Token | Hex |
|-------|-----|
| `--color-bg` | `#1E1813` |
| `--color-card` | `#26201A` |
| `--color-text` | `#E9DDCC` |
| `--color-muted` | `#BFAF98` |
| `--color-primary` | `#D9A642` |
| `--color-secondary` | `#5F7F52` |

---

## Button Semantics

| Button Type | Color | CSS Class | When to Use |
|-------------|-------|-----------|-------------|
| **Primary positive** | Sage Green `#4F6E44` | `.btn-primary` | "Make it", "Confirm", "Save" |
| **Secondary action** | Gold `#E2A93B` | `.btn-secondary` | "Swap", "Change", "Edit" |
| **Danger/Destructive** | Brick Red `#B94A34` | `.btn-danger` | "Swap ingredient" (in alerts), "Delete", "Remove" |
| **Ghost** | Transparent + border | `.btn-ghost` | "Ignore", "Cancel", "Add staples" |
| **Ghost Destructive** | Transparent + red text | `.btn-ghost-destructive` | "Clear list" |

### Button Examples

```jsx
// Tonight's Plan card
<button className="btn-primary">Make it</button>      // Green
<button className="btn-secondary">Swap</button>       // Gold

// Alert card (allergen warning)
<button className="btn-danger">Swap ingredient</button>  // Red
<button className="btn-ghost">Ignore</button>            // Ghost

// More options card
<button className="btn-ghost">Add staples</button>
<button className="btn-ghost-destructive">Clear list</button>
```

---

## CSS Custom Properties

```css
:root {
  /* Fonts */
  --font-heading: 'Lora', Georgia, serif;
  --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;

  /* Light Mode Colors */
  --color-primary: #E2A93B;
  --color-secondary: #4F6E44;
  --color-danger: #B94A34;
  --color-danger-deep: #8E3524;
  --color-danger-tint: #F1D1C7;
  --color-bg: #FAF3E6;
  --color-card: #F3E8D6;
  --color-text: #2B221A;
  --color-muted: #6B5C4D;
  --color-border: #D8CBB6;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-secondary: #6F8F5E;
    --color-danger-tint: #3A1B1B;
    --color-bg: #17120E;
    --color-card: #221A14;
    --color-text: #F6EDE0;
    --color-muted: #CBBBA3;
    --color-border: #3A2D23;
  }
}
```

---

## Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#E2A93B',      // Gold
        secondary: '#4F6E44',    // Sage Green (light)
        'secondary-dark': '#6F8F5E', // Sage Green (dark mode)
        danger: '#B94A34',       // Brick Red
        'danger-deep': '#8E3524',
        'danger-tint': '#F1D1C7',
        'danger-tint-dark': '#3A1B1B',
        harvest: {
          bg: '#FAF3E6',
          card: '#F3E8D6',
          text: '#2B221A',
          muted: '#6B5C4D',
          border: '#D8CBB6',
        },
        'harvest-dark': {
          bg: '#17120E',
          card: '#221A14',
          text: '#F6EDE0',
          muted: '#CBBBA3',
          border: '#3A2D23',
        },
      },
      fontFamily: {
        heading: ['Lora', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
}
```

---

## Quick Reference for Build Agent

**When implementing UI:**

1. **Headings** (app name, section titles) → `font-heading` (Lora)
2. **Everything else** → `font-sans` (Plus Jakarta Sans)
3. **"Go" actions** (Make it, Confirm) → Green (`secondary`)
4. **"Change" actions** (Swap, Edit) → Gold (`primary`)
5. **"Warning" actions** (Delete, Remove, Swap ingredient in alerts) → Red (`danger`)
6. **Backgrounds** → Use `harvest-bg` / `harvest-dark-bg`
7. **Cards** → Use `harvest-card` / `harvest-dark-card`

**No mono font needed.** Use `font-sans` for any numbers or technical text.
