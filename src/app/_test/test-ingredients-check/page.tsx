"use client";

import { useState } from "react";
import { IngredientsCheckPanel } from "@/components/meal-helper/IngredientsCheckPanel";
import { BottomNav } from "@/components/BottomNav";
import type { PlannedMealSummary } from "@/types/meal-helper";

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

export default function TestIngredientsCheck() {
  const [response, setResponse] = useState<string | null>(null);

  const handleYes = () => {
    setResponse("yes");
    console.log("User has all ingredients");
  };

  const handleNotSure = () => {
    setResponse("not-sure");
    console.log("User is not sure about ingredients");
  };

  const handleNo = () => {
    setResponse("no");
    console.log("User is missing ingredients");
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-900">
      <header className="sticky top-0 z-10 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 py-4">
        <h1 className="text-lg font-bold text-stone-800 dark:text-stone-100">
          Test: Ingredient Check Panel (Feature #84)
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Verify the IngredientsCheckPanel component opens and displays ingredients
        </p>
      </header>

      <main className="flex-1 p-4 pb-24">
        <div className="max-w-md mx-auto space-y-4">
          <IngredientsCheckPanel
            meal={testMeal}
            onYes={handleYes}
            onNotSure={handleNotSure}
            onNo={handleNo}
          />

          {response && (
            <div className="p-4 rounded-xl bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200">
              <p className="font-semibold">Response recorded:</p>
              <p className="text-sm mt-1">
                {response === "yes" && "User has all ingredients"}
                {response === "not-sure" && "User needs to check pantry"}
                {response === "no" && "User is missing ingredients - will add to grocery list"}
              </p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
