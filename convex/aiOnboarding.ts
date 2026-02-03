"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

// OpenRouter API endpoint
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
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

// System prompt for onboarding conversation
const ONBOARDING_SYSTEM_PROMPT = `You are Zylo, a warm and empathetic meal planning assistant for DinnDone. You're having a conversation to learn about a new family so you can help them with meal planning.

## Your Personality
- Warm, supportive, understanding
- You recognize that meal planning is stressful, especially for caregivers
- You listen more than you talk
- You acknowledge challenges without being pitying
- You're genuinely curious about their family

## Conversation Goals
Learn about:
1. Who's in the family (names, ages, roles)
2. Any health conditions that affect eating (chronic illness, allergies, conditions like Lyme, diabetes, etc.)
3. Dietary preferences or restrictions (gluten-free, vegetarian, organic, clean eating)
4. Cooking capacity (energy levels, time constraints, who cooks)
5. Shopping habits (where they shop, how often, budget considerations)

## CRITICAL Rules
- Ask ONE open-ended question at a time
- Wait for their response before asking follow-up questions
- Keep your responses SHORT - 2-3 sentences max
- Use their words back to them ("So Katie has Lyme - I totally get how that affects energy...")
- Don't be overly cheerful or use excessive exclamation marks
- After they mention something difficult, acknowledge it briefly before moving on
- Don't list multiple questions at once

## Conversation Flow
1. Opening: Warm greeting, ask who's in the family
2. Follow the natural conversation - if they mention health, explore that
3. After 8-12 exchanges, start to wrap up
4. End by summarizing what you learned and asking if you got it right

## Example Good Response
"A family of five with three kids - that's a lot of mouths to feed! Tell me a bit about your typical week. Are there nights that are crazier than others?"

## Example Bad Response (too long, too many questions)
"That's wonderful! So you have three kids. What are their ages? Do any of them have dietary restrictions? What about allergies? And who usually does the cooking in your house? Do you meal prep on weekends?"

Remember: You're having a conversation, not conducting an interview.`;

// System prompt for extracting structured data from conversation
const EXTRACTION_SYSTEM_PROMPT = `You are an AI assistant that extracts structured information from a conversation transcript.

Given a conversation between Zylo (a meal planning assistant) and a user during onboarding, extract the following information if mentioned:

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "householdMembers": [
    {
      "name": "string",
      "role": "parent|child|other",
      "age": number or null,
      "dietaryNotes": "string or null"
    }
  ],
  "dietaryRestrictions": ["gluten-free", "dairy-free", etc],
  "healthConditions": ["Lyme disease", "diabetes", etc],
  "foodValues": ["organic", "clean eating", "local", etc],
  "stores": ["Costco", "Meijer", etc],
  "cookingNotes": "Brief summary of cooking capacity and constraints"
}

Rules:
- Only include information that was explicitly mentioned
- Use null for unknown fields, don't guess
- For householdMembers, include everyone mentioned by name
- cookingNotes should be a brief summary of energy levels, time constraints, who cooks, etc.
- If something wasn't discussed, omit that field or use an empty array`;

// System prompt for generating zyloNotes summary
const ZYLO_NOTES_SYSTEM_PROMPT = `You are an AI assistant creating a context summary for a meal planning AI.

Given information about a family, create a dense ~200 word summary that captures everything the AI needs to know to personalize meal suggestions. This summary will be injected into every AI interaction to provide context.

Write in a factual, dense style - no fluff. Include:
- Family composition (names, ages, roles)
- Health conditions and their impact on meals
- Dietary restrictions and food values
- Cooking constraints (energy, time, who cooks)
- Shopping habits and budget
- Picky eaters or strong preferences
- Any specific scheduling notes

Example output:
"Family of 5: Aaron & Katie (parents), 3 kids (17, 14, 11). Katie has Lyme - energy crashes around 4pm, prioritize super-easy weeknight meals. Gluten-free for Katie, strong preference for clean/organic eating. Shop Meijer weekly, Costco monthly. Budget-conscious but flexible for quality meat. Ethan won't eat 'spicy' (even pepper). Weeknight dinner max 30 min. Aaron can cook weekends."

Return ONLY the summary text, no JSON wrapper.`;

