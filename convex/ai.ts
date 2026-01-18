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
            "You are Zylo, a friendly meal planning assistant for Dinner Bell app. Respond briefly.",
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
          "HTTP-Referer": "https://dinner-bell.app",
          "X-Title": "Dinner Bell",
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
          "HTTP-Referer": "https://dinner-bell.app",
          "X-Title": "Dinner Bell",
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
