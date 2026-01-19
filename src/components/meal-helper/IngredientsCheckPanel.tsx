"use client";

import { useState, useCallback } from "react";
import { Check } from "lucide-react";
import type { PlannedMealSummary } from "@/types/meal-helper";

export interface IngredientsCheckPanelProps {
  meal: PlannedMealSummary;
  prompt?: string;
  yesLabel?: string;
  notSureLabel?: string;
  noLabel?: string;
  /** Initial checked state for ingredients (keyed by ingredient string) */
  initialChecked?: Record<string, boolean>;
  /** Called when ingredient check state changes */
  onIngredientToggle?: (ingredient: string, checked: boolean) => void;
  onYes?: () => void;
  onNotSure?: () => void;
  onNo?: () => void;
}

export function IngredientsCheckPanel({
  meal,
  prompt = "Do you have these ingredients?",
  yesLabel = "Yes, all checked",
  notSureLabel = "Not sure",
  noLabel = "Missing some",
  initialChecked = {},
  onIngredientToggle,
  onYes,
  onNotSure,
  onNo,
}: IngredientsCheckPanelProps) {
  // Track which ingredients are checked as available
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>(initialChecked);

  const handleToggle = useCallback((ingredient: string) => {
    setCheckedIngredients((prev) => {
      const newChecked = !prev[ingredient];
      onIngredientToggle?.(ingredient, newChecked);
      return { ...prev, [ingredient]: newChecked };
    });
  }, [onIngredientToggle]);

  // Count checked vs total
  const checkedCount = Object.values(checkedIngredients).filter(Boolean).length;
  const totalCount = meal.ingredients.length;
  const allChecked = checkedCount === totalCount;

  return (
    <div
      className="rounded-2xl shadow-sm overflow-hidden"
      style={{
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        className="px-4 py-3"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          {prompt}
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs" style={{ color: "var(--color-muted)" }}>
            For: <span className="font-semibold">{meal.mealName}</span>
          </span>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: allChecked ? "rgba(76, 175, 80, 0.15)" : "var(--color-border)",
              color: allChecked ? "#4caf50" : "var(--color-muted)",
            }}
          >
            {checkedCount}/{totalCount} checked
          </span>
        </div>
      </div>

      <div className="px-4 py-3">
        <ul className="space-y-2 text-sm">
          {meal.ingredients.map((ingredient) => {
            const isChecked = checkedIngredients[ingredient] || false;
            return (
              <li key={ingredient}>
                <button
                  type="button"
                  onClick={() => handleToggle(ingredient)}
                  className="w-full flex items-start gap-3 text-left transition-colors"
                  style={{ color: "var(--color-text)" }}
                  aria-pressed={isChecked}
                  aria-label={`${ingredient} - ${isChecked ? "checked" : "unchecked"}`}
                >
                  {/* Checkbox */}
                  <span
                    className="mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{
                      backgroundColor: isChecked ? "var(--color-secondary)" : "transparent",
                      border: isChecked ? "none" : "2px solid var(--color-border)",
                    }}
                  >
                    {isChecked && <Check size={14} className="text-white" />}
                  </span>
                  {/* Ingredient text */}
                  <span
                    className={isChecked ? "line-through opacity-60" : ""}
                    style={{ color: "var(--color-text)" }}
                  >
                    {ingredient}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onYes}
            disabled={!allChecked}
            className="px-4 py-2 rounded-xl text-white font-semibold text-sm transition-opacity"
            style={{
              backgroundColor: "var(--color-primary)",
              opacity: allChecked ? 1 : 0.5,
            }}
          >
            {yesLabel}
          </button>
          <button
            type="button"
            onClick={onNotSure}
            className="px-4 py-2 rounded-xl font-semibold text-sm"
            style={{
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
            }}
          >
            {notSureLabel}
          </button>
          <button
            type="button"
            onClick={onNo}
            className="px-4 py-2 rounded-xl font-semibold text-sm"
            style={{
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
            }}
          >
            {noLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
