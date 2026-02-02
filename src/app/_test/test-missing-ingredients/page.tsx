"use client";

import { useState, useEffect } from "react";
import { IngredientsCheckPanel } from "@/components/meal-helper/IngredientsCheckPanel";
import { BottomNav } from "@/components/BottomNav";
import type { PlannedMealSummary } from "@/types/meal-helper";
import { CheckCircle2, Circle } from "lucide-react";

const testMeal: PlannedMealSummary = {
  id: "meal-1",
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

interface StepStatus {
  step1: boolean; // Leave some unchecked
  step2: boolean; // Verify highlighted
  step3: boolean; // Verify count shows
}

export default function TestMissingIngredients() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    // Pre-check some items, leave others unchecked
    "3 tbsp soy sauce": true,
    "4 cloves garlic, minced": true,
    "2 tbsp vegetable oil": true,
  });

  const [steps, setSteps] = useState<StepStatus>({
    step1: true, // Already true since we have unchecked items
    step2: false,
    step3: false,
  });

  const handleIngredientToggle = (ingredient: string, checked: boolean) => {
    setCheckedItems((prev) => ({ ...prev, [ingredient]: checked }));
  };

  // Count missing ingredients
  const missingCount = testMeal.ingredients.filter(
    (i) => !checkedItems[i]
  ).length;

  // Update step 1 based on missing count (using useEffect to avoid render-time state updates)
  useEffect(() => {
    setSteps((prev) => ({
      ...prev,
      step1: missingCount > 0,
    }));
  }, [missingCount]);

  const handleVerifyHighlighted = () => {
    // User confirms they see the highlighting
    setSteps((prev) => ({ ...prev, step2: true }));
  };

  const handleVerifyCount = () => {
    // User confirms they see the count
    setSteps((prev) => ({ ...prev, step3: true }));
  };

  const allStepsPassed = steps.step1 && steps.step2 && steps.step3;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-900">
      <header className="sticky top-0 z-10 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 py-4">
        <h1 className="text-lg font-bold text-stone-800 dark:text-stone-100">
          Test: Missing Ingredients Highlighted (Feature #86)
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Verify that unchecked ingredients are visually highlighted as needed
        </p>
      </header>

      <main className="flex-1 p-4 pb-24">
        <div className="max-w-md mx-auto space-y-6">
          {/* Test Steps Checklist */}
          <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-4">
            <h2 className="font-semibold text-stone-800 dark:text-stone-100 mb-3">
              Test Steps
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                {steps.step1 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-stone-300 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <span className={steps.step1 ? "text-green-700 dark:text-green-400 font-medium" : "text-stone-600 dark:text-stone-300"}>
                    Step 1: Leave some ingredients unchecked
                  </span>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Currently: {missingCount} ingredients are unchecked
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                {steps.step2 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-stone-300 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <span className={steps.step2 ? "text-green-700 dark:text-green-400 font-medium" : "text-stone-600 dark:text-stone-300"}>
                    Step 2: Verify they are visually highlighted
                  </span>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Missing items should have red background, red text, and &quot;needed&quot; label
                  </p>
                  {!steps.step2 && (
                    <button
                      onClick={handleVerifyHighlighted}
                      className="mt-2 px-3 py-1 text-xs font-medium rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    >
                      I see the highlighting
                    </button>
                  )}
                </div>
              </li>
              <li className="flex items-start gap-2">
                {steps.step3 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-stone-300 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <span className={steps.step3 ? "text-green-700 dark:text-green-400 font-medium" : "text-stone-600 dark:text-stone-300"}>
                    Step 3: Verify count of missing items shows
                  </span>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Header should show red badge with &quot;{missingCount} missing&quot;
                  </p>
                  {!steps.step3 && (
                    <button
                      onClick={handleVerifyCount}
                      className="mt-2 px-3 py-1 text-xs font-medium rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    >
                      I see the count badge
                    </button>
                  )}
                </div>
              </li>
            </ul>
          </div>

          {/* All Steps Passed Banner */}
          {allStepsPassed && (
            <div className="rounded-2xl bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                <span className="font-bold text-green-700 dark:text-green-300 text-lg">
                  Feature #86 Test Passed!
                </span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Missing ingredients are properly highlighted
              </p>
            </div>
          )}

          {/* The Component Under Test */}
          <IngredientsCheckPanel
            meal={testMeal}
            initialChecked={checkedItems}
            onIngredientToggle={handleIngredientToggle}
            onYes={() => console.log("All ingredients confirmed")}
            onNotSure={() => console.log("Not sure about ingredients")}
            onNo={() => console.log("Missing ingredients")}
          />

          {/* Legend */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-3">
            <h3 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase mb-2">
              Visual Indicators
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-red-100 border border-red-300"></span>
                <span className="text-stone-600 dark:text-stone-300">Red background = Missing ingredient</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded border-2 border-red-500"></span>
                <span className="text-stone-600 dark:text-stone-300">Red checkbox border = Needs to be checked</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-red-500">needed</span>
                <span className="text-stone-600 dark:text-stone-300">Label indicates item is required</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-500">4 missing</span>
                <span className="text-stone-600 dark:text-stone-300">Badge shows total missing count</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
