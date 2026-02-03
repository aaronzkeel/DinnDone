"use client";

import { Clock, ChefHat, Users, Eye } from "lucide-react";
import type { PlannedMeal, HouseholdMember } from "@/types/weekly-planning";
import { EFFORT_LABELS, EFFORT_DOTS } from "@/lib/effort-tiers";

interface DayCardProps {
  meal: PlannedMeal;
  householdMembers: HouseholdMember[];
  isToday: boolean;
  isPast?: boolean;
  onTap?: () => void;
  onViewMeal?: () => void;
}

export function DayCard({
  meal,
  householdMembers,
  isToday,
  isPast = false,
  onTap,
  onViewMeal,
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

  // Build aria-label for screen readers
  const ariaLabel = `${meal.dayOfWeek}, ${meal.mealName}${isToday ? ", today" : ""}${isPast ? ", completed" : ""}`;

  return (
    <button
      onClick={onTap}
      aria-label={ariaLabel}
      className={`
        w-full text-left p-4 md:p-5 rounded-xl transition-colors
        ${
          isToday
            ? "border-2"
            : "border hover:border-[var(--color-primary)]"
        }
        ${isPast ? "opacity-50" : ""}
      `}
      style={{
        backgroundColor: isToday
          ? "var(--color-primary-tint)"
          : "var(--color-card)",
        borderColor: isToday
          ? "var(--color-primary)"
          : "var(--color-border)",
      }}
    >
      <div className="flex gap-3 md:gap-4">
        {/* Date column */}
        <div
          className="flex flex-col items-center justify-center w-12 md:w-14 flex-shrink-0"
          style={{
            color: isToday ? "var(--color-primary)" : "var(--color-muted)",
          }}
        >
          <span className="text-xs md:text-sm font-medium uppercase">{day}</span>
          <span className="text-xl md:text-2xl font-bold">{num}</span>
        </div>

        {/* Meal info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="font-semibold truncate"
              style={{ color: "var(--color-text)" }}
            >
              {meal.mealName}
            </h3>

            {/* Effort indicator */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span
                className="text-xs font-medium"
                style={{ color: "var(--color-muted)" }}
              >
                {EFFORT_LABELS[meal.effortTier]}
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        i < EFFORT_DOTS[meal.effortTier]
                          ? "var(--color-primary)"
                          : "var(--color-border)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

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

            {/* Eaters - show names or initials */}
            <div className="flex items-center gap-1.5">
              <Users size={14} />
              {eaters.length <= 3 ? (
                <span className="truncate max-w-[100px] md:max-w-[150px]">
                  {eaters.map((e) => e.name.split(" ")[0]).join(", ")}
                </span>
              ) : (
                <span className="truncate max-w-[100px] md:max-w-[150px]">
                  {eaters.slice(0, 2).map((e) => e.name.split(" ")[0]).join(", ")} +{eaters.length - 2}
                </span>
              )}
            </div>
          </div>

          {/* View meal details link */}
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onViewMeal?.();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onViewMeal?.();
              }
            }}
            className="inline-flex items-center gap-1 mt-2 text-xs font-medium hover:opacity-80 cursor-pointer"
            style={{ color: "var(--color-primary)" }}
          >
            <Eye size={12} />
            View ingredients & directions
          </div>
        </div>
      </div>
    </button>
  );
}
