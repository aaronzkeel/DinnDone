// =============================================================================
// Meal Helper Data Types
// =============================================================================
// Types for the Meal Helper (home) section of the app.
// These derive from the canonical Meal type in ./meal.ts
// =============================================================================

import type { ReactNode } from "react";
import type { Ingredient, EffortTier, CleanupRatingDisplay } from "./meal";
import type { HouseholdMember } from "./household";

// Re-export canonical types for convenience
export type { EffortTier, CleanupRatingDisplay as CleanupRating, Ingredient };
export type { HouseholdMember };

export type MessageRole = "user" | "zylo";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string; // ISO date string
}

/**
 * MealSuggestion - a meal suggestion from Zylo
 */
export interface MealSuggestion {
  id: string;
  name: string;
  effortTier: EffortTier;
  prepTime: number; // minutes
  cookTime: number; // minutes
  cleanupRating: CleanupRatingDisplay;
  servings: number;
  ingredients: Ingredient[];
  briefInstructions: string;
  isFlexMeal: boolean;
}

/**
 * PlannedMealSummary - summary of a planned meal for display
 *
 * Used in TonightPlanCard, MealOptionDetails, etc.
 */
export interface PlannedMealSummary {
  id: string;
  mealName: string;
  effortTier: EffortTier;
  prepTime: number; // minutes
  cookTime: number; // minutes
  cleanupRating: CleanupRatingDisplay;
  /**
   * Full ingredient objects with quantities
   * Use getIngredientNames() from meal.ts if you need just names
   */
  ingredients: Ingredient[];
  /**
   * Flattened ingredient names for simple display
   * @deprecated Prefer using ingredients array and formatting as needed
   */
  ingredientNames?: string[];
  briefInstructions?: string;
  prepSteps?: string[]; // Step-by-step cooking instructions (renamed from steps for legacy compat)
  isFlexMeal: boolean;
  assignedCookId?: string;
  eaterIds?: string[];
  dayLabel?: string; // "Tonight", "Monday", etc.
}

// =============================================================================
// Component Props
// =============================================================================

export interface TonightPlanCardProps {
  meal: PlannedMealSummary;
  householdMembers: HouseholdMember[];
  onView?: () => void;
}

export interface ChatInputProps {
  onSendMessage?: (content: string) => void;
  onVoiceInput?: () => void;
  disabled?: boolean;
}

export interface ChatMessageProps {
  message: ChatMessage;
  currentUser?: HouseholdMember;
}

export interface EmergencyExitProps {
  onBack?: () => void;
  onChooseOption?: (optionId: string) => void;
}

export interface MealHelperHomeProps {
  /** Current user */
  currentUser: HouseholdMember;
  /** Tonight's planned meal (pulled from weekly plan in the real app) - null/undefined if no plan exists */
  tonightMeal?: PlannedMealSummary | null;
  /** Tomorrow's planned meal (on-deck) */
  tomorrowMeal?: PlannedMealSummary | null;
  /** Household members (used to display assigned cook / eaters) */
  householdMembers: HouseholdMember[];
  /** Chat message history */
  messages: ChatMessage[];
  /** Optional meal suggestions */
  mealSuggestions?: MealSuggestion[];
  /** Suggestion actions */
  onAcceptSuggestion?: (suggestionId: string) => void;
  onRejectSuggestion?: (suggestionId: string) => void;
  onSomethingElse?: (suggestionId: string) => void;
  /** Primary actions */
  onThisWorks?: () => void;
  onNewPlan?: () => void;
  onImWiped?: () => void;
  /** View meal details */
  onViewMeal?: () => void;
  /** Tomorrow meal actions */
  onSwapTomorrow?: () => void;
  onViewTomorrow?: () => void;
  /** Secondary actions */
  onOpenInventoryCheck?: () => void;
  /** Optional rails-first panel (swap list, ingredient check, etc.) */
  panel?: ReactNode;
  /** Chat input */
  onSendMessage?: (content: string) => void;
  onVoiceInput?: () => void;
  /** Loading state for AI responses */
  isLoading?: boolean;
}
