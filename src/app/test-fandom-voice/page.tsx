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
import type { FandomVoice } from "@/types/notifications";

// Feature #106: Zylo voice matches Fandom setting
// Test that Zylo responds with the selected fandom's characteristic phrasing

// Sample data
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
    "1.5 lbs chicken breast, sliced",
    "2 bell peppers, diced",
    "2 cups broccoli florets",
    "3 tbsp soy sauce",
    "4 cloves garlic, minced",
    "1 tbsp fresh ginger, grated",
    "2 cups jasmine rice",
  ],
  isFlexMeal: true,
  assignedCookId: "2",
};

// Fandom voice definitions with personality instructions
const FANDOM_VOICE_PROMPTS: Record<FandomVoice, string> = {
  default: `Your personality:
- Friendly, supportive, and never judgmental
- You understand that feeding a family is hard work
- You celebrate small wins and normalize "good enough" meals
- You keep responses concise (2-3 sentences max unless asked for more)
- You use occasional emojis but don't overdo it (max 1-2 per message)`,

  samwise: `Your personality is based on Samwise Gamgee from Lord of the Rings:
- You speak with humble, heartfelt encouragement like Sam
- Use phrases like "There's some good in this world, Mr. Frodo, and it's worth fighting for"
- Refer to food with Sam's love of simple, wholesome cooking (like his famous "po-tay-toes")
- Be steadfast and loyal in your support
- Occasionally use "If you understand me" or "Begging your pardon"
- You might say things like "Well now, that's a fine supper if I ever saw one"
- Keep Sam's optimism even when things seem hard
- Reference things being "as fine as any meal in the Shire"
- You keep responses concise (2-3 sentences max)`,

  "nacho-libre": `Your personality is based on Nacho from Nacho Libre:
- Speak with enthusiasm and dramatic flair
- Use phrases like "It's the best!" and "Muy delicioso!"
- Reference wrestling metaphors for cooking ("Let's get ready to rumble in the kitchen!")
- Be dramatically passionate about even simple meals
- Mix in occasional Spanish words naturally
- Say things like "These are the beans! The BEST beans!"
- Show excitement like "Tonight, we are going to eat like CHAMPIONS!"
- You keep responses concise (2-3 sentences max)`,

  "harry-potter": `Your personality is based on the Harry Potter universe:
- Reference magical cooking and potions
- Use phrases like "Brilliant!" and "Wicked!"
- Compare cooking to potion-making
- Mention things being "positively magical" or "enchanting"
- Reference house elves' cooking abilities as inspiration
- Say things like "This recipe is pure magic!"
- Use cozy, Hogwarts Great Hall vibes
- You keep responses concise (2-3 sentences max)`,

  "star-wars": `Your personality is based on Star Wars:
- Reference the Force and Jedi wisdom
- Use phrases like "May the Force be with your cooking" or "A powerful meal, this will be"
- Mix in occasional Yoda-speak for wisdom ("Patience you must have")
- Reference things being "strong with flavor"
- Compare meal prep to training exercises
- Say things like "I sense great potential in this dish"
- Use terms like "padawan" and "master chef"
- You keep responses concise (2-3 sentences max)`,

  "the-office": `Your personality is based on The Office:
- Use dry humor and workplace references
- Channel Michael Scott's enthusiasm ("That's what she said" - but keep it family-friendly)
- Make mundane cooking seem like an epic adventure
- Reference "conference room meetings" for meal planning
- Say things like "Bears, beets, Battlestar Galactica... and burritos"
- Use awkward pauses and "that's what she said" timing (without the phrase)
- Channel Dwight's intensity about details
- You keep responses concise (2-3 sentences max)`,
};

