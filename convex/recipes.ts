import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Reusable validators
const ingredientValidator = v.object({
  name: v.string(),
  quantity: v.string(),
  unit: v.optional(v.string()),
  isOrganic: v.optional(v.boolean()),
});

const effortTierValidator = v.union(
  v.literal("super-easy"),
  v.literal("middle"),
  v.literal("more-prep")
);

const cleanupRatingValidator = v.union(
  v.literal(1),
  v.literal(2),
  v.literal(3)
);

const sourceValidator = v.union(
  v.literal("ai"),
  v.literal("manual"),
  v.literal("scanned")
);

const sourceConfidenceValidator = v.object({
  title: v.number(),
  ingredients: v.number(),
  steps: v.number(),
});

// Get all recipes (sorted by most recent)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const recipes = await ctx.db.query("recipes").collect();
    // Sort by updatedAt or createdAt, newest first
    return recipes.sort((a, b) => {
      const aTime = a.updatedAt || a.createdAt || 0;
      const bTime = b.updatedAt || b.createdAt || 0;
      return bTime - aTime;
    });
  },
});

// Search recipes by name and optional filters
export const search = query({
  args: {
    query: v.optional(v.string()),
    effortTier: v.optional(effortTierValidator),
    source: v.optional(sourceValidator),
    cuisineTag: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let recipes = await ctx.db.query("recipes").collect();

    // Filter by search query (name match)
    if (args.query && args.query.trim()) {
      const searchTerm = args.query.toLowerCase().trim();
      recipes = recipes.filter((recipe) =>
        recipe.name.toLowerCase().includes(searchTerm) ||
        (recipe.description && recipe.description.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by effort tier
    if (args.effortTier) {
      recipes = recipes.filter((recipe) => recipe.effortTier === args.effortTier);
    }

    // Filter by source
    if (args.source) {
      recipes = recipes.filter((recipe) => recipe.source === args.source);
    }

    // Filter by cuisine tag
    if (args.cuisineTag) {
      const tag = args.cuisineTag.toLowerCase();
      recipes = recipes.filter((recipe) =>
        recipe.cuisineTags && recipe.cuisineTags.some((t) => t.toLowerCase() === tag)
      );
    }

    // Sort by updatedAt or createdAt, newest first
    return recipes.sort((a, b) => {
      const aTime = a.updatedAt || a.createdAt || 0;
      const bTime = b.updatedAt || b.createdAt || 0;
      return bTime - aTime;
    });
  },
});

// Get a single recipe by ID
export const get = query({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new recipe (enhanced with all fields)
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    effortTier: effortTierValidator,
    prepTime: v.number(),
    cookTime: v.number(),
    cleanupRating: cleanupRatingValidator,
    ingredients: v.array(ingredientValidator),
    steps: v.array(v.string()),
    isFlexMeal: v.optional(v.boolean()),
    cuisineTags: v.optional(v.array(v.string())),
    photoUrl: v.optional(v.string()),
    source: v.optional(sourceValidator),
    sourceConfidence: v.optional(sourceConfidenceValidator),
    notes: v.optional(v.string()),
    dedupe: v.optional(v.boolean()), // If true, check for existing recipe
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Optional deduplication by name
    if (args.dedupe) {
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
    }

    const { dedupe, ...recipeData } = args;
    const id = await ctx.db.insert("recipes", {
      ...recipeData,
      createdAt: now,
      updatedAt: now,
    });

    return { id, created: true, existing: false };
  },
});

// Update an existing recipe
export const update = mutation({
  args: {
    id: v.id("recipes"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    effortTier: v.optional(effortTierValidator),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    cleanupRating: v.optional(cleanupRatingValidator),
    ingredients: v.optional(v.array(ingredientValidator)),
    steps: v.optional(v.array(v.string())),
    isFlexMeal: v.optional(v.boolean()),
    cuisineTags: v.optional(v.array(v.string())),
    photoUrl: v.optional(v.string()),
    source: v.optional(sourceValidator),
    sourceConfidence: v.optional(sourceConfidenceValidator),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Verify recipe exists
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Recipe not found");
    }

    // Filter out undefined values and add updatedAt
    const cleanUpdates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

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

// Save a meal plan suggestion to the recipe library
export const saveFromMealPlan = mutation({
  args: {
    name: v.string(),
    effortTier: effortTierValidator,
    prepTime: v.number(),
    cookTime: v.number(),
    cleanupRating: cleanupRatingValidator,
    ingredients: v.array(ingredientValidator),
    steps: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check for existing recipe
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
      ...args,
      source: "ai",
      createdAt: now,
      updatedAt: now,
    });

    return { id, created: true, existing: false };
  },
});

