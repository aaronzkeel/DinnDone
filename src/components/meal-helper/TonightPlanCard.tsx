"use client";

import { Clock, Sparkles, ChefHat, Baby } from "lucide-react";
import type { TonightPlanCardProps, EffortTier, CleanupRating } from "@/types/meal-helper";
import { EFFORT_LABELS } from "@/lib/effort-tiers";

const effortColors: Record<EffortTier, string> = {
  "super-easy": "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-200",
  "middle": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200",
  "more-prep": "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200",
};

const cleanupLabels: Record<CleanupRating, string> = {
  low: "Low cleanup",
  medium: "Medium cleanup",
  high: "High cleanup",
};

export function TonightPlanCard({ meal, householdMembers, onView }: TonightPlanCardProps) {
  const cook = meal.assignedCookId
    ? householdMembers.find((member) => member.id === meal.assignedCookId)
    : undefined;

  const totalTime = meal.prepTime + meal.cookTime;

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm"
      style={{
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="min-w-0">
          <p
            className="text-xs font-semibold tracking-wide uppercase"
            style={{ color: "var(--color-muted)" }}
          >
            Tonight&apos;s plan
          </p>
          <button
            type="button"
            onClick={onView}
            className="text-lg font-semibold font-heading truncate text-left hover:underline focus:underline focus:outline-none"
            style={{ color: "var(--color-text)" }}
          >
            {meal.mealName}
          </button>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${effortColors[meal.effortTier]}`}>
            {EFFORT_LABELS[meal.effortTier]}
          </span>
          {meal.isFlexMeal && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-200">
              <Sparkles size={12} />
              Flex
            </span>
          )}
          {meal.isKidFriendly && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
              <Baby size={12} />
              Kid-friendly
            </span>
          )}
        </div>
      </div>

      <div className="px-4 py-3 space-y-2">
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
          style={{ color: "var(--color-muted)" }}
        >
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} />
            {totalTime} min
          </span>
          <span style={{ color: "var(--color-border)" }} aria-hidden="true">
            |
          </span>
          <span>{cleanupLabels[meal.cleanupRating]}</span>
          {cook && (
            <>
              <span style={{ color: "var(--color-border)" }} aria-hidden="true">
                |
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ChefHat size={14} />
                {cook.name} cooking
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {meal.ingredients.slice(0, 5).map((ingredient) => (
            <span
              key={ingredient}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "var(--color-border)",
                color: "var(--color-muted)",
              }}
            >
              {ingredient}
            </span>
          ))}
          {meal.ingredients.length > 5 && (
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              +{meal.ingredients.length - 5} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
