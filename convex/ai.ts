"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  buildWeekPlanSystemPrompt,
  buildAlternativesSystemPrompt,
  buildMealUpdateSystemPrompt,
  buildKeepMealsContext,
  buildRecipeLibraryContext,
  buildRecentMealsContext,
  cleanJsonResponse,
} from "./aiPrompts";

// OpenRouter API endpoint
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Default model as specified in the product plan
const DEFAULT_MODEL = "google/gemini-2.0-flash-001";

// ============================================================================
// AI Token Limits
// Note: These mirror values in src/lib/constants.ts but can't be imported here
// because Convex actions run in a separate environment.
// ============================================================================

/** Default max tokens for chat responses (general fallback) */
const DEFAULT_CHAT_MAX_TOKENS = 500;

/** Max tokens for meal alternative suggestions (needs room for 3 detailed meals) */
const ALTERNATIVES_MAX_TOKENS = 1500;

/** Max tokens for full week plan generation (7 detailed meals) */
const WEEK_PLAN_MAX_TOKENS = 2000;

/** Max tokens for pantry analysis responses */
const PANTRY_ANALYSIS_MAX_TOKENS = 400;

/** Max tokens for meal update from chat */
const MEAL_UPDATE_MAX_TOKENS = 600;

/** Max tokens for connection test (brief response only) */
const TEST_CONNECTION_MAX_TOKENS = 100;


interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Test the OpenRouter API connection.
 * This action verifies that the API key is configured and working.
 */
export const testConnection = action({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    model: v.optional(v.string()),
    responsePreview: v.optional(v.string()),
  }),
  handler: async (): Promise<{
    success: boolean;
    message: string;
    model?: string;
    responsePreview?: string;
  }> => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        message: "OPENROUTER_API_KEY is not set in environment variables",
      };
    }

    if (apiKey === "sk-or-v1-your-key-here") {
      return {
        success: false,
        message:
          "OPENROUTER_API_KEY is set to the placeholder value. Please configure a real API key.",
      };
    }

    try {
      const messages: OpenRouterMessage[] = [
        {
          role: "system",
          content:
            "You are Zylo, a friendly meal planning assistant for DinnDone app. Respond briefly.",
        },
        {
          role: "user",
          content: "Say hello and confirm you're working!",
        },
      ];

      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://dinndone.com",
          "X-Title": "DinnDone",
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages,
          max_tokens: TEST_CONNECTION_MAX_TOKENS,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          message: `OpenRouter API error (${response.status}): ${errorText}`,
        };
      }

      const data = (await response.json()) as OpenRouterResponse;

      if (!data.choices || data.choices.length === 0) {
        return {
          success: false,
          message: "OpenRouter returned empty response",
        };
      }

      const assistantMessage = data.choices[0].message.content;

      return {
        success: true,
        message: "OpenRouter API connection successful!",
        model: data.model,
        responsePreview:
          assistantMessage.length > 100
            ? assistantMessage.substring(0, 100) + "..."
            : assistantMessage,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to connect to OpenRouter: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});

/**
 * Send a chat message to the AI and get a response.
 * This is the main function for interacting with Zylo.
 */
export const chat = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(
          v.literal("system"),
          v.literal("user"),
          v.literal("assistant")
        ),
        content: v.string(),
      })
    ),
    maxTokens: v.optional(v.number()),
  },
  returns: v.object({
    success: v.boolean(),
    content: v.optional(v.string()),
    error: v.optional(v.string()),
    usage: v.optional(
      v.object({
        promptTokens: v.number(),
        completionTokens: v.number(),
        totalTokens: v.number(),
      })
    ),
  }),
  handler: async (
    ctx,
    { messages, maxTokens }
  ): Promise<{
    success: boolean;
    content?: string;
    error?: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }> => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey || apiKey === "sk-or-v1-your-key-here") {
      return {
        success: false,
        error: "OpenRouter API key not configured",
      };
    }

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://dinndone.com",
          "X-Title": "DinnDone",
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages,
          max_tokens: maxTokens ?? DEFAULT_CHAT_MAX_TOKENS,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `API error (${response.status}): ${errorText}`,
        };
      }

      const data = (await response.json()) as OpenRouterResponse;

      if (!data.choices || data.choices.length === 0) {
        return {
          success: false,
          error: "Empty response from AI",
        };
      }

      return {
        success: true,
        content: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Request failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});

/**
 * Suggest alternative meals for swapping.
 * Given a current meal, returns 3 alternatives with different effort levels.
 */
