"use client";

import { useState } from "react";
import { EditDayModal } from "@/components/weekly-planning/EditDayModal";
import type {
  PlannedMeal,
  MealAlternative,
  HouseholdMember,
} from "@/types/weekly-planning";

// Test page for verifying Feature #119: Edit modal shows alternative meals

const mockHouseholdMembers: HouseholdMember[] = [
  { id: "member-1", name: "Aaron", isAdmin: true },
  { id: "member-2", name: "Katie", isAdmin: false },
  { id: "member-3", name: "Sam", isAdmin: false },
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
    briefDescription: "Simple pasta with tomato sauce and fresh basil",
    effortTier: "super-easy",
    prepTime: 5,
    cookTime: 15,
    cleanupRating: "low",
    isFlexMeal: true,
  },
  {
    id: "alt-2",
    mealName: "Grilled Cheese & Tomato Soup",
    briefDescription: "Classic comfort food combo, ready in minutes",
    effortTier: "super-easy",
    prepTime: 5,
    cookTime: 10,
    cleanupRating: "low",
    isFlexMeal: true,
  },
  {
    id: "alt-3",
    mealName: "Sheet Pan Fajitas",
    briefDescription: "Colorful peppers and chicken with all the fixings",
    effortTier: "middle",
    prepTime: 15,
    cookTime: 25,
    cleanupRating: "medium",
    isFlexMeal: false,
  },
];

export default function TestEditDayModalPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [currentMeal, setCurrentMeal] = useState(mockCurrentMeal);

  const handleChangeCook = (cookId: string) => {
    setCurrentMeal((prev) => ({ ...prev, assignedCookId: cookId }));
  };

  const handleToggleEater = (memberId: string) => {
    setCurrentMeal((prev) => ({
      ...prev,
      eaterIds: prev.eaterIds.includes(memberId)
        ? prev.eaterIds.filter((id) => id !== memberId)
        : [...prev.eaterIds, memberId],
    }));
  };

  const handleSelectAlternative = (altId: string) => {
    const alt = mockAlternatives.find((a) => a.id === altId);
    if (alt) {
      // Feature #120: Actually swap the meal
      setCurrentMeal((prev) => ({
        ...prev,
        id: alt.id,
        mealName: alt.mealName,
        effortTier: alt.effortTier,
        prepTime: alt.prepTime,
        cookTime: alt.cookTime,
        cleanupRating: alt.cleanupRating,
        isFlexMeal: alt.isFlexMeal,
      }));
    }
  };

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">
        Test: Edit Day Modal (Feature #119)
      </h1>
      <p className="mb-4 text-stone-600 dark:text-stone-400">
        Verify that the edit modal shows alternative meal suggestions.
      </p>

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg"
        >
          Open Edit Modal
        </button>
      )}

      <div className="mt-6 p-4 rounded-lg bg-stone-100 dark:bg-stone-800">
        <h2 className="font-semibold mb-2">Verification Checklist:</h2>
        <ul className="space-y-1 text-sm">
          <li>✓ Step 1: Open edit modal - Modal displays when page loads</li>
          <li>
            ✓ Step 2: Verify alternative meal suggestions show - Look for
            &quot;Swap with Alternative&quot; section
          </li>
          <li>
            ✓ Step 3: Verify at least 2-3 alternatives - {mockAlternatives.length}{" "}
            alternatives provided
          </li>
        </ul>
      </div>

      {isOpen && (
        <EditDayModal
          currentMeal={currentMeal}
          alternatives={mockAlternatives}
          householdMembers={mockHouseholdMembers}
          onChangeCook={handleChangeCook}
          onToggleEater={handleToggleEater}
          onSelectAlternative={handleSelectAlternative}
          onMoreOptions={() => alert("More options clicked")}
          onUnplan={() => alert("Unplan clicked")}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
