import type { ReactNode } from 'react'

// =============================================================================
// Data Types
// =============================================================================

export type EffortTier = 'super-easy' | 'middle' | 'more-prep'

export type CleanupRating = 'low' | 'medium' | 'high'

export type MessageRole = 'user' | 'zylo'

export interface HouseholdMember {
  id: string
  name: string
  isAdmin: boolean
  avatarUrl?: string
}

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: string // ISO date string
}

export interface MealSuggestion {
  id: string
  name: string
  effortTier: EffortTier
  prepTime: number // minutes
  cookTime: number // minutes
  cleanupRating: CleanupRating
  servings: number
  ingredients: string[]
  briefInstructions: string
  isFlexMeal: boolean // vegetarian base with optional protein add-on
}

export interface PlannedMealSummary {
  id: string
  mealName: string
  effortTier: EffortTier
  prepTime: number // minutes
  cookTime: number // minutes
  cleanupRating: CleanupRating
  ingredients: string[]
  briefInstructions?: string
  isFlexMeal: boolean
  assignedCookId?: string
  eaterIds?: string[]
}

// =============================================================================
// Component Props
// =============================================================================

export interface MealSuggestionCardProps {
  /** The meal suggestion to display */
  suggestion: MealSuggestion
  /** Called when user accepts this suggestion */
  onAccept?: () => void
  /** Called when user rejects this suggestion */
  onReject?: () => void
  /** Called when user wants something else */
  onSomethingElse?: () => void
}

export interface MealHelperHomeProps {
  /** Current user */
  currentUser: HouseholdMember
  /** Tonight's planned meal (pulled from weekly plan in the real app) */
  tonightMeal: PlannedMealSummary
  /** Household members (used to display assigned cook / eaters) */
  householdMembers: HouseholdMember[]
  /** Chat message history */
  messages: ChatMessage[]
  /** Optional meal suggestions */
  mealSuggestions?: MealSuggestion[]
  /** Suggestion actions */
  onAcceptSuggestion?: (suggestionId: string) => void
  onRejectSuggestion?: (suggestionId: string) => void
  onSomethingElse?: (suggestionId: string) => void
  /** Primary actions */
  onThisWorks?: () => void
  onNewPlan?: () => void
  onImWiped?: () => void
  /** Secondary actions */
  onOpenInventoryCheck?: () => void

  /** Optional rails-first panel (swap list, ingredient check, etc.) */
  panel?: ReactNode

  /** Chat input */
  onSendMessage?: (content: string) => void
  onVoiceInput?: () => void
}

export interface MealOptionDetailsProps {
  meal: PlannedMealSummary
  householdMembers: HouseholdMember[]
  onCookThis?: () => void
  onBack?: () => void
  /** Called when user answers the ingredient check */
  onIngredientCheck?: (answer: 'yes' | 'not-sure' | 'no') => void
}

export interface EmergencyExitProps {
  onBack?: () => void
  onChooseOption?: (optionId: string) => void
}

export interface InventoryCheckProps {
  onBack?: () => void
  onSubmit?: (notes: string) => void
  onVoiceInput?: () => void
}
