"use client";

import { useState } from "react";
import { useConvexAuth, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignInButton } from "@/components/SignInButton";
import {
  MealHelperHome,
  MealOptionDetails,
  WeekSwapList,
  EmergencyExit,
  IngredientsCheckPanel,
  InventoryCheck,
} from "@/components/meal-helper";
import type { HouseholdMember, PlannedMealSummary, ChatMessage } from "@/types/meal-helper";

type ViewState = "home" | "details" | "swap" | "emergency" | "ingredients-check" | "missing-choice" | "swap-ingredients" | "inventory";

// Sample data - will be replaced with real data from Convex
const sampleHouseholdMembers: HouseholdMember[] = [
  { id: "hm-001", name: "Aaron", isAdmin: true },
  { id: "hm-002", name: "Katie", isAdmin: true },
  { id: "hm-003", name: "Lizzie", isAdmin: false },
  { id: "hm-004", name: "Ethan", isAdmin: false },
  { id: "hm-005", name: "Elijah", isAdmin: false },
];

const sampleTonightMeal: PlannedMealSummary = {
  id: "pm-001",
  mealName: "One-Pan Chicken & Peppers",
  effortTier: "super-easy",
  prepTime: 10,
  cookTime: 25,
  cleanupRating: "low",
  ingredients: ["Chicken thighs", "Bell peppers", "Olive oil", "Garlic", "Italian seasoning"],
  briefInstructions: "Season chicken, toss peppers in oil, roast together at 425F for 25 min.",
  isFlexMeal: false,
  assignedCookId: "hm-001",
};

// Sample week meals for the swap list
const sampleWeekMeals: Array<PlannedMealSummary & { dayLabel: string }> = [
  {
    ...sampleTonightMeal,
    dayLabel: "Tonight",
  },
  {
    id: "pm-002",
    mealName: "Taco Tuesday",
    effortTier: "super-easy",
    prepTime: 15,
    cookTime: 10,
    cleanupRating: "medium",
    ingredients: ["Ground beef", "Taco seasoning", "Tortillas", "Cheese", "Lettuce", "Tomatoes"],
    briefInstructions: "Brown beef with seasoning, warm tortillas, set up toppings bar.",
    isFlexMeal: false,
    assignedCookId: "hm-002",
    dayLabel: "Tuesday",
  },
  {
    id: "pm-003",
    mealName: "Veggie Stir Fry",
    effortTier: "middle",
    prepTime: 20,
    cookTime: 15,
    cleanupRating: "medium",
    ingredients: ["Tofu", "Broccoli", "Snap peas", "Soy sauce", "Ginger", "Rice"],
    briefInstructions: "Press tofu, prep veggies, stir fry in batches, serve over rice.",
    isFlexMeal: true,
    assignedCookId: "hm-001",
    dayLabel: "Wednesday",
  },
  {
    id: "pm-004",
    mealName: "Sheet Pan Salmon",
    effortTier: "middle",
    prepTime: 10,
    cookTime: 20,
    cleanupRating: "low",
    ingredients: ["Salmon fillets", "Asparagus", "Lemon", "Olive oil", "Dill"],
    briefInstructions: "Season salmon and asparagus, roast at 400F for 20 min.",
    isFlexMeal: false,
    assignedCookId: "hm-002",
    dayLabel: "Thursday",
  },
  {
    id: "pm-005",
    mealName: "Pizza Night",
    effortTier: "super-easy",
    prepTime: 5,
    cookTime: 15,
    cleanupRating: "low",
    ingredients: ["Pizza dough", "Marinara", "Mozzarella", "Pepperoni", "Veggies"],
    briefInstructions: "Roll dough, add toppings, bake at 450F until golden.",
    isFlexMeal: false,
    assignedCookId: "hm-001",
    dayLabel: "Friday",
  },
];

// Start with empty messages to show the welcome state
const sampleMessages: ChatMessage[] = [];

