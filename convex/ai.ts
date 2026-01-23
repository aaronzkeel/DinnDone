"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

// OpenRouter API endpoint
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Default model as specified in the product plan
const DEFAULT_MODEL = "google/gemini-2.0-flash-001";

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
  handler: async (ctx): Promise<{
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
          max_tokens: 100,
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
          max_tokens: maxTokens ?? 500,
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

    const excludeList = excludeMeals?.length
      ? `\nDo NOT suggest these meals (already in plan): ${excludeMeals.join(", ")}`
      : "";

    const systemPrompt = `You are Zylo, a meal planning assistant. Suggest 3 alternative dinner options.
Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "alternatives": [
    {
      "mealName": "Example Meal",
      "effortTier": "super-easy",
      "prepTime": 10,
      "cookTime": 20,
      "cleanupRating": "low",
      "briefDescription": "A quick and easy option",
      "isFlexMeal": true
    }
  ]
}

Rules:
- effortTier must be exactly: "super-easy", "middle", or "more-prep"
- cleanupRating must be exactly: "low", "medium", or "high"
- prepTime and cookTime are in minutes
- briefDescription should be 1 short sentence (under 60 chars)
- Provide variety: one easy, one medium, one more involved option
- Suggest family-friendly, common meals people actually cook
- Consider similar cuisine or ingredients to the current meal${excludeList}`;

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
          max_tokens: 800,
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

      try {
        const cleanedContent = content
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        const parsed = JSON.parse(cleanedContent) as {
          alternatives: Array<{
            mealName: string;
            effortTier: "super-easy" | "middle" | "more-prep";
            prepTime: number;
            cookTime: number;
            cleanupRating: "low" | "medium" | "high";
            briefDescription: string;
            isFlexMeal: boolean;
          }>;
        };

        if (!parsed.alternatives || !Array.isArray(parsed.alternatives)) {
          return {
            success: false,
            error: "Invalid response format: missing alternatives array",
          };
        }

        return {
          success: true,
          alternatives: parsed.alternatives,
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

    const systemPrompt = `You are Zylo, a meal planning assistant. Generate a 7-day dinner plan for a family.
Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "meals": [
    {
      "dayOfWeek": "Monday",
      "date": "${dates[0]}",
      "mealName": "Example Meal",
      "effortTier": "super-easy",
      "prepTime": 10,
      "cookTime": 20,
      "cleanupRating": "low",
      "ingredients": ["ingredient1", "ingredient2"],
      "isFlexMeal": false
    }
  ]
}

Rules:
- effortTier must be exactly: "super-easy", "middle", or "more-prep"
- cleanupRating must be exactly: "low", "medium", or "high"
- Include 3-8 main ingredients per meal
- prepTime and cookTime are in minutes
- Mix effort levels: more easy meals during weekdays, allow more prep on weekends
- Mark 2-3 meals as isFlexMeal: true (easy to swap or make quick adjustments)
- IMPORTANT: Follow 80/20 rule - 5-6 meals should be familiar family favorites (tacos, spaghetti, grilled chicken, stir fry, etc.), only 1-2 should be new or adventurous ideas
- Make meals family-friendly and varied throughout the week`;

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
          max_tokens: 2000,
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

      // Parse the JSON response
      try {
        // Remove potential markdown code blocks
        const cleanedContent = content
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

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
            isFlexMeal: boolean;
          }>;
        };

        if (!parsed.meals || !Array.isArray(parsed.meals)) {
          return {
            success: false,
            error: "Invalid response format: missing meals array",
          };
        }

        return {
          success: true,
          meals: parsed.meals,
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
          v.literal("easy"),
          v.literal("medium"),
          v.literal("involved")
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
    const keepContext =
      mealsToKeep.length > 0
        ? `\nKEEP these existing meals (do not replace):\n${mealsToKeep.map((m) => `- ${m.date}: ${m.mealName}`).join("\n")}`
        : "";

    // Build recipe library context
    const recipeContext =
      savedRecipes.length > 0
        ? `\nSaved recipes (prefer these, use ~80% from this list):\n${savedRecipes.map((r) => `- ${r.name}`).join("\n")}`
        : "";

    // Build recent meals context for variety
    const recentMealNames = recentMeals.map((m) => m.name);
    const varietyContext =
      recentMealNames.length > 0
        ? `\nAvoid exact repeats of these recent meals (past 2 weeks):\n${recentMealNames.join(", ")}`
        : "";

    const systemPrompt = `You are Zylo, a meal planning assistant. Generate a quick 7-day dinner plan.
Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "meals": [
    {
      "dayOfWeek": "Monday",
      "date": "${dates[0]}",
      "mealName": "Example Meal",
      "effortTier": "super-easy",
      "prepTime": 10,
      "cookTime": 20,
      "cleanupRating": "low",
      "ingredients": ["ingredient1", "ingredient2"],
      "isFlexMeal": false,
      "fromRecipeLibrary": true
    }
  ]
}

Rules:
- effortTier must be exactly: "super-easy", "middle", or "more-prep"
- cleanupRating must be exactly: "low", "medium", or "high"
- Include 3-8 main ingredients per meal
- prepTime and cookTime are in minutes
- fromRecipeLibrary: true if meal name matches a saved recipe, false if new suggestion
- Mix effort levels: more easy meals during weekdays
- Mark 2-3 meals as isFlexMeal: true${keepContext}${recipeContext}${varietyContext}`;

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
          max_tokens: 2000,
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
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

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

      return {
        success: true,
        meals: parsed.meals,
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
          v.literal("easy"),
          v.literal("medium"),
          v.literal("involved")
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
    const keepContext =
      mealsToKeep.length > 0
        ? `\nKEEP these existing meals:\n${mealsToKeep.map((m) => `- ${m.date}: ${m.mealName}`).join("\n")}`
        : "";

    // Build recipe library context
    const recipeContext =
      savedRecipes.length > 0
        ? `\nSaved recipes (prefer these):\n${savedRecipes.map((r) => `- ${r.name}`).join("\n")}`
        : "";

    // Build recent meals context for variety
    const recentMealNames = recentMeals.map((m) => m.name);
    const varietyContext =
      recentMealNames.length > 0
        ? `\nAvoid exact repeats:\n${recentMealNames.join(", ")}`
        : "";

    const systemPrompt = `You are Zylo, a meal planning assistant. Generate a 7-day dinner plan based on the conversation.
Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "meals": [
    {
      "dayOfWeek": "Monday",
      "date": "${dates[0]}",
      "mealName": "Example Meal",
      "effortTier": "super-easy",
      "prepTime": 10,
      "cookTime": 20,
      "cleanupRating": "low",
      "ingredients": ["ingredient1", "ingredient2"],
      "isFlexMeal": false,
      "fromRecipeLibrary": true
    }
  ]
}

Rules:
- effortTier: "super-easy", "middle", or "more-prep"
- cleanupRating: "low", "medium", or "high"
- Include 3-8 main ingredients per meal
- prepTime and cookTime in minutes
- fromRecipeLibrary: true if from saved recipes
- IMPORTANT: Follow what the user discussed in conversation (busy nights, energy levels, preferences)${keepContext}${recipeContext}${varietyContext}`;

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
          max_tokens: 2000,
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
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

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

      return {
        success: true,
        meals: parsed.meals,
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
          max_tokens: 400,
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
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

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
          v.literal("easy"),
          v.literal("medium"),
          v.literal("involved")
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

    const recipeContext =
      savedRecipes.length > 0
        ? `\nSaved recipes (prefer if matching):\n${savedRecipes.map((r) => `- ${r.name}`).join("\n")}`
        : "";

    const systemPrompt = `You are Zylo, a meal planning assistant. Update a meal based on the user's instruction.
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
          max_tokens: 600,
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
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

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
