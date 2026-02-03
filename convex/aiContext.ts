import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

/**
 * Internal query to get family profile for context building
 * Used by actions to fetch user context
 */
export const getFamilyProfile = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const profile = await ctx.db
      .query("familyProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return profile;
  },
});

/**
 * Internal query to get user preferences
 */
export const getUserPreferences = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return prefs;
  },
});

/**
 * Internal query to get user's stores
 */
export const getUserStores = internalQuery({
  args: {},
  handler: async (ctx) => {
    const stores = await ctx.db.query("stores").collect();
    return stores.map((s) => s.name);
  },
});
