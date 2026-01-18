> ⚠️ **SUPERSEDED** — See `DESIGN-TOKENS.md` for the locked-in color palette (Harvest Hug + Brick).

# Tailwind Color Configuration (ORIGINAL — DO NOT USE)

## Color Choices

- **Primary:** `yellow` (amber tones) — Used for buttons, links, key accents
- **Secondary:** `lime` — Used for success states, flex meal indicators
- **Neutral:** `stone` — Used for backgrounds, text, borders

## Usage Examples

### Primary (Yellow/Amber)
```
Primary button: bg-yellow-500 hover:bg-yellow-600 text-white
Active tab: text-yellow-600 dark:text-yellow-400
Focus ring: ring-yellow-500
```

### Secondary (Lime)
```
Success badge: bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200
Flex meal indicator: text-lime-600 dark:text-lime-400
```

### Neutral (Stone)
```
Background: bg-stone-50 dark:bg-stone-900
Card: bg-white dark:bg-stone-800
Text: text-stone-800 dark:text-stone-100
Muted text: text-stone-500 dark:text-stone-400
Border: border-stone-200 dark:border-stone-700
```

## Notification Icon Colors

Each notification type uses a distinct color for quick visual recognition:

| Type | Light Mode | Dark Mode |
|------|------------|-----------|
| Daily Brief | `bg-yellow-100 text-yellow-600` | `bg-yellow-900 text-yellow-400` |
| Strategic Pivot | `bg-blue-100 text-blue-600` | `bg-blue-900 text-blue-400` |
| Thaw Guardian | `bg-cyan-100 text-cyan-600` | `bg-cyan-900 text-cyan-400` |
| Weekly Plan Ready | `bg-purple-100 text-purple-600` | `bg-purple-900 text-purple-400` |
| Inventory SOS | `bg-orange-100 text-orange-600` | `bg-orange-900 text-orange-400` |
| Leftover Check | `bg-lime-100 text-lime-600` | `bg-lime-900 text-lime-400` |
| Cook Reminder | `bg-amber-100 text-amber-600` | `bg-amber-900 text-amber-400` |

## Build-Time Decision

The exact color palette may be refined during build. Test the provided colors and adjust if needed while maintaining the warm, low-stimulation aesthetic.
