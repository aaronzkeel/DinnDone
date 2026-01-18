// Fed Up Feeder - Core Data Types

export interface HouseholdMember {
  id: string
  name: string
  isAdmin: boolean
  avatarUrl?: string
  dietaryPreferences?: string[]
}

export interface WeekPlan {
  id: string
  weekStart: string // ISO date
  status: 'draft' | 'approved' | 'in-progress' | 'completed'
  meals: PlannedMeal[]
}

export interface PlannedMeal {
  id: string
  date: string // ISO date
  dayOfWeek: string
  name: string
  effortTier: EffortTier
  prepTime: number // minutes
  cookTime: number // minutes
  cleanupRating: CleanupRating
  cook: HouseholdMember
  eaters: HouseholdMember[]
  ingredients: Ingredient[]
  steps: string[]
  isFlexMeal?: boolean
}

export type EffortTier = 'easy' | 'medium' | 'involved'
export type CleanupRating = 1 | 2 | 3

export interface Ingredient {
  name: string
  quantity: string
  isOrganic?: boolean
}

export interface GroceryItem {
  id: string
  name: string
  quantity?: string
  store: string
  category: string
  isOrganic: boolean
  isChecked: boolean
  linkedMeals?: string[]
}

export interface Store {
  id: string
  name: string
  color?: string
}

export interface PantryItem {
  id: string
  name: string
  location: 'fridge' | 'freezer' | 'pantry'
  quantity?: string
}

// Notification Types
export type NotificationType =
  | 'daily-brief'
  | 'strategic-pivot'
  | 'thaw-guardian'
  | 'weekly-plan-ready'
  | 'inventory-sos'
  | 'leftover-check'
  | 'cook-reminder'

export type NotificationStatus = 'pending' | 'done' | 'dismissed'

export interface NotificationAction {
  id: string
  label: string
  isPrimary: boolean
}

export interface Notification {
  id: string
  type: NotificationType
  message: string
  timestamp: string
  status: NotificationStatus
  actions: NotificationAction[]
  resolvedAt?: string
  resolvedAction?: string
}

export type FandomVoice =
  | 'default'
  | 'samwise'
  | 'nacho-libre'
  | 'the-office'
  | 'star-wars'
  | 'harry-potter'

export interface NotificationPreferences {
  userId: string
  enabledTypes: NotificationType[]
  quietHoursStart: string // HH:MM format
  quietHoursEnd: string
  fandomVoice: FandomVoice
  pushEnabled: boolean
}

export interface CrisisDayMute {
  isActive: boolean
  expiresAt?: string
}
