"use client";

import { MealOptionDetails } from "@/components/meal-helper/MealOptionDetails";
import { BottomNav } from "@/components/BottomNav";
import type { PlannedMealSummary, HouseholdMember } from "@/types/meal-helper";

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
  prepSteps: [
    "Slice chicken breast into thin strips and season with salt and pepper",
    "Dice bell peppers and cut broccoli into small florets",
    "Mince garlic and grate fresh ginger",
    "Heat oil in a large wok or skillet over high heat",
    "Cook chicken until golden, about 5 minutes, then set aside",
    "Stir-fry vegetables for 3-4 minutes until crisp-tender",
    "Add chicken back, pour in soy sauce, toss to combine",
    "Serve hot over rice",
  ],
  isFlexMeal: true,
  assignedCookId: "user-2",
};

const householdMembers: HouseholdMember[] = [
  { id: "user-1", name: "Aaron", isAdmin: true },
  { id: "user-2", name: "Katie", isAdmin: false },
  { id: "user-3", name: "Sam", isAdmin: false },
];

export default function TestMealDetails() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-900">
      <header className="sticky top-0 z-10 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 py-4">
        <h1 className="text-lg font-bold text-stone-800 dark:text-stone-100">
          Test: Meal Details with Prep Steps (Feature #73)
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Verify numbered cooking steps display in order
        </p>
      </header>

      <main className="flex-1 pb-24">
        <MealOptionDetails
          meal={testMeal}
          householdMembers={householdMembers}
          onBack={() => console.log("Back clicked")}
          onCookThis={() => console.log("Cook this clicked")}
          onIngredientCheck={(response) => console.log("Ingredient check:", response)}
        />
      </main>

      <BottomNav />
    </div>
  );
}