export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  // All hooks must be called before any conditional returns
  const currentUser = sampleHouseholdMembers[0]; // Aaron for now

  // View state management
  const [currentView, setCurrentView] = useState<ViewState>("home");

  // Tonight's meal state (allows swapping)
  const [tonightMeal, setTonightMeal] = useState<PlannedMealSummary & { dayLabel?: string }>(
    { ...sampleTonightMeal, dayLabel: "Tonight" }
  );

  // Week meals state (updates when swapped)
  const [weekMeals, setWeekMeals] = useState<Array<PlannedMealSummary & { dayLabel: string }>>(
    sampleWeekMeals
  );

  // Chat messages state for feedback
  const [messages, setMessages] = useState<ChatMessage[]>(sampleMessages);

  // Meal confirmed state
  const [isConfirmed, setIsConfirmed] = useState(false);

  // AI chat loading state
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Ingredient check state
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [missingIngredients, setMissingIngredients] = useState<string[]>([]);

  // Pending swap meal (selected but not yet confirmed)
  const [pendingSwapMeal, setPendingSwapMeal] = useState<(PlannedMealSummary & { dayLabel: string }) | null>(null);

  // Convex AI chat action
  const chatWithAi = useAction(api.ai.chat);

  // Helper to add a Zylo message
  const addZyloMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "zylo",
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  // Button handlers
  const handleThisWorks = () => {
    setCurrentView("details");
  };

  const handleNewPlan = () => {
    setCurrentView("swap");
  };

  const handleImWiped = () => {
    setCurrentView("emergency");
  };

  const handleViewMeal = () => {
    setCurrentView("details");
  };

  const handleBack = () => {
    setCurrentView("home");
  };

  // MealOptionDetails handlers
  const handleCookThis = () => {
    setIsConfirmed(true);
    addZyloMessage(`You're all set! "${tonightMeal.mealName}" is locked in for tonight. You got this!`);
    setCurrentView("home");
  };

  const handleIngredientCheck = (response: "yes" | "not-sure" | "no") => {
    if (response === "yes") {
      addZyloMessage("Great! You're ready to cook. Hit 'Cook this' when you're ready to lock it in.");
    } else if (response === "not-sure") {
      // Open the ingredient checklist panel
      setCurrentView("ingredients-check");
    } else {
      addZyloMessage("Missing some ingredients? You can swap for a different meal, or hit the store for a quick pickup.");
      setCurrentView("swap");
    }
  };

  // IngredientsCheckPanel handlers
  const handleIngredientToggle = (ingredient: string, checked: boolean) => {
    setCheckedIngredients((prev) => ({ ...prev, [ingredient]: checked }));
  };

  const handleIngredientsAllChecked = () => {
    addZyloMessage("You've got everything! Ready to cook when you are.");
    setCheckedIngredients({});
    setCurrentView("details");
  };

  const handleIngredientsMissingSome = () => {
    // Calculate which ingredients are missing
    const missing = tonightMeal.ingredients.filter(
      (ingredient) => !checkedIngredients[ingredient]
    );
    setMissingIngredients(missing);
    setCurrentView("missing-choice");
  };

  // Missing choice handlers
  const handlePickDifferentMeal = () => {
    addZyloMessage("No problem! Let's find something you have ingredients for.");
    setCheckedIngredients({});
    setMissingIngredients([]);
    setCurrentView("swap");
  };

  const handleAddToGroceryList = () => {
    // TODO: Actually add to grocery list when that feature is wired up
    addZyloMessage(`Added ${missingIngredients.length} item${missingIngredients.length > 1 ? "s" : ""} to your grocery list. You're good to go!`);
    setCheckedIngredients({});
    setMissingIngredients([]);
    setCurrentView("details");
  };

  // WeekSwapList handler - actually swaps the meals
  const handleSwapSelect = (mealId: string) => {
    const selectedMeal = weekMeals.find((m) => m.id === mealId);
    if (!selectedMeal) return;

    // Store the pending swap and go to ingredient check
    setPendingSwapMeal(selectedMeal);
    setCheckedIngredients({});
    setCurrentView("swap-ingredients");
  };

  // Confirm swap after ingredient check
  const handleConfirmSwap = () => {
    if (!pendingSwapMeal) return;

    const oldTonightMeal = tonightMeal;
    const selectedDayLabel = pendingSwapMeal.dayLabel;

    // Update tonight's meal
    setTonightMeal({ ...pendingSwapMeal, dayLabel: "Tonight" });

    // Update week meals - swap the day labels
    setWeekMeals((prev) =>
      prev.map((m) => {
        if (m.id === pendingSwapMeal.id) {
          return { ...oldTonightMeal, dayLabel: selectedDayLabel };
        }
        if (m.id === oldTonightMeal.id) {
          return { ...pendingSwapMeal, dayLabel: "Tonight" };
        }
        return m;
      })
    );

    setIsConfirmed(false);
    addZyloMessage(`Swapped! Tonight is now "${pendingSwapMeal.mealName}". "${oldTonightMeal.mealName}" moved to ${selectedDayLabel}.`);
    setPendingSwapMeal(null);
    setCheckedIngredients({});
    setCurrentView("home");
  };

  const handleCancelSwap = () => {
    setPendingSwapMeal(null);
    setCheckedIngredients({});
    setCurrentView("swap");
  };

  // EmergencyExit handler
  const handleEmergencyOption = (optionId: string) => {
    const optionMessages: Record<string, string> = {
      leftovers: "Leftovers it is! Zero shame, maximum efficiency. Enjoy your easy night.",
      freezer: "Freezer save activated! Grab something frozen and maybe a side salad. Done.",
      takeout: "Clean takeout locked in. Pick something decent and call it a win. You deserve it.",
    };

    setIsConfirmed(true);
    addZyloMessage(optionMessages[optionId] || "You're all set for an easy night!");
    setCurrentView("home");
  };

  const handleOpenInventoryCheck = () => {
    setCurrentView("inventory");
  };

  const handleInventorySubmit = async (notes: string) => {
    // Add user message showing what they have
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: `Here's what I have on hand: ${notes}`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setCurrentView("home");
    setIsAiLoading(true);

    try {
      const systemPrompt = `You are Zylo, a warm meal planning assistant. The user just told you what ingredients they have on hand. Suggest 2-3 quick meal ideas they could make with those ingredients.

Be concise (2-3 sentences per suggestion). Focus on simple, family-friendly meals. If they're missing key ingredients, mention easy substitutions.

Tonight's planned meal is "${tonightMeal.mealName}" - if their ingredients work for that, mention it!`;

      const result = await chatWithAi({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here's what I have: ${notes}` },
        ],
        maxTokens: 400,
      });

      if (result.success && result.content) {
        addZyloMessage(result.content);
      } else {
        addZyloMessage("I see what you've got! Based on tonight's plan, you should be good to go. Let me know if you need suggestions!");
      }
    } catch (error) {
      console.error("Inventory AI error:", error);
      addZyloMessage("Got it! Take a look at tonight's plan and see if it works with what you have.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Set loading state
    setIsAiLoading(true);

    try {
      // Build system prompt with context
      const systemPrompt = `You are Zylo, a warm and supportive meal planning assistant for the DinnDone app. You help exhausted caregivers with dinner decisions.

Your personality:
- Warm, empathetic, never judgmental
- Concise - keep responses to 1-3 sentences
- Practical and solution-focused
- Use casual, friendly language
- No guilt or pressure about meal choices

Current context:
- Tonight's planned meal: ${tonightMeal.mealName}
- Effort level: ${tonightMeal.effortTier}
- Ingredients needed: ${tonightMeal.ingredients.join(", ")}
- Cook time: ${tonightMeal.prepTime + tonightMeal.cookTime} minutes total

You can help with:
- Quick meal suggestions based on what they have
- Substitution ideas for missing ingredients
- Simpler alternatives if they're tired
- Encouragement and meal planning tips

If they ask about something outside meal planning, gently redirect to food topics.`;

      // Build conversation history for AI (last 10 messages for context)
      const recentMessages = messages.slice(-10);
      const aiMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
        ...recentMessages.map((m) => ({
          role: (m.role === "zylo" ? "assistant" : "user") as "user" | "assistant",
          content: m.content,
        })),
        { role: "user", content },
      ];

      const result = await chatWithAi({ messages: aiMessages, maxTokens: 300 });

      if (result.success && result.content) {
        addZyloMessage(result.content);
      } else {
        addZyloMessage("Hmm, I had a little hiccup there. Try asking again, or use the buttons above!");
      }
    } catch (error) {
      console.error("AI chat error:", error);
      addZyloMessage("Oops! Something went wrong. Let's try that again, or use the buttons above.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleVoiceInput = () => {
    addZyloMessage("Voice input coming soon! For now, type your message or use the buttons above.");
  };

  // Show loading state
  if (isLoading) {
    return (
      <div
        className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center font-sans"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="animate-pulse" style={{ color: "var(--color-muted)" }}>
          Loading...
        </div>
      </div>
    );
  }

  // Show sign-in page for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div
        className="flex min-h-[calc(100vh-120px)] flex-col font-sans"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <main className="flex flex-1 items-center justify-center px-4">
          <div
            className="w-full max-w-md rounded-lg p-8 text-center"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <h1
              className="text-3xl font-semibold tracking-tight font-heading mb-4"
              style={{ color: "var(--color-text)" }}
            >
              Welcome to DinnDone
            </h1>
            <p className="text-lg mb-8" style={{ color: "var(--color-muted)" }}>
              Your AI-powered meal planning companion
            </p>
            <SignInButton />
          </div>
        </main>
      </div>
    );
  }

  // Render appropriate view based on state
  if (currentView === "details") {
    return (
      <MealOptionDetails
        meal={tonightMeal}
        householdMembers={sampleHouseholdMembers}
        onBack={handleBack}
        onCookThis={handleCookThis}
        onIngredientCheck={handleIngredientCheck}
      />
    );
  }

  if (currentView === "swap") {
    return (
      <WeekSwapList
        meals={weekMeals}
        currentMealId={tonightMeal.id}
        onSelect={handleSwapSelect}
        onBack={handleBack}
      />
    );
  }

  if (currentView === "swap-ingredients" && pendingSwapMeal) {
    return (
      <div
        className="min-h-[calc(100vh-120px)] px-4 py-4"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <button
          onClick={handleCancelSwap}
          className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity mb-4"
          style={{ color: "var(--color-muted)" }}
        >
          ← Back to meals
        </button>

        <div
          className="rounded-2xl mb-4 p-4"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Switching to:
          </p>
          <h2 className="text-lg font-semibold font-heading" style={{ color: "var(--color-text)" }}>
            {pendingSwapMeal.mealName}
          </h2>
        </div>

        <IngredientsCheckPanel
          meal={pendingSwapMeal}
          prompt="Do you have these ingredients?"
          yesLabel="Yes, swap it!"
          notSureLabel="Let me check..."
          noLabel="No, pick another"
          initialChecked={checkedIngredients}
          onIngredientToggle={handleIngredientToggle}
          onYes={handleConfirmSwap}
          onNotSure={() => {}} // Stay on this screen to check
          onNo={handleCancelSwap}
        />
      </div>
    );
  }

  if (currentView === "emergency") {
    return (
      <EmergencyExit
        onBack={handleBack}
        onChooseOption={handleEmergencyOption}
      />
    );
  }

  if (currentView === "inventory") {
    return (
      <InventoryCheck
        onBack={handleBack}
        onSubmit={handleInventorySubmit}
        onVoiceInput={handleVoiceInput}
      />
    );
  }

  if (currentView === "ingredients-check") {
    return (
      <div
        className="min-h-[calc(100vh-120px)] px-4 py-4"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <button
          onClick={() => setCurrentView("details")}
          className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity mb-4"
          style={{ color: "var(--color-muted)" }}
        >
          ← Back to meal
        </button>
        <IngredientsCheckPanel
          meal={tonightMeal}
          prompt="Check off ingredients you have"
          yesLabel="I have everything!"
          notSureLabel="Back to meal"
          noLabel="Missing some"
          initialChecked={checkedIngredients}
          onIngredientToggle={handleIngredientToggle}
          onYes={handleIngredientsAllChecked}
          onNotSure={() => setCurrentView("details")}
          onNo={handleIngredientsMissingSome}
        />
      </div>
    );
  }

  if (currentView === "missing-choice") {
    return (
      <div
        className="min-h-[calc(100vh-120px)] px-4 py-4"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <button
          onClick={() => setCurrentView("ingredients-check")}
          className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity mb-4"
          style={{ color: "var(--color-muted)" }}
        >
          ← Back to checklist
        </button>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            className="px-4 py-3"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <h2 className="text-lg font-semibold font-heading" style={{ color: "var(--color-text)" }}>
              Missing {missingIngredients.length} ingredient{missingIngredients.length > 1 ? "s" : ""}
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              What would you like to do?
            </p>
          </div>

          <div className="px-4 py-3">
            <ul className="space-y-1 mb-4">
              {missingIngredients.map((ingredient) => (
                <li
                  key={ingredient}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "#ef4444" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {ingredient}
                </li>
              ))}
            </ul>

            <div className="space-y-2">
              <button
                onClick={handleAddToGroceryList}
                className="w-full px-4 py-3 rounded-xl text-white font-semibold text-sm"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Add to grocery list & cook this
              </button>
              <button
                onClick={handlePickDifferentMeal}
                className="w-full px-4 py-3 rounded-xl font-semibold text-sm"
                style={{
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-border)",
                }}
              >
                Pick a different meal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MealHelperHome
      currentUser={currentUser}
      tonightMeal={tonightMeal}
      householdMembers={sampleHouseholdMembers}
      messages={messages}
      onThisWorks={handleThisWorks}
      onNewPlan={handleNewPlan}
      onImWiped={handleImWiped}
      onViewMeal={handleViewMeal}
      onOpenInventoryCheck={handleOpenInventoryCheck}
      onSendMessage={handleSendMessage}
      onVoiceInput={handleVoiceInput}
      isLoading={isAiLoading}
    />
  );
}