export const suggestAlternatives = action({
  args: {
    currentMealName: v.string(),
    effortPreference: v.optional(v.string()),
    excludeMeals: v.optional(v.array(v.string())),
  },
  returns: v.object({
    success: v.boolean(),
    alternatives: v.optional(
      v.array(
        v.object({
          mealName: v.string(),
          effortTier: v.union(
            v.literal("super-easy"),
            v.literal("middle"),
            v.literal("more-prep")
          ),
          prepTime: v.number(),
          cookTime: v.number(),
          cleanupRating: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high")
          ),
          briefDescription: v.string(),
          isFlexMeal: v.boolean(),
          ingredients: v.array(v.string()),
          steps: v.array(v.string()),
        })
      )
    ),
    error: v.optional(v.string()),
  }),
  handler: async (
    ctx,
    { currentMealName, effortPreference, excludeMeals }
  ): Promise<{
    success: boolean;
    alternatives?: Array<{
      mealName: string;
      effortTier: "super-easy" | "middle" | "more-prep";
      prepTime: number;
      cookTime: number;
      cleanupRating: "low" | "medium" | "high";
      briefDescription: string;
      isFlexMeal: boolean;
      ingredients: string[];
      steps: string[];
    }>;
    error?: string;
  }> => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey || apiKey === "sk-or-v1-your-key-here") {
      return {
        success: false,
        error: "OpenRouter API key not configured",
      };
    }

    const systemPrompt = buildAlternativesSystemPrompt({
      excludeMeals: excludeMeals,
    });

    const userPrompt = `Current meal: "${currentMealName}"
${effortPreference ? `Preference: ${effortPreference}` : "No effort preference."}

Suggest 3 alternative dinners that could replace this meal.`;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://dinndone.com",
          "X-Title": "DinnDone",
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: ALTERNATIVES_MAX_TOKENS,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `API error (${response.status}): ${errorText}`,
        };
      }

      const data = (await response.json()) as OpenRouterResponse;

      if (!data.choices || data.choices.length === 0) {
        return {
          success: false,
          error: "Empty response from AI",
        };
      }

      const content = data.choices[0].message.content;
      const cleanedContent = cleanJsonResponse(content);

      try {
        const parsed = JSON.parse(cleanedContent) as {
          alternatives: Array<{
            mealName: string;
            effortTier: "super-easy" | "middle" | "more-prep";
            prepTime: number;
            cookTime: number;
            cleanupRating: "low" | "medium" | "high";
            briefDescription: string;
            isFlexMeal: boolean;
            ingredients?: string[];
            steps?: string[];
          }>;
        };

        if (!parsed.alternatives || !Array.isArray(parsed.alternatives)) {
          return {
            success: false,
            error: "Invalid response format: missing alternatives array",
          };
        }

        // Ensure ingredients and steps are always arrays
        const alternatives = parsed.alternatives.map((alt) => ({
          ...alt,
          ingredients: alt.ingredients || [],
          steps: alt.steps || [],
        }));

        return {
          success: true,
          alternatives,
        };
      } catch (parseError) {
        return {
          success: false,
          error: `Failed to parse AI response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Request failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});

/**
 * Generate a 7-day meal plan using AI.
 * Returns an array of planned meals for the week.
 */
export const generateWeekPlan = action({
  args: {
    weekStartDate: v.string(),
    householdSize: v.number(),
    dietaryPreferences: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    meals: v.optional(
      v.array(
        v.object({
          dayOfWeek: v.string(),
          date: v.string(),
          mealName: v.string(),
          effortTier: v.union(
            v.literal("super-easy"),
            v.literal("middle"),
            v.literal("more-prep")
          ),
          prepTime: v.number(),
          cookTime: v.number(),
          cleanupRating: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high")
          ),
          ingredients: v.array(v.string()),
          steps: v.array(v.string()),
          isFlexMeal: v.boolean(),
        })
      )
    ),
    error: v.optional(v.string()),
  }),
  handler: async (
    ctx,
    { weekStartDate, householdSize, dietaryPreferences }
  ): Promise<{
    success: boolean;
    meals?: Array<{
      dayOfWeek: string;
      date: string;
      mealName: string;
      effortTier: "super-easy" | "middle" | "more-prep";
      prepTime: number;
      cookTime: number;
      cleanupRating: "low" | "medium" | "high";
      ingredients: string[];
      steps: string[];
      isFlexMeal: boolean;
    }>;
    error?: string;
  }> => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey || apiKey === "sk-or-v1-your-key-here") {
      return {
        success: false,
        error: "OpenRouter API key not configured",
      };
    }

    // Calculate dates for the week
    const startDate = new Date(weekStartDate);
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const dates = days.map((_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return date.toISOString().split("T")[0];
    });

    const systemPrompt = buildWeekPlanSystemPrompt({
      sampleDate: dates[0],
      includeRecipeLibraryField: false,
      isQuickPlan: false,
    });

    const userPrompt = `Generate a 7-day dinner plan for ${householdSize} people.
Week starting: ${weekStartDate}
${dietaryPreferences ? `Dietary preferences: ${dietaryPreferences}` : "No specific dietary restrictions."}

Generate exactly 7 meals, one for each day from Monday to Sunday.
Use these exact dates: ${dates.join(", ")}`;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://dinndone.com",
          "X-Title": "DinnDone",
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: WEEK_PLAN_MAX_TOKENS,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `API error (${response.status}): ${errorText}`,
        };
      }

      const data = (await response.json()) as OpenRouterResponse;

      if (!data.choices || data.choices.length === 0) {
        return {
          success: false,
          error: "Empty response from AI",
        };
      }

      const content = data.choices[0].message.content;
      const cleanedContent = cleanJsonResponse(content);

      try {
        const parsed = JSON.parse(cleanedContent) as {
          meals: Array<{
            dayOfWeek: string;
            date: string;
            mealName: string;
            effortTier: "super-easy" | "middle" | "more-prep";
            prepTime: number;
            cookTime: number;
            cleanupRating: "low" | "medium" | "high";
            ingredients: string[];
            steps?: string[];
            isFlexMeal: boolean;
          }>;
        };

        if (!parsed.meals || !Array.isArray(parsed.meals)) {
          return {
            success: false,
            error: "Invalid response format: missing meals array",
          };
        }

        // Ensure steps array exists (default to empty if AI didn't provide)
        const mealsWithSteps = parsed.meals.map((meal) => ({
          ...meal,
          steps: meal.steps || [],
        }));

        return {
          success: true,
          meals: mealsWithSteps,
        };
      } catch (parseError) {
        return {
          success: false,
          error: `Failed to parse AI response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Request failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});

