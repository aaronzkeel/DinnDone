/**
 * Shared AI prompt templates for meal generation.
 * Centralizes prompt content to reduce duplication and make updates easier.
 */

// =============================================================================
// Types
// =============================================================================

export type EffortTier = "super-easy" | "middle" | "more-prep";
export type CleanupRating = "low" | "medium" | "high";

export interface MealGenerationOptions {
  /** Sample date for JSON schema example (e.g., "2025-02-03") */
  sampleDate: string;
  /** Include fromRecipeLibrary field in schema */
  includeRecipeLibraryField?: boolean;
  /** Additional context to append (e.g., existing meals, saved recipes) */
  additionalContext?: string;
  /** Custom rules to add (overrides or adds to base rules) */
  customRules?: string[];
  /** Whether this is a quick plan (affects 80/20 rule messaging) */
  isQuickPlan?: boolean;
}

export interface AlternativesOptions {
  /** Meals to exclude (already in plan) */
  excludeMeals?: string[];
}

// =============================================================================
// Effort Tier Descriptions
// =============================================================================

export const EFFORT_TIER_DESCRIPTIONS = {
  "super-easy": "Minimal prep, quick cooking, simple cleanup (15-20 min total)",
  "middle": "Moderate prep and cooking, reasonable cleanup (30-45 min total)",
  "more-prep": "More involved prep/cooking, worth the effort for special meals (45-60+ min)",
} as const;

export const EFFORT_TIER_RULES = `
- effortTier must be exactly: "super-easy", "middle", or "more-prep"
- super-easy: minimal prep, under 30 min total, one-pot meals, simple ingredients
- middle: moderate prep, 30-45 min, standard home cooking
- more-prep: involved recipes, 45+ min, worth it for weekends or special occasions`;

// =============================================================================
// Cleanup Rating Rules
// =============================================================================

export const CLEANUP_RATING_DESCRIPTIONS = {
  low: "One pot/pan, minimal dishes",
  medium: "2-3 pots/pans, standard cleanup",
  high: "Multiple pots/pans, more dishes",
} as const;

export const CLEANUP_RATING_RULES = `
- cleanupRating must be exactly: "low", "medium", or "high"
- low: one-pot meals, minimal dishes, sheet pan dinners
- medium: 2-3 pots/pans, typical home cooking
- high: multiple components, more elaborate meals`;

// =============================================================================
// Ingredient and Step Rules
// =============================================================================

export const INGREDIENT_RULES = `
- Include 3-8 main ingredients per meal
- List ingredient names only (no quantities in the array)
- Focus on key ingredients, skip common pantry staples unless critical`;

export const STEP_RULES = `
- Include 3-6 clear, concise cooking steps for each meal
- Each step should be actionable and specific
- Steps should be in logical cooking order`;

// =============================================================================
// JSON Schema Builders
// =============================================================================

/**
 * Build the expected JSON schema for a single meal.
 */
export function buildMealJsonSchema(options: {
  includeRecipeLibraryField?: boolean;
  includeDayAndDate?: boolean;
  includeBriefDescription?: boolean;
  sampleDate?: string;
}): string {
  const { includeRecipeLibraryField, includeDayAndDate, includeBriefDescription, sampleDate } = options;

  const mealFields = [
    ...(includeDayAndDate
      ? [`      "dayOfWeek": "Monday"`, `      "date": "${sampleDate || "2025-01-06"}"`]
      : []),
    `      "mealName": "Example Meal"`,
    `      "effortTier": "super-easy"`,
    `      "prepTime": 10`,
    `      "cookTime": 20`,
    `      "cleanupRating": "low"`,
    ...(includeBriefDescription ? [`      "briefDescription": "Quick and easy weeknight dinner"`] : []),
    `      "ingredients": ["ingredient1", "ingredient2"]`,
    `      "steps": ["Step 1: Do this", "Step 2: Do that", "Step 3: Serve"]`,
    `      "isFlexMeal": false`,
    ...(includeRecipeLibraryField ? [`      "fromRecipeLibrary": true`] : []),
  ];

  return `{
    ${mealFields.join(",\n    ")}
    }`;
}

/**
 * Build the full JSON schema for a week plan response.
 */
export function buildWeekPlanJsonSchema(options: {
  sampleDate: string;
  includeRecipeLibraryField?: boolean;
}): string {
  const mealSchema = buildMealJsonSchema({
    includeRecipeLibraryField: options.includeRecipeLibraryField,
    includeDayAndDate: true,
    sampleDate: options.sampleDate,
  });

  return `{
  "meals": [
${mealSchema}
  ]
}`;
}

/**
 * Build the JSON schema for alternatives response.
 */
export function buildAlternativesJsonSchema(): string {
  const mealSchema = buildMealJsonSchema({
    includeRecipeLibraryField: false,
    includeDayAndDate: false,
    includeBriefDescription: true,
  });

  return `{
  "alternatives": [
${mealSchema}
  ]
}`;
}

// =============================================================================
// System Prompt Builders
// =============================================================================

/**
 * Build the base rules section that appears in all meal generation prompts.
 */
