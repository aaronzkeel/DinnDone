"use client";

import { useState, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { MealHelperHome } from "@/components/meal-helper";
import type {
  HouseholdMember,
  PlannedMealSummary,
  ChatMessage,
} from "@/types/meal-helper";

// Sample data for testing
const sampleUser: HouseholdMember = {
  id: "1",
  name: "Aaron",
  isAdmin: true,
};

const sampleHouseholdMembers: HouseholdMember[] = [
  { id: "1", name: "Aaron", isAdmin: true },
  { id: "2", name: "Katie", isAdmin: true },
];

const sampleTonightMeal: PlannedMealSummary = {
  id: "1",
  mealName: "Chicken Stir Fry",
  effortTier: "middle",
  prepTime: 15,
  cookTime: 20,
  cleanupRating: "medium",
  ingredients: [
    "Chicken breast",
    "Bell peppers",
    "Broccoli",
    "Soy sauce",
    "Garlic",
    "Ginger",
    "Rice",
  ],
  isFlexMeal: true,
  assignedCookId: "2",
};

// System prompt for Zylo
const ZYLO_SYSTEM_PROMPT = `You are Zylo, a warm and encouraging meal planning assistant for the Dinner Bell family meal planning app.

Your personality:
- Friendly, supportive, and never judgmental
- You understand that feeding a family is hard work
- You celebrate small wins and normalize "good enough" meals
- You keep responses concise (2-3 sentences max unless asked for more)
- You use occasional emojis but don't overdo it (max 1-2 per message)

Context about tonight's meal plan:
- Tonight's planned meal: Chicken Stir Fry
- Effort level: Medium
- Cook: Katie
- Prep time: 15 min, Cook time: 20 min
- Key ingredients: Chicken breast, Bell peppers, Broccoli, Soy sauce, Garlic, Ginger, Rice
- This is a flex meal (can be easily swapped)

When users ask about meals:
- Suggest meals from the weekly plan when possible
- Be helpful with substitutions and modifications
- If they seem overwhelmed, remind them that takeout or leftovers are valid options
- Don't lecture about nutrition unless specifically asked

Remember: Your job is to reduce dinner decision fatigue, not add to it.`;

export default function TestZyloChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Convex action for AI chat
  const chatAction = useAction(api.ai.chat);

  const handleSendMessage = useCallback(async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: ZYLO_SYSTEM_PROMPT },
        // Include recent messages for context (last 10 messages max)
        ...messages.slice(-10).map((msg) => ({
          role: (msg.role === "user" ? "user" : "assistant") as "user" | "assistant",
          content: msg.content,
        })),
        { role: "user", content },
      ];

      // Call the Convex AI action
      const response = await chatAction({
        messages: conversationHistory,
        maxTokens: 300,
      });

      if (response.success && response.content) {
        const zyloMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "zylo",
          content: response.content,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, zyloMessage]);
      } else {
        // Handle error - show friendly error message from Zylo
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "zylo",
          content: "Hmm, I'm having trouble connecting right now. Let me try again in a moment! 🔄",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        console.error("AI chat error:", response.error);
      }
    } catch (error) {
      // Handle unexpected errors
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "zylo",
        content: "Oops, something went wrong on my end. Mind trying that again? 💛",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [chatAction, messages]);

  const handleVoiceInput = () => {
    console.log("Voice input triggered");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
          Test: Zylo AI Chat (Feature #90)
        </h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Type a message like &quot;What can I make?&quot; and Zylo will respond with AI-generated suggestions.
        </p>
      </div>

      <MealHelperHome
        currentUser={sampleUser}
        tonightMeal={sampleTonightMeal}
        householdMembers={sampleHouseholdMembers}
        messages={messages}
        onThisWorks={() => console.log("This works clicked")}
        onNewPlan={() => console.log("New plan clicked")}
        onImWiped={() => console.log("I'm wiped clicked")}
        onOpenInventoryCheck={() => console.log("Inventory check clicked")}
        onSendMessage={handleSendMessage}
        onVoiceInput={handleVoiceInput}
        isLoading={isLoading}
      />
    </div>
  );
}
