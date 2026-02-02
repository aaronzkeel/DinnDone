import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// Reusable validators
// User-friendly effort tier values
const effortTier = v.union(
  v.literal("super-easy"),
  v.literal("middle"),
  v.literal("more-prep")
);

const cleanupRating = v.union(v.literal(1), v.literal(2), v.literal(3));

const weekPlanStatus = v.union(
  v.literal("draft"),
  v.literal("approved"),
  v.literal("in-progress"),
  v.literal("completed")
);

const notificationType = v.union(
  v.literal("daily-brief"),
  v.literal("strategic-pivot"),
  v.literal("thaw-guardian"),
  v.literal("weekly-plan-ready"),
  v.literal("inventory-sos"),
  v.literal("leftover-check"),
  v.literal("cook-reminder")
);

const notificationStatus = v.union(
  v.literal("pending"),
  v.literal("done"),
  v.literal("dismissed")
);

const fandomVoice = v.union(
  v.literal("default"),
  v.literal("samwise"),
  v.literal("nacho-libre"),
  v.literal("the-office"),
  v.literal("star-wars"),
  v.literal("harry-potter")
);

const pantryLocation = v.union(
  v.literal("fridge"),
  v.literal("freezer"),
  v.literal("pantry")
);

const schema = defineSchema({
  ...authTables,

  // Extended user profile
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  }).index("email", ["email"]),

  // HouseholdMember - a person in the household
  householdMembers: defineTable({
    userId: v.optional(v.id("users")), // links to auth user if they have an account
    name: v.string(),
    isAdmin: v.boolean(),
    avatarUrl: v.optional(v.string()),
    dietaryPreferences: v.optional(v.array(v.string())),
  }).index("by_user", ["userId"]),

  // Store - shopping locations
  stores: defineTable({
    name: v.string(),
    color: v.optional(v.string()),
  }),

  // WeekPlan - a 7-day meal plan
  weekPlans: defineTable({
    weekStart: v.string(), // ISO date string (YYYY-MM-DD)
    status: weekPlanStatus,
    approvedBy: v.optional(v.id("householdMembers")), // Who approved the plan
    approvedAt: v.optional(v.string()), // ISO timestamp when approved
  }).index("by_week_start", ["weekStart"]),

  // PlannedMeal - a meal scheduled for a specific date
  plannedMeals: defineTable({
    weekPlanId: v.id("weekPlans"),
    date: v.string(), // ISO date string
    dayOfWeek: v.string(),
    name: v.string(),
    effortTier: effortTier,
    prepTime: v.number(), // minutes
    cookTime: v.number(), // minutes
    cleanupRating: cleanupRating,
    cookId: v.id("householdMembers"),
    eaterIds: v.array(v.id("householdMembers")),
    ingredients: v.array(
      v.object({
        name: v.string(),
        quantity: v.string(),
        isOrganic: v.optional(v.boolean()),
      })
    ),
    steps: v.array(v.string()),
    isFlexMeal: v.optional(v.boolean()),
    recipeId: v.optional(v.id("recipes")), // optional link to saved recipe
  })
    .index("by_week_plan", ["weekPlanId"])
    .index("by_date", ["date"]),

  // Recipe - reusable meal templates
  recipes: defineTable({
    name: v.string(),
    effortTier: effortTier,
    prepTime: v.number(),
    cookTime: v.number(),
    cleanupRating: cleanupRating,
    ingredients: v.array(
      v.object({
        name: v.string(),
        quantity: v.string(),
        isOrganic: v.optional(v.boolean()),
      })
    ),
    steps: v.array(v.string()),
    isFlexMeal: v.optional(v.boolean()),
  }).index("by_name", ["name"]),

  // GroceryItem - items on the shopping list
  groceryItems: defineTable({
    name: v.string(),
    quantity: v.optional(v.string()),
    storeId: v.optional(v.id("stores")), // undefined = unassigned
    category: v.string(),
    isOrganic: v.boolean(),
    isChecked: v.boolean(),
    linkedMealIds: v.optional(v.array(v.id("plannedMeals"))),
    weekPlanId: v.optional(v.id("weekPlans")), // which week this item is for
    sortOrder: v.optional(v.number()), // order within the store (lower = higher up)
  })
    .index("by_store", ["storeId"])
    .index("by_store_order", ["storeId", "sortOrder"])
    .index("by_week_plan", ["weekPlanId"])
    .index("by_checked", ["isChecked"]),

  // PantryItem - current inventory
  pantryItems: defineTable({
    name: v.string(),
    location: pantryLocation,
    quantity: v.optional(v.string()),
  }).index("by_location", ["location"]),

  // Notification - individual nudges
  notifications: defineTable({
    userId: v.id("users"),
    type: notificationType,
    message: v.string(),
    timestamp: v.string(), // ISO timestamp
    status: notificationStatus,
    actions: v.array(
      v.object({
        id: v.string(),
        label: v.string(),
        isPrimary: v.boolean(),
      })
    ),
    resolvedAt: v.optional(v.string()),
    resolvedAction: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["userId", "status"]),

  // NotificationPreferences - per-user settings
  notificationPreferences: defineTable({
    userId: v.id("users"),
    enabledTypes: v.array(notificationType),
    quietHoursStart: v.string(), // HH:MM format
    quietHoursEnd: v.string(),
    fandomVoice: fandomVoice,
    pushEnabled: v.boolean(),
    crisisDayMute: v.optional(
      v.object({
        isActive: v.boolean(),
        expiresAt: v.optional(v.string()),
      })
    ),
  }).index("by_user", ["userId"]),

  // PushSubscription - stores browser push notification subscriptions
  pushSubscriptions: defineTable({
    userId: v.id("users"),
    endpoint: v.string(),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
    createdAt: v.string(), // ISO timestamp
  })
    .index("by_user", ["userId"])
    .index("by_endpoint", ["endpoint"]),
});

export default schema;
