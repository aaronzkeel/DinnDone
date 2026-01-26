# Props & Types

Define shared types in `src/types/` folder. Import them into components.

```tsx
// In src/types/grocery.ts
export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  isChecked: boolean;
}

// In component
import type { GroceryItem } from "@/types/grocery";
```

## Rules

- Types shared by multiple components go in `src/types/[area].ts`
- Use `interface` for object shapes, `type` for unions
- Import with `import type` (not just `import`)

## Existing Type Files

- `src/types/grocery.ts` — GroceryItem, MealSource
- `src/types/meal-helper.ts` — ChatMessage, MealSuggestion
- `src/types/weekly-planning.ts` — PlannedMeal, HouseholdMember
- `src/types/notifications.ts` — Notification, NotificationAction