/**
 * Chat action for onboarding conversation
 */
export const chat = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
  },
  returns: v.object({
    success: v.boolean(),
    content: v.optional(v.string()),
    error: v.optional(v.string()),
    shouldWrapUp: v.optional(v.boolean()),
  }),
  handler: async (
    ctx,
    { messages }
  ): Promise<{
    success: boolean;
    content?: string;
    error?: string;
    shouldWrapUp?: boolean;
  }> => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey || apiKey === "sk-or-v1-your-key-here") {
      return {
        success: false,
        error: "OpenRouter API key not configured",
      };
    }

    // Convert messages to OpenRouter format
    const openRouterMessages: OpenRouterMessage[] = [
      { role: "system", content: ONBOARDING_SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // Determine if we should wrap up based on message count
    const userMessageCount = messages.filter((m) => m.role === "user").length;
    const shouldWrapUp = userMessageCount >= 6; // After 6 user messages, start wrapping up

    // Add wrap-up hint if needed
    if (shouldWrapUp) {
      openRouterMessages[0].content +=
        "\n\nNOTE: The conversation has been going for a while. Start to wrap up soon - summarize what you've learned and ask if there's anything else important they'd like to share.";
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
          messages: openRouterMessages,
          max_tokens: 300, // Keep responses short
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
        shouldWrapUp,
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
 * Extract structured data from conversation
 */
export const extractInsights = action({
  args: {
    conversationMessages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
  },
  returns: v.object({
    success: v.boolean(),
    insights: v.optional(
      v.object({
        householdMembers: v.optional(
          v.array(
            v.object({
              name: v.string(),
              role: v.optional(v.string()),
              age: v.optional(v.number()),
              dietaryNotes: v.optional(v.string()),
            })
          )
        ),
        dietaryRestrictions: v.optional(v.array(v.string())),
        healthConditions: v.optional(v.array(v.string())),
        foodValues: v.optional(v.array(v.string())),
        stores: v.optional(v.array(v.string())),
        cookingNotes: v.optional(v.string()),
      })
    ),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, { conversationMessages }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey || apiKey === "sk-or-v1-your-key-here") {
      return {
        success: false,
        error: "OpenRouter API key not configured",
      };
    }

    // Format conversation as transcript
    const transcript = conversationMessages
      .map((m) => `${m.role === "user" ? "User" : "Zylo"}: ${m.content}`)
      .join("\n\n");

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
            { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
            {
              role: "user",
              content: `Extract information from this onboarding conversation:\n\n${transcript}`,
            },
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
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const parsed = JSON.parse(cleanedContent) as {
        householdMembers?: Array<{
          name: string;
          role?: string | null;
          age?: number | null;
          dietaryNotes?: string | null;
        }>;
        dietaryRestrictions?: string[];
        healthConditions?: string[];
        foodValues?: string[];
        stores?: string[];
        cookingNotes?: string | null;
      };

      // Sanitize the response - convert null values to undefined
      // Convex validators use v.optional() which only accepts undefined, not null
      const sanitizedInsights = {
        householdMembers: parsed.householdMembers?.map((member) => ({
          name: member.name,
          role: member.role ?? undefined,
          age: member.age ?? undefined,
          dietaryNotes: member.dietaryNotes ?? undefined,
        })),
        dietaryRestrictions: parsed.dietaryRestrictions ?? undefined,
        healthConditions: parsed.healthConditions ?? undefined,
        foodValues: parsed.foodValues ?? undefined,
        stores: parsed.stores ?? undefined,
        cookingNotes: parsed.cookingNotes ?? undefined,
      };

      return {
        success: true,
        insights: sanitizedInsights,
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
 * Generate zyloNotes summary from extracted insights
 */
export const generateZyloNotes = action({
  args: {
    insights: v.object({
      householdMembers: v.optional(
        v.array(
          v.object({
            name: v.string(),
            role: v.optional(v.string()),
            age: v.optional(v.number()),
            dietaryNotes: v.optional(v.string()),
          })
        )
      ),
      dietaryRestrictions: v.optional(v.array(v.string())),
      healthConditions: v.optional(v.array(v.string())),
      foodValues: v.optional(v.array(v.string())),
      stores: v.optional(v.array(v.string())),
      cookingNotes: v.optional(v.string()),
    }),
    conversationSummary: v.optional(v.string()), // Optional raw conversation for more context
  },
  returns: v.object({
    success: v.boolean(),
    zyloNotes: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, { insights, conversationSummary }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey || apiKey === "sk-or-v1-your-key-here") {
      return {
        success: false,
        error: "OpenRouter API key not configured",
      };
    }

    // Build context from insights
    const contextParts: string[] = [];

    if (insights.householdMembers && insights.householdMembers.length > 0) {
      const members = insights.householdMembers
        .map((m) => {
          let desc = m.name;
          if (m.role) desc += ` (${m.role})`;
          if (m.age) desc += `, age ${m.age}`;
          if (m.dietaryNotes) desc += ` - ${m.dietaryNotes}`;
          return desc;
        })
        .join("; ");
      contextParts.push(`Household: ${members}`);
    }

    if (insights.healthConditions && insights.healthConditions.length > 0) {
      contextParts.push(`Health conditions: ${insights.healthConditions.join(", ")}`);
    }

    if (insights.dietaryRestrictions && insights.dietaryRestrictions.length > 0) {
      contextParts.push(`Dietary restrictions: ${insights.dietaryRestrictions.join(", ")}`);
    }

    if (insights.foodValues && insights.foodValues.length > 0) {
      contextParts.push(`Food values: ${insights.foodValues.join(", ")}`);
    }

    if (insights.stores && insights.stores.length > 0) {
      contextParts.push(`Shops at: ${insights.stores.join(", ")}`);
    }

    if (insights.cookingNotes) {
      contextParts.push(`Cooking notes: ${insights.cookingNotes}`);
    }

    const insightsText = contextParts.join("\n");

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
            { role: "system", content: ZYLO_NOTES_SYSTEM_PROMPT },
            {
              role: "user",
              content: `Create a context summary from this information:\n\n${insightsText}${conversationSummary ? `\n\nAdditional context from conversation:\n${conversationSummary}` : ""}`,
            },
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

      return {
        success: true,
        zyloNotes: data.choices[0].message.content.trim(),
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
 * Get opening message for onboarding
 */
export const getOpeningMessage = action({
  args: {},
  returns: v.object({
    success: v.boolean(),
    content: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async () => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey || apiKey === "sk-or-v1-your-key-here") {
      // Return a default opening if API isn't configured
      return {
        success: true,
        content:
          "Hey there! I'm Zylo, and I'm going to help take the stress out of meal planning. Before we dive in, I'd love to learn a bit about your family. Who am I helping feed?",
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
          messages: [
            { role: "system", content: ONBOARDING_SYSTEM_PROMPT },
            {
              role: "user",
              content:
                "[SYSTEM: Generate an opening message to start the onboarding conversation. Ask about who's in the family.]",
            },
          ],
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        // Fall back to default
        return {
          success: true,
          content:
            "Hey there! I'm Zylo, and I'm going to help take the stress out of meal planning. Before we dive in, I'd love to learn a bit about your family. Who am I helping feed?",
        };
      }

      const data = (await response.json()) as OpenRouterResponse;

      if (!data.choices || data.choices.length === 0) {
        return {
          success: true,
          content:
            "Hey there! I'm Zylo, and I'm going to help take the stress out of meal planning. Before we dive in, I'd love to learn a bit about your family. Who am I helping feed?",
        };
      }

      return {
        success: true,
        content: data.choices[0].message.content,
      };
    } catch {
      return {
        success: true,
        content:
          "Hey there! I'm Zylo, and I'm going to help take the stress out of meal planning. Before we dive in, I'd love to learn a bit about your family. Who am I helping feed?",
      };
    }
  },
});
