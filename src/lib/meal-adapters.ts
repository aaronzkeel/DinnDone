/**
 * Adapters to convert between Convex schema types and UI types
 */

import type { Doc } from "../../convex/_generated/dataModel";
import type { EffortTier, CleanupRating, PlannedMealSummary, HouseholdMember } from "@/types/meal-helper";
import type {
  PlannedMeal as WeeklyPlannedMeal,
  WeekSummary,
  WeekPlan,
  PlanStatus,
} from "@/types/weekly-planning";

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
 * Format a Date as YYYY-MM-DD in local timezone (avoids UTC shift from toISOString)
 */
function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayDateString(): string {
  return formatDateLocal(new Date());
}

/**
 * Get the Monday of the current week as YYYY-MM-DD string
 */
export function getCurrentWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  return formatDateLocal(monday);
}

// Re-export reverse maps for mutations
export { effortTierReverseMap, cleanupRatingReverseMap };

// =============================================================================
// Weekly Planning Adapters
// =============================================================================

/**
 * Convert a Convex plannedMeal document to weekly-planning PlannedMeal type
 */
export function toWeeklyPlannedMeal(meal: Doc<"plannedMeals">): WeeklyPlannedMeal {
  return {
    id: meal._id,
    date: meal.date,
    dayOfWeek: meal.dayOfWeek,
    recipeId: meal.recipeId,
    mealName: meal.name,
    effortTier: effortTierMap[meal.effortTier],
    prepTime: meal.prepTime,
    cookTime: meal.cookTime,
    cleanupRating: cleanupRatingMap[meal.cleanupRating],
    assignedCookId: meal.cookId,
    eaterIds: meal.eaterIds.map((id) => id as string),
    servings: meal.eaterIds.length, // Derive from eaters count
    ingredients: meal.ingredients.map((ing) => ing.name),
    isFlexMeal: meal.isFlexMeal ?? false,
    isUnplanned: false, // Default to false, no Convex field for this
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
