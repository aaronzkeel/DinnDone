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

// Validator for fandom voice (matching schema.ts)
const fandomVoice = v.union(
  v.literal("default"),
  v.literal("samwise"),
  v.literal("nacho-libre"),
  v.literal("the-office"),
  v.literal("star-wars"),
  v.literal("harry-potter")
);

// Default notification preferences
const defaultEnabledTypes = [
  "daily-brief",
  "strategic-pivot",
  "thaw-guardian",
  "weekly-plan-ready",
  "cook-reminder",
] as const;

/**
 * Get notification preferences for the current user.
 * Returns defaults if no preferences have been set yet.
 */
export const getPreferences = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const preferences = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Return defaults if no preferences exist
    if (!preferences) {
      return {
        userId,
        enabledTypes: [...defaultEnabledTypes],
        quietHoursStart: "21:00",
        quietHoursEnd: "07:00",
        fandomVoice: "default" as const,
        pushEnabled: true,
        crisisDayMute: undefined,
      };
    }

    return preferences;
  },
});

/**
 * Get notification preferences for a specific user (admin use or testing).
 */
export const getPreferencesForUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const preferences = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // Return defaults if no preferences exist
    if (!preferences) {
      return {
        userId: args.userId,
        enabledTypes: [...defaultEnabledTypes],
        quietHoursStart: "21:00",
        quietHoursEnd: "07:00",
        fandomVoice: "default" as const,
        pushEnabled: true,
        crisisDayMute: undefined,
      };
    }

    return preferences;
  },
});

/**
 * Update notification preferences for the current user.
 * Creates preferences if they don't exist yet.
 */
export const updatePreferences = mutation({
  args: {
    enabledTypes: v.optional(v.array(notificationType)),
    quietHoursStart: v.optional(v.string()),
    quietHoursEnd: v.optional(v.string()),
    fandomVoice: v.optional(fandomVoice),
    pushEnabled: v.optional(v.boolean()),
    crisisDayMute: v.optional(
      v.object({
        isActive: v.boolean(),
        expiresAt: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if preferences exist
    const existingPrefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingPrefs) {
      // Update existing preferences
      const updates: Record<string, unknown> = {};
      if (args.enabledTypes !== undefined) updates.enabledTypes = args.enabledTypes;
      if (args.quietHoursStart !== undefined) updates.quietHoursStart = args.quietHoursStart;
      if (args.quietHoursEnd !== undefined) updates.quietHoursEnd = args.quietHoursEnd;
      if (args.fandomVoice !== undefined) updates.fandomVoice = args.fandomVoice;
      if (args.pushEnabled !== undefined) updates.pushEnabled = args.pushEnabled;
      if (args.crisisDayMute !== undefined) updates.crisisDayMute = args.crisisDayMute;

      await ctx.db.patch(existingPrefs._id, updates);
      return existingPrefs._id;
    } else {
      // Create new preferences with defaults merged with provided values
      const newPrefs = {
        userId,
        enabledTypes: args.enabledTypes ?? [...defaultEnabledTypes],
        quietHoursStart: args.quietHoursStart ?? "21:00",
        quietHoursEnd: args.quietHoursEnd ?? "07:00",
        fandomVoice: args.fandomVoice ?? ("default" as const),
        pushEnabled: args.pushEnabled ?? true,
        crisisDayMute: args.crisisDayMute,
      };

      return await ctx.db.insert("notificationPreferences", newPrefs);
    }
  },
});

/**
 * Reset notification preferences to defaults for the current user.
 */
export const resetPreferences = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if preferences exist
    const existingPrefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const defaultPrefs = {
      enabledTypes: [...defaultEnabledTypes],
      quietHoursStart: "21:00",
      quietHoursEnd: "07:00",
      fandomVoice: "default" as const,
      pushEnabled: true,
      crisisDayMute: undefined,
    };

    if (existingPrefs) {
      await ctx.db.patch(existingPrefs._id, defaultPrefs);
      return existingPrefs._id;
    } else {
      return await ctx.db.insert("notificationPreferences", {
        userId,
        ...defaultPrefs,
      });
    }
  },
});
