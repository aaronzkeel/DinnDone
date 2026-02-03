import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const effortPreference = v.union(
  v.literal("super-easy"),
  v.literal("middle"),
  v.literal("more-prep"),
  v.literal("mixed")
);

const onboardingType = v.union(
  v.literal("quick"),
  v.literal("conversational"),
  v.literal("skipped")
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
 * Check if user has completed (or skipped) onboarding
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

    // Allow through if completed OR skipped
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
    onboardingType: v.optional(onboardingType),
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
      onboardingType: args.onboardingType,
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
 * Skip onboarding (user can come back later)
 */
export const skipOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to skip onboarding");
    }

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const data = {
      onboardingCompleted: true,
      onboardingCompletedAt: new Date().toISOString(),
      onboardingType: "skipped" as const,
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

/**
 * Admin: Reset all onboarding data (dev only)
 */
export const adminResetAllOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    // Reset all userPreferences
    const allPrefs = await ctx.db.query("userPreferences").collect();
    for (const pref of allPrefs) {
      await ctx.db.patch(pref._id, {
        onboardingCompleted: false,
        onboardingCompletedAt: undefined,
        onboardingType: undefined,
      });
    }

    // Delete all onboarding conversations
    const allConvs = await ctx.db.query("onboardingConversations").collect();
    for (const conv of allConvs) {
      await ctx.db.delete(conv._id);
    }

    // Delete all family profiles
    const allProfiles = await ctx.db.query("familyProfiles").collect();
    for (const profile of allProfiles) {
      await ctx.db.delete(profile._id);
    }

    // Delete all household members
    const allMembers = await ctx.db.query("householdMembers").collect();
    for (const member of allMembers) {
      await ctx.db.delete(member._id);
    }

    // Delete all stores
    const allStores = await ctx.db.query("stores").collect();
    for (const store of allStores) {
      await ctx.db.delete(store._id);
    }

    return {
      reset: {
        preferences: allPrefs.length,
        conversations: allConvs.length,
        profiles: allProfiles.length,
        members: allMembers.length,
        stores: allStores.length,
      },
    };
  },
});
