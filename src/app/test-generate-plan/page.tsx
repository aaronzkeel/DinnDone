"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Sparkles, Loader2, Check, Clock, Users } from "lucide-react";

interface GeneratedMeal {
  dayOfWeek: string;
  date: string;
  mealName: string;
  effortTier: "super-easy" | "middle" | "more-prep";
  prepTime: number;
  cookTime: number;
  cleanupRating: "low" | "medium" | "high";
  ingredients: string[];
  isFlexMeal: boolean;
}

// List of common familiar family meals (for 80/20 detection)
const FAMILIAR_MEALS = [
  "taco", "tacos", "burrito", "enchilada", "quesadilla", "fajita",
  "spaghetti", "pasta", "lasagna", "mac and cheese", "macaroni",
  "pizza", "grilled cheese",
  "chicken", "grilled chicken", "baked chicken", "fried chicken", "chicken stir fry", "chicken stir-fry",
  "stir fry", "stir-fry", "fried rice",
  "burger", "hamburger", "cheeseburger", "meatloaf",
  "salmon", "fish", "shrimp", "fish sticks",
  "steak", "beef", "pot roast", "roast",
  "pork chop", "pork",
  "soup", "chili", "stew",
  "rice", "beans",
  "sandwich", "hot dog", "sloppy joe",
  "casserole", "noodle",
];

// Check if a meal name is familiar
function isFamiliarMeal(mealName: string): boolean {
  const lowerName = mealName.toLowerCase();
  return FAMILIAR_MEALS.some(familiar => lowerName.includes(familiar));
}

export default function TestGeneratePlanPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [meals, setMeals] = useState<GeneratedMeal[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateWeekPlan = useAction(api.ai.generateWeekPlan);

  // Get next Monday's date
  const getNextMonday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday.toISOString().split("T")[0];
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setMeals(null);

    try {
      const result = await generateWeekPlan({
        weekStartDate: getNextMonday(),
        householdSize: 5,
      });

      if (result.success && result.meals) {
        setMeals(result.meals);
      } else {
        setError(result.error || "Unknown error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const getEffortBadgeColor = (tier: string) => {
    switch (tier) {
      case "super-easy":
        return "bg-green-100 text-green-800";
      case "middle":
        return "bg-yellow-100 text-yellow-800";
      case "more-prep":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEffortLabel = (tier: string) => {
    switch (tier) {
      case "super-easy":
        return "Super Easy";
      case "middle":
        return "Medium";
      case "more-prep":
        return "More Prep";
      default:
        return tier;
    }
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="max-w-2xl mx-auto">
        <h1
          className="text-2xl font-bold mb-4 font-heading"
          style={{ color: "var(--color-text)" }}
        >
          Test: AI Meal Plan Generation
        </h1>
        <p className="mb-6" style={{ color: "var(--color-muted)" }}>
          This page tests Feature #132: AI generates draft week plan
        </p>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating plan...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate 7-Day Plan
            </>
          )}
        </button>

        {error && (
          <div className="p-4 mb-6 rounded-lg bg-red-100 border border-red-300 text-red-800">
            <strong>Error:</strong> {error}
          </div>
        )}

        {meals && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Check className="text-green-600" size={20} />
              <span
                className="font-medium"
                style={{ color: "var(--color-text)" }}
              >
                Generated {meals.length} meals!
              </span>
            </div>

            {/* 80/20 Familiar/New Analysis - Feature #133 */}
            {(() => {
              const familiarCount = meals.filter(m => isFamiliarMeal(m.mealName)).length;
              const newCount = meals.length - familiarCount;
              const meets8020 = familiarCount >= 5 && newCount <= 2;
              return (
                <div
                  className={`p-4 mb-4 rounded-lg border ${meets8020 ? "bg-green-50 border-green-300" : "bg-yellow-50 border-yellow-300"}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-semibold ${meets8020 ? "text-green-800" : "text-yellow-800"}`}>
                      80/20 Analysis (Feature #133)
                    </span>
                    {meets8020 ? (
                      <Check className="text-green-600" size={16} />
                    ) : (
                      <span className="text-yellow-600">⚠️</span>
                    )}
                  </div>
                  <div className={`text-sm ${meets8020 ? "text-green-700" : "text-yellow-700"}`}>
                    <p>Familiar meals: {familiarCount}/7 ({Math.round(familiarCount/7*100)}%)</p>
                    <p>New/adventurous meals: {newCount}/7 ({Math.round(newCount/7*100)}%)</p>
                    <p className="mt-1 font-medium">
                      {meets8020
                        ? "✓ Meets 80/20 requirement (5-6 familiar, 1-2 new)"
                        : "✗ Does not meet 80/20 requirement"}
                    </p>
                  </div>
                </div>
              );
            })()}

            <div className="space-y-3">
              {meals.map((meal, index) => {
                const familiar = isFamiliarMeal(meal.mealName);
                return (
                <div
                  key={index}
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div
                        className="text-sm font-medium"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {meal.dayOfWeek} • {meal.date}
                      </div>
                      <div
                        className="text-lg font-semibold flex items-center gap-2"
                        style={{ color: "var(--color-text)" }}
                      >
                        {meal.mealName}
                        <span className={`text-xs px-2 py-0.5 rounded ${familiar ? "bg-green-100 text-green-800" : "bg-purple-100 text-purple-800"}`}>
                          {familiar ? "Familiar" : "New"}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getEffortBadgeColor(meal.effortTier)}`}
                    >
                      {getEffortLabel(meal.effortTier)}
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-4 text-sm mb-2"
                    style={{ color: "var(--color-muted)" }}
                  >
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {meal.prepTime + meal.cookTime}m total
                    </span>
                    <span>Cleanup: {meal.cleanupRating}</span>
                    {meal.isFlexMeal && (
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs">
                        Flex
                      </span>
                    )}
                  </div>

                  <div
                    className="text-sm"
                    style={{ color: "var(--color-muted)" }}
                  >
                    <strong>Ingredients:</strong> {meal.ingredients.join(", ")}
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
