"use client";

import { Check, ClipboardList, Sparkles, Loader2 } from "lucide-react";
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
  onGeneratePlan,
  isGenerating,
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
      {/* Centered container for tablet/desktop - wider on tablet for 2-column grid */}
      <div className="w-full max-w-3xl md:max-w-4xl mx-auto">
      {/* Week selector */}
      <WeekSelector
        weeks={availableWeeks}
        selectedWeekId={selectedWeekPlan.id}
        onSelectWeek={onSelectWeek}
        onAddWeek={onAddWeek}
      />

      {/* Status badge - increased padding on tablet */}
      <div className="px-4 py-2 md:py-3 md:px-6 flex items-center justify-between">
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

      {/* Meal cards - increased padding on tablet */}
      <div className="flex-1 overflow-auto px-4 pb-4 md:px-6 md:pb-6">
        {selectedWeekPlan.meals.length === 0 ? (
          /* Empty state - no meals yet */
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: "var(--color-primary)", opacity: 0.15 }}
            >
              <Sparkles
                size={32}
                style={{ color: "var(--color-primary)" }}
              />
            </div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--color-text)" }}
            >
              No meals planned yet
            </h3>
            <p
              className="text-sm mb-6 max-w-xs"
              style={{ color: "var(--color-muted)" }}
            >
              Let Zylo create a personalized meal plan for your family.
            </p>
            <button
              onClick={onGeneratePlan}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  Generate plan
                </>
              )}
            </button>
          </div>
        ) : (
          /* Grid layout: 1 column on mobile, 2 columns on tablet */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
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
        )}
      </div>
      </div>{/* End centered container */}
    </div>
  );
}
