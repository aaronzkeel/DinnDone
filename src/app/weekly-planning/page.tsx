"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { WeekPlanView, EditDayModal, PantryAudit } from "@/components/weekly-planning";
import { RequireAuth } from "@/components/RequireAuth";
import {
  toHouseholdMember,
  toWeekSummary,
  toWeekPlan,
  effortTierReverseMap,
  cleanupRatingReverseMap,
} from "@/lib/meal-adapters";
import type {
  PlannedMeal,
  MealAlternative,
  PantryCheckItem,
  EffortTier,
  CleanupRating,
} from "@/types/weekly-planning";

// Sample alternatives for swapping meals (will be replaced with AI suggestions)
const sampleAlternatives: MealAlternative[] = [
  {
    id: "alt-001",
    mealName: "Pasta Primavera",
    effortTier: "middle",
    prepTime: 15,
    cookTime: 20,
    cleanupRating: "medium",
    briefDescription: "Fresh seasonal vegetables with pasta and olive oil",
    isFlexMeal: true,
  },
  {
    id: "alt-002",
    mealName: "Grilled Chicken Salad",
    effortTier: "super-easy",
    prepTime: 10,
    cookTime: 15,
    cleanupRating: "low",
    briefDescription: "Light and healthy with mixed greens",
    isFlexMeal: false,
  },
];

