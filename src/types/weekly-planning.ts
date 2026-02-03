// =============================================================================
// Weekly Planning Data Types
// =============================================================================
// These types are used by the weekly planning UI components.
// They derive from the canonical Meal type in ./meal.ts
// =============================================================================

import type { Ingredient, EffortTier, CleanupRatingDisplay } from "./meal";
import type { HouseholdMember } from "./household";

// Re-export canonical types for convenience
export type { EffortTier, CleanupRatingDisplay as CleanupRating, Ingredient };
export type { HouseholdMember };

export type PlanStatus = "draft" | "approved" | "in-progress" | "completed";

/**
 * PlannedMeal - meal scheduled for a specific date in a week plan
 *
 * Note: This uses CleanupRatingDisplay (string) for UI convenience.
 * The database stores numeric values (1|2|3) which are converted by adapters.
 */
export interface PlannedMeal {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  dayOfWeek: string;
  recipeId?: string; // links to Recipe if from library
  mealName: string;
  effortTier: EffortTier;
  prepTime: number;
  cookTime: number;
  cleanupRating: CleanupRatingDisplay;
  assignedCookId: string; // HouseholdMember id
  eaterIds: string[]; // HouseholdMember ids
  servings: number; // Derived from eaterIds.length
  /**
   * Full ingredient objects with quantities
   * Use getIngredientNames() from meal.ts if you need just names
   */
  ingredients: Ingredient[];
  steps: string[]; // Cooking directions
  isFlexMeal: boolean;
}

export interface WeekPlan {
  id: string;
  weekStartDate: string; // ISO date string (Monday)
  status: PlanStatus;
  meals: PlannedMeal[];
  approvedBy?: string; // HouseholdMember id
  approvedAt?: string; // ISO timestamp
}

/**
 * MealAlternative - suggestion from AI when swapping a meal
 */
export interface MealAlternative {
  id: string;
  mealName: string;
  effortTier: EffortTier;
  prepTime: number;
  cookTime: number;
  cleanupRating: CleanupRatingDisplay;
  briefDescription: string;
  isFlexMeal: boolean;
  ingredients: Ingredient[];
  steps: string[];
}

export interface PantryCheckItem {
  id: string;
  name: string;
  alreadyHave: boolean;
}

export interface WeekSummary {
  id: string;
  weekStartDate: string;
  label: string; // "This Week", "Next Week", "Jan 27 - Feb 2"
  status: PlanStatus;
}

// =============================================================================
// Component Props
// =============================================================================

export interface WeekPlanViewProps {
  /** Current user */
  currentUser: HouseholdMember;
  /** Available weeks to select from */
  availableWeeks: WeekSummary[];
  /** Currently selected week plan */
  selectedWeekPlan: WeekPlan;
  /** All household members */
  householdMembers: HouseholdMember[];
  /** Called when user selects a different week */
  onSelectWeek?: (weekId: string) => void;
  /** Called when user taps a meal to expand/edit */
  onSelectMeal?: (mealId: string) => void;
  /** Called when user approves the plan */
  onApprovePlan?: () => void;
  /** Called when user wants to add another week */
  onAddWeek?: () => void;
  /** Called when user taps a day card */
  onTapMeal?: (mealId: string) => void;
  /** Called when user taps "View" to see meal details directly */
  onViewMeal?: (mealId: string) => void;
  /** Called when user wants to check pantry */
  onPantryAudit?: () => void;
  /** Called when user wants to generate a plan for an empty week */
  onGeneratePlan?: () => void;
  /** Whether AI is currently generating a plan */
  isGenerating?: boolean;
  /** Called when user wants to delete the current week */
  onDeleteWeek?: () => void;
}

export interface DayCardProps {
  /** The planned meal for this day */
  meal: PlannedMeal;
  /** All household members (for displaying cook and eaters) */
  householdMembers: HouseholdMember[];
  /** Whether this is today */
  isToday: boolean;
  /** Called when user taps the day card */
  onTap?: () => void;
}

export interface SwapModalProps {
  /** Current meal being swapped */
  currentMeal: PlannedMeal;
  /** Alternative meal suggestions */
  alternatives: MealAlternative[];
  /** Called when user selects an alternative */
  onSelectAlternative?: (alternativeId: string) => void;
  /** Called when user wants more options */
  onMoreOptions?: () => void;
  /** Called when user chooses "I'll figure it out" */
  onUnplan?: () => void;
  /** Called when user closes modal */
  onClose?: () => void;
}

export interface PantryAuditProps {
  /** Items to check */
  items: PantryCheckItem[];
  /** Called when user toggles an item */
  onToggleItem?: (itemId: string) => void;
  /** Called when user completes audit */
  onComplete?: () => void;
}
