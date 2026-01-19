"use client";

import { useState } from "react";
import { WeekPlanView } from "@/components/weekly-planning";
import type {
  HouseholdMember,
  WeekSummary,
  WeekPlan,
  PlanStatus,
} from "@/types/weekly-planning";

// Sample data
const householdMembers: HouseholdMember[] = [
  { id: "hm-001", name: "Aaron", isAdmin: true },
  { id: "hm-002", name: "Katie", isAdmin: true },
];

const currentUser: HouseholdMember = {
  id: "hm-001",
  name: "Aaron",
  isAdmin: true,
};

// Create weeks with different statuses
const createWeekPlan = (
  id: string,
  weekStartDate: string,
  status: PlanStatus,
  label: string
): { summary: WeekSummary; plan: WeekPlan } => {
  const baseDate = new Date(weekStartDate);
  const meals = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const mealNames = [
      "Pancakes & Eggs",
      "Taco Tuesday",
      "Pasta Primavera",
      "Chicken Stir Fry",
      "Pizza Night",
      "Grilled Burgers",
      "Slow Cooker Pot Roast",
    ];
    return {
      id: `${id}-meal-${i}`,
      date: date.toISOString().split("T")[0],
      dayOfWeek: dayNames[date.getDay()],
      mealName: mealNames[i],
      effortTier: (["super-easy", "middle", "more-prep"][i % 3]) as "super-easy" | "middle" | "more-prep",
      prepTime: 10 + (i * 5),
      cookTime: 15 + (i * 5),
      cleanupRating: (["low", "medium", "high"][i % 3]) as "low" | "medium" | "high",
      assignedCookId: i % 2 === 0 ? "hm-001" : "hm-002",
      eaterIds: ["hm-001", "hm-002"],
      servings: 4,
      ingredients: ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
      isFlexMeal: i % 3 === 0,
      isUnplanned: false,
    };
  });

  return {
    summary: {
      id,
      weekStartDate,
      label,
      status,
    },
    plan: {
      id,
      weekStartDate,
      status,
      meals,
      approvedBy: status !== "draft" ? "hm-001" : undefined,
      approvedAt: status !== "draft" ? new Date().toISOString() : undefined,
    },
  };
};

// Get current week's Monday
const today = new Date();
const currentDay = today.getDay();
const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
const thisMonday = new Date(today);
thisMonday.setDate(today.getDate() - daysToMonday);

// Get last week's Monday
const lastMonday = new Date(thisMonday);
lastMonday.setDate(thisMonday.getDate() - 7);

// Get next week's Monday
const nextMonday = new Date(thisMonday);
nextMonday.setDate(thisMonday.getDate() + 7);

// Get week after next
const weekAfterNext = new Date(thisMonday);
weekAfterNext.setDate(thisMonday.getDate() + 14);

// Create 4 weeks with different statuses
const weekData = [
  createWeekPlan("wp-completed", lastMonday.toISOString().split("T")[0], "completed", "Last Week"),
  createWeekPlan("wp-in-progress", thisMonday.toISOString().split("T")[0], "in-progress", "This Week"),
  createWeekPlan("wp-approved", nextMonday.toISOString().split("T")[0], "approved", "Next Week"),
  createWeekPlan("wp-draft", weekAfterNext.toISOString().split("T")[0], "draft", "Week After Next"),
];

const availableWeeks = weekData.map((w) => w.summary);

export default function TestPlanStatusPage() {
  const [selectedWeekId, setSelectedWeekId] = useState("wp-in-progress");

  const selectedWeekData = weekData.find((w) => w.plan.id === selectedWeekId);
  const selectedWeekPlan = selectedWeekData?.plan || weekData[1].plan;

  const handleSelectWeek = (weekId: string) => {
    setSelectedWeekId(weekId);
  };

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
      <div className="p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <h1 className="font-heading font-bold text-lg" style={{ color: "var(--color-text)" }}>
          Test: Plan Status Display (Feature #136)
        </h1>
        <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>
          Verify status badge shows correctly for each plan state
        </p>

        {/* Status Legend */}
        <div
          className="p-4 rounded-lg space-y-2"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2 className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
            Status States:
          </h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: "var(--color-border)",
                  color: "var(--color-muted)",
                }}
              >
                Draft
              </span>
              <span style={{ color: "var(--color-muted)" }}>- Not yet finalized</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: "rgba(79, 110, 68, 0.2)",
                  color: "var(--color-secondary)",
                }}
              >
                Approved
              </span>
              <span style={{ color: "var(--color-muted)" }}>- Plan confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: "rgba(79, 110, 68, 0.2)",
                  color: "var(--color-secondary)",
                }}
              >
                In Progress
              </span>
              <span style={{ color: "var(--color-muted)" }}>- Current week</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: "rgba(79, 110, 68, 0.2)",
                  color: "var(--color-secondary)",
                }}
              >
                Completed
              </span>
              <span style={{ color: "var(--color-muted)" }}>- Past week done</span>
            </div>
          </div>

          <div className="pt-2 mt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
            <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--color-text)" }}>
              Test Instructions:
            </h3>
            <ol className="text-sm space-y-1" style={{ color: "var(--color-muted)" }}>
              <li>1. Select each week to view its status badge</li>
              <li>2. Last Week = Completed, This Week = In Progress</li>
              <li>3. Next Week = Approved, Week After = Draft</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Current selection info */}
      <div className="px-4 py-2 text-sm" style={{ color: "var(--color-text)" }}>
        <strong>Selected:</strong> {selectedWeekData?.summary.label} ({selectedWeekPlan.status})
      </div>

      <WeekPlanView
        currentUser={currentUser}
        availableWeeks={availableWeeks}
        selectedWeekPlan={selectedWeekPlan}
        householdMembers={householdMembers}
        onSelectWeek={handleSelectWeek}
        onSelectMeal={(id) => console.log("Selected meal:", id)}
        onApprovePlan={() => console.log("Approve plan clicked")}
        onAddWeek={() => console.log("Add week clicked")}
        onTapMeal={(id) => console.log("Tapped meal:", id)}
        onPantryAudit={() => console.log("Pantry audit clicked")}
      />
    </div>
  );
}
