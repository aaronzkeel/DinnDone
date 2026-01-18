"use client";

import { Check, ClipboardList } from "lucide-react";
import type { WeekPlanViewProps } from "@/types/weekly-planning";
import { WeekSelector } from "./WeekSelector";
import { DayCard } from "./DayCard";

export function WeekPlanView({
  currentUser,
  availableWeeks,
  selectedWeekPlan,
  householdMembers,
  onSelectWeek,
  onSelectMeal,
  onApprovePlan,
  onAddWeek,
  onTapMeal,
  onPantryAudit,
}: WeekPlanViewProps) {
  // Check if today is in this week
  const today = new Date().toISOString().split("T")[0];

  const isDraft = selectedWeekPlan.status === "draft";
  const isAdmin = currentUser.isAdmin;

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Week selector */}
      <WeekSelector
        weeks={availableWeeks}
        selectedWeekId={selectedWeekPlan.id}
        onSelectWeek={onSelectWeek}
        onAddWeek={onAddWeek}
      />

      {/* Status badge */}
      <div className="px-4 py-2 flex items-center justify-between">
        <div
          className={`
            text-xs font-medium px-2 py-1 rounded-full
            ${
              isDraft
                ? "bg-[var(--color-border)] text-[var(--color-muted)]"
                : "bg-[var(--color-secondary)] bg-opacity-20 text-[var(--color-secondary)]"
            }
          `}
        >
          {selectedWeekPlan.status === "draft" && "Draft"}
          {selectedWeekPlan.status === "approved" && "Approved"}
          {selectedWeekPlan.status === "in-progress" && "In Progress"}
          {selectedWeekPlan.status === "completed" && "Completed"}
        </div>

        <div className="flex items-center gap-2">
          {/* Pantry Audit button */}
          <button
            onClick={onPantryAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            <ClipboardList size={14} />
            Pantry Audit
          </button>

          {isDraft && isAdmin && (
            <button
              onClick={onApprovePlan}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-colors"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <Check size={14} />
              Looks good
            </button>
          )}
        </div>
      </div>

      {/* Meal cards */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        <div className="space-y-2">
          {selectedWeekPlan.meals.map((meal) => (
            <DayCard
              key={meal.id}
              meal={meal}
              householdMembers={householdMembers}
              isToday={meal.date === today}
              onTap={() => {
                onTapMeal?.(meal.id);
                onSelectMeal?.(meal.id);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
