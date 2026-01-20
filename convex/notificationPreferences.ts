import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const notificationTypeValidator = v.union(
  v.literal("daily-brief"),
  v.literal("strategic-pivot"),
  v.literal("thaw-guardian"),
  v.literal("weekly-plan-ready"),
  v.literal("inventory-sos"),
  v.literal("leftover-check"),
  v.literal("cook-reminder")
);

const fandomVoiceValidator = v.union(
  v.literal("default"),
  v.literal("samwise"),
  v.literal("nacho-libre"),
  v.literal("the-office"),
  v.literal("star-wars"),
  v.literal("harry-potter")
);

type NotificationTypeValue =
  | "daily-brief"
  | "strategic-pivot"
  | "thaw-guardian"
  | "weekly-plan-ready"
  | "inventory-sos"
  | "leftover-check"
  | "cook-reminder";

type FandomVoiceValue =
  | "default"
  | "samwise"
  | "nacho-libre"
  | "the-office"
  | "star-wars"
  | "harry-potter";

// Default preferences for new users
const defaultEnabledTypes: NotificationTypeValue[] = [
  "daily-brief",
  "strategic-pivot",
  "thaw-guardian",
  "weekly-plan-ready",
  "cook-reminder",
];

const defaultPreferences: {
  enabledTypes: NotificationTypeValue[];
  quietHoursStart: string;
  quietHoursEnd: string;
  fandomVoice: FandomVoiceValue;
  pushEnabled: boolean;
} = {
  enabledTypes: defaultEnabledTypes,
  quietHoursStart: "21:00",
  quietHoursEnd: "07:00",
  fandomVoice: "default",
  pushEnabled: true,
};

// Get preferences for current user (creates defaults if none exist)
export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      // Return defaults for unauthenticated users
      return {
        _id: null,
        userId: null,
        ...defaultPreferences,
        crisisDayMute: undefined,
      };
    }

    const prefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (prefs) {
      return prefs;
    }

    // Return default structure (will be created on first update)
    return {
      _id: null,
      userId,
      ...defaultPreferences,
      crisisDayMute: undefined,
    };
  },
});

// Update preferences (creates if doesn't exist)
export const update = mutation({
  args: {
    enabledTypes: v.optional(v.array(notificationTypeValidator)),
    quietHoursStart: v.optional(v.string()),
    quietHoursEnd: v.optional(v.string()),
    fandomVoice: v.optional(fandomVoiceValidator),
    pushEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to update preferences");
    }

    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(args).filter(([, value]) => value !== undefined)
    );

    // Check if preferences exist
    const existing = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, cleanUpdates);
      return await ctx.db.get(existing._id);
    } else {
      // Create new with defaults + updates
      const newPrefs = {
        userId,
        enabledTypes: defaultPreferences.enabledTypes ,
        quietHoursStart: defaultPreferences.quietHoursStart,
        quietHoursEnd: defaultPreferences.quietHoursEnd,
        fandomVoice: defaultPreferences.fandomVoice,
        pushEnabled: defaultPreferences.pushEnabled,
        ...cleanUpdates,
      };
      const id = await ctx.db.insert("notificationPreferences", newPrefs);
      return await ctx.db.get(id);
    }
  },
});

// Toggle crisis day mute
export const toggleCrisisMute = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to toggle crisis mute");
    }

    // Get or create preferences
    let prefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!prefs) {
      // Create preferences first
      const id = await ctx.db.insert("notificationPreferences", {
        userId,
        enabledTypes: defaultPreferences.enabledTypes ,
        quietHoursStart: defaultPreferences.quietHoursStart,
        quietHoursEnd: defaultPreferences.quietHoursEnd,
        fandomVoice: defaultPreferences.fandomVoice,
        pushEnabled: defaultPreferences.pushEnabled,
      });
      prefs = await ctx.db.get(id);
      if (!prefs) throw new Error("Failed to create preferences");
    }

    const currentMute = prefs.crisisDayMute;
    const isCurrentlyActive = currentMute?.isActive ?? false;

    const newMute = isCurrentlyActive
      ? { isActive: false }
      : {
          isActive: true,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };

    await ctx.db.patch(prefs._id, { crisisDayMute: newMute });

    return {
      crisisDayMute: newMute,
    };
  },
});

// Reset to defaults
export const resetToDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to reset preferences");
    }

    const existing = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const defaultData = {
      enabledTypes: defaultPreferences.enabledTypes ,
      quietHoursStart: defaultPreferences.quietHoursStart,
      quietHoursEnd: defaultPreferences.quietHoursEnd,
      fandomVoice: defaultPreferences.fandomVoice,
      pushEnabled: defaultPreferences.pushEnabled,
      crisisDayMute: undefined,
    };

    if (existing) {
      await ctx.db.patch(existing._id, defaultData);
      return await ctx.db.get(existing._id);
    } else {
      const id = await ctx.db.insert("notificationPreferences", {
        userId,
        ...defaultData,
      });
      return await ctx.db.get(id);
    }
  },
});
