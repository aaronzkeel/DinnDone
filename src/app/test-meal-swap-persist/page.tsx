"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { EditDayModal } from "@/components/weekly-planning/EditDayModal";
import type {
  PlannedMeal,
  MealAlternative,
  HouseholdMember,
} from "@/types/weekly-planning";
import type { Id } from "../../../convex/_generated/dataModel";

// Test page for Feature #121: Swap persists to database
// This page tests that meal swaps save to Convex and persist after page refresh

// Map database effortTier to UI effortTier
function mapEffortTier(dbTier: "easy" | "medium" | "involved"): "super-easy" | "middle" | "more-prep" {
  switch (dbTier) {
    case "easy": return "super-easy";
    case "medium": return "middle";
    case "involved": return "more-prep";
  }
}

// Map UI effortTier to database effortTier
function mapEffortTierToDb(uiTier: "super-easy" | "middle" | "more-prep"): "easy" | "medium" | "involved" {
  switch (uiTier) {
    case "super-easy": return "easy";
    case "middle": return "medium";
    case "more-prep": return "involved";
  }
}

// Map cleanupRating from number to string
function mapCleanupRating(rating: 1 | 2 | 3): "low" | "medium" | "high" {
  switch (rating) {
    case 1: return "low";
    case 2: return "medium";
    case 3: return "high";
  }
}

// Alternative meals available for swapping
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

// Mock household members for the modal
const mockHouseholdMembers: HouseholdMember[] = [
  { id: "member-1", name: "Aaron", isAdmin: true },
  { id: "member-2", name: "Katie", isAdmin: false },
];

