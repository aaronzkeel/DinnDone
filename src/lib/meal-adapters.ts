/**
 * Adapters to convert between Convex schema types and UI types
 *
 * IMPORTANT: These adapters should PRESERVE all data from the source.
 * Do not flatten ingredient objects to strings or drop fields.
 */

import type { Doc, Id } from "../../convex/_generated/dataModel";
import type {
  Meal,
  MealDisplay,
  Ingredient,
  CleanupRatingNumeric,
  CleanupRatingDisplay,
} from "@/types/meal";
import {
  cleanupRatingToDisplay,
  cleanupRatingToNumeric,
  toMealDisplay,
} from "@/types/meal";
import type { HouseholdMember } from "@/types/meal-helper";
import type {
  PlannedMeal as WeeklyPlannedMeal,
  WeekSummary,
  WeekPlan,
  PlanStatus,
} from "@/types/weekly-planning";

// Import date utilities from the canonical source
import {
  formatDateLocal,
  getTodayString,
  getCurrentWeekStart,
  getTomorrowString,
} from "./dateUtils";

// Re-export date utilities for backwards compatibility
// New code should import directly from dateUtils.ts
export { formatDateLocal, getCurrentWeekStart, getTomorrowString };
export { getTodayString as getTodayDateString };

// Re-export the cleanup rating maps for backwards compatibility
export const cleanupRatingMap = cleanupRatingToDisplay;
export const cleanupRatingReverseMap = cleanupRatingToNumeric;

/**
 * Convert a Convex plannedMeal document to canonical Meal type
 * This preserves ALL data from the database
 */
export function toMeal(meal: Doc<"plannedMeals">): Meal {
  return {
    id: meal._id,
    weekPlanId: meal.weekPlanId,
    date: meal.date,
    dayOfWeek: meal.dayOfWeek,
    name: meal.name,
    effortTier: meal.effortTier,
    prepTime: meal.prepTime,
    cookTime: meal.cookTime,
    cleanupRating: meal.cleanupRating,
    cookId: meal.cookId,
    eaterIds: meal.eaterIds.map((id) => id as string),
    ingredients: meal.ingredients,
    steps: meal.steps || [],
    isFlexMeal: meal.isFlexMeal ?? false,
    recipeId: meal.recipeId,
  };
}

/**
 * Legacy adapter: Convert a Convex plannedMeal document to UI PlannedMealSummary
 * @deprecated Prefer using toMeal() and the canonical Meal type
 */
export function toPlannedMealSummary(
  meal: Doc<"plannedMeals">,
  dayLabel: string
): MealSummaryLegacy & { dayLabel: string };
export function toPlannedMealSummary(
  meal: Doc<"plannedMeals">
): MealSummaryLegacy;
export function toPlannedMealSummary(
  meal: Doc<"plannedMeals">,
  dayLabel?: string
): MealSummaryLegacy & { dayLabel?: string } {
  return {
    id: meal._id,
    mealName: meal.name,
    effortTier: meal.effortTier,
    prepTime: meal.prepTime,
    cookTime: meal.cookTime,
    cleanupRating: cleanupRatingToDisplay[meal.cleanupRating],
    // FIXED: Preserve full ingredient objects
    ingredients: meal.ingredients,
    // Keep flattened names for backwards compat where needed
    ingredientNames: meal.ingredients.map((ing) => ing.name),
    prepSteps: meal.steps || [],
    isFlexMeal: meal.isFlexMeal ?? false,
    assignedCookId: meal.cookId,
    eaterIds: meal.eaterIds.map((id) => id as string),
    dayLabel,
  };
}

/**
 * Legacy type for backwards compatibility with PlannedMealSummary consumers
 */
