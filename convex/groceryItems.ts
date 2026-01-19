import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all grocery items
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("groceryItems").collect();
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
    return await ctx.db.insert("groceryItems", {
      ...args,
      isChecked: false,
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
