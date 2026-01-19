"use client";

import { useState } from "react";
import { MealSuggestionCard } from "@/components/meal-helper/MealSuggestionCard";
import { MealOptionDetails } from "@/components/meal-helper/MealOptionDetails";
import type { MealSuggestion, HouseholdMember, PlannedMealSummary } from "@/types/meal-helper";

// Test data for Feature #104: Quick suggestion cards from Zylo
const sampleSuggestions: MealSuggestion[] = [
  {
    id: "sug-1",
    name: "Chicken Stir Fry",
    effortTier: "middle",
    prepTime: 15,
    cookTime: 20,
    cleanupRating: "medium",
    isFlexMeal: true,
    servings: 4,
    briefInstructions: "Slice chicken, prep veggies, stir fry in wok with soy sauce and garlic.",
    ingredients: ["Chicken breast", "Bell peppers", "Broccoli", "Soy sauce", "Garlic", "Ginger"],
  },
  {
    id: "sug-2",
    name: "Grilled Cheese & Tomato Soup",
    effortTier: "super-easy",
    prepTime: 5,
    cookTime: 10,
    cleanupRating: "low",
    isFlexMeal: false,
    servings: 2,
    briefInstructions: "Butter bread, add cheese, grill until golden. Heat soup.",
    ingredients: ["Bread", "Cheese", "Butter", "Canned tomato soup"],
  },
  {
    id: "sug-3",
    name: "Spaghetti and Meatballs",
    effortTier: "more-prep",
    prepTime: 25,
    cookTime: 35,
    cleanupRating: "high",
    isFlexMeal: false,
    servings: 6,
    briefInstructions: "Mix and form meatballs, brown in pan, simmer in marinara. Cook pasta.",
    ingredients: ["Ground beef", "Breadcrumbs", "Egg", "Spaghetti", "Marinara sauce", "Parmesan"],
  },
];

const sampleHouseholdMembers: HouseholdMember[] = [
  { id: "1", name: "Aaron", isAdmin: true },
  { id: "2", name: "Katie", isAdmin: true },
];

export default function TestMealSuggestionCardsPage() {
  const [selectedSuggestion, setSelectedSuggestion] = useState<MealSuggestion | null>(null);
  const [acceptedMeal, setAcceptedMeal] = useState<string | null>(null);
  const [rejectedMeals, setRejectedMeals] = useState<string[]>([]);

  const handleAccept = (suggestion: MealSuggestion) => {
    setSelectedSuggestion(suggestion);
    setAcceptedMeal(suggestion.name);
  };

  const handleReject = (suggestionId: string) => {
    const suggestion = sampleSuggestions.find((s) => s.id === suggestionId);
    if (suggestion) {
      setRejectedMeals((prev) => [...prev, suggestion.name]);
    }
  };

  const handleSomethingElse = (suggestionId: string) => {
    console.log("Something else requested for:", suggestionId);
    alert("Zylo would show more suggestions here!");
  };

  // Convert MealSuggestion to PlannedMealSummary for details view
  const convertToPlannedMeal = (suggestion: MealSuggestion): PlannedMealSummary => ({
    id: suggestion.id,
    mealName: suggestion.name,
    effortTier: suggestion.effortTier,
    prepTime: suggestion.prepTime,
    cookTime: suggestion.cookTime,
    cleanupRating: suggestion.cleanupRating,
    isFlexMeal: suggestion.isFlexMeal,
    briefInstructions: suggestion.briefInstructions,
    ingredients: suggestion.ingredients,
    assignedCookId: "2",
  });

  // Show details view if a suggestion was selected
  if (selectedSuggestion) {
    return (
      <MealOptionDetails
        meal={convertToPlannedMeal(selectedSuggestion)}
        householdMembers={sampleHouseholdMembers}
        onBack={() => setSelectedSuggestion(null)}
        onCookThis={() => {
          alert(`Cooking ${selectedSuggestion.name}!`);
          setSelectedSuggestion(null);
        }}
        onIngredientCheck={(response) => {
          console.log("Ingredient check:", response);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
          Test: Quick Suggestion Cards (Feature #104)
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
          Verify that Zylo can show tappable meal suggestion cards.
        </p>

        {/* Test status */}
        <div
          className="mt-4 p-3 rounded-lg"
          style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
        >
          <h2 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
            Test Status:
          </h2>
          <ul className="space-y-1 text-sm" style={{ color: "var(--color-muted)" }}>
            <li>
              Accepted meal:{" "}
              <span style={{ color: acceptedMeal ? "var(--color-secondary)" : "var(--color-muted)" }}>
                {acceptedMeal || "None yet"}
              </span>
            </li>
            <li>
              Rejected meals:{" "}
              <span style={{ color: rejectedMeals.length > 0 ? "var(--color-text)" : "var(--color-muted)" }}>
                {rejectedMeals.length > 0 ? rejectedMeals.join(", ") : "None yet"}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Simulated Zylo response with suggestion cards */}
      <div className="p-4">
        <div className="flex items-start gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <span className="text-white text-sm font-bold">Z</span>
          </div>
          <div
            className="rounded-2xl rounded-bl-md px-4 py-3"
            style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
          >
            <p style={{ color: "var(--color-text)" }}>
              Here are some meal suggestions based on what you have! Tap &quot;Let&apos;s do it&quot; to see details:
            </p>
          </div>
        </div>

        {/* Meal suggestion cards */}
        <div className="space-y-3 ml-10">
          {sampleSuggestions.map((suggestion) => (
            <MealSuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onAccept={() => handleAccept(suggestion)}
              onReject={() => handleReject(suggestion.id)}
              onSomethingElse={() => handleSomethingElse(suggestion.id)}
            />
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 mt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
        <h2 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
          Verification Checklist:
        </h2>
        <ul className="space-y-1 text-sm" style={{ color: "var(--color-muted)" }}>
          <li>Step 1: MealSuggestionCards display (you should see 3 cards above)</li>
          <li>Step 2: Tap &quot;Let&apos;s do it&quot; on a card to see meal details</li>
          <li>Step 3: Use &quot;Back&quot; to return, or tap X to reject a meal</li>
        </ul>
      </div>
    </div>
  );
}
