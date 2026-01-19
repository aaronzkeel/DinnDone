import type { ReactNode } from "react";

// Data Types
export type EffortTier = "super-easy" | "middle" | "more-prep";

export type CleanupRating = "low" | "medium" | "high";

export type MessageRole = "user" | "zylo";

export interface HouseholdMember {
  id: string;
  name: string;
  isAdmin: boolean;
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string; // ISO date string
}

export interface MealSuggestion {
  id: string;
  name: string;
  effortTier: EffortTier;
  prepTime: number; // minutes
  cookTime: number; // minutes
  cleanupRating: CleanupRating;
  servings: number;
  ingredients: string[];
  briefInstructions: string;
  isFlexMeal: boolean; // vegetarian base with optional protein add-on
}

export interface PlannedMealSummary {
  id: string;
  mealName: string;
  effortTier: EffortTier;
  prepTime: number; // minutes
  cookTime: number; // minutes
  cleanupRating: CleanupRating;
  ingredients: string[];
  briefInstructions?: string;
  isFlexMeal: boolean;
  assignedCookId?: string;
  eaterIds?: string[];
}

// Component Props
export interface TonightPlanCardProps {
  meal: PlannedMealSummary;
  householdMembers: HouseholdMember[];
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
