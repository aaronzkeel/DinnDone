/**
 * Date utility functions for DinnDone
 *
 * TIMEZONE HANDLING:
 * All functions in this module use LOCAL timezone, not UTC.
 * This is intentional because meal planning is based on the user's local day,
 * not a UTC day. Using toISOString() would cause dates to shift when the user
 * is in a timezone behind UTC (e.g., 11pm EST would become the next day in UTC).
 *
 * CANONICAL IMPLEMENTATION:
 * This is the single source of truth for date formatting and week calculation.
 * The same logic exists in convex/weekPlans.ts for server-side use (Convex
 * cannot import from src/lib), but this file is the canonical reference.
 */

/**
 * Get the Monday of the week containing the given date.
 *
 * Uses the ISO week definition where Monday is the first day of the week.
 *
 * @param date - The date to find the Monday for
 * @returns A new Date object set to Monday 00:00:00 of that week
 *
 * @example
 * getMondayOfWeek(new Date('2025-01-15')) // Wednesday -> returns Monday Jan 13
 * getMondayOfWeek(new Date('2025-01-19')) // Sunday -> returns Monday Jan 13
 */
export function getMondayOfWeek(date: Date): Date {
  const result = new Date(date);
  const dayOfWeek = result.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // Calculate days to subtract: (dayOfWeek + 6) % 7 gives 0 for Monday, 6 for Sunday
  const daysToSubtract = (dayOfWeek + 6) % 7;
  result.setDate(result.getDate() - daysToSubtract);
  return result;
}

/**
 * Format a Date as YYYY-MM-DD string in the LOCAL timezone.
 *
 * IMPORTANT: This does NOT use toISOString() because that converts to UTC,
 * which can shift the date by a day depending on timezone. For meal planning,
 * we always want the local date.
 *
 * @param date - The date to format
 * @returns Date string in YYYY-MM-DD format (local timezone)
 *
 * @example
 * formatDateLocal(new Date('2025-01-15T23:30:00')) // '2025-01-15' (not shifted to next day)
 */
export function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date as a YYYY-MM-DD string in local timezone.
 *
 * @returns Today's date string in YYYY-MM-DD format
 *
 * @example
 * getTodayString() // '2025-01-15' (whatever today is locally)
 */
export function getTodayString(): string {
  return formatDateLocal(new Date());
}

/**
 * Get this week's Monday as a YYYY-MM-DD string.
 *
 * @returns This week's Monday in YYYY-MM-DD format (local timezone)
 *
 * @example
 * // If today is Wednesday Jan 15, 2025
 * getCurrentWeekStart() // '2025-01-13' (Monday of this week)
 */
export function getCurrentWeekStart(): string {
  return formatDateLocal(getMondayOfWeek(new Date()));
}

/**
 * Get tomorrow's date as a YYYY-MM-DD string in local timezone.
 *
 * @returns Tomorrow's date string in YYYY-MM-DD format
 *
 * @example
 * // If today is Jan 15, 2025
 * getTomorrowString() // '2025-01-16'
 */
export function getTomorrowString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateLocal(tomorrow);
}
