"use client";

import { useState } from "react";
import { EditDayModal } from "@/components/weekly-planning/EditDayModal";
import type {
  PlannedMeal,
  HouseholdMember,
} from "@/types/weekly-planning";

// Test page for Feature #140: Empty state for no alternatives
// Message when no swap options available

const mockHouseholdMembers: HouseholdMember[] = [
  { id: "member-1", name: "Aaron", isAdmin: true },
  { id: "member-2", name: "Katie", isAdmin: true },
];

const mockCurrentMeal: PlannedMeal = {
  id: "meal-1",
  dayOfWeek: "Monday",
  date: "2026-01-19",
  mealName: "Chicken Stir Fry",
  effortTier: "middle",
  prepTime: 15,
  cookTime: 20,
  cleanupRating: "medium",
  servings: 4,
  ingredients: ["Chicken", "Broccoli", "Soy sauce", "Garlic"],
  isFlexMeal: false,
  isUnplanned: false,
  assignedCookId: "member-2",
  eaterIds: ["member-1", "member-2"],
};

export default function TestEmptyAlternativesPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: "var(--color-bg)" }}>
      <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--color-text)" }}>
        Test: Empty State for No Alternatives (Feature #140)
      </h1>
      <p className="mb-4" style={{ color: "var(--color-muted)" }}>
        Verify helpful message displays when no swap options are available.
      </p>

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 text-white rounded-lg"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          Open Edit Modal
        </button>
      )}

      {/* Test Steps */}
      <div
        className="mt-4 p-4 rounded-lg"
        style={{
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h2 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
          Test Steps:
        </h2>
        <ul className="space-y-1 text-sm" style={{ color: "var(--color-muted)" }}>
          <li>Step 1: Open edit modal with no alternatives - Modal is open with empty alternatives array</li>
          <li>Step 2: Verify helpful message displays - Look for &quot;No quick swap options available&quot;</li>
          <li>Step 3: Verify manual entry option exists - Look for &quot;More options&quot; button</li>
        </ul>
      </div>

      {isOpen && (
        <EditDayModal
          currentMeal={mockCurrentMeal}
          alternatives={[]}
          householdMembers={mockHouseholdMembers}
          onChangeCook={() => {}}
          onToggleEater={() => {}}
          onSelectAlternative={() => {}}
          onMoreOptions={() => alert("More options - browse all meals or add your own")}
          onUnplan={() => alert("Unplan")}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