const fandomVoices: Array<{ value: FandomVoice; label: string; hint: string }> = [
  { value: "default", label: "Default", hint: "Friendly and supportive" },
  { value: "samwise", label: "Samwise (LOTR)", hint: '"Po-tay-toes!" vibes' },
  { value: "nacho-libre", label: "Nacho Libre", hint: '"It\'s the best!" energy' },
  { value: "harry-potter", label: "Harry Potter", hint: "Magical cooking" },
  { value: "star-wars", label: "Star Wars", hint: "May the Fork be with you" },
  { value: "the-office", label: "The Office", hint: "That's what she said" },
];

export default function TestFandomVoicePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<FandomVoice>("default");

  const chatAction = useAction(api.ai.chat);

  // Build system prompt with selected fandom voice
  const buildSystemPrompt = (voice: FandomVoice) => {
    return `You are Zylo, a meal planning assistant for the DinnDone family meal planning app.

${FANDOM_VOICE_PROMPTS[voice]}

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

IMPORTANT: Stay in character with the selected voice style throughout your responses!

Remember: Your job is to reduce dinner decision fatigue, not add to it.`;
  };

  const handleSendMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const conversationHistory: Array<{
          role: "system" | "user" | "assistant";
          content: string;
        }> = [
          { role: "system", content: buildSystemPrompt(selectedVoice) },
          ...messages.slice(-10).map((msg) => ({
            role: (msg.role === "user" ? "user" : "assistant") as
              | "user"
              | "assistant",
            content: msg.content,
          })),
          { role: "user", content },
        ];

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
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "zylo",
            content:
              "Hmm, I'm having trouble connecting right now. Let me try again in a moment!",
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } catch (error) {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "zylo",
          content: "Oops, something went wrong. Mind trying that again?",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [chatAction, messages, selectedVoice]
  );

  const handleVoiceChange = (voice: FandomVoice) => {
    setSelectedVoice(voice);
    // Clear messages when voice changes to see fresh responses
    setMessages([]);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
          Test: Fandom Voice (Feature #106)
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
          Select a fandom voice and chat with Zylo to verify the response style matches.
        </p>

        {/* Voice Selector */}
        <div
          className="mt-4 p-3 rounded-xl"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Select Fandom Voice:
          </label>
          <div className="flex flex-wrap gap-2">
            {fandomVoices.map((voice) => (
              <button
                key={voice.value}
                onClick={() => handleVoiceChange(voice.value)}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor:
                    selectedVoice === voice.value
                      ? "var(--color-primary)"
                      : "var(--color-bg)",
                  color:
                    selectedVoice === voice.value
                      ? "white"
                      : "var(--color-text)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {voice.label}
              </button>
            ))}
          </div>
          {selectedVoice !== "default" && (
            <p className="text-xs mt-2" style={{ color: "var(--color-muted)" }}>
              Hint: {fandomVoices.find((v) => v.value === selectedVoice)?.hint}
            </p>
          )}
        </div>

        {/* Test Instructions */}
        <div
          className="mt-3 p-3 rounded-lg text-sm"
          style={{
            backgroundColor:
              selectedVoice === "samwise"
                ? "rgba(76, 175, 80, 0.1)"
                : "var(--color-bg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <strong style={{ color: "var(--color-text)" }}>Test Steps:</strong>
          <ol
            className="mt-1 ml-4 list-decimal"
            style={{ color: "var(--color-muted)" }}
          >
            <li>Step 1: Select &quot;Samwise (LOTR)&quot; voice above</li>
            <li>
              Step 2: Ask &quot;What should I make for dinner?&quot;
            </li>
            <li>
              Step 3: Verify response has Samwise-style phrasing (references to
              potatoes, the Shire, humble encouragement)
            </li>
          </ol>
          {selectedVoice === "samwise" && (
            <p
              className="mt-2 font-medium"
              style={{ color: "var(--color-secondary)" }}
            >
              Samwise voice selected! Try asking about dinner.
            </p>
          )}
        </div>
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
        onVoiceInput={() => console.log("Voice input triggered")}
        isLoading={isLoading}
      />
    </div>
  );
}
