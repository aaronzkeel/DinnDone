# Button Semantics

Button colors have meaning. Use the right color for the action type.

| Action Type | Color | Class | Examples |
|-------------|-------|-------|----------|
| **Confirm/Go** | Sage Green | `btn-primary` | "Make it", "Confirm", "Save" |
| **Change/Edit** | Gold | `btn-secondary` | "Swap", "Change", "Edit" |
| **Danger** | Brick Red | `btn-danger` | "Delete", "Remove" |
| **Cancel/Dismiss** | Transparent | `btn-ghost` | "Ignore", "Cancel" |
| **Destructive Ghost** | Transparent + red text | `btn-ghost-destructive` | "Clear list" |

```jsx
// Tonight's Plan card
<button className="btn-primary">Make it</button>      // Green
<button className="btn-secondary">Swap</button>       // Gold

// Alert card
<button className="btn-danger">Swap ingredient</button>  // Red
<button className="btn-ghost">Ignore</button>            // Ghost
```

**Source:** `product-plan/design-system/DESIGN-TOKENS.md` (LOCKED)
