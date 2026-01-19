import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all stores
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("stores").collect();
  },
});

// Get a store by ID
export const get = query({
  args: { id: v.id("stores") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Add a new store
export const add = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("stores", args);
  },
});

// Update a store
export const update = mutation({
  args: {
    id: v.id("stores"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(filteredUpdates).length > 0) {
      await ctx.db.patch(id, filteredUpdates);
    }
    return await ctx.db.get(id);
  },
});

// Delete a store
export const remove = mutation({
  args: { id: v.id("stores") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Seed default stores (only if empty)
export const seedDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("stores").first();
    if (existing) {
      return { seeded: false, message: "Stores already exist" };
    }

    const defaultStores = [
      { name: "Meijer", color: "#4A90D9" },
      { name: "Costco", color: "#E31837" },
      { name: "Aldi", color: "#00A0DF" },
      { name: "Trader Joe's", color: "#C10230" },
    ];

    const ids = [];
    for (const store of defaultStores) {
      const id = await ctx.db.insert("stores", store);
      ids.push(id);
    }

    return { seeded: true, count: ids.length, ids };
  },
});
