// =============================================================================
// Household Types
// =============================================================================
// Shared types for household-related data across the app.
// =============================================================================

/**
 * HouseholdMember - represents a member of the user's household
 *
 * Used in UI components for displaying cook assignments, eaters, etc.
 * Note: Convex database entities have different shapes (e.g., _id instead of id)
 */
export interface HouseholdMember {
  id: string;
  name: string;
  isAdmin: boolean;
  avatarUrl?: string;
}