// =============================================================================
// Conversational Planning Actions
// =============================================================================

/**
 * Quick generate a week plan (for "Just plan it for me" flow).
 * Uses saved recipes when available, checks recent meals for variety.
 */
export const quickGeneratePlan = action({
  args: {
    weekStartDate: v.string(),
    householdSize: v.number(),
    existingMeals: v.array(
      v.object({
        date: v.string(),
        mealName: v.string(),
        keep: v.boolean(),
      })
    ),
    savedRecipes: v.array(
      v.object({
        name: v.string(),
        effortTier: v.union(
          v.literal("super-easy"),
          v.literal("middle"),
          v.literal("more-prep")
        ),
      })
    ),
    recentMeals: v.array(
      v.object({
        name: v.string(),
        date: v.string(),
      })
    ),
  },
  returns: v.object({
    success: v.boolean(),
    meals: v.optional(
      v.array(
        v.object({
          dayOfWeek: v.string(),
          date: v.string(),
          mealName: v.string(),
          effortTier: v.union(
            v.literal("super-easy"),
            v.literal("middle"),
            v.literal("more-prep")
          ),
          prepTime: v.number(),
          cookTime: v.number(),
          cleanupRating: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high")
          ),
          ingredients: v.array(v.string()),
          steps: v.array(v.string()),
          isFlexMeal: v.boolean(),
          fromRecipeLibrary: v.boolean(),
        })
      )
    ),
    error: v.optional(v.string()),
  }),
  handler: async (
    ctx,
    { weekStartDate, householdSize, existingMeals, savedRecipes, recentMeals }
  ): Promise<{
    success: boolean;
    meals?: Array<{
      dayOfWeek: string;
      date: string;
      mealName: string;
      effortTier: "super-easy" | "middle" | "more-prep";
      prepTime: number;
      cookTime: number;
      cleanupRating: "low" | "medium" | "high";
      ingredients: string[];
      steps: string[];
      isFlexMeal: boolean;
      fromRecipeLibrary: boolean;
    }>;
    error?: string;
  }> => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey || apiKey === "sk-or-v1-your-key-here") {
      return {
        success: false,
        error: "OpenRouter API key not configured",
      };
    }

    // Calculate dates for the week
    const startDate = new Date(weekStartDate);
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const dates = days.map((_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return date.toISOString().split("T")[0];
    });

    // Build context about existing meals to keep
    const mealsToKeep = existingMeals.filter((m) => m.keep);
    const keepContext = buildKeepMealsContext(mealsToKeep);

    // Build recipe library context
    const recipeContext = buildRecipeLibraryContext(savedRecipes);

    // Build recent meals context for variety
    const recentMealNames = recentMeals.map((m) => m.name);
    const varietyContext = buildRecentMealsContext(recentMealNames);

    const systemPrompt = buildWeekPlanSystemPrompt({
      sampleDate: dates[0],
      includeRecipeLibraryField: true,
      isQuickPlan: true,
      additionalContext: keepContext + recipeContext + varietyContext,
    });

    const userPrompt = `Generate a 7-day dinner plan for ${householdSize} people.
Week starting: ${weekStartDate}
Use these exact dates: ${dates.join(", ")}

Quick plan - use sensible family-friendly defaults.`;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://dinndone.com",
          "X-Title": "DinnDone",
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: WEEK_PLAN_MAX_TOKENS,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `API error (${response.status}): ${errorText}`,
        };
      }

      const data = (await response.json()) as OpenRouterResponse;

      if (!data.choices || data.choices.length === 0) {
        return {
          success: false,
          error: "Empty response from AI",
        };
      }

      const content = data.choices[0].message.content;
      const cleanedContent = cleanJsonResponse(content);

      try {
        const parsed = JSON.parse(cleanedContent) as {
          meals: Array<{
            dayOfWeek: string;
            date: string;
            mealName: string;
            effortTier: "super-easy" | "middle" | "more-prep";
            prepTime: number;
            cookTime: number;
            cleanupRating: "low" | "medium" | "high";
            ingredients: string[];
            steps?: string[];
            isFlexMeal: boolean;
            fromRecipeLibrary: boolean;
          }>;
        };

        if (!parsed.meals || !Array.isArray(parsed.meals)) {
          return {
            success: false,
            error: "Invalid response format: missing meals array",
          };
        }

        // Ensure steps array exists (default to empty if AI didn't provide)
        const mealsWithSteps = parsed.meals.map((meal) => ({
          ...meal,
          steps: meal.steps || [],
        }));

        return {
          success: true,
          meals: mealsWithSteps,
        };
      } catch (parseError) {
        return {
          success: false,
          error: `Failed to parse AI response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Request failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});

/**
 * Generate a week plan with conversation context (for "Let's discuss" flow).
 * Takes full chat history into account for personalized planning.
 */
export const generatePlanWithConversation = action({
  args: {
    weekStartDate: v.string(),
    householdSize: v.number(),
    existingMeals: v.array(
      v.object({
        date: v.string(),
        mealName: v.string(),
        keep: v.boolean(),
      })
    ),
    savedRecipes: v.array(
      v.object({
        name: v.string(),
        effortTier: v.union(
          v.literal("super-easy"),
          v.literal("middle"),
          v.literal("more-prep")
        ),
      })
    ),
    recentMeals: v.array(
      v.object({
        name: v.string(),
        date: v.string(),
      })
    ),
    conversationHistory: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("zylo")),
        content: v.string(),
      })
    ),
  },
  returns: v.object({
    success: v.boolean(),
    meals: v.optional(
      v.array(
        v.object({
          dayOfWeek: v.string(),
          date: v.string(),
          mealName: v.string(),
          effortTier: v.union(
            v.literal("super-easy"),
            v.literal("middle"),
            v.literal("more-prep")
          ),
          prepTime: v.number(),
          cookTime: v.number(),
          cleanupRating: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high")
          ),
          ingredients: v.array(v.string()),
          steps: v.array(v.string()),
          isFlexMeal: v.boolean(),
          fromRecipeLibrary: v.boolean(),
        })
      )
    ),
    error: v.optional(v.string()),
  }),
  handler: async (
    ctx,
    {
      weekStartDate,
      householdSize,
      existingMeals,
      savedRecipes,
      recentMeals,
      conversationHistory,
    }
  ): Promise<{
    success: boolean;
    meals?: Array<{
      dayOfWeek: string;
      date: string;
      mealName: string;
      effortTier: "super-easy" | "middle" | "more-prep";
      prepTime: number;
      cookTime: number;
      cleanupRating: "low" | "medium" | "high";
      ingredients: string[];
      steps: string[];
      isFlexMeal: boolean;
      fromRecipeLibrary: boolean;
    }>;
    error?: string;
  }> => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey || apiKey === "sk-or-v1-your-key-here") {
      return {
        success: false,
        error: "OpenRouter API key not configured",
      };
    }

    // Calculate dates for the week
    const startDate = new Date(weekStartDate);
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const dates = days.map((_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return date.toISOString().split("T")[0];
    });

    // Build conversation summary
    const conversationSummary = conversationHistory
      .map((m) => `${m.role === "user" ? "User" : "Zylo"}: ${m.content}`)
      .join("\n");

    // Build context about existing meals to keep
    const mealsToKeep = existingMeals.filter((m) => m.keep);
    const keepContext = buildKeepMealsContext(mealsToKeep);

    // Build recipe library context
    const recipeContext = buildRecipeLibraryContext(savedRecipes, "prefer these");

    // Build recent meals context for variety
    const recentMealNames = recentMeals.map((m) => m.name);
    const varietyContext = buildRecentMealsContext(recentMealNames);

    const systemPrompt = buildWeekPlanSystemPrompt({
      sampleDate: dates[0],
      includeRecipeLibraryField: true,
      isQuickPlan: false,
      additionalContext: keepContext + recipeContext + varietyContext,
      customRules: [
        "- IMPORTANT: Follow what the user discussed in conversation (busy nights, energy levels, preferences)",
      ],
    });

    const userPrompt = `CONVERSATION CONTEXT:
${conversationSummary}

---
Generate a 7-day dinner plan for ${householdSize} people based on the above conversation.
Week starting: ${weekStartDate}
Use these exact dates: ${dates.join(", ")}`;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://dinndone.com",
          "X-Title": "DinnDone",
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: WEEK_PLAN_MAX_TOKENS,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `API error (${response.status}): ${errorText}`,
        };
      }

      const data = (await response.json()) as OpenRouterResponse;

      if (!data.choices || data.choices.length === 0) {
        return {
          success: false,
          error: "Empty response from AI",
        };
      }

      const content = data.choices[0].message.content;
      const cleanedContent = cleanJsonResponse(content);

      try {
        const parsed = JSON.parse(cleanedContent) as {
          meals: Array<{
            dayOfWeek: string;
            date: string;
            mealName: string;
            effortTier: "super-easy" | "middle" | "more-prep";
            prepTime: number;
            cookTime: number;
            cleanupRating: "low" | "medium" | "high";
            ingredients: string[];
            steps?: string[];
            isFlexMeal: boolean;
            fromRecipeLibrary: boolean;
          }>;
        };

        if (!parsed.meals || !Array.isArray(parsed.meals)) {
          return {
            success: false,
            error: "Invalid response format: missing meals array",
          };
        }

        // Ensure steps array exists (default to empty if AI didn't provide)
        const mealsWithSteps = parsed.meals.map((meal) => ({
          ...meal,
          steps: meal.steps || [],
        }));

        return {
          success: true,
          meals: mealsWithSteps,
        };
      } catch (parseError) {
        return {
          success: false,
          error: `Failed to parse AI response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Request failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});

