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

// Swap two meals (exchange their meal data, keep dates/days)
export const swapMeals = mutation({
  args: {
    mealId1: v.id("plannedMeals"),
    mealId2: v.id("plannedMeals"),
  },
  handler: async (ctx, args) => {
    const meal1 = await ctx.db.get(args.mealId1);
    const meal2 = await ctx.db.get(args.mealId2);

    if (!meal1 || !meal2) {
      throw new Error("One or both meals not found");
    }

    // Swap the meal content (name, effort, times, ingredients, etc.)
    // but keep the date, dayOfWeek, weekPlanId, cookId, and eaterIds
    await ctx.db.patch(args.mealId1, {
      name: meal2.name,
      effortTier: meal2.effortTier,
      prepTime: meal2.prepTime,
      cookTime: meal2.cookTime,
      cleanupRating: meal2.cleanupRating,
      ingredients: meal2.ingredients,
      steps: meal2.steps,
      isFlexMeal: meal2.isFlexMeal,
      recipeId: meal2.recipeId,
    });

    await ctx.db.patch(args.mealId2, {
      name: meal1.name,
      effortTier: meal1.effortTier,
      prepTime: meal1.prepTime,
      cookTime: meal1.cookTime,
      cleanupRating: meal1.cleanupRating,
      ingredients: meal1.ingredients,
      steps: meal1.steps,
      isFlexMeal: meal1.isFlexMeal,
      recipeId: meal1.recipeId,
    });

    return {
      success: true,
      swapped: {
        meal1: { id: args.mealId1, originalName: meal1.name, newName: meal2.name },
        meal2: { id: args.mealId2, originalName: meal2.name, newName: meal1.name },
      },
    };
  },
});

// Seed a sample week plan with meals for testing
export const seedSampleWeekPlan = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if a week plan already exists
    const existingPlans = await ctx.db.query("weekPlans").collect();
    if (existingPlans.length > 0) {
      // Check if the existing plan has meals
      const existingMeals = await ctx.db.query("plannedMeals").collect();
      if (existingMeals.length > 0) {
        return { seeded: false, message: "Week plan with meals already exists" };
      }
    }

    // Get or create a household member for the cook
    let cookId;
    const members = await ctx.db.query("householdMembers").collect();
    if (members.length > 0) {
      cookId = members[0]._id;
    } else {
      // Create a sample household member
      cookId = await ctx.db.insert("householdMembers", {
        name: "Sample Cook",
        isAdmin: true,
      });
    }

    // Get the start of the current week (Monday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    const weekStart = monday.toISOString().split("T")[0];

    // Create week plan if needed
    let weekPlanId;
    if (existingPlans.length > 0) {
      weekPlanId = existingPlans[0]._id;
    } else {
      weekPlanId = await ctx.db.insert("weekPlans", {
        weekStart,
        status: "approved",
      });
    }

    // Create sample meals for the week
    const sampleMeals = [
      {
        dayOfWeek: "Monday",
        name: "Chicken Stir Fry",
        effortTier: "medium" as const,
        prepTime: 20,
        cookTime: 15,
        cleanupRating: 2 as const,
        ingredients: [
          { name: "Chicken Breast", quantity: "1.5 lbs" },
          { name: "Broccoli", quantity: "2 cups" },
          { name: "Soy Sauce", quantity: "3 tbsp" },
          { name: "Bell Peppers", quantity: "2" },
          { name: "Garlic", quantity: "4 cloves" },
        ],
        steps: ["Slice chicken", "Prep vegetables", "Stir fry chicken", "Add vegetables", "Season and serve"],
        isFlexMeal: true,
      },
      {
        dayOfWeek: "Tuesday",
        name: "Taco Night",
        effortTier: "easy" as const,
        prepTime: 15,
        cookTime: 20,
        cleanupRating: 2 as const,
        ingredients: [
          { name: "Ground Beef", quantity: "1 lb" },
          { name: "Taco Shells", quantity: "12" },
          { name: "Lettuce", quantity: "1 head" },
          { name: "Tomatoes", quantity: "2" },
          { name: "Cheese", quantity: "1 cup" },
          { name: "Sour Cream", quantity: "0.5 cup" },
        ],
        steps: ["Brown the beef", "Season with taco spices", "Prep toppings", "Serve in shells"],
        isFlexMeal: false,
      },
      {
        dayOfWeek: "Wednesday",
        name: "Pasta Carbonara",
        effortTier: "medium" as const,
        prepTime: 10,
        cookTime: 25,
        cleanupRating: 1 as const,
        ingredients: [
          { name: "Spaghetti", quantity: "1 lb" },
          { name: "Bacon", quantity: "8 strips" },
          { name: "Eggs", quantity: "4" },
          { name: "Parmesan Cheese", quantity: "1 cup" },
          { name: "Black Pepper", quantity: "1 tsp" },
        ],
        steps: ["Boil pasta", "Crisp bacon", "Mix eggs and cheese", "Combine hot pasta with egg mixture", "Top with bacon"],
        isFlexMeal: true,
      },
    ];

    const mealIds = [];
    for (let i = 0; i < sampleMeals.length; i++) {
      const meal = sampleMeals[i];
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      const mealId = await ctx.db.insert("plannedMeals", {
        weekPlanId,
        date: dateStr,
        dayOfWeek: meal.dayOfWeek,
        name: meal.name,
        effortTier: meal.effortTier,
        prepTime: meal.prepTime,
        cookTime: meal.cookTime,
        cleanupRating: meal.cleanupRating,
        cookId,
        eaterIds: [cookId],
        ingredients: meal.ingredients,
        steps: meal.steps,
        isFlexMeal: meal.isFlexMeal,
      });
      mealIds.push(mealId);
    }

    return {
      seeded: true,
      weekPlanId,
      mealCount: mealIds.length,
      mealIds,
    };
  },
});
