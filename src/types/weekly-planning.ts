// =============================================================================
// Weekly Planning Data Types
// =============================================================================

export type PlanStatus = "draft" | "approved" | "in-progress" | "completed";

export type EffortTier = "super-easy" | "middle" | "more-prep";

export type CleanupRating = "low" | "medium" | "high";

export interface HouseholdMember {
  id: string;
  name: string;
  isAdmin: boolean;
  avatarUrl?: string;
}

export interface PlannedMeal {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  dayOfWeek: string;
  recipeId?: string; // links to Recipe if from library
  mealName: string;
  effortTier: EffortTier;
  prepTime: number;
  cookTime: number;
  cleanupRating: CleanupRating;
  assignedCookId: string; // HouseholdMember id
  eaterIds: string[]; // HouseholdMember ids
  servings: number;
  ingredients: string[];
  isFlexMeal: boolean;
  isUnplanned: boolean; // true if user chose "I'll figure it out"
}

export interface WeekPlan {
  id: string;
  weekStartDate: string; // ISO date string (Monday)
  status: PlanStatus;
  meals: PlannedMeal[];
  approvedBy?: string; // HouseholdMember id
  approvedAt?: string; // ISO timestamp
}

export interface MealAlternative {
  id: string;
  mealName: string;
  effortTier: EffortTier;
  prepTime: number;
  cookTime: number;
  cleanupRating: CleanupRating;
  briefDescription: string;
  isFlexMeal: boolean;
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
  /** Called when user wants to check pantry */
  onPantryAudit?: () => void;
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