/**
 * Analyze pantry contents against needed ingredients.
 * Compares what the user has on hand to what they need for their meal plan.
 */
export const analyzePantry = action({
  args: {
    userHasOnHand: v.string(),
    neededIngredients: v.array(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    missingItems: v.optional(v.array(v.string())),
    zyloResponse: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (
    ctx,
    { userHasOnHand, neededIngredients }
  ): Promise<{
    success: boolean;
    missingItems?: string[];
    zyloResponse?: string;
    error?: string;
  }> => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey || apiKey === "sk-or-v1-your-key-here") {
      return {
        success: false,
        error: "OpenRouter API key not configured",
      };
    }

    const systemPrompt = `You are Zylo, a friendly meal planning assistant. The user is telling you what ingredients they have on hand. Your job is to compare that to the list of needed ingredients and identify what's missing.

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "missingItems": ["ingredient1", "ingredient2"],
  "zyloResponse": "A warm, brief response (1-2 sentences)"
}

Rules:
- Compare the user's description to the needed ingredients list
- Be generous with matching - "chicken" matches "chicken breast", "onion" matches "yellow onion", etc.
- If the user says they have "most things" or similar, only flag obvious gaps
- missingItems should ONLY include items from the neededIngredients list that the user clearly doesn't have
- If everything seems covered, return an empty missingItems array
- zyloResponse should be warm and conversational (1-2 sentences max)
- If there are missing items, acknowledge them kindly
- If they have everything, celebrate briefly

Needed ingredients for their meal plan:
${neededIngredients.join(", ")}`;

    const userPrompt = `Here's what I have on hand: ${userHasOnHand}`;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://dinndone.com",
          "X-Title": "DinnDone",
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: PANTRY_ANALYSIS_MAX_TOKENS,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `API error (${response.status}): ${errorText}`,
        };
      }

      const data = (await response.json()) as OpenRouterResponse;

      if (!data.choices || data.choices.length === 0) {
        return {
          success: false,
          error: "Empty response from AI",
        };
      }

      const content = data.choices[0].message.content;
      const cleanedContent = cleanJsonResponse(content);

      const parsed = JSON.parse(cleanedContent) as {
        missingItems: string[];
        zyloResponse: string;
      };

      return {
        success: true,
        missingItems: parsed.missingItems || [],
        zyloResponse: parsed.zyloResponse,
      };
    } catch (error) {
      return {
        success: false,
        error: `Request failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});

/**
 * Update a single meal based on chat instruction (for post-generation changes).
 * E.g., "Make Wednesday leftovers" or "Change Tuesday to pizza"
 */
export const updateMealFromChat = action({
  args: {
    currentMealName: v.string(),
    dayOfWeek: v.string(),
    date: v.string(),
    instruction: v.string(),
    savedRecipes: v.array(
      v.object({
        name: v.string(),
        effortTier: v.union(
          v.literal("super-easy"),
          v.literal("middle"),
          v.literal("more-prep")
        ),
      })
    ),
  },
  returns: v.object({
    success: v.boolean(),
    updatedMeal: v.optional(
      v.object({
        mealName: v.string(),
        effortTier: v.union(
          v.literal("super-easy"),
          v.literal("middle"),
          v.literal("more-prep")
        ),
        prepTime: v.number(),
        cookTime: v.number(),
        cleanupRating: v.union(
          v.literal("low"),
          v.literal("medium"),
          v.literal("high")
        ),
        ingredients: v.array(v.string()),
        isFlexMeal: v.boolean(),
        fromRecipeLibrary: v.boolean(),
      })
    ),
    zyloResponse: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (
    ctx,
    { currentMealName, dayOfWeek, date, instruction, savedRecipes }
  ): Promise<{
    success: boolean;
    updatedMeal?: {
      mealName: string;
      effortTier: "super-easy" | "middle" | "more-prep";
      prepTime: number;
      cookTime: number;
      cleanupRating: "low" | "medium" | "high";
      ingredients: string[];
      isFlexMeal: boolean;
      fromRecipeLibrary: boolean;
    };
    zyloResponse?: string;
    error?: string;
  }> => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey || apiKey === "sk-or-v1-your-key-here") {
      return {
        success: false,
        error: "OpenRouter API key not configured",
      };
    }

    const recipeContext = buildRecipeLibraryContext(savedRecipes, "prefer if matching");
    const systemPrompt = buildMealUpdateSystemPrompt(recipeContext);

    const userPrompt = `Current meal on ${dayOfWeek} (${date}): "${currentMealName}"
User instruction: "${instruction}"

Generate the updated meal.`;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://dinndone.com",
          "X-Title": "DinnDone",
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: MEAL_UPDATE_MAX_TOKENS,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `API error (${response.status}): ${errorText}`,
        };
      }

      const data = (await response.json()) as OpenRouterResponse;

      if (!data.choices || data.choices.length === 0) {
        return {
          success: false,
          error: "Empty response from AI",
        };
      }

      const content = data.choices[0].message.content;
      const cleanedContent = cleanJsonResponse(content);

      const parsed = JSON.parse(cleanedContent) as {
        updatedMeal: {
          mealName: string;
          effortTier: "super-easy" | "middle" | "more-prep";
          prepTime: number;
          cookTime: number;
          cleanupRating: "low" | "medium" | "high";
          ingredients: string[];
          isFlexMeal: boolean;
          fromRecipeLibrary: boolean;
        };
        zyloResponse: string;
      };

      if (!parsed.updatedMeal) {
        return {
          success: false,
          error: "Invalid response format: missing updatedMeal",
        };
      }

      return {
        success: true,
        updatedMeal: parsed.updatedMeal,
        zyloResponse: parsed.zyloResponse,
      };
    } catch (error) {
      return {
        success: false,
        error: `Request failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});

