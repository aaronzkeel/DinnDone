import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all grocery items, ordered by sortOrder within each store
export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("groceryItems").collect();
    // Sort items by sortOrder (nulls go to end)
    return items.sort((a, b) => {
      const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  },
});

// List grocery items by store
export const listByStore = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("groceryItems")
      .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
      .collect();
  },
});

// List grocery items by week plan
export const listByWeekPlan = query({
  args: { weekPlanId: v.id("weekPlans") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("groceryItems")
      .withIndex("by_week_plan", (q) => q.eq("weekPlanId", args.weekPlanId))
      .collect();
  },
});

// Add a new grocery item
export const add = mutation({
  args: {
    name: v.string(),
    quantity: v.optional(v.string()),
    storeId: v.id("stores"),
    category: v.string(),
    isOrganic: v.boolean(),
    linkedMealIds: v.optional(v.array(v.id("plannedMeals"))),
    weekPlanId: v.optional(v.id("weekPlans")),
  },
  handler: async (ctx, args) => {
    // Get existing items in this store to determine sortOrder
    const storeItems = await ctx.db
      .query("groceryItems")
      .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
      .collect();

    // Find the maximum sortOrder and add 1000
    const maxOrder = storeItems.reduce((max, item) => {
      const order = item.sortOrder ?? 0;
      return order > max ? order : max;
    }, 0);

    return await ctx.db.insert("groceryItems", {
      ...args,
      isChecked: false,
      sortOrder: maxOrder + 1000,
    });
  },
});

// Toggle checked status
export const toggleChecked = mutation({
  args: { id: v.id("groceryItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");

    await ctx.db.patch(args.id, { isChecked: !item.isChecked });
    return { isChecked: !item.isChecked };
  },
});

// Update a grocery item
export const update = mutation({
  args: {
    id: v.id("groceryItems"),
    name: v.optional(v.string()),
    quantity: v.optional(v.string()),
    storeId: v.optional(v.id("stores")),
    category: v.optional(v.string()),
    isOrganic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(filteredUpdates).length > 0) {
      await ctx.db.patch(id, filteredUpdates);
    }
    return await ctx.db.get(id);
  },
});

// Delete a grocery item
export const remove = mutation({
  args: { id: v.id("groceryItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Delete all checked items
export const clearChecked = mutation({
  args: {},
  handler: async (ctx) => {
    const checkedItems = await ctx.db
      .query("groceryItems")
      .withIndex("by_checked", (q) => q.eq("isChecked", true))
      .collect();

    for (const item of checkedItems) {
      await ctx.db.delete(item._id);
    }

    return { deletedCount: checkedItems.length };
  },
});

// Reorder an item within a store (or move to a different store)
// beforeId: the item this should appear before (null = move to end of store)
export const reorder = mutation({
  args: {
    id: v.id("groceryItems"),
    storeId: v.optional(v.id("stores")),
    beforeId: v.optional(v.union(v.id("groceryItems"), v.null())),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");

    // Determine the target store (use provided or keep current)
    const targetStoreId = args.storeId ?? item.storeId;

    // Get all items in the target store, sorted by sortOrder
    const storeItems = await ctx.db
      .query("groceryItems")
      .withIndex("by_store", (q) => q.eq("storeId", targetStoreId))
      .collect();

    // Sort by sortOrder (nulls at end)
    storeItems.sort((a, b) => {
      const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });

    // Remove the item being moved from the list (if it's already in this store)
    const filteredItems = storeItems.filter((i) => i._id !== args.id);

    // Calculate new sortOrder
    let newSortOrder: number;

    if (args.beforeId === null || args.beforeId === undefined) {
      // Move to end of list
      const lastItem = filteredItems[filteredItems.length - 1];
      newSortOrder = lastItem ? (lastItem.sortOrder ?? 0) + 1000 : 1000;
    } else {
      // Insert before the specified item
      const beforeIndex = filteredItems.findIndex((i) => i._id === args.beforeId);
      if (beforeIndex === -1) {
        // beforeId not found, append to end
        const lastItem = filteredItems[filteredItems.length - 1];
        newSortOrder = lastItem ? (lastItem.sortOrder ?? 0) + 1000 : 1000;
      } else if (beforeIndex === 0) {
        // Insert at beginning
        const firstItem = filteredItems[0];
        newSortOrder = (firstItem?.sortOrder ?? 1000) / 2;
      } else {
        // Insert between two items
        const prevItem = filteredItems[beforeIndex - 1];
        const nextItem = filteredItems[beforeIndex];
        const prevOrder = prevItem?.sortOrder ?? 0;
        const nextOrder = nextItem?.sortOrder ?? prevOrder + 2000;
        newSortOrder = (prevOrder + nextOrder) / 2;
      }
    }

    // Update the item with new store and sortOrder
    await ctx.db.patch(args.id, {
      storeId: targetStoreId,
      sortOrder: newSortOrder,
    });

    return await ctx.db.get(args.id);
  },
});
