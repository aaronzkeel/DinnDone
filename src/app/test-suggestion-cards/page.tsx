"use client";

import { useState, useCallback } from "react";
import { CheckCircle2 } from "lucide-react";
import { MealHelperHome } from "@/components/meal-helper";
import { MealOptionDetails } from "@/components/meal-helper/MealOptionDetails";
import type {
  HouseholdMember,
  PlannedMealSummary,
  ChatMessage,
  MealSuggestion,
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
  ],
  isFlexMeal: true,
  assignedCookId: "2",
};

// Meal suggestions library that Zylo can recommend
const MEAL_SUGGESTIONS_LIBRARY: MealSuggestion[] = [
  {
    id: "quick-tacos",
    name: "Quick Chicken Tacos",
    effortTier: "super-easy",
    prepTime: 10,
    cookTime: 15,
    cleanupRating: "low",
    servings: 4,
    ingredients: ["Chicken breast", "Taco seasoning", "Tortillas", "Cheese", "Salsa"],
    briefInstructions: "Season and cook chicken, warm tortillas, and assemble with your favorite toppings.",
    isFlexMeal: false,
  },
  {
    id: "pasta-primavera",
    name: "Pasta Primavera",
    effortTier: "super-easy",
    prepTime: 10,
    cookTime: 15,
    cleanupRating: "low",
    servings: 4,
    ingredients: ["Pasta", "Mixed vegetables", "Olive oil", "Parmesan cheese", "Garlic"],
    briefInstructions: "Cook pasta, sauté vegetables, toss together with olive oil and parmesan.",
    isFlexMeal: true,
  },
  {
    id: "sheet-pan-salmon",
    name: "Sheet Pan Salmon & Asparagus",
    effortTier: "super-easy",
    prepTime: 5,
    cookTime: 20,
    cleanupRating: "low",
    servings: 4,
    ingredients: ["Salmon fillets", "Asparagus", "Lemon", "Olive oil", "Garlic"],
    briefInstructions: "Arrange salmon and asparagus on sheet pan, season, bake at 400°F for 20 minutes.",
    isFlexMeal: false,
  },
  {
    id: "grilled-burgers",
    name: "Grilled Burgers",
    effortTier: "middle",
    prepTime: 10,
    cookTime: 15,
    cleanupRating: "medium",
    servings: 4,
    ingredients: ["Ground beef", "Burger buns", "Lettuce", "Tomato", "Cheese", "Onion"],
    briefInstructions: "Form patties, grill to desired doneness, serve on buns with your favorite toppings.",
    isFlexMeal: false,
  },
  {
    id: "veggie-quesadillas",
    name: "Veggie Quesadillas",
    effortTier: "super-easy",
    prepTime: 5,
    cookTime: 10,
    cleanupRating: "low",
    servings: 4,
    ingredients: ["Tortillas", "Cheese", "Bell peppers", "Onions", "Black beans"],
    briefInstructions: "Fill tortillas with cheese and veggies, cook in a skillet until golden and crispy.",
    isFlexMeal: true,
  },
];

// Trigger phrases that cause Zylo to show suggestion cards
const SUGGESTION_TRIGGERS = [
  "suggest",
  "suggestion",
  "what can",
  "what should",
  "recommend",
  "ideas",
  "options",
  "alternatives",
  "give me some",
  "quick meals",
  "easy dinner",
];

function shouldShowSuggestions(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return SUGGESTION_TRIGGERS.some((trigger) => lowerMessage.includes(trigger));
}

