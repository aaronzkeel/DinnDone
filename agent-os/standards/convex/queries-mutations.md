# Queries & Mutations

Use Convex's `query()` for read-only operations and `mutation()` for writes.

```ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query: read data, no side effects
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("groceryItems").collect();
  },
});

// Mutation: create, update, or delete data
export const add = mutation({
  args: {
    name: v.string(),
    quantity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("groceryItems", { ...args });
  },
});
```

## File Naming

Each table gets its own file: `convex/groceryItems.ts`, `convex/weekPlans.ts`, etc.
