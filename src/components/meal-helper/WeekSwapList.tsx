import { ChevronRight, Clock, ArrowLeft } from "lucide-react";
import type { PlannedMealSummary } from "@/types/meal-helper";

export interface WeekSwapListProps {
  meals: Array<PlannedMealSummary & { dayLabel?: string }>;
  currentMealId?: string;
  onSelect?: (mealId: string) => void;
  onBack?: () => void;
}

export function WeekSwapList({
  meals,
  currentMealId,
  onSelect,
  onBack,
}: WeekSwapListProps) {
  // Filter out the current meal (no need to swap with itself)
  const swappableMeals = meals.filter((meal) => meal.id !== currentMealId);

  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3"
        style={{
          backgroundColor: "var(--color-bg)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center rounded-full p-2 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
          aria-label="Go back"
        >
          <ArrowLeft size={20} style={{ color: "var(--color-text)" }} />
        </button>
        <h1
          className="font-heading text-lg font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          Swap Tonight&apos;s Meal
        </h1>
      </div>

      {/* Content */}
      <div className="p-4">
        {swappableMeals.length === 0 ? (
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <p
              className="text-sm"
              style={{ color: "var(--color-muted)" }}
            >
              No other meals available to swap this week.
            </p>
          </div>
        ) : (
          <div
            className="overflow-hidden rounded-2xl shadow-sm"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="px-4 py-3"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <h3
                className="text-sm font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                Pick a meal from this week
              </h3>
              <p
                className="mt-1 text-xs"
                style={{ color: "var(--color-muted)" }}
              >
                Fastest option if you already planned for the ingredients.
              </p>
            </div>

            <div>
              {swappableMeals.map((meal, index) => {
                const totalTime = meal.prepTime + meal.cookTime;
                const isLast = index === swappableMeals.length - 1;

                return (
                  <button
                    key={meal.id}
                    type="button"
                    onClick={() => onSelect?.(meal.id)}
                    className="w-full text-left px-4 py-3 transition-colors hover:bg-stone-50 dark:hover:bg-stone-700/40"
                    style={{
                      borderBottom: isLast
                        ? "none"
                        : "1px solid var(--color-border)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div
                          className="text-xs font-semibold"
                          style={{ color: "var(--color-muted)" }}
                        >
                          {meal.dayLabel || "This week"}
                        </div>
                        <div
                          className="truncate text-sm font-semibold"
                          style={{ color: "var(--color-text)" }}
                        >
                          {meal.mealName}
                        </div>
                        <div
                          className="mt-1 flex items-center gap-2 text-xs"
                          style={{ color: "var(--color-muted)" }}
                        >
                          <span className="inline-flex items-center gap-1">
                            <Clock size={12} />
                            {totalTime}m
                          </span>
                          <span
                            aria-hidden="true"
                            style={{ color: "var(--color-border)" }}
                          >
                            |
                          </span>
                          <span className="truncate">
                            {meal.ingredients.slice(0, 3).join(", ")}
                            {meal.ingredients.length > 3 ? "…" : ""}
                          </span>
                        </div>
                      </div>

                      <ChevronRight
                        size={18}
                        className="mt-1 flex-shrink-0"
                        style={{ color: "var(--color-muted)" }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
