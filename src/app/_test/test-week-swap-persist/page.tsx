"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { WeekSwapList } from "@/components/meal-helper";
import type { PlannedMealSummary } from "@/types/meal-helper";
import type { Id } from "../../../convex/_generated/dataModel";

// Test page for Feature #79: Swap updates database
// This tests the week swap flow where you swap tonight's meal with another day's meal
// and verifies the swap persists in Convex database

// Map database effortTier to UI effortTier
function mapEffortTier(
  dbTier: "easy" | "medium" | "involved"
): "super-easy" | "middle" | "more-prep" {
  switch (dbTier) {
    case "easy":
      return "super-easy";
    case "medium":
      return "middle";
    case "involved":
      return "more-prep";
  }
}

// Map cleanupRating from number to string
function mapCleanupRating(rating: 1 | 2 | 3): "low" | "medium" | "high" {
  switch (rating) {
    case 1:
      return "low";
    case 2:
      return "medium";
    case 3:
      return "high";
  }
}

export default function TestWeekSwapPersistPage() {
  const [showSwapList, setShowSwapList] = useState(false);
  const [swapResult, setSwapResult] = useState<{
    meal1OriginalName: string;
    meal2OriginalName: string;
    meal1NewName: string;
    meal2NewName: string;
  } | null>(null);
  const [testStatus, setTestStatus] = useState<
    "idle" | "swapping" | "passed" | "failed"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Query for week plans and meals from Convex
  const weekPlans = useQuery(api.weekPlans.list);
  const seedWeekPlan = useMutation(api.weekPlans.seedSampleWeekPlan);
  const swapMeals = useMutation(api.weekPlans.swapMeals);

  // Get the first week plan
  const weekPlan = weekPlans?.[0];

  // Query meals for the first week plan
  const mealsData = useQuery(
    api.weekPlans.getMeals,
    weekPlan ? { weekPlanId: weekPlan._id } : "skip"
  );

  // Get tonight's meal (first meal in the list for testing)
  const tonightsMeal = mealsData?.[0];

  // Convert database meals to UI format for WeekSwapList
  const weekMeals: Array<PlannedMealSummary & { dayLabel: string }> =
    mealsData?.map((meal, index) => ({
      id: meal._id,
      dayLabel:
        index === 0 ? `${meal.dayOfWeek} (Tonight)` : meal.dayOfWeek,
      mealName: meal.name,
      effortTier: mapEffortTier(meal.effortTier),
      prepTime: meal.prepTime,
      cookTime: meal.cookTime,
      cleanupRating: mapCleanupRating(meal.cleanupRating),
      ingredients: meal.ingredients.map((i) => i.name),
      isFlexMeal: meal.isFlexMeal ?? false,
      assignedCookId: meal.cookId,
    })) ?? [];

  // Handle selecting a meal to swap with
  const handleSelectMealToSwap = async (selectedMealId: string) => {
    if (!tonightsMeal) return;

    // Don't swap with self
    if (selectedMealId === tonightsMeal._id) {
      setShowSwapList(false);
      return;
    }

    setTestStatus("swapping");

    try {
      const selectedMeal = mealsData?.find((m) => m._id === selectedMealId);
      if (!selectedMeal) throw new Error("Selected meal not found");

      // Swap the meals in the database
      await swapMeals({
        mealId1: tonightsMeal._id as Id<"plannedMeals">,
        mealId2: selectedMealId as Id<"plannedMeals">,
      });

      setSwapResult({
        meal1OriginalName: tonightsMeal.name,
        meal2OriginalName: selectedMeal.name,
        meal1NewName: selectedMeal.name,
        meal2NewName: tonightsMeal.name,
      });

      setShowSwapList(false);
      setTestStatus("passed");
    } catch (error) {
      console.error("Error swapping meals:", error);
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
      setTestStatus("failed");
    }
  };

  // Seed test data if needed
  const handleSeedData = async () => {
    try {
      const result = await seedWeekPlan({});
      console.log("Seed result:", result);
    } catch (error) {
      console.error("Error seeding data:", error);
    }
  };

  // Reset test state
  const handleReset = () => {
    setSwapResult(null);
    setTestStatus("idle");
    setErrorMessage(null);
  };

  // Show the week swap list
  if (showSwapList && tonightsMeal && weekMeals.length > 0) {
    return (
      <WeekSwapList
        meals={weekMeals}
        currentMealId={tonightsMeal._id}
        onSelect={handleSelectMealToSwap}
        onBack={() => setShowSwapList(false)}
      />
    );
  }

  return (
    <div
      className="min-h-screen p-4"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="max-w-2xl mx-auto">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--color-text)" }}
        >
          Test: Week Swap Persistence (Feature #79)
        </h1>
        <p className="mb-4" style={{ color: "var(--color-muted)" }}>
          Verify that swapping tonight&apos;s meal with another day&apos;s meal persists
          to Convex database.
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
            Feature #79 Verification Steps:
          </h2>
          <ul
            className="space-y-2 text-sm"
            style={{ color: "var(--color-muted)" }}
          >
            <li className="flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                style={{
                  backgroundColor: swapResult
                    ? "var(--color-secondary)"
                    : "var(--color-border)",
                  color: swapResult ? "white" : "var(--color-muted)",
                }}
              >
                {swapResult ? "✓" : "1"}
              </span>
              <span
                style={{ color: swapResult ? "var(--color-secondary)" : "inherit" }}
              >
                Step 1: Complete a swap
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                style={{
                  backgroundColor: "var(--color-border)",
                  color: "var(--color-muted)",
                }}
              >
                2
              </span>
              <span>Step 2: Refresh the page (verify step 1 first)</span>
            </li>
            <li className="flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                style={{
                  backgroundColor: "var(--color-border)",
                  color: "var(--color-muted)",
                }}
              >
                3
              </span>
              <span>
                Step 3: Verify swap persisted (meal names should remain swapped)
              </span>
            </li>
          </ul>
        </div>

        {/* Test Status */}
        {testStatus !== "idle" && (
          <div
            className="p-4 rounded-lg mb-6"
            style={{
              backgroundColor:
                testStatus === "passed"
                  ? "rgba(76, 175, 80, 0.1)"
                  : testStatus === "failed"
                  ? "rgba(244, 67, 54, 0.1)"
                  : "rgba(255, 193, 7, 0.1)",
              border: `1px solid ${
                testStatus === "passed"
                  ? "#4caf50"
                  : testStatus === "failed"
                  ? "#f44336"
                  : "#ffc107"
              }`,
            }}
          >
            <p
              className="font-semibold"
              style={{
                color:
                  testStatus === "passed"
                    ? "#4caf50"
                    : testStatus === "failed"
                    ? "#f44336"
                    : "#ffc107",
              }}
            >
              {testStatus === "swapping" && "Swapping meals..."}
              {testStatus === "passed" && "SUCCESS! Meals swapped in database."}
              {testStatus === "failed" && `FAILED: ${errorMessage}`}
            </p>
            {testStatus === "passed" && swapResult && (
              <div className="text-sm mt-2" style={{ color: "var(--color-muted)" }}>
                <p>
                  Tonight&apos;s meal changed: {swapResult.meal1OriginalName} →{" "}
                  {swapResult.meal1NewName}
                </p>
                <p>
                  Other meal changed: {swapResult.meal2OriginalName} →{" "}
                  {swapResult.meal2NewName}
                </p>
                <p className="mt-2 font-medium" style={{ color: "var(--color-text)" }}>
                  Refresh the page to verify the swap persists!
                </p>
              </div>
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

        {/* Current Meals Display */}
        {mealsData && mealsData.length > 0 && (
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
              Current Week Meals (from Convex Database):
            </h2>
            <div className="space-y-2">
              {mealsData.map((meal, index) => (
                <div
                  key={meal._id}
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor:
                      index === 0
                        ? "rgba(226, 169, 59, 0.15)"
                        : "rgba(79, 110, 68, 0.1)",
                    border: `1px solid ${
                      index === 0
                        ? "var(--color-primary)"
                        : "var(--color-secondary)"
                    }`,
                  }}
                >
                  <p
                    className="font-bold"
                    style={{ color: "var(--color-text)" }}
                  >
                    {index === 0 ? `${meal.dayOfWeek} (Tonight)` : meal.dayOfWeek}:{" "}
                    {meal.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                    ID: {meal._id}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowSwapList(true)}
              className="mt-4 px-4 py-2 rounded-lg font-semibold text-white w-full"
              style={{ backgroundColor: "var(--color-primary)" }}
              disabled={!tonightsMeal || mealsData.length < 2}
            >
              Swap Tonight&apos;s Meal with Another Day
            </button>

            {swapResult && (
              <button
                onClick={handleReset}
                className="mt-2 px-4 py-2 rounded-lg font-medium w-full"
                style={{
                  backgroundColor: "transparent",
                  color: "var(--color-secondary)",
                  border: "1px solid var(--color-secondary)",
                }}
              >
                Reset Test
              </button>
            )}
          </div>
        )}

        {/* Loading state */}
        {!weekPlans && (
          <div className="text-center p-8" style={{ color: "var(--color-muted)" }}>
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
