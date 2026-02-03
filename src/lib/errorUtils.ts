/**
 * Extracts a user-friendly error message from any error type.
 * Handles Error objects, strings, and unknown types gracefully.
 */
export function extractErrorMessage(error: unknown, maxLength = 150): string {
  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else if (
    error !== null &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    // Handle objects with a message property (like some API errors)
    message = (error as { message: string }).message;
  } else {
    return "Something unexpected happened. Please try again.";
  }

  // Clean up common technical prefixes that aren't helpful to users
  message = message
    .replace(/^Error:\s*/i, "")
    .replace(/^Uncaught\s*/i, "")
    .replace(/^ConvexError:\s*/i, "");

  // Truncate if too long
  if (message.length > maxLength) {
    message = message.slice(0, maxLength - 3) + "...";
  }

  return message || "Something unexpected happened. Please try again.";
}

/**
 * Wraps an error message with a friendly context prefix.
 * Example: formatError("swap meals", error) => "Couldn't swap meals: Network timeout"
 */
export function formatErrorForUser(
  action: string,
  error: unknown,
  fallbackMessage?: string
): string {
  const extracted = extractErrorMessage(error);

  // If the extracted message is our generic fallback, use a simpler format
  if (extracted === "Something unexpected happened. Please try again.") {
    return fallbackMessage || `Couldn't ${action}. Please try again.`;
  }

  return `Couldn't ${action}: ${extracted}`;
}