function buildBaseRules(options: {
  includeRecipeLibraryField?: boolean;
}): string {
  const rules = [
    EFFORT_TIER_RULES.trim(),
    CLEANUP_RATING_RULES.trim(),
    INGREDIENT_RULES.trim(),
    STEP_RULES.trim(),
    `- prepTime and cookTime are in minutes`,
  ];

  if (options.includeRecipeLibraryField) {
    rules.push(`- fromRecipeLibrary: true if meal name matches a saved recipe, false if new suggestion`);
  }

  return rules.join("\n");
}

/**
 * Build the system prompt for generating a full week plan.
 */
export function buildWeekPlanSystemPrompt(options: MealGenerationOptions): string {
  const jsonSchema = buildWeekPlanJsonSchema({
    sampleDate: options.sampleDate,
    includeRecipeLibraryField: options.includeRecipeLibraryField,
  });

  const baseRules = buildBaseRules({
    includeRecipeLibraryField: options.includeRecipeLibraryField,
  });

  const weekdayRule = `- Mix effort levels: more easy meals during weekdays, allow more prep on weekends`;
  const flexMealRule = `- Mark 2-3 meals as isFlexMeal: true (easy to swap or make quick adjustments)`;

  // The 80/20 rule for familiar vs. adventurous meals
  const familiarityRule = options.isQuickPlan
    ? ""
    : `- IMPORTANT: Follow 80/20 rule - 5-6 meals should be familiar family favorites (tacos, spaghetti, grilled chicken, stir fry, etc.), only 1-2 should be new or adventurous ideas`;

  const familyFriendlyRule = `- Make meals family-friendly and varied throughout the week`;

  const customRulesSection = options.customRules?.length
    ? "\n" + options.customRules.join("\n")
    : "";

  return `You are Zylo, a meal planning assistant. Generate a 7-day dinner plan for a family.
Return ONLY valid JSON in this exact format (no markdown, no explanation):
${jsonSchema}

Rules:
${baseRules}
${weekdayRule}
${flexMealRule}
${familiarityRule}
${familyFriendlyRule}${options.additionalContext || ""}${customRulesSection}`;
}

/**
 * Build the system prompt for suggesting alternative meals.
 */
export function buildAlternativesSystemPrompt(options: AlternativesOptions): string {
  const jsonSchema = buildAlternativesJsonSchema();
  const baseRules = buildBaseRules({ includeRecipeLibraryField: false });

  const excludeList = options.excludeMeals?.length
    ? `\nDo NOT suggest these meals (already in plan): ${options.excludeMeals.join(", ")}`
    : "";

  return `You are Zylo, a meal planning assistant. Suggest 3 alternative dinner options.
Return ONLY valid JSON in this exact format (no markdown, no explanation):
${jsonSchema}

Rules:
${baseRules}
- briefDescription should be 1 short sentence (under 60 chars)
- Provide variety: one easy, one medium, one more involved option
- Suggest family-friendly, common meals people actually cook
- Consider similar cuisine or ingredients to the current meal${excludeList}`;
}

/**
 * Build the system prompt for updating a single meal from chat instruction.
 */
export function buildMealUpdateSystemPrompt(recipeContext: string): string {
  return `You are Zylo, a meal planning assistant. Update a meal based on the user's instruction.
Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "updatedMeal": {
    "mealName": "New Meal Name",
    "effortTier": "super-easy",
    "prepTime": 10,
    "cookTime": 20,
    "cleanupRating": "low",
    "ingredients": ["ingredient1", "ingredient2"],
    "isFlexMeal": false,
    "fromRecipeLibrary": false
  },
  "zyloResponse": "Done! I changed Wednesday to Leftover Night."
}

Rules:
- effortTier: "super-easy", "middle", or "more-prep"
- cleanupRating: "low", "medium", or "high"
- For "leftovers" or "leftover night": use effortTier "super-easy", prepTime 5, cookTime 10, cleanupRating "low", ingredients ["various leftovers"]
- For "takeout" or "delivery": use effortTier "super-easy", prepTime 0, cookTime 0, cleanupRating "low", ingredients ["order out"]
- fromRecipeLibrary: true if meal name matches a saved recipe
- zyloResponse should be a short, friendly confirmation${recipeContext}`;
}

// =============================================================================
// Context Builders
// =============================================================================

/**
 * Build context string for meals to keep (existing plan).
 */
export function buildKeepMealsContext(
  mealsToKeep: Array<{ date: string; mealName: string }>
): string {
  if (mealsToKeep.length === 0) return "";
  return `\nKEEP these existing meals (do not replace):\n${mealsToKeep.map((m) => `- ${m.date}: ${m.mealName}`).join("\n")}`;
}

/**
 * Build context string for saved recipes.
 */
export function buildRecipeLibraryContext(
  savedRecipes: Array<{ name: string }>,
  preferenceNote?: string
): string {
  if (savedRecipes.length === 0) return "";
  const note = preferenceNote || "prefer these, use ~80% from this list";
  return `\nSaved recipes (${note}):\n${savedRecipes.map((r) => `- ${r.name}`).join("\n")}`;
}

/**
 * Build context string for recent meals (to avoid repetition).
 */
export function buildRecentMealsContext(recentMealNames: string[]): string {
  if (recentMealNames.length === 0) return "";
  return `\nAvoid exact repeats of these recent meals (past 2 weeks):\n${recentMealNames.join(", ")}`;
}

// =============================================================================
// Response Parsing Utilities
// =============================================================================

/**
 * Clean AI response content by removing markdown code blocks.
 */
export function cleanJsonResponse(content: string): string {
  return content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
}