// =============================================================================
// Context Injection for Personalized AI
// =============================================================================

/**
 * Build Zylo context string for AI prompts.
 * Returns tiered context based on usage scenario.
 *
 * Tiers:
 * - minimal: Just zyloNotes (~200 tokens)
 * - planning: +dietary restrictions, effort preference (~300 tokens)
 * - shopping: +store list, budget level (~350 tokens)
 * - full: Complete profile for deep questions (~500 tokens)
 */
export const buildZyloContext = action({
  args: {
    tier: v.union(
      v.literal("minimal"),
      v.literal("planning"),
      v.literal("shopping"),
      v.literal("full")
    ),
    userId: v.id("users"),
  },
  returns: v.object({
    context: v.string(),
    hasProfile: v.boolean(),
  }),
  handler: async (ctx, { tier, userId }): Promise<{ context: string; hasProfile: boolean }> => {
    // Fetch family profile
    const profile = await ctx.runQuery(internal.aiContext.getFamilyProfile, { userId });
    const prefs = await ctx.runQuery(internal.aiContext.getUserPreferences, { userId });

    if (!profile && !prefs) {
      return {
        context: "",
        hasProfile: false,
      };
    }

    const contextParts: string[] = [];

    // MINIMAL tier: Just zyloNotes
    if (profile?.zyloNotes) {
      contextParts.push(`Family Context: ${profile.zyloNotes}`);
    }

    if (tier === "minimal") {
      return {
        context: contextParts.join("\n\n"),
        hasProfile: !!profile,
      };
    }

    // PLANNING tier: +dietary and effort
    if (prefs?.dietaryRestrictions && prefs.dietaryRestrictions.length > 0) {
      contextParts.push(`Dietary Restrictions: ${prefs.dietaryRestrictions.join(", ")}`);
    }

    if (prefs?.effortPreference) {
      const effortMap: Record<string, string> = {
        "super-easy": "prefers super-easy, minimal-prep meals",
        middle: "likes a mix of easy and moderate effort meals",
        "more-prep": "enjoys cooking and is happy to spend time in the kitchen",
        mixed: "varies - match effort to the day of week",
      };
      contextParts.push(`Cooking Effort: ${effortMap[prefs.effortPreference] || prefs.effortPreference}`);
    }

    if (profile?.healthContext?.conditions && profile.healthContext.conditions.length > 0) {
      contextParts.push(`Health Considerations: ${profile.healthContext.conditions.join(", ")}`);
    }

    if (tier === "planning") {
      return {
        context: contextParts.join("\n\n"),
        hasProfile: !!profile,
      };
    }

    // SHOPPING tier: +stores and budget
    if (profile?.shoppingPreferences?.primaryStores && profile.shoppingPreferences.primaryStores.length > 0) {
      contextParts.push(`Primary Stores: ${profile.shoppingPreferences.primaryStores.join(", ")}`);
    }

    if (profile?.shoppingPreferences?.budgetLevel) {
      const budgetMap: Record<string, string> = {
        "budget-conscious": "budget-conscious, looks for deals",
        moderate: "moderate budget, balances cost and quality",
        flexible: "flexible budget, prioritizes quality",
      };
      contextParts.push(`Budget: ${budgetMap[profile.shoppingPreferences.budgetLevel] || profile.shoppingPreferences.budgetLevel}`);
    }

    if (profile?.shoppingPreferences?.frequency) {
      contextParts.push(`Shopping Frequency: ${profile.shoppingPreferences.frequency}`);
    }

    if (tier === "shopping") {
      return {
        context: contextParts.join("\n\n"),
        hasProfile: !!profile,
      };
    }

    // FULL tier: Everything
    if (profile?.familyDynamics?.primaryCook) {
      contextParts.push(`Primary Cook: ${profile.familyDynamics.primaryCook}`);
    }

    if (profile?.familyDynamics?.pickyEaters && profile.familyDynamics.pickyEaters.length > 0) {
      contextParts.push(`Picky Eaters: ${profile.familyDynamics.pickyEaters.join(", ")}`);
    }

    if (profile?.cookingCapacity?.weeknightMinutes) {
      contextParts.push(`Weeknight Cooking Time: max ${profile.cookingCapacity.weeknightMinutes} minutes`);
    }

    if (profile?.cookingCapacity?.energyLevel) {
      const energyMap: Record<string, string> = {
        low: "limited energy for cooking",
        variable: "energy varies day to day",
        good: "generally has good energy for cooking",
      };
      contextParts.push(`Energy Level: ${energyMap[profile.cookingCapacity.energyLevel] || profile.cookingCapacity.energyLevel}`);
    }

    if (profile?.healthContext?.foodValues && profile.healthContext.foodValues.length > 0) {
      contextParts.push(`Food Values: ${profile.healthContext.foodValues.join(", ")}`);
    }

    return {
      context: contextParts.join("\n\n"),
      hasProfile: !!profile,
    };
  },
});

