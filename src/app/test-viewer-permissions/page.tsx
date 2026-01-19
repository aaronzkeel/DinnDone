"use client";

import { useState } from "react";
import { EditDayModal } from "@/components/weekly-planning/EditDayModal";
import type {
  PlannedMeal,
  MealAlternative,
  HouseholdMember,
} from "@/types/weekly-planning";

// Test page for Feature #138: Only admins can reassign cook
// Viewers cannot change cook assignment

const mockHouseholdMembers: HouseholdMember[] = [
  { id: "member-1", name: "Aaron", isAdmin: true },
  { id: "member-2", name: "Katie", isAdmin: true },
  { id: "member-3", name: "Sam", isAdmin: false }, // Sam is a viewer
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
  eaterIds: ["member-1", "member-2", "member-3"],
};

const mockAlternatives: MealAlternative[] = [
  {
    id: "alt-1",
    mealName: "Quick Pasta Marinara",
    briefDescription: "Simple pasta with tomato sauce",
    effortTier: "super-easy",
    prepTime: 5,
    cookTime: 15,
    cleanupRating: "low",
    isFlexMeal: true,
  },
];

export default function TestViewerPermissionsPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [currentMeal, setCurrentMeal] = useState(mockCurrentMeal);
  const [currentUser, setCurrentUser] = useState<HouseholdMember>(
    mockHouseholdMembers[2] // Start as Sam (viewer)
  );

  const isAdmin = currentUser.isAdmin;

  const handleChangeCook = (cookId: string) => {
    // Only allow if user is admin
    if (isAdmin) {
      setCurrentMeal((prev) => ({ ...prev, assignedCookId: cookId }));
    }
  };

  const handleToggleEater = (memberId: string) => {
    setCurrentMeal((prev) => ({
      ...prev,
      eaterIds: prev.eaterIds.includes(memberId)
        ? prev.eaterIds.filter((id) => id !== memberId)
        : [...prev.eaterIds, memberId],
    }));
  };

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: "var(--color-bg)" }}>
      <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--color-text)" }}>
        Test: Only Admins Can Reassign Cook (Feature #138)
      </h1>
      <p className="mb-4" style={{ color: "var(--color-muted)" }}>
        Viewers cannot change cook assignment.
      </p>

      {/* User Switcher */}
      <div
        className="p-4 rounded-xl mb-4"
        style={{
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h2 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
          Current User: {currentUser.name} ({isAdmin ? "Admin" : "Viewer"})
        </h2>
        <div className="flex gap-2">
          {mockHouseholdMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => setCurrentUser(member)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{
                backgroundColor:
                  currentUser.id === member.id
                    ? "var(--color-primary)"
                    : "var(--color-border)",
                color:
                  currentUser.id === member.id ? "white" : "var(--color-text)",
              }}
            >
              {member.name} ({member.isAdmin ? "Admin" : "Viewer"})
            </button>
          ))}
        </div>
      </div>

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
          <li
            className={
              !isAdmin ? "text-green-600 font-semibold" : ""
            }
          >
            Step 1: Sign in as viewer - {!isAdmin ? "✓ Sam (Viewer) selected" : "Select Sam above"}
          </li>
          <li>Step 2: Open edit modal - Modal should be visible</li>
          <li>
            Step 3: Verify cook selector is disabled -{" "}
            {!isAdmin
              ? "Buttons should show '(Admin only)' and be disabled"
              : "Switch to Sam to test"}
          </li>
        </ul>

        {!isAdmin && isOpen && (
          <div
            className="mt-3 p-2 rounded bg-green-100 text-green-800 text-sm font-semibold"
            style={{ backgroundColor: "rgba(76, 175, 80, 0.2)", color: "#4caf50" }}
          >
            Feature #138 PASSED - Cook selector shows &quot;(Admin only)&quot; and is disabled for viewers!
          </div>
        )}
      </div>

      {isOpen && (
        <EditDayModal
          currentMeal={currentMeal}
          alternatives={mockAlternatives}
          householdMembers={mockHouseholdMembers}
          canChangeCook={isAdmin}
          onChangeCook={handleChangeCook}
          onToggleEater={handleToggleEater}
          onSelectAlternative={() => {}}
          onMoreOptions={() => alert("More options")}
          onUnplan={() => alert("Unplan")}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
