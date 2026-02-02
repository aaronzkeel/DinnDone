"use client";

import { useState } from "react";
import { WeekPlanView } from "@/components/weekly-planning";
import type {
  HouseholdMember,
  WeekSummary,
  WeekPlan,
} from "@/types/weekly-planning";

/**
 * Test page for Feature #139: Empty state when no plan exists
 * This page displays the WeekPlanView with an empty week (no meals)
 * to verify the empty state UI and Generate plan button.
 */

// Sample household members
const householdMembers: HouseholdMember[] = [
  { id: "hm-001", name: "Aaron", isAdmin: true },
  { id: "hm-002", name: "Katie", isAdmin: true },
  { id: "hm-003", name: "Lizzie", isAdmin: false },
  { id: "hm-004", name: "Ethan", isAdmin: false },
  { id: "hm-005", name: "Elijah", isAdmin: false },
];

// Sample weeks - include one with no meals
const availableWeeks: WeekSummary[] = [
  {
    id: "wp-empty",
    weekStartDate: "2024-02-05",
    label: "Feb 5 - Feb 11",
    status: "draft",
  },
];

// Empty week plan - no meals
const emptyWeekPlan: WeekPlan = {
  id: "wp-empty",
  weekStartDate: "2024-02-05",
  status: "draft",
  meals: [], // No meals - should trigger empty state
};

// Current user (admin)
const currentUser: HouseholdMember = {
  id: "hm-001",
  name: "Aaron",
  isAdmin: true,
};

export default function TestEmptyWeekPlanPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(false);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    // Simulate plan generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(false);
    setGeneratedPlan(true);
    console.log("Generate plan clicked - plan would be generated here");
  };

  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Test header */}
      <div
        className="p-4 border-b"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-card)",
        }}
      >
        <h1
          className="text-lg font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          Test: Empty Week Plan State
        </h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Feature #139: Empty state when no plan exists
        </p>
      </div>

      {/* Verification checklist */}
      <div
        className="p-4 border-b"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-card)",
        }}
      >
        <h2
          className="text-sm font-semibold mb-2"
          style={{ color: "var(--color-text)" }}
        >
          Verification Steps:
        </h2>
        <ul className="text-sm space-y-1" style={{ color: "var(--color-muted)" }}>
          <li>✓ Step 1: View week with no plan (see below)</li>
          <li>✓ Step 2: Verify empty state message displays</li>
          <li>✓ Step 3: Verify Generate plan button is prominent</li>
        </ul>
        {generatedPlan && (
          <p
            className="mt-2 text-sm font-medium"
            style={{ color: "var(--color-secondary)" }}
          >
            Generate plan button was clicked successfully!
          </p>
        )}
      </div>

      {/* Week Plan View with empty week */}
      <WeekPlanView
        currentUser={currentUser}
        availableWeeks={availableWeeks}
        selectedWeekPlan={emptyWeekPlan}
        householdMembers={householdMembers}
        onSelectWeek={(weekId) => console.log("Select week:", weekId)}
        onSelectMeal={(mealId) => console.log("Select meal:", mealId)}
        onApprovePlan={() => console.log("Approve plan")}
        onAddWeek={() => console.log("Add week")}
        onTapMeal={(mealId) => console.log("Tap meal:", mealId)}
        onPantryAudit={() => console.log("Pantry audit")}
        onGeneratePlan={handleGeneratePlan}
        isGenerating={isGenerating}
      />
    </div>
  );
}