// =============================================================================
// Grocery List Chat Actions
// =============================================================================

/** Max tokens for grocery chat responses */
const GROCERY_CHAT_MAX_TOKENS = 800;

interface GroceryAction {
  type: "add" | "move" | "check" | "uncheck" | "remove" | "createStore";
  itemName: string;
  quantity?: string;
  storeId?: string;
  storeName?: string;
  isOrganic?: boolean;
}

/**
 * Chat with Zylo about grocery list management.
 * Parses natural language to add, move, check, or remove items.
 */
export const groceryChat = action({
  args: {
    message: v.string(),
    availableStores: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
      })
    ),
    currentItems: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        storeId: v.optional(v.string()),
        storeName: v.optional(v.string()),
        isChecked: v.boolean(),
      })
    ),
    conversationHistory: v.optional(
      v.array(
        v.object({
          role: v.union(v.literal("user"), v.literal("zylo")),
          content: v.string(),
        })
      )
    ),
  },
  returns: v.object({
    success: v.boolean(),
    zyloResponse: v.optional(v.string()),
    actions: v.optional(
      v.array(
        v.object({
          type: v.union(
            v.literal("add"),
            v.literal("move"),
            v.literal("check"),
            v.literal("uncheck"),
            v.literal("remove"),
            v.literal("createStore")
          ),
          itemName: v.string(),
          quantity: v.optional(v.string()),
          storeId: v.optional(v.string()),
          storeName: v.optional(v.string()),
          isOrganic: v.optional(v.boolean()),
        })
      )
    ),
    needsStoreSelection: v.optional(
      v.object({
        items: v.array(v.string()),
        availableStores: v.array(v.string()),
      })
    ),
    error: v.optional(v.string()),
  }),
  handler: async (
    _ctx,
    { message, availableStores, currentItems, conversationHistory }
  ): Promise<{
    success: boolean;
    zyloResponse?: string;
    actions?: GroceryAction[];
    needsStoreSelection?: {
      items: string[];
      availableStores: string[];
    };
    error?: string;
  }> => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey || apiKey === "sk-or-v1-your-key-here") {
      return {
        success: false,
        error: "OpenRouter API key not configured",
      };
    }

    const storeList = availableStores.length > 0
      ? availableStores.map((s) => `- ${s.name} (id: ${s.id})`).join("\n")
      : "";
    const itemList =
      currentItems.length > 0
        ? currentItems
            .map(
              (i) =>
                `- ${i.name}${i.storeName ? ` (at ${i.storeName})` : " (unassigned)"}${i.isChecked ? " [CHECKED]" : ""}`
            )
            .join("\n")
        : "(empty list)";

    const systemPrompt = `You are Zylo, a friendly grocery list assistant for the DinnDone app. Help users manage their grocery list through natural conversation.

AVAILABLE STORES:
${storeList || "(no stores yet)"}

CURRENT GROCERY LIST:
${itemList}

Your job is to understand what the user wants to do and return structured actions. Parse natural language into actions.

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "zyloResponse": "A warm, brief conversational response (1-2 sentences)",
  "actions": [
    {
      "type": "add" | "move" | "check" | "uncheck" | "remove" | "createStore",
      "itemName": "item name (or store name for createStore)",
      "quantity": "optional quantity string like '2 lbs' or '1'",
      "storeId": "store id from list above, or 'NEW' for new stores",
      "storeName": "store name for confirmation message",
      "isOrganic": true/false (optional, for add only)
    }
  ],
  "needsStoreSelection": {
    "items": ["item1", "item2"],
    "availableStores": ["Costco", "Aldi"]
  }
}

RULES:
1. For "add" actions, always include storeId if the user specified a store
2. **IMPORTANT: If user mentions a store NOT in the AVAILABLE STORES list, first add a "createStore" action**, then add the items with storeId: "NEW" and the storeName. The app will handle linking them.
3. If user says "add X" without specifying ANY store, set needsStoreSelection with the items and available store names
4. For "check" or "uncheck", match item names case-insensitively to current list
5. For "move", include both the item name and the target storeId
6. Default quantity to "1" if not specified
7. Parse quantities naturally: "2 lbs of chicken" → itemName: "chicken", quantity: "2 lbs"
8. Recognize organic requests: "organic apples" → itemName: "apples", isOrganic: true
9. Be generous with matching - "milk" matches "Milk", "2% milk", etc.
10. zyloResponse should be warm and conversational, confirming what you did

EXAMPLES:
User: "Add chicken to Costco" (Costco exists)
→ actions: [{ type: "add", itemName: "chicken", quantity: "1", storeId: "costco-id", storeName: "Costco" }]

User: "Pick up black beans at Aldi" (Aldi does NOT exist yet)
→ actions: [
  { type: "createStore", itemName: "Aldi", storeName: "Aldi" },
  { type: "add", itemName: "black beans", quantity: "1", storeId: "NEW", storeName: "Aldi" }
]
→ zyloResponse: "Added Aldi as a new store and added black beans to it!"

User: "I need eggs, milk, and bread"
→ needsStoreSelection: { items: ["eggs", "milk", "bread"], availableStores: ["Costco", "Aldi"] }

User: "At Trader Joe's I need apples and cheese" (Trader Joe's does NOT exist)
→ actions: [
  { type: "createStore", itemName: "Trader Joe's", storeName: "Trader Joe's" },
  { type: "add", itemName: "apples", quantity: "1", storeId: "NEW", storeName: "Trader Joe's" },
  { type: "add", itemName: "cheese", quantity: "1", storeId: "NEW", storeName: "Trader Joe's" }
]

User: "I got the milk and eggs"
→ actions: [{ type: "check", itemName: "milk" }, { type: "check", itemName: "eggs" }]

User: "Move the avocados to Trader Joe's"
→ actions: [{ type: "move", itemName: "avocados", storeId: "traders-id", storeName: "Trader Joe's" }]`;

    // Build conversation messages
    const messages: OpenRouterMessage[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory.slice(-6)) {
        // Last 6 messages for context
        messages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        });
      }
    }

    // Add current message
    messages.push({ role: "user", content: message });

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://dinndone.com",
          "X-Title": "DinnDone",
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages,
          max_tokens: GROCERY_CHAT_MAX_TOKENS,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `API error (${response.status}): ${errorText}`,
        };
      }

      const data = (await response.json()) as OpenRouterResponse;

      if (!data.choices || data.choices.length === 0) {
        return {
          success: false,
          error: "Empty response from AI",
        };
      }

      const content = data.choices[0].message.content;
      const cleanedContent = cleanJsonResponse(content);

      try {
        const parsed = JSON.parse(cleanedContent) as {
          zyloResponse: string;
          actions?: GroceryAction[];
          needsStoreSelection?: {
            items: string[];
            availableStores: string[];
          };
        };

        return {
          success: true,
          zyloResponse: parsed.zyloResponse,
          actions: parsed.actions,
          needsStoreSelection: parsed.needsStoreSelection,
        };
      } catch {
        // If parsing fails, return the raw content as zyloResponse
        return {
          success: true,
          zyloResponse: content,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Request failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});
