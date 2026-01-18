"use client";

import { Clock, ChefHat, Users } from "lucide-react";
import type { PlannedMeal, HouseholdMember, EffortTier } from "@/types/weekly-planning";

interface DayCardProps {
  meal: PlannedMeal;
  householdMembers: HouseholdMember[];
  isToday: boolean;
  onTap?: () => void;
}

const effortDots: Record<EffortTier, number> = {
  "super-easy": 1,
  middle: 2,
  "more-prep": 3,
};

const effortLabels: Record<EffortTier, string> = {
  "super-easy": "Super Easy",
  middle: "Medium",
  "more-prep": "More Prep",
};

export function DayCard({
  meal,
  householdMembers,
  isToday,
  onTap,
}: DayCardProps) {
  const cook = householdMembers.find((m) => m.id === meal.assignedCookId);
  const eaters = householdMembers.filter((m) => meal.eaterIds.includes(m.id));
  const totalTime = meal.prepTime + meal.cookTime;

  // Format date as "Mon 15"
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00"); // Add time to avoid timezone issues
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    const num = date.getDate();
    return { day, num };
  };

  const { day, num } = formatDate(meal.date);

  return (
    <button
      onClick={onTap}
      className={`
        w-full text-left p-4 rounded-xl transition-colors
        ${
          isToday
            ? "border-2"
            : "border hover:border-[var(--color-primary)]"
        }
        ${meal.isUnplanned ? "opacity-60" : ""}
      `}
      style={{
        backgroundColor: isToday
          ? "var(--color-primary)"
          : "var(--color-card)",
        borderColor: isToday
          ? "var(--color-primary)"
          : "var(--color-border)",
        ...(isToday && { backgroundColor: "rgba(226, 169, 59, 0.1)" }),
      }}
    >
      <div className="flex gap-3">
        {/* Date column */}
        <div
          className="flex flex-col items-center justify-center w-12 flex-shrink-0"
          style={{
            color: isToday ? "var(--color-primary)" : "var(--color-muted)",
          }}
        >
          <span className="text-xs font-medium uppercase">{day}</span>
          <span className="text-xl font-bold">{num}</span>
        </div>

        {/* Meal info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`
                font-semibold truncate
                ${meal.isUnplanned ? "italic" : ""}
              `}
              style={{
                color: meal.isUnplanned
                  ? "var(--color-muted)"
                  : "var(--color-text)",
              }}
            >
              {meal.isUnplanned ? "Unplanned" : meal.mealName}
            </h3>

            {/* Effort indicator */}
            {!meal.isUnplanned && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--color-muted)" }}
                >
                  {effortLabels[meal.effortTier]}
                </span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          i < effortDots[meal.effortTier]
                            ? "var(--color-primary)"
                            : "var(--color-border)",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {!meal.isUnplanned && (
            <div
              className="flex items-center gap-3 mt-2 text-sm"
              style={{ color: "var(--color-muted)" }}
            >
              {/* Time */}
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                <span>{totalTime}m</span>
              </div>

              {/* Cook */}
              {cook && (
                <div className="flex items-center gap-1.5">
                  <ChefHat size={14} />
                  <span>{cook.name}</span>
                </div>
              )}

              {/* Eaters count */}
              <div className="flex items-center gap-1.5">
                <Users size={14} />
                <span>{eaters.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
