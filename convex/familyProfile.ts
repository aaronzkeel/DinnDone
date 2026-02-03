import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Validators for family profile fields
const locationValidator = v.object({
  city: v.optional(v.string()),
  region: v.optional(v.string()),
});

const budgetLevel = v.union(
  v.literal("budget-conscious"),
  v.literal("moderate"),
  v.literal("flexible")
);

const shoppingPreferencesValidator = v.object({
  primaryStores: v.optional(v.array(v.string())),
  frequency: v.optional(v.string()),
  budgetLevel: v.optional(budgetLevel),
  bulkBuying: v.optional(v.boolean()),
});

const healthContextValidator = v.object({
  conditions: v.optional(v.array(v.string())),
  dietaryRestrictions: v.optional(v.array(v.string())),
  foodValues: v.optional(v.array(v.string())),
  allergies: v.optional(v.array(v.string())),
});

const familyDynamicsValidator = v.object({
  primaryCook: v.optional(v.string()),
  pickyEaters: v.optional(v.array(v.string())),
  kidsAges: v.optional(v.array(v.number())),
  mealSchedule: v.optional(v.string()),
});

const energyLevel = v.union(
  v.literal("low"),
  v.literal("variable"),
  v.literal("good")
);

const cookingCapacityValidator = v.object({
  energyLevel: v.optional(energyLevel),
  weeknightMinutes: v.optional(v.number()),
  weekendFlexibility: v.optional(v.boolean()),
  batchCooking: v.optional(v.boolean()),
});

/**
 * Get family profile for current user
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const profile = await ctx.db
      .query("familyProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return profile;
  },
});

/**
 * Get just the zyloNotes for context injection (lightweight query)
 */
export const getZyloNotes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const profile = await ctx.db
      .query("familyProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return profile?.zyloNotes ?? null;
  },
});

/**
 * Create or update family profile
 */
export const upsert = mutation({
  args: {
    location: v.optional(locationValidator),
    shoppingPreferences: v.optional(shoppingPreferencesValidator),
    healthContext: v.optional(healthContextValidator),
    familyDynamics: v.optional(familyDynamicsValidator),
    cookingCapacity: v.optional(cookingCapacityValidator),
    zyloNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to update family profile");
    }

    const now = new Date().toISOString();
    const existing = await ctx.db
      .query("familyProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      // Update existing profile
      const updates: Record<string, unknown> = { updatedAt: now };

      if (args.location !== undefined) updates.location = args.location;
      if (args.shoppingPreferences !== undefined)
        updates.shoppingPreferences = args.shoppingPreferences;
      if (args.healthContext !== undefined)
        updates.healthContext = args.healthContext;
      if (args.familyDynamics !== undefined)
        updates.familyDynamics = args.familyDynamics;
      if (args.cookingCapacity !== undefined)
        updates.cookingCapacity = args.cookingCapacity;
      if (args.zyloNotes !== undefined) updates.zyloNotes = args.zyloNotes;

      await ctx.db.patch(existing._id, updates);
      return existing._id;
    } else {
      // Create new profile
      return await ctx.db.insert("familyProfiles", {
        userId,
        location: args.location,
        shoppingPreferences: args.shoppingPreferences,
        healthContext: args.healthContext,
        familyDynamics: args.familyDynamics,
        cookingCapacity: args.cookingCapacity,
        zyloNotes: args.zyloNotes,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

/**
 * Update only the zyloNotes field (called after AI extraction)
 */
export const updateZyloNotes = mutation({
  args: {
    zyloNotes: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to update zylo notes");
    }

    const now = new Date().toISOString();
    const existing = await ctx.db
      .query("familyProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        zyloNotes: args.zyloNotes,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create minimal profile with just zyloNotes
      return await ctx.db.insert("familyProfiles", {
        userId,
        zyloNotes: args.zyloNotes,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

/**
 * Delete family profile (for redo onboarding)
 */
export const deleteProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to delete family profile");
    }

    const existing = await ctx.db
      .query("familyProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
