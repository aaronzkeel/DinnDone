import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Save a push subscription for the current user
 */
export const save = mutation({
  args: {
    endpoint: v.string(),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if subscription already exists
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (existing) {
      // Update existing subscription
      await ctx.db.patch(existing._id, {
        userId,
        keys: args.keys,
      });
      return existing._id;
    }

    // Create new subscription
    const subscriptionId = await ctx.db.insert("pushSubscriptions", {
      userId,
      endpoint: args.endpoint,
      keys: args.keys,
      createdAt: new Date().toISOString(),
    });

    return subscriptionId;
  },
});

/**
 * Remove a push subscription
 */
export const remove = mutation({
  args: {
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const subscription = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (subscription && subscription.userId === userId) {
      await ctx.db.delete(subscription._id);
      return true;
    }

    return false;
  },
});

/**
 * Get the current user's push subscription
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const subscription = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return subscription;
  },
});

/**
 * Check if the current user has a push subscription
 */
export const hasSubscription = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    const subscription = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return subscription !== null;
  },
});
