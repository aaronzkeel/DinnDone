"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { IngredientsCheckPanel } from "@/components/meal-helper/IngredientsCheckPanel";
import { BottomNav } from "@/components/BottomNav";
import type { PlannedMealSummary } from "@/types/meal-helper";
import { CheckCircle2, Circle, ShoppingCart, Plus } from "lucide-react";

// Test page for Feature #87: Add missing to grocery list
// Verifies: One-tap adds missing ingredients to list

interface StepStatus {
  step1: boolean; // Have missing ingredients
  step2: boolean; // Tap Add to grocery list
  step3: boolean; // Verify items added
}

// Category mapping for common ingredients
function categorizeIngredient(ingredient: string): string {
  const lower = ingredient.toLowerCase();
  if (lower.includes("chicken") || lower.includes("beef") || lower.includes("pork") || lower.includes("fish") || lower.includes("salmon")) {
    return "Meat";
  }
  if (lower.includes("broccoli") || lower.includes("pepper") || lower.includes("onion") || lower.includes("garlic") || lower.includes("ginger") || lower.includes("lettuce")) {
    return "Produce";
  }
  if (lower.includes("milk") || lower.includes("cheese") || lower.includes("yogurt") || lower.includes("butter")) {
    return "Dairy";
  }
  if (lower.includes("bread") || lower.includes("bun") || lower.includes("tortilla")) {
    return "Bakery";
  }
  if (lower.includes("rice") || lower.includes("pasta") || lower.includes("soy sauce") || lower.includes("oil")) {
    return "Pantry";
  }
  return "Other";
}

