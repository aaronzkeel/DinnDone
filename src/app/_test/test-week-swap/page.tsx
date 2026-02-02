"use client";

import { useState } from "react";
import { WeekSwapList } from "@/components/meal-helper";
import type { PlannedMealSummary } from "@/types/meal-helper";

// Sample week meals for swap list
const sampleWeekMeals: Array<PlannedMealSummary & { dayLabel: string }> = [
  {
    id: "1",
    dayLabel: "Monday (Tonight)",
    mealName: "Chicken Stir Fry",
    effortTier: "middle",
    prepTime: 15,
    cookTime: 20,
    cleanupRating: "medium",
    ingredients: ["Chicken breast", "Bell peppers", "Broccoli", "Soy sauce"],
    isFlexMeal: true,
    assignedCookId: "2",
  },
  {
    id: "2",
    dayLabel: "Tuesday",
    mealName: "Taco Night",
    effortTier: "super-easy",
    prepTime: 10,
    cookTime: 15,
    cleanupRating: "low",
    ingredients: ["Ground beef", "Taco shells", "Cheese", "Lettuce", "Salsa"],
    isFlexMeal: false,
    assignedCookId: "1",
  },
  {
    id: "3",
    dayLabel: "Wednesday",
    mealName: "Spaghetti Bolognese",
    effortTier: "middle",
    prepTime: 15,
    cookTime: 30,
    cleanupRating: "medium",
    ingredients: ["Ground beef", "Pasta", "Tomato sauce", "Onion", "Garlic"],
    isFlexMeal: false,
    assignedCookId: "2",
  },
  {
    id: "4",
    dayLabel: "Thursday",
    mealName: "Grilled Salmon",
    effortTier: "middle",
    prepTime: 10,
    cookTime: 20,
    cleanupRating: "low",
    ingredients: ["Salmon fillets", "Lemon", "Asparagus", "Olive oil"],
    isFlexMeal: false,
    assignedCookId: "1",
  },
  {
    id: "5",
    dayLabel: "Friday",
    mealName: "Pizza Night",
    effortTier: "super-easy",
    prepTime: 5,
    cookTime: 20,
    cleanupRating: "low",
    ingredients: ["Pizza dough", "Mozzarella", "Pepperoni", "Tomato sauce"],
    isFlexMeal: true,
    assignedCookId: "2",
  },
  {
    id: "6",
    dayLabel: "Saturday",
    mealName: "Beef Stew",
    effortTier: "more-prep",
    prepTime: 30,
    cookTime: 120,
    cleanupRating: "medium",
    ingredients: ["Beef chuck", "Potatoes", "Carrots", "Onions", "Beef broth"],
    isFlexMeal: false,
    assignedCookId: "1",
  },
  {
    id: "7",
    dayLabel: "Sunday",
    mealName: "Roast Chicken",
    effortTier: "more-prep",
    prepTime: 20,
    cookTime: 90,
    cleanupRating: "high",
    ingredients: ["Whole chicken", "Potatoes", "Carrots", "Herbs", "Butter"],
    isFlexMeal: false,
    assignedCookId: "2",
  },
];

export default function TestWeekSwapPage() {
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [showList, setShowList] = useState(true);

  const handleSelect = (mealId: string) => {
    const meal = sampleWeekMeals.find((m) => m.id === mealId);
    setSelectedMeal(meal?.mealName || mealId);
    setShowList(false);
  };

  const handleBack = () => {
    setShowList(true);
    setSelectedMeal(null);
  };

  if (!showList) {
    return (
      <div
        className="min-h-screen p-4 font-sans"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            Meal Selected!
          </h2>
          <p
            className="mt-2"
            style={{ color: "var(--color-muted)" }}
          >
            You selected: <strong style={{ color: "var(--color-text)" }}>{selectedMeal}</strong>
          </p>
          <button
            onClick={handleBack}
            className="mt-4 rounded-lg px-4 py-2 font-medium text-white"
            style={{ backgroundColor: "var(--color-secondary)" }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <WeekSwapList
      meals={sampleWeekMeals}
      currentMealId="1"
      onSelect={handleSelect}
      onBack={handleBack}
    />
  );
}
