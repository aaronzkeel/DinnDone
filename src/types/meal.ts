// =============================================================================
// Canonical Meal Type - Single Source of Truth
// =============================================================================
// This file defines the canonical meal data structure that matches the Convex
// schema. All other meal representations should derive from or map to this type.
// =============================================================================

/**
 * Effort tier for a meal - how much work is involved
 */
export type EffortTier = "super-easy" | "middle" | "more-prep";

/**
 * Cleanup rating - stored as number in database, displayed as string in UI
 * Database: 1 | 2 | 3
 * UI: "low" | "medium" | "high"
 */
export type CleanupRatingNumeric = 1 | 2 | 3;
export type CleanupRatingDisplay = "low" | "medium" | "high";

/**
 * Mapping between numeric and display cleanup ratings
 */
export const cleanupRatingToDisplay: Record<CleanupRatingNumeric, CleanupRatingDisplay> = {
  1: "low",
  2: "medium",
  3: "high",
};

export const cleanupRatingToNumeric: Record<CleanupRatingDisplay, CleanupRatingNumeric> = {
  low: 1,
  medium: 2,
  high: 3,
};

/**
 * Ingredient with full details - matches Convex schema
 */
export interface Ingredient {
  name: string;
  quantity: string;
  isOrganic?: boolean;
}

/**
 * Canonical Meal type - matches Convex plannedMeals schema exactly
 *
 * This is the source of truth. When converting to UI types:
 * - Use cleanupRatingToDisplay() for the cleanup rating
 * - Preserve full ingredient objects, don't flatten to string[]
 * - Keep all fields, don't drop data
 */
export interface Meal {
  id: string;
  weekPlanId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  dayOfWeek: string;
  name: string;
  effortTier: EffortTier;
  prepTime: number; // minutes
  cookTime: number; // minutes
  cleanupRating: CleanupRatingNumeric; // 1 | 2 | 3
  cookId: string; // HouseholdMember id
  eaterIds: string[]; // HouseholdMember ids
  ingredients: Ingredient[];
  steps: string[];
  isFlexMeal: boolean;
  recipeId?: string; // Optional link to saved recipe
}

/**
 * Meal with display-friendly cleanup rating
 * Use this in UI components that need the string version
 */
export interface MealDisplay extends Omit<Meal, "cleanupRating"> {
  cleanupRating: CleanupRatingDisplay;
}

/**
 * Convert a Meal to MealDisplay (numeric cleanup rating -> string)
 */
export function toMealDisplay(meal: Meal): MealDisplay {
  return {
    ...meal,
    cleanupRating: cleanupRatingToDisplay[meal.cleanupRating],
  };
}

/**
 * Convert a MealDisplay back to Meal (string cleanup rating -> numeric)
 */
export function fromMealDisplay(meal: MealDisplay): Meal {
  return {
    ...meal,
    cleanupRating: cleanupRatingToNumeric[meal.cleanupRating],
  };
}

/**
 * Meal alternative suggestion from AI
 * Similar to Meal but without scheduling fields (weekPlanId, date, dayOfWeek, cookId, eaterIds)
 */
export interface MealSuggestion {
  id: string;
  name: string;
  effortTier: EffortTier;
  prepTime: number;
  cookTime: number;
  cleanupRating: CleanupRatingDisplay; // AI returns string format
  ingredients: Ingredient[];
  steps: string[];
  isFlexMeal: boolean;
  briefDescription?: string; // Short summary for swap UI
}

/**
 * Helper to flatten ingredients to just names (for simple display)
 * Use sparingly - prefer showing full ingredient info when possible
 */
export function getIngredientNames(ingredients: Ingredient[]): string[] {
  return ingredients.map((ing) => ing.name);
}

/**
 * Helper to format ingredient with quantity
 */
export function formatIngredient(ingredient: Ingredient): string {
  return `${ingredient.quantity} ${ingredient.name}`;
}
