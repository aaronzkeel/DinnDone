import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all week plans
export const list = query({
  args: {},
  handler: async (ctx) => {
    const weekPlans = await ctx.db.query("weekPlans").order("asc").collect();
    return weekPlans;
  },
});

// Get a specific week plan by ID
export const get = query({
  args: { id: v.id("weekPlans") },
  handler: async (ctx, args) => {
    const weekPlan = await ctx.db.get(args.id);
    return weekPlan;
  },
});

// Get week plan by start date
export const getByWeekStart = query({
  args: { weekStart: v.string() },
  handler: async (ctx, args) => {
    const weekPlan = await ctx.db
      .query("weekPlans")
      .withIndex("by_week_start", (q) => q.eq("weekStart", args.weekStart))
      .first();
    return weekPlan;
  },
});

// Get meals for a week plan
export const getMeals = query({
  args: { weekPlanId: v.id("weekPlans") },
  handler: async (ctx, args) => {
    const meals = await ctx.db
      .query("plannedMeals")
      .withIndex("by_week_plan", (q) => q.eq("weekPlanId", args.weekPlanId))
      .collect();
    return meals;
  },
});

// Get a week plan with its meals (combined query for convenience)
export const getWithMeals = query({
  args: { id: v.id("weekPlans") },
  handler: async (ctx, args) => {
    const weekPlan = await ctx.db.get(args.id);
    if (!weekPlan) return null;

    const meals = await ctx.db
      .query("plannedMeals")
      .withIndex("by_week_plan", (q) => q.eq("weekPlanId", args.id))
      .collect();

    return {
      ...weekPlan,
      meals,
    };
  },
});

// Create a new week plan
export const create = mutation({
  args: {
    weekStart: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("approved"),
      v.literal("in-progress"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("weekPlans", {
      weekStart: args.weekStart,
      status: args.status,
    });
    return id;
  },
});

// Update week plan status
export const updateStatus = mutation({
  args: {
    id: v.id("weekPlans"),
    status: v.union(
      v.literal("draft"),
      v.literal("approved"),
      v.literal("in-progress"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
    });
    return { success: true };
  },
});

// Add a meal to a week plan
export const addMeal = mutation({
  args: {
    weekPlanId: v.id("weekPlans"),
    date: v.string(),
    dayOfWeek: v.string(),
    name: v.string(),
    effortTier: v.union(v.literal("easy"), v.literal("medium"), v.literal("involved")),
    prepTime: v.number(),
    cookTime: v.number(),
    cleanupRating: v.union(v.literal(1), v.literal(2), v.literal(3)),
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
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("plannedMeals", {
      weekPlanId: args.weekPlanId,
      date: args.date,
      dayOfWeek: args.dayOfWeek,
      name: args.name,
      effortTier: args.effortTier,
      prepTime: args.prepTime,
      cookTime: args.cookTime,
      cleanupRating: args.cleanupRating,
      cookId: args.cookId,
      eaterIds: args.eaterIds,
      ingredients: args.ingredients,
      steps: args.steps,
      isFlexMeal: args.isFlexMeal,
    });
    return id;
  },
});

// Update a meal
export const updateMeal = mutation({
  args: {
    id: v.id("plannedMeals"),
    name: v.optional(v.string()),
    effortTier: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("involved"))),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    cleanupRating: v.optional(v.union(v.literal(1), v.literal(2), v.literal(3))),
    cookId: v.optional(v.id("householdMembers")),
    eaterIds: v.optional(v.array(v.id("householdMembers"))),
    ingredients: v.optional(
      v.array(
        v.object({
          name: v.string(),
          quantity: v.string(),
          isOrganic: v.optional(v.boolean()),
        })
      )
    ),
    steps: v.optional(v.array(v.string())),
    isFlexMeal: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    await ctx.db.patch(id, cleanUpdates);
    return { success: true };
  },
});

// Delete a meal
export const deleteMeal = mutation({
  args: { id: v.id("plannedMeals") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Delete a week plan and all its meals
export const deleteWeekPlan = mutation({
  args: { id: v.id("weekPlans") },
  handler: async (ctx, args) => {
    // First delete all meals in this week plan
    const meals = await ctx.db
      .query("plannedMeals")
      .withIndex("by_week_plan", (q) => q.eq("weekPlanId", args.id))
      .collect();

    for (const meal of meals) {
      await ctx.db.delete(meal._id);
    }

    // Then delete the week plan
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