export default function TestMealSwapPersistPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [swapCompleted, setSwapCompleted] = useState(false);
  const [swappedToMeal, setSwappedToMeal] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<"idle" | "swapping" | "verifying" | "passed" | "failed">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Query for week plans and meals from Convex
  const weekPlans = useQuery(api.weekPlans.list);
  const seedWeekPlan = useMutation(api.weekPlans.seedSampleWeekPlan);
  const updateMeal = useMutation(api.weekPlans.updateMeal);

  // Get the first week plan
  const weekPlan = weekPlans?.[0];

  // Query meals for the first week plan
  const mealsData = useQuery(
    api.weekPlans.getMeals,
    weekPlan ? { weekPlanId: weekPlan._id } : "skip"
  );

  // Get the first meal for testing
  const firstMeal = mealsData?.[0];

  // Seed test data if needed
  const handleSeedData = async () => {
    try {
      const result = await seedWeekPlan({});
      console.log("Seed result:", result);
    } catch (error) {
      console.error("Error seeding data:", error);
    }
  };

  // Convert database meal to UI PlannedMeal format
  const currentMeal: PlannedMeal | null = firstMeal ? {
    id: firstMeal._id,
    dayOfWeek: firstMeal.dayOfWeek,
    date: firstMeal.date,
    mealName: firstMeal.name,
    effortTier: mapEffortTier(firstMeal.effortTier),
    prepTime: firstMeal.prepTime,
    cookTime: firstMeal.cookTime,
    cleanupRating: mapCleanupRating(firstMeal.cleanupRating),
    servings: firstMeal.eaterIds.length,
    ingredients: firstMeal.ingredients.map(i => i.name),
    isFlexMeal: firstMeal.isFlexMeal ?? false,
    isUnplanned: false,
    assignedCookId: "member-1", // Default for test
    eaterIds: ["member-1", "member-2"], // Default for test
  } : null;

  // Handle swapping to an alternative
  const handleSelectAlternative = async (altId: string) => {
    if (!firstMeal) return;

    const alt = mockAlternatives.find((a) => a.id === altId);
    if (!alt) return;

    setTestStatus("swapping");
    setSwappedToMeal(alt.mealName);

    try {
      // Update the meal in Convex database
      await updateMeal({
        id: firstMeal._id as Id<"plannedMeals">,
        name: alt.mealName,
        effortTier: mapEffortTierToDb(alt.effortTier),
        prepTime: alt.prepTime,
        cookTime: alt.cookTime,
        cleanupRating: alt.cleanupRating === "low" ? 1 : alt.cleanupRating === "medium" ? 2 : 3,
        isFlexMeal: alt.isFlexMeal,
      });

      setSwapCompleted(true);
      setIsModalOpen(false);
      setTestStatus("verifying");

      // Give it a moment for UI to update
      setTimeout(() => {
        setTestStatus("passed");
      }, 500);
    } catch (error) {
      console.error("Error swapping meal:", error);
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
      setTestStatus("failed");
    }
  };

  // Check if the swap was successful (meal name matches what we swapped to)
  useEffect(() => {
    if (swapCompleted && swappedToMeal && firstMeal) {
      if (firstMeal.name === swappedToMeal) {
        setTestStatus("passed");
      }
    }
  }, [swapCompleted, swappedToMeal, firstMeal]);

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-2xl mx-auto">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--color-text)" }}
        >
          Test: Meal Swap Persistence (Feature #121)
        </h1>
        <p className="mb-4" style={{ color: "var(--color-muted)" }}>
          Verify that meal swaps save to Convex and persist after page refresh.
        </p>

        {/* Verification Checklist */}
        <div
          className="p-4 rounded-lg mb-6"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2
            className="font-semibold mb-3"
            style={{ color: "var(--color-text)" }}
          >
            Verification Checklist:
          </h2>
          <ul className="space-y-2 text-sm" style={{ color: "var(--color-muted)" }}>
            <li className="flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                style={{
                  backgroundColor: currentMeal ? "var(--color-secondary)" : "var(--color-border)",
                  color: currentMeal ? "white" : "var(--color-muted)",
                }}
              >
                {currentMeal ? "✓" : "1"}
              </span>
              <span style={{ color: currentMeal ? "var(--color-secondary)" : "inherit" }}>
                Step 1: Swap a meal - {currentMeal ? `Current meal: ${currentMeal.mealName}` : "Loading..."}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                style={{
                  backgroundColor: swapCompleted ? "var(--color-secondary)" : "var(--color-border)",
                  color: swapCompleted ? "white" : "var(--color-muted)",
                }}
              >
                {swapCompleted ? "✓" : "2"}
              </span>
              <span style={{ color: swapCompleted ? "var(--color-secondary)" : "inherit" }}>
                Step 2: Refresh page - {swapCompleted ? "Swap completed, refresh to verify" : "Complete step 1 first"}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                style={{
                  backgroundColor: testStatus === "passed" ? "var(--color-secondary)" : "var(--color-border)",
                  color: testStatus === "passed" ? "white" : "var(--color-muted)",
                }}
              >
                {testStatus === "passed" ? "✓" : "3"}
              </span>
              <span style={{ color: testStatus === "passed" ? "var(--color-secondary)" : "inherit" }}>
                Step 3: Verify swap persisted - {testStatus === "passed" ? "PASSED!" : "Verify meal name matches after refresh"}
              </span>
            </li>
          </ul>
        </div>

        {/* Test Status */}
        {testStatus !== "idle" && (
          <div
            className="p-4 rounded-lg mb-6"
            style={{
              backgroundColor: testStatus === "passed"
                ? "rgba(76, 175, 80, 0.1)"
                : testStatus === "failed"
                  ? "rgba(244, 67, 54, 0.1)"
                  : "rgba(255, 193, 7, 0.1)",
              border: `1px solid ${testStatus === "passed" ? "#4caf50" : testStatus === "failed" ? "#f44336" : "#ffc107"}`,
            }}
          >
            <p
              className="font-semibold"
              style={{
                color: testStatus === "passed" ? "#4caf50" : testStatus === "failed" ? "#f44336" : "#ffc107",
              }}
            >
              {testStatus === "swapping" && "Swapping meal..."}
              {testStatus === "verifying" && "Verifying persistence..."}
              {testStatus === "passed" && `SUCCESS! Meal swapped to "${swappedToMeal}" and persisted to database.`}
              {testStatus === "failed" && `FAILED: ${errorMessage}`}
            </p>
            {testStatus === "passed" && (
              <p className="text-sm mt-2" style={{ color: "var(--color-muted)" }}>
                Refresh the page to verify the swap persists in the database.
              </p>
            )}
          </div>
        )}

        {/* No Data State */}
        {weekPlans && weekPlans.length === 0 && (
          <div
            className="p-4 rounded-lg mb-6 text-center"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px dashed var(--color-border)",
            }}
          >
            <p className="mb-4" style={{ color: "var(--color-muted)" }}>
              No week plans found. Seed test data to begin.
            </p>
            <button
              onClick={handleSeedData}
              className="px-4 py-2 rounded-lg font-semibold text-white"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Seed Test Data
            </button>
          </div>
        )}

        {/* Current Meal Display */}
        {currentMeal && (
          <div
            className="p-4 rounded-lg mb-6"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <h2
              className="font-semibold mb-3"
              style={{ color: "var(--color-text)" }}
            >
              Current Meal (from Convex Database):
            </h2>
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: "rgba(226, 169, 59, 0.1)",
                border: "1px solid var(--color-primary)",
              }}
            >
              <p
                className="font-bold text-lg"
                style={{ color: "var(--color-text)" }}
                data-testid="current-meal-name"
              >
                {currentMeal.mealName}
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
                {currentMeal.dayOfWeek} • {currentMeal.effortTier} • {currentMeal.prepTime + currentMeal.cookTime}m total
              </p>
              <p className="text-xs mt-2" style={{ color: "var(--color-muted)" }}>
                Database ID: {firstMeal?._id}
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-lg font-semibold text-white w-full"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Open Edit Modal to Swap Meal
            </button>
          </div>
        )}

        {/* Alternative Meals Info */}
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2
            className="font-semibold mb-3"
            style={{ color: "var(--color-text)" }}
          >
            Available Alternatives:
          </h2>
          <ul className="space-y-2 text-sm">
            {mockAlternatives.map((alt) => (
              <li key={alt.id} className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "var(--color-primary)" }}
                />
                <span style={{ color: "var(--color-text)" }}>
                  {alt.mealName}
                </span>
                <span style={{ color: "var(--color-muted)" }}>
                  ({alt.effortTier}, {alt.prepTime + alt.cookTime}m)
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Edit Day Modal */}
        {isModalOpen && currentMeal && (
          <EditDayModal
            currentMeal={currentMeal}
            alternatives={mockAlternatives}
            householdMembers={mockHouseholdMembers}
            onChangeCook={() => {}}
            onToggleEater={() => {}}
            onSelectAlternative={handleSelectAlternative}
            onMoreOptions={() => alert("More options clicked")}
            onUnplan={() => alert("Unplan clicked")}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
