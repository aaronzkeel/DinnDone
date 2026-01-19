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

// Recipe library - Zylo's knowledge of family-friendly meals
const RECIPE_LIBRARY = `
## Recipe Library (Zink Family Favorites)

When users ask what they can make with specific ingredients, suggest meals from this library:

### CHICKEN DISHES:
1. **Chicken Stir Fry** (Medium effort, 35 min) - Chicken breast with bell peppers, broccoli, soy sauce, garlic, ginger, served over rice
2. **Grilled Chicken Tacos** (Easy, 25 min) - Seasoned grilled chicken with lettuce, tomato, cheese, sour cream in soft tortillas
3. **Chicken Parmesan** (Medium effort, 45 min) - Breaded chicken cutlets with marinara sauce and melted mozzarella, served over pasta
4. **Chicken Alfredo** (Medium effort, 30 min) - Sliced chicken breast in creamy alfredo sauce over fettuccine
5. **Honey Garlic Chicken** (Easy, 25 min) - Pan-seared chicken thighs with honey garlic glaze, served with steamed vegetables
6. **Chicken Fajitas** (Easy, 30 min) - Sliced chicken with sauteed peppers and onions, warm tortillas

### BEEF DISHES:
1. **Taco Night** (Easy, 25 min) - Ground beef with taco seasoning, served in shells with all the fixings
2. **Spaghetti and Meatballs** (Medium effort, 45 min) - Homemade meatballs in marinara over spaghetti
3. **Grilled Burgers** (Easy, 20 min) - Classic burgers with your choice of toppings
4. **Beef Stir Fry** (Medium effort, 30 min) - Sliced beef with vegetables in teriyaki sauce
5. **Shepherd's Pie** (More prep, 60 min) - Ground beef with vegetables topped with mashed potatoes

### PORK DISHES:
1. **Pulled Pork Sandwiches** (More prep, slow cooker) - Slow-cooked pork shoulder with BBQ sauce
2. **Pork Chops** (Easy, 25 min) - Pan-seared or grilled with apple sauce
3. **Bacon Carbonara** (Medium effort, 25 min) - Pasta with crispy bacon, eggs, and parmesan

### FISH/SEAFOOD:
1. **Sheet Pan Salmon** (Easy, 25 min) - Salmon fillets with asparagus and lemon
2. **Fish Tacos** (Easy, 20 min) - Crispy fish with cabbage slaw and chipotle mayo
3. **Shrimp Stir Fry** (Easy, 20 min) - Quick shrimp with vegetables in garlic sauce

### VEGETARIAN/FLEX MEALS:
1. **Pasta Primavera** (Easy, 25 min) - Pasta with seasonal vegetables in light sauce
2. **Veggie Quesadillas** (Easy, 15 min) - Cheese and vegetable quesadillas
3. **Grilled Cheese & Tomato Soup** (Easy, 20 min) - Classic comfort food combo
4. **Bean Burritos** (Easy, 20 min) - Black beans, rice, cheese, and toppings

### QUICK & EASY (Under 20 min):
1. **Quesadillas** - Any protein or veggie
2. **BLT Sandwiches** - Bacon, lettuce, tomato
3. **Grilled Cheese** - Quick and satisfying
4. **Fried Rice** - Use leftover rice and any protein/veggies
`;

// System prompt for Zylo with recipe library
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

${RECIPE_LIBRARY}

IMPORTANT INSTRUCTIONS FOR INGREDIENT-BASED SUGGESTIONS:
- When users ask "What can I make with [ingredient]?", suggest 2-3 meals from the Recipe Library above that use that ingredient
- Always reference specific meals BY NAME from the library (e.g., "Chicken Stir Fry", "Grilled Chicken Tacos")
- Include the effort level and approximate time for each suggestion
- If the ingredient matches tonight's meal, mention that first, then offer alternatives

When users ask about meals:
- ALWAYS suggest meals from the Recipe Library above
- Be helpful with substitutions and modifications
- If they seem overwhelmed, remind them that takeout or leftovers are valid options
- Don't lecture about nutrition unless specifically asked

Remember: Your job is to reduce dinner decision fatigue, not add to it.`;

export default function TestInventorySuggestionsPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    step1: boolean | null;
    step2: boolean | null;
    step3: boolean | null;
  }>({ step1: null, step2: null, step3: null });

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
        maxTokens: 400,
      });

      if (response.success && response.content) {
        const zyloMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "zylo",
          content: response.content,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, zyloMessage]);

        // Auto-check test results for chicken-based queries
        const lowerContent = content.toLowerCase();
        const lowerResponse = response.content.toLowerCase();

        if (lowerContent.includes("chicken")) {
          // Step 1: User asked about chicken
          setTestResults((prev) => ({ ...prev, step1: true }));

          // Step 2: Check if response contains chicken-based meal suggestions
          const chickenMeals = [
            "chicken stir fry",
            "grilled chicken tacos",
            "chicken parmesan",
            "chicken alfredo",
            "honey garlic chicken",
            "chicken fajitas",
          ];
          const hasChickenSuggestions = chickenMeals.some((meal) =>
            lowerResponse.includes(meal)
          );
          setTestResults((prev) => ({ ...prev, step2: hasChickenSuggestions }));

          // Step 3: Verify suggestions are from recipe library (check for specific meal names)
          const fromLibrary = chickenMeals.filter((meal) =>
            lowerResponse.includes(meal)
          );
          setTestResults((prev) => ({ ...prev, step3: fromLibrary.length > 0 }));
        }
      } else {
        // Handle error
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

  const allTestsPassed = testResults.step1 && testResults.step2 && testResults.step3;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
          Test: Zylo Suggests Meals Based on Inventory (Feature #92)
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
          Test that Zylo suggests meals from the recipe library based on what ingredients you have.
        </p>

        {/* Test Steps */}
        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}>
          <h2 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>Test Steps:</h2>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                testResults.step1 === null ? "bg-gray-200 text-gray-500" :
                testResults.step1 ? "bg-green-500 text-white" : "bg-red-500 text-white"
              }`}>
                {testResults.step1 === null ? "1" : testResults.step1 ? "✓" : "✗"}
              </span>
              <span style={{ color: "var(--color-text)" }}>
                Step 1: Ask &quot;What can I make with chicken?&quot;
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                testResults.step2 === null ? "bg-gray-200 text-gray-500" :
                testResults.step2 ? "bg-green-500 text-white" : "bg-red-500 text-white"
              }`}>
                {testResults.step2 === null ? "2" : testResults.step2 ? "✓" : "✗"}
              </span>
              <span style={{ color: "var(--color-text)" }}>
                Step 2: Verify Zylo suggests chicken-based meals
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                testResults.step3 === null ? "bg-gray-200 text-gray-500" :
                testResults.step3 ? "bg-green-500 text-white" : "bg-red-500 text-white"
              }`}>
                {testResults.step3 === null ? "3" : testResults.step3 ? "✓" : "✗"}
              </span>
              <span style={{ color: "var(--color-text)" }}>
                Step 3: Verify suggestions are from recipe library
              </span>
            </li>
          </ul>

          {allTestsPassed && (
            <div className="mt-3 p-2 rounded bg-green-100 text-green-800 text-sm font-semibold">
              ✅ Feature #92 PASSED - Zylo suggests meals based on inventory!
            </div>
          )}
        </div>

        {/* Quick test button */}
        <button
          onClick={() => handleSendMessage("What can I make with chicken?")}
          disabled={isLoading}
          className="mt-3 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {isLoading ? "Asking Zylo..." : "Run Test: Ask about chicken"}
        </button>
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