interface MealSummaryLegacy {
  id: string;
  mealName: string;
  effortTier: "super-easy" | "middle" | "more-prep";
  prepTime: number;
  cookTime: number;
  cleanupRating: CleanupRatingDisplay;
  ingredients: Ingredient[];
  ingredientNames: string[]; // Flattened names for legacy consumers
  prepSteps: string[];
  isFlexMeal: boolean;
  assignedCookId: Id<"householdMembers">;
  eaterIds: string[];
}

/**
 * Convert a Convex householdMember document to UI HouseholdMember
 */
export function toHouseholdMember(member: Doc<"householdMembers">): HouseholdMember {
  return {
    id: member._id,
    name: member.name,
    isAdmin: member.isAdmin,
    avatarUrl: member.avatarUrl,
  };
}

/**
 * Get the day label from a date string (e.g., "Monday", "Tonight")
 */
export function getDayLabel(dateString: string, isToday: boolean): string {
  if (isToday) return "Tonight";

  const date = new Date(dateString + "T12:00:00"); // Add time to avoid timezone issues
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

// =============================================================================
// Weekly Planning Adapters
// =============================================================================

/**
 * Convert a Convex plannedMeal document to weekly-planning PlannedMeal type
 * FIXED: Now preserves full ingredient objects
 */
export function toWeeklyPlannedMeal(meal: Doc<"plannedMeals">): WeeklyPlannedMeal {
  return {
    id: meal._id,
    date: meal.date,
    dayOfWeek: meal.dayOfWeek,
    recipeId: meal.recipeId,
    mealName: meal.name,
    effortTier: meal.effortTier,
    prepTime: meal.prepTime,
    cookTime: meal.cookTime,
    cleanupRating: cleanupRatingToDisplay[meal.cleanupRating],
    assignedCookId: meal.cookId,
    eaterIds: meal.eaterIds.map((id) => id as string),
    servings: meal.eaterIds.length, // Derive from eaters count
    // FIXED: Preserve full ingredient objects
    ingredients: meal.ingredients,
    steps: meal.steps || [],
    isFlexMeal: meal.isFlexMeal ?? false,
  };
}

/**
 * Generate a week label from a date string
 * Returns "This Week", "Next Week", or a date range like "Jan 27 - Feb 2"
 */
export function getWeekLabel(weekStart: string): string {
  const currentWeekStart = getCurrentWeekStart();
  const weekStartDate = new Date(weekStart + "T12:00:00");
  const currentWeekDate = new Date(currentWeekStart + "T12:00:00");

  const diffTime = weekStartDate.getTime() - currentWeekDate.getTime();
  const diffWeeks = Math.round(diffTime / (7 * 24 * 60 * 60 * 1000));

  if (diffWeeks === 0) return "This Week";
  if (diffWeeks === 1) return "Next Week";
  if (diffWeeks === -1) return "Last Week";

  // Format as date range
  const weekEnd = new Date(weekStartDate);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const startMonth = weekStartDate.toLocaleDateString("en-US", { month: "short" });
  const startDay = weekStartDate.getDate();
  const endMonth = weekEnd.toLocaleDateString("en-US", { month: "short" });
  const endDay = weekEnd.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}

/**
 * Convert a Convex weekPlan document to UI WeekSummary
 */
export function toWeekSummary(weekPlan: Doc<"weekPlans">): WeekSummary {
  return {
    id: weekPlan._id,
    weekStartDate: weekPlan.weekStart,
    label: getWeekLabel(weekPlan.weekStart),
    status: weekPlan.status as PlanStatus,
  };
}

/**
 * Convert a Convex weekPlan with meals to UI WeekPlan
 */
export function toWeekPlan(
  weekPlan: Doc<"weekPlans">,
  meals: Doc<"plannedMeals">[]
): WeekPlan {
  return {
    id: weekPlan._id,
    weekStartDate: weekPlan.weekStart,
    status: weekPlan.status as PlanStatus,
    meals: meals.map(toWeeklyPlannedMeal),
    approvedBy: weekPlan.approvedBy,
    approvedAt: weekPlan.approvedAt,
  };
}
