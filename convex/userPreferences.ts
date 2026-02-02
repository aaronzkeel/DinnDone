import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const effortPreference = v.union(
  v.literal("super-easy"),
  v.literal("middle"),
  v.literal("more-prep"),
  v.literal("mixed")
);

/**
 * Get user preferences for current user
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return prefs;
  },
});

/**
 * Check if user has completed onboarding
 */
export const hasCompletedOnboarding = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return prefs?.onboardingCompleted ?? false;
  },
});

/**
 * Mark onboarding as completed
 */
export const completeOnboarding = mutation({
  args: {
    dietaryRestrictions: v.optional(v.array(v.string())),
    effortPreference: v.optional(effortPreference),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to complete onboarding");
    }

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const data = {
      onboardingCompleted: true,
      onboardingCompletedAt: new Date().toISOString(),
      dietaryRestrictions: args.dietaryRestrictions,
      effortPreference: args.effortPreference,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("userPreferences", {
        userId,
        ...data,
      });
    }
  },
});

/**
 * Update user preferences
 */
export const update = mutation({
  args: {
    dietaryRestrictions: v.optional(v.array(v.string())),
    effortPreference: v.optional(effortPreference),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to update preferences");
    }

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Filter out undefined values
    const updates: Record<string, unknown> = {};
    if (args.dietaryRestrictions !== undefined) {
      updates.dietaryRestrictions = args.dietaryRestrictions;
    }
    if (args.effortPreference !== undefined) {
      updates.effortPreference = args.effortPreference;
    }

    if (existing) {
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    } else {
      return await ctx.db.insert("userPreferences", {
        userId,
        onboardingCompleted: false,
        ...updates,
      });
    }
  },
});

/**
 * Reset onboarding status (for redo setup)
 */
export const resetOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to reset onboarding");
    }

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        onboardingCompleted: false,
        onboardingCompletedAt: undefined,
      });
    }
  },
});
