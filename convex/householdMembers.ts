import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all household members
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("householdMembers").collect();
  },
});

// Get a specific household member by ID
export const get = query({
  args: { id: v.id("householdMembers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get household member by user ID (for linking auth users)
export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("householdMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Seed the Zink family household members
export const seedZinkFamily = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if members already exist
    const existingMembers = await ctx.db.query("householdMembers").collect();
    if (existingMembers.length > 0) {
      return {
        success: false,
        message: "Household members already exist",
        count: existingMembers.length,
      };
    }

    // Zink family members
    const members = [
      { name: "Aaron", isAdmin: true, dietaryPreferences: [] },
      { name: "Katie", isAdmin: true, dietaryPreferences: [] },
      { name: "Lizzie", isAdmin: false, dietaryPreferences: [] },
      { name: "Ethan", isAdmin: false, dietaryPreferences: [] },
      { name: "Elijah", isAdmin: false, dietaryPreferences: [] },
    ];

    const insertedIds: string[] = [];
    for (const member of members) {
      const id = await ctx.db.insert("householdMembers", member);
      insertedIds.push(id);
    }

    return {
      success: true,
      message: "Zink family seeded successfully",
      count: insertedIds.length,
      ids: insertedIds,
    };
  },
});

// Create a new household member
export const create = mutation({
  args: {
    name: v.string(),
    isAdmin: v.boolean(),
    userId: v.optional(v.id("users")),
    avatarUrl: v.optional(v.string()),
    dietaryPreferences: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("householdMembers", {
      name: args.name,
      isAdmin: args.isAdmin,
      userId: args.userId,
      avatarUrl: args.avatarUrl,
      dietaryPreferences: args.dietaryPreferences ?? [],
    });
  },
});

// Update a household member
export const update = mutation({
  args: {
    id: v.id("householdMembers"),
    name: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
    avatarUrl: v.optional(v.string()),
    dietaryPreferences: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const member = await ctx.db.get(id);
    if (!member) {
      throw new Error("Household member not found");
    }

    const patchData: Partial<typeof member> = {};
    if (updates.name !== undefined) patchData.name = updates.name;
    if (updates.isAdmin !== undefined) patchData.isAdmin = updates.isAdmin;
    if (updates.avatarUrl !== undefined) patchData.avatarUrl = updates.avatarUrl;
    if (updates.dietaryPreferences !== undefined)
      patchData.dietaryPreferences = updates.dietaryPreferences;

    await ctx.db.patch(id, patchData);
    return { success: true };
  },
});

// Delete a household member
export const remove = mutation({
  args: { id: v.id("householdMembers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
