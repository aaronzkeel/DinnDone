"use client";

import { ArrowLeft, Clock, ChefHat, Sparkles, Droplets } from "lucide-react";
import type { PlannedMealSummary, HouseholdMember } from "@/types/meal-helper";
import type { Ingredient } from "@/types/meal";
import { EFFORT_LABELS } from "@/lib/effort-tiers";

/**
 * Format ingredient for display - quantity + name, or just name if no quantity
 */
function formatIngredientDisplay(ingredient: Ingredient): string {
  if (ingredient.quantity && ingredient.quantity.trim()) {
    return `${ingredient.quantity} ${ingredient.name}`;
  }
  return ingredient.name;
}

export interface MealOptionDetailsProps {
  meal: PlannedMealSummary;
  householdMembers: HouseholdMember[];
  onCookThis?: () => void;
  onBack?: () => void;
  onIngredientCheck?: (response: "yes" | "not-sure" | "no") => void;
}

const cleanupLabels = {
  low: "Low cleanup",
  medium: "Medium cleanup",
  high: "High cleanup",
} as const;

function getEffortDescription(effortTier: string, totalTime: number): string {
  if (effortTier === "super-easy") {
    return `Quick and simple - about ${totalTime} minutes from start to plate. Minimal prep, straightforward cooking.`;
  } else if (effortTier === "middle") {
    return `Moderate effort - ${totalTime} minutes total. Some prep work, but nothing complicated.`;
  } else {
    return `More involved - ${totalTime} minutes total. Worth it for a heartier meal with more prep steps.`;
  }
}

export function MealOptionDetails({
  meal,
  householdMembers,
  onCookThis,
  onBack,
  onIngredientCheck,
}: MealOptionDetailsProps) {
  const cook = meal.assignedCookId
    ? householdMembers.find((member) => member.id === meal.assignedCookId)
    : undefined;
  const totalTime = meal.prepTime + meal.cookTime;

  return (
    <div
      className="flex flex-col min-h-full"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="px-4 pt-4 pb-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-80"
          style={{ color: "var(--color-muted)" }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="px-4">
        <div
          className="rounded-2xl border shadow-sm overflow-hidden"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <div
            className="px-4 py-3 border-b"
            style={{ borderColor: "var(--color-border)" }}
          >
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              {meal.mealName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor:
                    meal.effortTier === "super-easy"
                      ? "var(--color-success-tint)"
                      : meal.effortTier === "middle"
                        ? "var(--color-primary-tint)"
                        : "var(--color-warning-tint)",
                  color:
                    meal.effortTier === "super-easy"
                      ? "var(--color-success)"
                      : meal.effortTier === "middle"
                        ? "var(--color-primary)"
                        : "var(--color-warning)",
                }}
              >
                {EFFORT_LABELS[meal.effortTier]}
              </span>
              {meal.isFlexMeal && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "var(--color-success-tint)",
                    color: "var(--color-success)",
                  }}
                >
                  <Sparkles size={12} />
                  Flex meal
                </span>
              )}
            </div>
          </div>

          <div className="px-4 py-3 space-y-3">
            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
              style={{ color: "var(--color-muted)" }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} />
                {totalTime} min total
              </span>
              <span style={{ color: "var(--color-border)" }} aria-hidden="true">
                |
              </span>
              <span>{meal.prepTime} min prep</span>
              <span style={{ color: "var(--color-border)" }} aria-hidden="true">
                |
              </span>
              <span>{meal.cookTime} min cook</span>
              <span style={{ color: "var(--color-border)" }} aria-hidden="true">
                |
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Droplets size={14} />
                {cleanupLabels[meal.cleanupRating]}
              </span>
              {cook && (
                <>
                  <span
                    style={{ color: "var(--color-border)" }}
                    aria-hidden="true"
                  >
                    |
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ChefHat size={14} />
                    {cook.name} cooking
                  </span>
                </>
              )}
            </div>

            <div>
              <h2
                className="text-sm font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                Ingredients
              </h2>
              <ul
                className="mt-2 space-y-1 text-sm"
                style={{ color: "var(--color-muted)" }}
              >
                {meal.ingredients.map((ingredient) => (
                  <li key={ingredient.name} className="flex items-start gap-2">
                    <span
                      className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: "var(--color-border)" }}
                    />
                    <span>{formatIngredientDisplay(ingredient)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="rounded-xl border p-3"
              style={{
                backgroundColor: "var(--color-bg)",
                borderColor: "var(--color-border)",
              }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                Do you have the ingredients?
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onIngredientCheck?.("yes")}
                  className="px-3 py-1.5 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-colors"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => onIngredientCheck?.("not-sure")}
                  className="px-3 py-1.5 rounded-lg border text-sm font-semibold hover:opacity-80 transition-colors"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-muted)",
                  }}
                >
                  Not sure
                </button>
                <button
                  type="button"
                  onClick={() => onIngredientCheck?.("no")}
                  className="px-3 py-1.5 rounded-lg border text-sm font-semibold hover:opacity-80 transition-colors"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-muted)",
                  }}
                >
                  No
                </button>
              </div>
            </div>

            <div>
              <h2
                className="text-sm font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                Directions
              </h2>
              {meal.prepSteps && meal.prepSteps.length > 0 ? (
                <ol
                  className="mt-2 space-y-2 text-sm"
                  style={{ color: "var(--color-muted)" }}
                >
                  {meal.prepSteps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                        style={{
                          backgroundColor: "var(--color-primary)",
                          color: "white",
                        }}
                      >
                        {index + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <div
                  className="mt-2 p-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    color: "var(--color-muted)",
                  }}
                >
                  <p className="italic">
                    {meal.briefInstructions || getEffortDescription(meal.effortTier, totalTime)}
                  </p>
                  <p className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>
                    Full directions coming soon. For now, use the ingredients and timing above as your guide.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 mt-auto">
        <button
          onClick={onCookThis}
          className="w-full px-4 py-3 rounded-xl text-white font-semibold hover:opacity-90 active:scale-[0.99] transition-all"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          Cook this
        </button>
      </div>
    </div>
  );
}