export default function TestAddMissingToGrocery() {
  // Convex queries and mutations
  const stores = useQuery(api.stores.list);
  const groceryItems = useQuery(api.groceryItems.list);
  const weekPlans = useQuery(api.weekPlans.list);
  const addGroceryItem = useMutation(api.groceryItems.add);
  const seedStores = useMutation(api.stores.seedDefaults);

  // Get meals for the first week plan
  const weekPlan = weekPlans?.[0];
  const mealsData = useQuery(
    api.weekPlans.getMeals,
    weekPlan ? { weekPlanId: weekPlan._id } : "skip"
  );

  // Local state
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [addedItems, setAddedItems] = useState<string[]>([]);
  const [steps, setSteps] = useState<StepStatus>({
    step1: false,
    step2: false,
    step3: false,
  });

  // Use first meal from database or fallback
  const firstMeal = mealsData?.[0];

  // Convert database meal to PlannedMealSummary
  const testMeal: PlannedMealSummary = firstMeal ? {
    id: firstMeal._id,
    mealName: firstMeal.name,
    effortTier: firstMeal.effortTier === "easy" ? "super-easy" : firstMeal.effortTier === "medium" ? "middle" : "more-prep",
    prepTime: firstMeal.prepTime,
    cookTime: firstMeal.cookTime,
    cleanupRating: firstMeal.cleanupRating === 1 ? "low" : firstMeal.cleanupRating === 2 ? "medium" : "high",
    ingredients: firstMeal.ingredients.map(i => i.name),
    isFlexMeal: firstMeal.isFlexMeal ?? false,
  } : {
    id: "test-meal-1",
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
      "1 inch fresh ginger, grated",
      "2 tbsp vegetable oil",
    ],
    isFlexMeal: true,
  };

  // Seed stores if needed
  useEffect(() => {
    if (stores && stores.length === 0) {
      seedStores();
    }
  }, [stores, seedStores]);

  // Calculate missing ingredients
  const missingIngredients = testMeal.ingredients.filter(
    (i) => !checkedIngredients[i]
  );

  // Update step 1 based on missing count
  useEffect(() => {
    setSteps((prev) => ({
      ...prev,
      step1: missingIngredients.length > 0,
    }));
  }, [missingIngredients.length]);

  // Handle ingredient toggle
  const handleIngredientToggle = useCallback((ingredient: string, checked: boolean) => {
    setCheckedIngredients((prev) => ({ ...prev, [ingredient]: checked }));
  }, []);

  // Handle adding missing ingredients to grocery list
  const handleAddMissingToGrocery = async () => {
    if (!stores || stores.length === 0) {
      alert("No stores available. Please wait for stores to load.");
      return;
    }

    const defaultStoreId = stores[0]._id;
    const mealId = firstMeal?._id as Id<"plannedMeals"> | undefined;

    setIsAdding(true);
    const added: string[] = [];

    try {
      for (const ingredient of missingIngredients) {
        await addGroceryItem({
          name: ingredient,
          quantity: "1",
          storeId: defaultStoreId,
          category: categorizeIngredient(ingredient),
          isOrganic: false,
          linkedMealIds: mealId ? [mealId] : undefined,
        });
        added.push(ingredient);
      }

      setAddedItems(added);
      setSteps((prev) => ({ ...prev, step2: true }));

      // Small delay then verify
      setTimeout(() => {
        setSteps((prev) => ({ ...prev, step3: true }));
      }, 500);
    } catch (error) {
      console.error("Error adding items:", error);
      alert("Failed to add items: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsAdding(false);
    }
  };

  // Count items that match what we added
  const matchingItemsCount = groceryItems?.filter((item) =>
    addedItems.some((added) => item.name === added)
  ).length ?? 0;

  // Check if all added items are in the grocery list
  const allItemsInGroceryList = addedItems.length > 0 && matchingItemsCount === addedItems.length;

  const allStepsPassed = steps.step1 && steps.step2 && steps.step3 && allItemsInGroceryList;

  // Loading state
  if (stores === undefined || groceryItems === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="text-center">
          <div
            className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-2"
            style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}
          />
          <p style={{ color: "var(--color-muted)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      <header
        className="sticky top-0 z-10 border-b px-4 py-4"
        style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-border)" }}
      >
        <h1 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
          Test: Add Missing to Grocery List (Feature #87)
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
          Verify that one-tap adds missing ingredients to the grocery list
        </p>
      </header>

      <main className="flex-1 p-4 pb-24">
        <div className="max-w-md mx-auto space-y-6">
          {/* Test Steps Checklist */}
          <div
            className="rounded-2xl border p-4"
            style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}
          >
            <h2 className="font-semibold mb-3" style={{ color: "var(--color-text)" }}>
              Test Steps
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                {steps.step1 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "var(--color-border)" }} />
                )}
                <div>
                  <span
                    className={steps.step1 ? "text-green-700 dark:text-green-400 font-medium" : ""}
                    style={{ color: steps.step1 ? undefined : "var(--color-muted)" }}
                  >
                    Step 1: Have missing ingredients
                  </span>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                    Currently: {missingIngredients.length} ingredients are unchecked
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                {steps.step2 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "var(--color-border)" }} />
                )}
                <div>
                  <span
                    className={steps.step2 ? "text-green-700 dark:text-green-400 font-medium" : ""}
                    style={{ color: steps.step2 ? undefined : "var(--color-muted)" }}
                  >
                    Step 2: Tap &quot;Add to grocery list&quot;
                  </span>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                    {steps.step2 ? `Added ${addedItems.length} items` : "Use the button below to add missing items"}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                {steps.step3 && allItemsInGroceryList ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "var(--color-border)" }} />
                )}
                <div>
                  <span
                    className={steps.step3 && allItemsInGroceryList ? "text-green-700 dark:text-green-400 font-medium" : ""}
                    style={{ color: steps.step3 && allItemsInGroceryList ? undefined : "var(--color-muted)" }}
                  >
                    Step 3: Verify items added to grocery list
                  </span>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                    {allItemsInGroceryList
                      ? `All ${matchingItemsCount} items found in grocery list!`
                      : addedItems.length > 0
                      ? `Found ${matchingItemsCount} of ${addedItems.length} items`
                      : "Items will be verified after adding"}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* All Steps Passed Banner */}
          {allStepsPassed && (
            <div
              className="rounded-2xl border p-4 text-center"
              style={{
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                borderColor: "#4caf50",
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                <span className="font-bold text-lg text-green-700 dark:text-green-300">
                  Feature #87 Test Passed!
                </span>
              </div>
              <p className="text-sm mt-1 text-green-600 dark:text-green-400">
                One-tap adds missing ingredients to grocery list
              </p>
            </div>
          )}

          {/* Ingredient Check Panel */}
          <IngredientsCheckPanel
            meal={testMeal}
            prompt="Check which ingredients you already have:"
            initialChecked={checkedIngredients}
            onIngredientToggle={handleIngredientToggle}
            yesLabel="All checked"
            notSureLabel="Not sure"
            noLabel="Missing some"
            onYes={() => {}}
            onNotSure={() => {}}
            onNo={() => {}}
          />

          {/* Add to Grocery List Button */}
          <button
            type="button"
            onClick={handleAddMissingToGrocery}
            disabled={missingIngredients.length === 0 || isAdding || steps.step2}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold transition-opacity"
            style={{
              backgroundColor: "var(--color-primary)",
              opacity: missingIngredients.length === 0 || isAdding || steps.step2 ? 0.5 : 1,
            }}
            data-testid="add-to-grocery-button"
          >
            {isAdding ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                Adding {missingIngredients.length} items...
              </>
            ) : steps.step2 ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Added {addedItems.length} items to grocery list
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                <Plus className="w-4 h-4" />
                Add {missingIngredients.length} missing to grocery list
              </>
            )}
          </button>

          {/* Added Items List */}
          {addedItems.length > 0 && (
            <div
              className="rounded-xl border p-4"
              style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}
            >
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-text)" }}>
                Items Added to Grocery List:
              </h3>
              <ul className="space-y-1 text-sm" style={{ color: "var(--color-muted)" }}>
                {addedItems.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Current Grocery List Count */}
          <div
            className="rounded-xl border p-3 text-center"
            style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}
          >
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              Total items in grocery list: <span className="font-bold" style={{ color: "var(--color-text)" }}>{groceryItems.length}</span>
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
