import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Validator for notification types (matching schema.ts)
const notificationType = v.union(
  v.literal("daily-brief"),
  v.literal("strategic-pivot"),
  v.literal("thaw-guardian"),
  v.literal("weekly-plan-ready"),
  v.literal("inventory-sos"),
  v.literal("leftover-check"),
  v.literal("cook-reminder")
);

// Note: notificationStatus validator is defined in schema.ts
// Kept here for reference but not needed since we use literal values directly

/**
 * Get all notifications for the current user, sorted by timestamp (newest first)
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return notifications;
  },
});

/**
 * Get pending notifications for the current user
 */
export const listPending = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", userId).eq("status", "pending")
      )
      .order("desc")
      .collect();

    return notifications;
  },
});

/**
 * Create a new notification for a user
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    type: notificationType,
    message: v.string(),
    actions: v.array(
      v.object({
        id: v.string(),
        label: v.string(),
        isPrimary: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      message: args.message,
      timestamp: new Date().toISOString(),
      status: "pending",
      actions: args.actions,
    });

    return notificationId;
  },
});

/**
 * Create a notification for the current authenticated user
 */
export const createForSelf = mutation({
  args: {
    type: notificationType,
    message: v.string(),
    actions: v.array(
      v.object({
        id: v.string(),
        label: v.string(),
        isPrimary: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const notificationId = await ctx.db.insert("notifications", {
      userId,
      type: args.type,
      message: args.message,
      timestamp: new Date().toISOString(),
      status: "pending",
      actions: args.actions,
    });

    return notificationId;
  },
});

/**
 * Mark a notification as done with the action taken
 */
export const markDone = mutation({
  args: {
    notificationId: v.id("notifications"),
    actionId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    // Security: Only allow modifying own notifications
    if (notification.userId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.notificationId, {
      status: "done",
      resolvedAt: new Date().toISOString(),
      resolvedAction: args.actionId,
    });
  },
});

/**
 * Dismiss a notification
 */
export const dismiss = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    // Security: Only allow modifying own notifications
    if (notification.userId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.notificationId, {
      status: "dismissed",
      resolvedAt: new Date().toISOString(),
    });
  },
});

/**
 * Delete a notification (for testing/cleanup)
 */
export const remove = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    // Security: Only allow deleting own notifications
    if (notification.userId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.notificationId);
  },
});
