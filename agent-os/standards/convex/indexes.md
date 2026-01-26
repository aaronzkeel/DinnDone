# Indexes

Add indexes to fields you filter or query by frequently. Use `by_fieldname` naming.

```ts
groceryItems: defineTable({
  storeId: v.optional(v.id("stores")),
  weekPlanId: v.optional(v.id("weekPlans")),
  isChecked: v.boolean(),
})
  .index("by_store", ["storeId"])
  .index("by_week_plan", ["weekPlanId"])
  .index("by_checked", ["isChecked"]),
```

## Using Indexes in Queries

```ts
// Use withIndex instead of filter when possible
const items = await ctx.db
  .query("groceryItems")
  .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
  .collect();
```

## When to Add

- Querying a table by a specific field (e.g., "get all items for this store")
- Filtering by a boolean (e.g., "get all checked items")
- Looking up by foreign key (e.g., weekPlanId)
