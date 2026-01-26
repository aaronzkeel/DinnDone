# Schema Validators

Define reusable validators at the top of `convex/schema.ts`. Reuse them in table definitions.

```ts
// Define once
const effortTier = v.union(
  v.literal("easy"),
  v.literal("medium"),
  v.literal("involved")
);

// Use in multiple tables
plannedMeals: defineTable({
  effortTier: effortTier,
  // ...
}),

recipes: defineTable({
  effortTier: effortTier,
  // ...
}),
```

## Existing Validators

- `effortTier` — "easy" | "medium" | "involved"
- `cleanupRating` — 1 | 2 | 3
- `weekPlanStatus` — "draft" | "approved" | "in-progress" | "completed"
- `notificationType` — "daily-brief" | "strategic-pivot" | etc.
- `fandomVoice` — "default" | "samwise" | "nacho-libre" | etc.
- `pantryLocation` — "fridge" | "freezer" | "pantry"