// Get random suggestions
function getRandomSuggestions(count: number = 3): MealSuggestion[] {
  const shuffled = [...MEAL_SUGGESTIONS_LIBRARY].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function TestSuggestionCardsPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mealSuggestions, setMealSuggestions] = useState<MealSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<PlannedMealSummary | null>(null);

  // Test step tracking
  const [step1Complete, setStep1Complete] = useState(false);
  const [step2Complete, setStep2Complete] = useState(false);
  const [step3Complete, setStep3Complete] = useState(false);

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

    // Mark step 1 complete when user asks for suggestions
    if (shouldShowSuggestions(content)) {
      setStep1Complete(true);
    }

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Check if the message is asking for suggestions
    if (shouldShowSuggestions(content)) {
      // Generate meal suggestion cards
      const suggestions = getRandomSuggestions(3);
      setMealSuggestions(suggestions);

      const zyloMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "zylo",
        content: "Here are some quick options for you! Tap any card to see the full details.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, zyloMessage]);

      // Mark step 2 complete when suggestions are shown
      setStep2Complete(true);
    } else {
      // Regular response
      const zyloMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "zylo",
        content: `Got it! If you want me to show you some meal options, just ask me to "suggest some meals" or "what can I make?" 😊`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, zyloMessage]);
    }

    setIsLoading(false);
  }, []);

  const handleAcceptSuggestion = useCallback((suggestionId: string) => {
    const suggestion = MEAL_SUGGESTIONS_LIBRARY.find((s) => s.id === suggestionId);
    if (suggestion) {
      // Convert MealSuggestion to PlannedMealSummary for details view
      const mealDetails: PlannedMealSummary = {
        id: suggestion.id,
        mealName: suggestion.name,
        effortTier: suggestion.effortTier,
        prepTime: suggestion.prepTime,
        cookTime: suggestion.cookTime,
        cleanupRating: suggestion.cleanupRating,
        ingredients: suggestion.ingredients,
        briefInstructions: suggestion.briefInstructions,
        isFlexMeal: suggestion.isFlexMeal,
        assignedCookId: "1",
      };
      setSelectedMeal(mealDetails);

      // Mark step 3 complete when a card is tapped
      setStep3Complete(true);
    }
  }, []);

  const handleRejectSuggestion = useCallback((suggestionId: string) => {
    // Remove the rejected suggestion
    setMealSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));

    const zyloMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "zylo",
      content: "No problem! I'll keep that one off the list. 👍",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, zyloMessage]);
  }, []);

  const handleSomethingElse = useCallback(() => {
    // Clear current suggestions and get new ones
    setMealSuggestions([]);
    setIsLoading(true);

    setTimeout(() => {
      const newSuggestions = getRandomSuggestions(3);
      setMealSuggestions(newSuggestions);

      const zyloMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "zylo",
        content: "How about these instead? 🍽️",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, zyloMessage]);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleVoiceInput = () => {
    console.log("Voice input triggered");
  };

  const handleBackFromDetails = () => {
    setSelectedMeal(null);
  };

  const handleCookThis = () => {
    if (selectedMeal) {
      const zyloMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "zylo",
        content: `Great choice! ${selectedMeal.mealName} is locked in for tonight. You've got this! 🎉`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, zyloMessage]);
      setMealSuggestions([]);
      setSelectedMeal(null);
    }
  };

  // If a meal is selected, show the details view
  if (selectedMeal) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
          <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
            Test: Quick Suggestion Cards (Feature #104)
          </h1>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Viewing meal details - Step 3 verified!
          </p>
        </div>
        <MealOptionDetails
          meal={selectedMeal}
          householdMembers={sampleHouseholdMembers}
          onBack={handleBackFromDetails}
          onCookThis={handleCookThis}
        />
      </div>
    );
  }

  const allStepsPassed = step1Complete && step2Complete && step3Complete;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
          Test: Quick Suggestion Cards (Feature #104)
        </h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Ask Zylo for meal suggestions to see tappable MealSuggestionCards.
        </p>

        {/* Test Steps Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                step1Complete ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              {step1Complete && <CheckCircle2 size={14} className="text-white" />}
            </div>
            <span
              className={`text-sm ${step1Complete ? "text-green-600 font-medium" : ""}`}
              style={{ color: step1Complete ? undefined : "var(--color-muted)" }}
            >
              Step 1: Ask Zylo for suggestions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                step2Complete ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              {step2Complete && <CheckCircle2 size={14} className="text-white" />}
            </div>
            <span
              className={`text-sm ${step2Complete ? "text-green-600 font-medium" : ""}`}
              style={{ color: step2Complete ? undefined : "var(--color-muted)" }}
            >
              Step 2: Verify MealSuggestionCards display
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                step3Complete ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              {step3Complete && <CheckCircle2 size={14} className="text-white" />}
            </div>
            <span
              className={`text-sm ${step3Complete ? "text-green-600 font-medium" : ""}`}
              style={{ color: step3Complete ? undefined : "var(--color-muted)" }}
            >
              Step 3: Verify tapping card shows details
            </span>
          </div>
        </div>

        {allStepsPassed && (
          <div className="mt-4 p-3 rounded-lg bg-green-100 border border-green-300">
            <p className="text-green-800 font-semibold text-center">
              ✅ Feature #104 PASSED - All steps verified!
            </p>
          </div>
        )}

        {/* Quick test button */}
        <div className="mt-4">
          <button
            onClick={() => handleSendMessage("Can you suggest some quick meal options?")}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            Quick Test: Ask for suggestions
          </button>
        </div>
      </div>

      <MealHelperHome
        currentUser={sampleUser}
        tonightMeal={sampleTonightMeal}
        householdMembers={sampleHouseholdMembers}
        messages={messages}
        mealSuggestions={mealSuggestions}
        onAcceptSuggestion={handleAcceptSuggestion}
        onRejectSuggestion={handleRejectSuggestion}
        onSomethingElse={handleSomethingElse}
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
