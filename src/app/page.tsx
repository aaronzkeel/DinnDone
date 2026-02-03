"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useConvexAuth, useAction, useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { SignInButton } from "@/components/SignInButton";
import {
  MealHelperHome,
  MealOptionDetails,
  WeekSwapList,
  EmergencyExit,
  IngredientsCheckPanel,
  InventoryCheck,
} from "@/components/meal-helper";
import type { PlannedMealSummary, ChatMessage, Ingredient } from "@/types/meal-helper";
import {
  toPlannedMealSummary,
  toHouseholdMember,
  getDayLabel,
  getTodayDateString,
} from "@/lib/meal-adapters";
import { formatErrorForUser } from "@/lib/errorUtils";
import {
  CHAT_HISTORY_LIMIT,
  CHAT_MAX_TOKENS,
  CHAT_INVENTORY_MAX_TOKENS,
  AI_CHAT_DEBOUNCE_MS,
  GROCERY_LIST_PREVIEW_LIMIT,
  MISSING_ITEMS_PREVIEW_LIMIT,
} from "@/lib/constants";

type ViewState = "home" | "details" | "swap" | "emergency" | "ingredients-check" | "missing-choice" | "swap-ingredients" | "inventory";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  // Check if user has completed onboarding
  const hasCompletedOnboarding = useQuery(
    api.userPreferences.hasCompletedOnboarding,
    isAuthenticated ? {} : "skip"
  );

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (isAuthenticated && hasCompletedOnboarding === false) {
      router.push("/onboarding");
    }
  }, [isAuthenticated, hasCompletedOnboarding, router]);

  // Get today's date for queries
  const today = getTodayDateString();

  // Fetch real data from Convex
  const householdMembersData = useQuery(api.householdMembers.list);
  const weekData = useQuery(api.weekPlans.getCurrentWeekWithMeals, { today });
  const groceryListData = useQuery(api.groceryItems.list);

  // Mutation for swapping meals
  const swapMealsMutation = useMutation(api.weekPlans.swapMeals);

  // Convert Convex data to UI types
  const householdMembers = useMemo(() => {
    if (!householdMembersData || householdMembersData.length === 0) {
      return []; // No fallback - show empty state
    }
    return householdMembersData.map(toHouseholdMember);
  }, [householdMembersData]);

  // Calculate tomorrow's date string
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Convert meals data
  const { tonightMeal, tomorrowMeal, weekMeals } = useMemo(() => {
    if (!weekData || !weekData.meals || weekData.meals.length === 0) {
      return { tonightMeal: null, tomorrowMeal: null, weekMeals: [] };
    }

    const todayStr = today;
    const convertedMeals = weekData.meals.map((meal) => {
      const isToday = meal.date === todayStr;
      const dayLabel = getDayLabel(meal.date, isToday);
      return toPlannedMealSummary(meal, dayLabel);
    });

    // Sort by date - use Map for O(1) lookups instead of O(n) .find() in sort callback
    // Cast: Convex Id<"plannedMeals"> -> string for Map key compatibility
    const mealDateMap = new Map(weekData.meals.map((m) => [m._id as string, m.date]));
    convertedMeals.sort((a, b) => {
      const dateA = mealDateMap.get(a.id);
      const dateB = mealDateMap.get(b.id);
      if (!dateA || !dateB) return 0;
      return dateA.localeCompare(dateB);
    });

    const tonight = convertedMeals.find((m) => m.dayLabel === "Tonight") ?? null;

    // Find tomorrow's meal
    const tomorrowMealData = weekData.meals.find((m) => m.date === tomorrow);
    const tomorrowConverted = tomorrowMealData
      ? toPlannedMealSummary(tomorrowMealData, "Tomorrow")
      : null;

    return { tonightMeal: tonight, tomorrowMeal: tomorrowConverted, weekMeals: convertedMeals };
  }, [weekData, today, tomorrow]);

  // Current user (first admin, or first member)
  const currentUser = useMemo(() => {
    if (householdMembers.length === 0) {
      return { id: "unknown", name: "User", isAdmin: false };
    }
    return householdMembers.find((m) => m.isAdmin) ?? householdMembers[0];
  }, [householdMembers]);

  // View state management
  const [currentView, setCurrentView] = useState<ViewState>("home");

  // Chat messages state for feedback
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Meal confirmed state
  const [isConfirmed, setIsConfirmed] = useState(false);

  // AI chat loading state
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Ingredient check state
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [missingIngredients, setMissingIngredients] = useState<string[]>([]);

  // Pending swap meal (selected but not yet confirmed)
  const [pendingSwapMeal, setPendingSwapMeal] = useState<(PlannedMealSummary & { dayLabel: string }) | null>(null);

  // Which meal to show in details view (tonight or tomorrow)
  const [detailMeal, setDetailMeal] = useState<PlannedMealSummary | null>(null);

  // Pantry audit state for Home page
  const [pantryMissingItems, setPantryMissingItems] = useState<string[]>([]);

  // Convex AI chat actions
  const chatWithAi = useAction(api.ai.chat);
  const analyzePantry = useAction(api.ai.analyzePantry);

  // Grocery item mutations
  const addGroceryItem = useMutation(api.groceryItems.add);
  const removeGroceryItemByName = useMutation(api.groceryItems.removeByName);

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
    setDetailMeal(tonightMeal ?? null);
    setCurrentView("details");
  };

  const handleNewPlan = () => {
    setCurrentView("swap");
  };

  const handleImWiped = () => {
    setCurrentView("emergency");
  };

  const handleViewMeal = () => {
    setDetailMeal(tonightMeal ?? null);
    setCurrentView("details");
  };

  const handleBack = () => {
    setCurrentView("home");
  };

  // MealOptionDetails handlers
  const handleCookThis = () => {
    if (!tonightMeal) return;
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
    setDetailMeal(tonightMeal ?? null);
    setCurrentView("details");
  };

  const handleIngredientsMissingSome = () => {
    if (!tonightMeal) return;
    // Calculate which ingredients are missing (using ingredient name as key)
    const missing = tonightMeal.ingredients
      .filter((ingredient) => !checkedIngredients[ingredient.name])
      .map((ingredient) => ingredient.name);
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
    setDetailMeal(tonightMeal ?? null);
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
  const handleConfirmSwap = async () => {
    if (!pendingSwapMeal || !tonightMeal) return;

    const selectedDayLabel = pendingSwapMeal.dayLabel;
    const oldMealName = tonightMeal.mealName;
    const newMealName = pendingSwapMeal.mealName;

    try {
      // Call the Convex mutation to swap meals in the database
      await swapMealsMutation({
        mealId1: tonightMeal.id as Id<"plannedMeals">,
        mealId2: pendingSwapMeal.id as Id<"plannedMeals">,
      });

      setIsConfirmed(false);
      addZyloMessage(`Swapped! Tonight is now "${newMealName}". "${oldMealName}" moved to ${selectedDayLabel}.`);
    } catch (error) {
      console.error("Swap error:", error);
      addZyloMessage(formatErrorForUser("swap the meals", error));
    }

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

  // Tomorrow meal actions
  const handleSwapTomorrow = async () => {
    if (!tonightMeal || !tomorrowMeal) return;

    const oldMealName = tonightMeal.mealName;
    const newMealName = tomorrowMeal.mealName;

    try {
      await swapMealsMutation({
        mealId1: tonightMeal.id as Id<"plannedMeals">,
        mealId2: tomorrowMeal.id as Id<"plannedMeals">,
      });

      addZyloMessage(`Swapped! Tonight is now "${newMealName}". "${oldMealName}" moved to tomorrow.`);
    } catch (error) {
      console.error("Swap error:", error);
      addZyloMessage(formatErrorForUser("swap the meals", error));
    }
  };

  const handleViewTomorrow = () => {
    if (tomorrowMeal) {
      setDetailMeal(tomorrowMeal);
      setCurrentView("details");
    }
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
      // If we have a meal plan, do pantry analysis to find missing ingredients
      if (weekMeals.length > 0) {
        // Get unique ingredient names from all week's meals
        const allIngredientNames = weekMeals.flatMap((meal) =>
          meal.ingredients.map((ing) => ing.name)
        );
        const uniqueIngredients = [...new Set(allIngredientNames)];

        const result = await analyzePantry({
          userHasOnHand: notes,
          neededIngredients: uniqueIngredients,
        });

        if (result.success) {
          // Filter out items that are already on the grocery list
          const existingGroceryNames = (groceryListData || [])
            .filter((item) => !item.isChecked)
            .map((item) => item.name.toLowerCase());

          const trulyMissing = (result.missingItems || []).filter(
            (item) => !existingGroceryNames.some((existing) =>
              existing.includes(item.toLowerCase()) || item.toLowerCase().includes(existing)
            )
          );

          setPantryMissingItems(trulyMissing);

          if (trulyMissing.length > 0) {
            addZyloMessage(
              `${result.zyloResponse || "Got it!"} Missing ${trulyMissing.length} item${trulyMissing.length > 1 ? "s" : ""}: ${trulyMissing.slice(0, MISSING_ITEMS_PREVIEW_LIMIT).join(", ")}${trulyMissing.length > MISSING_ITEMS_PREVIEW_LIMIT ? "..." : ""}. Want me to add them to your grocery list?`
            );
          } else if ((result.missingItems || []).length > 0) {
            // Items were identified as missing but they're already on the list
            addZyloMessage(`${result.zyloResponse || "Got it!"} The items you're missing are already on your grocery list. You're all set!`);
            setPantryMissingItems([]);
          } else {
            addZyloMessage(result.zyloResponse || "Looks like you have everything you need for this week's meals!");
            setPantryMissingItems([]);
          }
        } else {
          addZyloMessage("I had trouble checking your pantry. Let me know if you need help!");
        }
      } else {
        // No meal plan - suggest meals based on what they have (existing behavior)
        const systemPrompt = `You are Zylo, a warm meal planning assistant. The user just told you what ingredients they have on hand. Suggest 2-3 quick meal ideas they could make with those ingredients.

Be concise (2-3 sentences per suggestion). Focus on simple, family-friendly meals. If they're missing key ingredients, mention easy substitutions.`;

        const result = await chatWithAi({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Here's what I have: ${notes}` },
          ],
          maxTokens: CHAT_INVENTORY_MAX_TOKENS,
        });

        if (result.success && result.content) {
          addZyloMessage(result.content);
        } else {
          addZyloMessage("I see what you've got! Let me know if you want some meal ideas based on those ingredients.");
        }
      }
    } catch (error) {
      console.error("Inventory AI error:", error);
      addZyloMessage("Got it! Take a look at tonight's plan and see if it works with what you have.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Debounced ref for AI chat to prevent spam
  const lastAiChatCallRef = useRef<number>(0);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Check if user is responding to add missing items to grocery list
    const addToListPatterns = /^(yes|yeah|yep|sure|add|add them|add to list|please|ok|okay)$/i;
    if (pantryMissingItems.length > 0 && addToListPatterns.test(content.trim())) {
      setIsAiLoading(true);
      try {
        for (const item of pantryMissingItems) {
          await addGroceryItem({
            name: item,
            category: "From Meal Plan",
            isOrganic: false,
          });
        }
        addZyloMessage(
          `Done! Added ${pantryMissingItems.length} item${pantryMissingItems.length > 1 ? "s" : ""} to your grocery list. You're all set!`
        );
        setPantryMissingItems([]);
      } catch (error) {
        console.error("Failed to add grocery items:", error);
        addZyloMessage(formatErrorForUser("add items to your grocery list", error));
      } finally {
        setIsAiLoading(false);
      }
      return;
    }

    // Check if user is saying they have something that's on the grocery list
    // Patterns like "I have spinach", "I actually have...", "take off spinach", "remove spinach"
    const haveItemPattern = /(?:i (?:have|got|actually have)|take off|remove|take .* off)(.*)/i;
    const haveMatch = content.match(haveItemPattern);
    const uncheckedGroceryItems = (groceryListData || []).filter((item) => !item.isChecked);

    if (haveMatch && uncheckedGroceryItems.length > 0) {
      const userMentionedItems = haveMatch[1].toLowerCase();
      const itemsToRemove: string[] = [];

      // Check each grocery item to see if user mentioned having it
      for (const groceryItem of uncheckedGroceryItems) {
        const itemNameLower = groceryItem.name.toLowerCase();
        // Check for partial match
        if (userMentionedItems.includes(itemNameLower) ||
            itemNameLower.split(" ").some((word) => userMentionedItems.includes(word) && word.length > 3)) {
          itemsToRemove.push(groceryItem.name);
        }
      }

      if (itemsToRemove.length > 0) {
        setIsAiLoading(true);
        try {
          for (const itemName of itemsToRemove) {
            await removeGroceryItemByName({ name: itemName });
          }
          const remainingCount = uncheckedGroceryItems.length - itemsToRemove.length;
          addZyloMessage(
            `Got it! Removed ${itemsToRemove.join(", ")} from your grocery list. ${remainingCount > 0 ? `${remainingCount} item${remainingCount > 1 ? "s" : ""} left.` : "List is looking good!"}`
          );
          // Update pantry missing items if any of them were removed
          if (pantryMissingItems.length > 0) {
            const updatedMissing = pantryMissingItems.filter(
              (item) => !itemsToRemove.some((removed) => removed.toLowerCase() === item.toLowerCase())
            );
            setPantryMissingItems(updatedMissing);
          }
        } catch (error) {
          console.error("Failed to remove grocery items:", error);
          addZyloMessage(formatErrorForUser("remove items from your list", error));
        } finally {
          setIsAiLoading(false);
        }
        return;
      }
    }

    // Debounce: ignore AI calls within 1000ms of last call
    const now = Date.now();
    if (now - lastAiChatCallRef.current < AI_CHAT_DEBOUNCE_MS) {
      return;
    }
    lastAiChatCallRef.current = now;

    // Set loading state
    setIsAiLoading(true);

    try {
      // Build comprehensive context from real data
      const mealInfo = tonightMeal
        ? `Tonight's meal: ${tonightMeal.mealName} (${tonightMeal.effortTier}, ${tonightMeal.prepTime + tonightMeal.cookTime} min)
Ingredients: ${tonightMeal.ingredients.map((ing) => ing.name).join(", ")}`
        : "No meal planned for tonight.";

      // Build week meals context
      const weekMealsContext = weekMeals.length > 0
        ? `\nThis week's meals:\n${weekMeals.map((m) => `- ${m.dayLabel}: ${m.mealName}`).join("\n")}`
        : "";

      // Build grocery list context
      const uncheckedGroceryItems = (groceryListData || []).filter((item) => !item.isChecked);
      const groceryContext = uncheckedGroceryItems.length > 0
        ? `\nGrocery list (${uncheckedGroceryItems.length} items): ${uncheckedGroceryItems.slice(0, GROCERY_LIST_PREVIEW_LIMIT).map((i) => i.name).join(", ")}${uncheckedGroceryItems.length > GROCERY_LIST_PREVIEW_LIMIT ? "..." : ""}`
        : "\nGrocery list is empty.";

      const systemPrompt = `You are Zylo, a warm and supportive meal planning assistant for the DinnDone app.

IMPORTANT: Only reference information provided below. NEVER make up ingredients, meals, or data you don't have.

${mealInfo}${weekMealsContext}${groceryContext}

Your personality:
- Warm, empathetic, concise (1-3 sentences)
- Practical and solution-focused
- No guilt or pressure about meal choices

You can help with:
- Answering questions about the meal plan shown above
- Suggesting substitutions for ingredients
- Simpler alternatives if they're tired

If asked about something not in the data above, say you don't have that information.`;

      // Build conversation history for AI (limited messages for context and token efficiency)
      const recentMessages = messages.slice(-CHAT_HISTORY_LIMIT);
      const aiMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
        ...recentMessages.map((m) => ({
          role: (m.role === "zylo" ? "assistant" : "user") as "user" | "assistant",
          content: m.content,
        })),
        { role: "user", content },
      ];

      const result = await chatWithAi({ messages: aiMessages, maxTokens: CHAT_MAX_TOKENS });

      if (result.success && result.content) {
        addZyloMessage(result.content);
      } else {
        addZyloMessage("Hmm, I had a little hiccup there. Try asking again, or use the buttons above!");
      }
    } catch (error) {
      console.error("AI chat error:", error);
      addZyloMessage(formatErrorForUser("process your message", error, "Oops! Something went wrong. Let's try that again, or use the buttons above."));
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleVoiceInput = () => {
    addZyloMessage("Voice input coming soon! For now, type your message or use the buttons above.");
  };

  // Show loading state (auth loading, onboarding check, or data loading)
  const isDataLoading = householdMembersData === undefined || weekData === undefined;
  const isOnboardingLoading = isAuthenticated && hasCompletedOnboarding === undefined;
  if (isLoading || isOnboardingLoading || (isAuthenticated && isDataLoading)) {
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
  if (currentView === "details" && detailMeal) {
    return (
      <MealOptionDetails
        meal={detailMeal}
        householdMembers={householdMembers}
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
        currentMealId={tonightMeal?.id ?? ""}
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

  if (currentView === "ingredients-check" && tonightMeal) {
    return (
      <div
        className="min-h-[calc(100vh-120px)] px-4 py-4"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <button
          onClick={() => {
            setDetailMeal(tonightMeal);
            setCurrentView("details");
          }}
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
          onNotSure={() => {
            setDetailMeal(tonightMeal);
            setCurrentView("details");
          }}
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
      tomorrowMeal={tomorrowMeal}
      householdMembers={householdMembers}
      messages={messages}
      onThisWorks={handleThisWorks}
      onNewPlan={handleNewPlan}
      onImWiped={handleImWiped}
      onViewMeal={handleViewMeal}
      onSwapTomorrow={handleSwapTomorrow}
      onViewTomorrow={handleViewTomorrow}
      onOpenInventoryCheck={handleOpenInventoryCheck}
      onSendMessage={handleSendMessage}
      onVoiceInput={handleVoiceInput}
      isLoading={isAiLoading}
    />
  );
}
