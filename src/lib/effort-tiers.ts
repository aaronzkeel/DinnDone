/**
 * Shared effort tier utilities
 *
 * Effort tiers represent the level of complexity/work involved in preparing a meal:
 * - super-easy: Minimal effort (e.g., leftovers, takeout, simple assembly)
 * - middle: Moderate effort (standard home cooking)
 * - more-prep: Higher effort (more involved recipes)
 */

import type { EffortTier } from "@/types/weekly-planning";

// Re-export the type for convenience
export type { EffortTier };

/**
 * Human-readable labels for each effort tier
 */
export const EFFORT_LABELS: Record<EffortTier, string> = {
  "super-easy": "Super Easy",
  middle: "Medium",
  "more-prep": "More Prep",
} as const;

/**
 * Number of dots to display for each effort tier (1-3 scale)
 */
export const EFFORT_DOTS: Record<EffortTier, number> = {
  "super-easy": 1,
  middle: 2,
  "more-prep": 3,
} as const;

/**
 * Get the human-readable label for an effort tier
 */
export function getEffortLabel(tier: EffortTier): string {
  return EFFORT_LABELS[tier];
}

/**
 * Get the number of dots to display for an effort tier
 */
export function getEffortDots(tier: EffortTier): number {
  return EFFORT_DOTS[tier];
}