export default function WeeklyPlanningPage() {
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<PlannedMeal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPantryAudit, setShowPantryAudit] = useState(false);
  const [pantryItems, setPantryItems] = useState<PantryCheckItem[]>([]);

  // Convex queries
  const householdMembersData = useQuery(api.householdMembers.list);
  const weekPlansData = useQuery(api.weekPlans.list);
  const selectedWeekData = useQuery(
    api.weekPlans.getWithMeals,
    selectedWeekId ? { id: selectedWeekId as Id<"weekPlans"> } : "skip"
  );

  // Convex mutations
  const updateMeal = useMutation(api.weekPlans.updateMeal);
  const updateStatus = useMutation(api.weekPlans.updateStatus);

  // AI action
  const generateWeekPlan = useAction(api.ai.generateWeekPlan);

  // Convert Convex data to UI types
  const householdMembers = useMemo(() => {
    if (!householdMembersData) return [];
    return householdMembersData.map(toHouseholdMember);
  }, [householdMembersData]);

  const availableWeeks = useMemo(() => {
    if (!weekPlansData) return [];
    return weekPlansData.map(toWeekSummary);
  }, [weekPlansData]);

  const selectedWeekPlan = useMemo(() => {
    if (!selectedWeekData) return null;
    return toWeekPlan(selectedWeekData, selectedWeekData.meals);
  }, [selectedWeekData]);

  // Current user is first admin member (for now)
  const currentUser = useMemo(() => {
    const admin = householdMembers.find((m) => m.isAdmin);
    return admin || householdMembers[0] || { id: "", name: "Guest", isAdmin: false };
  }, [householdMembers]);

  // Auto-select first week when data loads
  useEffect(() => {
    if (availableWeeks.length > 0 && !selectedWeekId) {
      setSelectedWeekId(availableWeeks[0].id);
    }
  }, [availableWeeks, selectedWeekId]);

  // Loading state
  const isLoading =
    householdMembersData === undefined ||
    weekPlansData === undefined ||
    (selectedWeekId && selectedWeekData === undefined);

  const handleSelectWeek = (weekId: string) => {
    setSelectedWeekId(weekId);
  };

  const handleSelectMeal = (mealId: string) => {
    const meal = selectedWeekPlan?.meals.find((m) => m.id === mealId);
    if (meal) {
      setSelectedMeal(meal);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMeal(null);
  };

  const handleChangeCook = async (newCookId: string) => {
    if (!selectedMeal) return;
    try {
      await updateMeal({
        id: selectedMeal.id as Id<"plannedMeals">,
        cookId: newCookId as Id<"householdMembers">,
      });
    } catch (error) {
      console.error("Failed to change cook:", error);
    }
  };

  const handleToggleEater = async (memberId: string) => {
    if (!selectedMeal) return;
    try {
      const currentEaters = selectedMeal.eaterIds;
      const newEaters = currentEaters.includes(memberId)
        ? currentEaters.filter((id) => id !== memberId)
        : [...currentEaters, memberId];

      await updateMeal({
        id: selectedMeal.id as Id<"plannedMeals">,
        eaterIds: newEaters.map((id) => id as Id<"householdMembers">),
      });
    } catch (error) {
      console.error("Failed to toggle eater:", error);
    }
  };

  const handleSelectAlternative = async (alternativeId: string) => {
    if (!selectedMeal) return;
    const alternative = sampleAlternatives.find((a) => a.id === alternativeId);
    if (!alternative) return;

    try {
      await updateMeal({
        id: selectedMeal.id as Id<"plannedMeals">,
        name: alternative.mealName,
        effortTier: effortTierReverseMap[alternative.effortTier as EffortTier],
        prepTime: alternative.prepTime,
        cookTime: alternative.cookTime,
        cleanupRating: cleanupRatingReverseMap[alternative.cleanupRating as CleanupRating],
        isFlexMeal: alternative.isFlexMeal,
      });
      handleCloseModal();
    } catch (error) {
      console.error("Failed to swap meal:", error);
    }
  };

  const handleMoreOptions = () => {
    console.log("More options requested - will integrate with AI");
  };

  const handleUnplan = async () => {
    if (!selectedMeal) return;
    try {
      await updateMeal({
        id: selectedMeal.id as Id<"plannedMeals">,
        name: "Unplanned",
        isFlexMeal: true,
      });
      handleCloseModal();
    } catch (error) {
      console.error("Failed to unplan meal:", error);
    }
  };

  const handleApprovePlan = async () => {
    if (!selectedWeekPlan || !currentUser.id) return;

    try {
      await updateStatus({
        id: selectedWeekPlan.id as Id<"weekPlans">,
        status: "approved",
        approvedBy: currentUser.id as Id<"householdMembers">,
      });

      // Extract unique ingredients from all meals to create pantry items
      const allIngredients = selectedWeekPlan.meals.flatMap((meal) => meal.ingredients);
      const uniqueIngredients = [...new Set(allIngredients)];

      const items: PantryCheckItem[] = uniqueIngredients.map((ingredient, index) => ({
        id: `pantry-${index}`,
        name: ingredient,
        alreadyHave: false,
      }));

      setPantryItems(items);
      setShowPantryAudit(true);
    } catch (error) {
      console.error("Failed to approve plan:", error);
    }
  };

  const handleAddWeek = () => {
    console.log("Add new week - will implement with create mutation");
  };

  const handlePantryAudit = () => {
    if (!selectedWeekPlan) return;

    const allIngredients = selectedWeekPlan.meals.flatMap((meal) => meal.ingredients);
    const uniqueIngredients = [...new Set(allIngredients)];

    const items: PantryCheckItem[] = uniqueIngredients.map((ingredient, index) => ({
      id: `pantry-${index}`,
      name: ingredient,
      alreadyHave: false,
    }));

    setPantryItems(items);
    setShowPantryAudit(true);
  };

  const handleTogglePantryItem = (itemId: string) => {
    setPantryItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, alreadyHave: !item.alreadyHave } : item
      )
    );
  };

  const handleCompletePantryAudit = () => {
    setShowPantryAudit(false);
    const uncheckedItems = pantryItems.filter((item) => !item.alreadyHave);
    console.log("Items to add to grocery list:", uncheckedItems.map((i) => i.name));
  };

  const handleGeneratePlan = async () => {
    if (!selectedWeekPlan) return;

    setIsGenerating(true);
    try {
      const result = await generateWeekPlan({
        weekStartDate: selectedWeekPlan.weekStartDate,
        householdSize: householdMembers.length,
      });

      if (!result.success) {
        console.error("Failed to generate plan:", result.error);
        alert("Failed to generate plan: " + (result.error || "Unknown error"));
      }
      // Success: Convex will auto-update via the query subscription
    } catch (error) {
      console.error("Error generating plan:", error);
      alert("Error generating plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <RequireAuth>
        <div
          className="flex min-h-[calc(100vh-120px)] items-center justify-center"
          style={{ backgroundColor: "var(--color-bg)" }}
        >
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
            <p className="text-[var(--color-text-secondary)]">Loading week plans...</p>
          </div>
        </div>
      </RequireAuth>
    );
  }

  // No weeks available
  if (availableWeeks.length === 0) {
    return (
      <RequireAuth>
        <div
          className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center p-4"
          style={{ backgroundColor: "var(--color-bg)" }}
        >
          <p className="mb-4 text-[var(--color-text-secondary)]">
            No week plans yet. Create one to get started!
          </p>
          <button
            onClick={handleAddWeek}
            className="rounded-lg px-6 py-3 font-medium"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "white",
            }}
          >
            Create Week Plan
          </button>
        </div>
      </RequireAuth>
    );
  }

  // No selected plan (shouldn't happen with auto-select)
  if (!selectedWeekPlan) {
    return (
      <RequireAuth>
        <div
          className="flex min-h-[calc(100vh-120px)] items-center justify-center"
          style={{ backgroundColor: "var(--color-bg)" }}
        >
          <p className="text-[var(--color-text-secondary)]">Select a week to view</p>
        </div>
      </RequireAuth>
    );
  }

  // Pantry audit view
  if (showPantryAudit) {
    return (
      <RequireAuth>
        <div
          className="flex min-h-[calc(100vh-120px)] flex-col font-sans"
          style={{ backgroundColor: "var(--color-bg)" }}
        >
          <PantryAudit
            items={pantryItems}
            onToggleItem={handleTogglePantryItem}
            onComplete={handleCompletePantryAudit}
          />
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div
        className="flex min-h-[calc(100vh-120px)] flex-col font-sans"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <WeekPlanView
          currentUser={currentUser}
          availableWeeks={availableWeeks}
          selectedWeekPlan={selectedWeekPlan}
          householdMembers={householdMembers}
          onSelectWeek={handleSelectWeek}
          onSelectMeal={handleSelectMeal}
          onApprovePlan={handleApprovePlan}
          onAddWeek={handleAddWeek}
          onTapMeal={handleSelectMeal}
          onPantryAudit={handlePantryAudit}
          onGeneratePlan={handleGeneratePlan}
          isGenerating={isGenerating}
        />

        {/* Edit Day Modal */}
        {isModalOpen && selectedMeal && (
          <EditDayModal
            currentMeal={selectedMeal}
            alternatives={sampleAlternatives}
            householdMembers={householdMembers}
            onChangeCook={handleChangeCook}
            onToggleEater={handleToggleEater}
            onSelectAlternative={handleSelectAlternative}
            onMoreOptions={handleMoreOptions}
            onUnplan={handleUnplan}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </RequireAuth>
  );
}
