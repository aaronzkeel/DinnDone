"use client";

import { Clock, Sparkles, Check, X, RefreshCw } from "lucide-react";
import type { MealSuggestion, EffortTier, CleanupRating } from "@/types/meal-helper";
import { EFFORT_LABELS } from "@/lib/effort-tiers";

interface MealSuggestionCardProps {
  suggestion: MealSuggestion;
  onAccept?: () => void;
  onReject?: () => void;
  onSomethingElse?: () => void;
}

const effortColors: Record<EffortTier, string> = {
  "super-easy": "bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-300",
  "middle": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  "more-prep": "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
};

const cleanupIcons: Record<CleanupRating, string> = {
  low: "1 pan",
  medium: "2-3 dishes",
  high: "Full cleanup",
};

export function MealSuggestionCard({
  suggestion,
  onAccept,
  onReject,
  onSomethingElse,
}: MealSuggestionCardProps) {
  const totalTime = suggestion.prepTime + suggestion.cookTime;

  return (
    <div
      className="rounded-xl overflow-hidden shadow-sm"
      style={{
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* Header */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold truncate"
              style={{ color: "var(--color-text)" }}
            >
              {suggestion.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${effortColors[suggestion.effortTier]}`}
              >
                {EFFORT_LABELS[suggestion.effortTier]}
              </span>
              {suggestion.isFlexMeal && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-300 flex items-center gap-1">
                  <Sparkles size={10} />
                  Flex Meal
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="px-4 py-3 space-y-2">
        <div
          className="flex items-center gap-4 text-sm"
          style={{ color: "var(--color-muted)" }}
        >
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{totalTime} min total</span>
          </div>
          <div style={{ color: "var(--color-border)" }}>|</div>
          <div className="flex items-center gap-1.5">
            <span>{cleanupIcons[suggestion.cleanupRating]}</span>
          </div>
        </div>

        <p
          className="text-sm line-clamp-2"
          style={{ color: "var(--color-muted)" }}
        >
          {suggestion.briefInstructions}
        </p>

        {/* Ingredients preview */}
        <div className="flex flex-wrap gap-1 pt-1">
          {suggestion.ingredients.slice(0, 4).map((ingredient, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "var(--color-border)",
                color: "var(--color-muted)",
              }}
            >
              {ingredient}
            </span>
          ))}
          {suggestion.ingredients.length > 4 && (
            <span className="text-xs px-2 py-0.5" style={{ color: "var(--color-muted)" }}>
              +{suggestion.ingredients.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div
        className="px-4 py-3 flex gap-2"
        style={{
          backgroundColor: "var(--color-bg)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <button
          onClick={onAccept}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-white font-medium text-sm hover:opacity-90 active:scale-[0.98] transition-all"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <Check size={16} />
          Let&apos;s do it
        </button>
        <button
          onClick={onReject}
          className="px-3 py-2 rounded-lg transition-colors hover:opacity-80"
          style={{
            border: "1px solid var(--color-border)",
            color: "var(--color-muted)",
          }}
          aria-label="Reject"
        >
          <X size={16} />
        </button>
        <button
          onClick={onSomethingElse}
          className="px-3 py-2 rounded-lg transition-colors hover:opacity-80"
          style={{
            border: "1px solid var(--color-border)",
            color: "var(--color-muted)",
          }}
          aria-label="Something else"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
}
