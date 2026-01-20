/**
 * Adapters to convert between Convex schema types and UI types
 */

import type { Doc, Id } from "../../convex/_generated/dataModel";
import type { EffortTier, CleanupRating, PlannedMealSummary, HouseholdMember } from "@/types/meal-helper";

// Convex uses "easy" | "medium" | "involved"
// UI uses "super-easy" | "middle" | "more-prep"
const effortTierMap: Record<"easy" | "medium" | "involved", EffortTier> = {
  easy: "super-easy",
  medium: "middle",
  involved: "more-prep",
};

const effortTierReverseMap: Record<EffortTier, "easy" | "medium" | "involved"> = {
  "super-easy": "easy",
  middle: "medium",
  "more-prep": "involved",
};

// Convex uses 1 | 2 | 3
// UI uses "low" | "medium" | "high"
const cleanupRatingMap: Record<1 | 2 | 3, CleanupRating> = {
  1: "low",
  2: "medium",
  3: "high",
};

const cleanupRatingReverseMap: Record<CleanupRating, 1 | 2 | 3> = {
  low: 1,
  medium: 2,
  high: 3,
};

/**
 * Convert a Convex plannedMeal document to UI PlannedMealSummary
 * Overloaded: when dayLabel is provided, the return type includes required dayLabel
 */
export function toPlannedMealSummary(
  meal: Doc<"plannedMeals">,
  dayLabel: string
): PlannedMealSummary & { dayLabel: string };
export function toPlannedMealSummary(
  meal: Doc<"plannedMeals">
): PlannedMealSummary;
export function toPlannedMealSummary(
  meal: Doc<"plannedMeals">,
  dayLabel?: string
): PlannedMealSummary & { dayLabel?: string } {
  return {
    id: meal._id,
    mealName: meal.name,
    effortTier: effortTierMap[meal.effortTier],
    prepTime: meal.prepTime,
    cookTime: meal.cookTime,
    cleanupRating: cleanupRatingMap[meal.cleanupRating],
    ingredients: meal.ingredients.map((ing) => ing.name),
    prepSteps: meal.steps,
    isFlexMeal: meal.isFlexMeal ?? false,
    assignedCookId: meal.cookId,
    eaterIds: meal.eaterIds.map((id) => id as string),
    dayLabel,
  };
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

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

/**
 * Get the Monday of the current week as YYYY-MM-DD string
 */
export function getCurrentWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  return monday.toISOString().split("T")[0];
}

// Re-export reverse maps for mutations
export { effortTierReverseMap, cleanupRatingReverseMap };
