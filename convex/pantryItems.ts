import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const pantryLocation = v.union(
  v.literal("fridge"),
  v.literal("freezer"),
  v.literal("pantry")
);

/**
 * List all pantry items
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pantryItems").collect();
  },
});

/**
 * List pantry items by location
 */
export const listByLocation = query({
  args: { location: pantryLocation },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pantryItems")
      .withIndex("by_location", (q) => q.eq("location", args.location))
      .collect();
  },
});

/**
 * Add a new pantry item
 */
export const add = mutation({
  args: {
    name: v.string(),
    location: pantryLocation,
    quantity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pantryItems", {
      name: args.name,
      location: args.location,
      quantity: args.quantity,
    });
  },
});

/**
 * Update a pantry item
 */
export const update = mutation({
  args: {
    id: v.id("pantryItems"),
    name: v.optional(v.string()),
    location: v.optional(pantryLocation),
    quantity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Filter out undefined values
    const filteredUpdates: Record<string, string> = {};
    if (updates.name !== undefined) filteredUpdates.name = updates.name;
    if (updates.location !== undefined) filteredUpdates.location = updates.location;
    if (updates.quantity !== undefined) filteredUpdates.quantity = updates.quantity;

    if (Object.keys(filteredUpdates).length === 0) {
      return;
    }

    await ctx.db.patch(id, filteredUpdates);
  },
});

/**
 * Remove a pantry item
 */
export const remove = mutation({
  args: { id: v.id("pantryItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
