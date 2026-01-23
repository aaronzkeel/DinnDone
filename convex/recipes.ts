import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Reusable ingredient validator
const ingredientValidator = v.object({
  name: v.string(),
  quantity: v.string(),
  isOrganic: v.optional(v.boolean()),
});

// Get all recipes
export const list = query({
  args: {},
  handler: async (ctx) => {
    const recipes = await ctx.db.query("recipes").collect();
    return recipes;
  },
});

// Search recipes by name (partial match, case-insensitive)
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const allRecipes = await ctx.db.query("recipes").collect();
    const searchTerm = args.query.toLowerCase();

    return allRecipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(searchTerm)
    );
  },
});

// Get a single recipe by ID
export const get = query({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new recipe (dedupes by name - returns existing if found)
export const create = mutation({
  args: {
    name: v.string(),
    effortTier: v.union(v.literal("easy"), v.literal("medium"), v.literal("involved")),
    prepTime: v.number(),
    cookTime: v.number(),
    cleanupRating: v.union(v.literal(1), v.literal(2), v.literal(3)),
    ingredients: v.array(ingredientValidator),
    steps: v.array(v.string()),
    isFlexMeal: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check for existing recipe with same name (case-insensitive)
    const existingRecipes = await ctx.db
      .query("recipes")
      .withIndex("by_name")
      .collect();

    const normalizedName = args.name.toLowerCase().trim();
    const existing = existingRecipes.find(
      (r) => r.name.toLowerCase().trim() === normalizedName
    );

    if (existing) {
      return { id: existing._id, created: false, existing: true };
    }

    const id = await ctx.db.insert("recipes", {
      name: args.name,
      effortTier: args.effortTier,
      prepTime: args.prepTime,
      cookTime: args.cookTime,
      cleanupRating: args.cleanupRating,
      ingredients: args.ingredients,
      steps: args.steps,
      isFlexMeal: args.isFlexMeal,
    });

    return { id, created: true, existing: false };
  },
});

// Update an existing recipe
export const update = mutation({
  args: {
    id: v.id("recipes"),
    name: v.optional(v.string()),
    effortTier: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("involved"))),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    cleanupRating: v.optional(v.union(v.literal(1), v.literal(2), v.literal(3))),
    ingredients: v.optional(v.array(ingredientValidator)),
    steps: v.optional(v.array(v.string())),
    isFlexMeal: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Verify recipe exists
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Recipe not found");
    }

    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    await ctx.db.patch(id, cleanUpdates);
    return { success: true };
  },
});

// Delete a recipe
export const remove = mutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Recipe not found");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});
