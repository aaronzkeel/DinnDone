/**
 * Application-wide constants
 *
 * This file contains named constants for magic numbers used throughout the app.
 * Each constant includes a comment explaining why that value was chosen.
 */

// =============================================================================
// AI Chat Configuration
// =============================================================================

/**
 * Number of recent messages to include in AI chat context.
 * Keep recent context for token efficiency while maintaining conversation flow.
 * 10 messages (~5 user + 5 assistant) provides enough context without bloating prompts.
 */
export const CHAT_HISTORY_LIMIT = 10;

/**
 * Max tokens for short AI chat responses (quick answers, confirmations).
 * Short responses keep the app snappy and reduce API costs.
 */
export const CHAT_MAX_TOKENS = 300;

/**
 * Max tokens for discuss mode conversation responses.
 * Slightly more room for empathetic, supportive responses during planning discussions.
 */
export const CHAT_DISCUSS_MAX_TOKENS = 150;

/**
 * Max tokens for inventory/pantry suggestion responses.
 * Needs a bit more room to suggest 2-3 meal ideas.
 */
export const CHAT_INVENTORY_MAX_TOKENS = 400;

// =============================================================================
// Recent Meals Configuration
// =============================================================================

/**
 * Number of days to look back for recent meals when checking variety.
 * Two weeks provides enough history to avoid meal repetition without
 * being so long that favorites can't come back into rotation.
 */
export const RECENT_MEALS_LOOKBACK_DAYS = 14;

// =============================================================================
// Debounce Timings (milliseconds)
// =============================================================================

/**
 * Debounce for AI chat messages on the home page.
 * 1 second prevents accidental double-sends while still feeling responsive.
 */
export const AI_CHAT_DEBOUNCE_MS = 1000;

/**
 * Debounce for meal alternative suggestions.
 * 1.5 seconds prevents spamming the AI when quickly browsing meals.
 */
export const SUGGEST_ALTERNATIVES_DEBOUNCE_MS = 1500;

/**
 * Debounce for full week plan generation.
 * 2 seconds prevents accidental double-generation of expensive operations.
 */
export const GENERATE_PLAN_DEBOUNCE_MS = 2000;

/**
 * Debounce for quick plan generation.
 * 2 seconds prevents accidental double-generation.
 */
export const QUICK_PLAN_DEBOUNCE_MS = 2000;

// =============================================================================
// UI Constants
// =============================================================================

/**
 * Maximum length for notification message previews before truncating.
 * 120 characters fits well in the notification card UI without wrapping excessively.
 */
export const MESSAGE_TRUNCATE_LENGTH = 120;

/**
 * Number of grocery items to preview in chat context.
 * 15 items keeps context reasonable while showing enough to be useful.
 */
export const GROCERY_LIST_PREVIEW_LIMIT = 15;

/**
 * Number of items to show before "and X more..." text in missing ingredient summary.
 */
export const MISSING_ITEMS_PREVIEW_LIMIT = 5;

// =============================================================================
// Display Labels
// =============================================================================

/**
 * Human-readable labels for cleanup rating values.
 * Keys match CleanupRatingDisplay type ("low" | "medium" | "high").
 */
export const CLEANUP_LABELS = {
  low: "Low cleanup",
  medium: "Medium cleanup",
  high: "High cleanup",
} as const;
