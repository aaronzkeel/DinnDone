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

export default function WeeklyPlanningPage() {
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<PlannedMeal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPantryAudit, setShowPantryAudit] = useState(false);
  const [pantryItems, setPantryItems] = useState<PantryCheckItem[]>([]);
  const [alternatives, setAlternatives] = useState<MealAlternative[]>([]);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);

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
  const createWeekPlan = useMutation(api.weekPlans.create);
  const addGroceryItem = useMutation(api.groceryItems.add);

  // AI actions
  const generateWeekPlan = useAction(api.ai.generateWeekPlan);
  const suggestAlternatives = useAction(api.ai.suggestAlternatives);

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

  // Sync selectedMeal with Convex data when it updates (keeps modal in sync after mutations)
  useEffect(() => {
    if (selectedMeal && selectedWeekPlan) {
      const updatedMeal = selectedWeekPlan.meals.find((m) => m.id === selectedMeal.id);
      if (updatedMeal && JSON.stringify(updatedMeal) !== JSON.stringify(selectedMeal)) {
        setSelectedMeal(updatedMeal);
      }
    }
  }, [selectedWeekPlan, selectedMeal]);

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
    setAlternatives([]);
    setIsLoadingAlternatives(false);
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
    const alternative = alternatives.find((a: MealAlternative) => a.id === alternativeId);
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

  const handleMoreOptions = async () => {
    if (!selectedMeal || !selectedWeekPlan) return;

    setIsLoadingAlternatives(true);
    try {
      // Get other meal names in the plan to exclude from suggestions
      const excludeMeals = selectedWeekPlan.meals
        .map((m) => m.mealName)
        .filter((name) => name !== selectedMeal.mealName);

      const result = await suggestAlternatives({
        currentMealName: selectedMeal.mealName,
        excludeMeals,
      });

      if (result.success && result.alternatives) {
        // Convert AI alternatives to MealAlternative format with unique IDs
        const newAlternatives: MealAlternative[] = result.alternatives.map((alt, index) => ({
          id: `ai-alt-${Date.now()}-${index}`,
          mealName: alt.mealName,
          effortTier: alt.effortTier,
          prepTime: alt.prepTime,
          cookTime: alt.cookTime,
          cleanupRating: alt.cleanupRating,
          briefDescription: alt.briefDescription,
          isFlexMeal: alt.isFlexMeal,
        }));
        setAlternatives(newAlternatives);
      } else {
        console.error("Failed to get alternatives:", result.error);
      }
    } catch (error) {
      console.error("Error fetching alternatives:", error);
    } finally {
      setIsLoadingAlternatives(false);
    }
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

  const handleCustomMeal = async (
    mealName: string,
    effortTier: "super-easy" | "middle" | "more-prep"
  ) => {
    if (!selectedMeal) return;
    try {
      await updateMeal({
        id: selectedMeal.id as Id<"plannedMeals">,
        name: mealName,
        effortTier: effortTierReverseMap[effortTier as EffortTier],
        isFlexMeal: true,
      });
      handleCloseModal();
    } catch (error) {
      console.error("Failed to set custom meal:", error);
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

  const handleAddWeek = async () => {
    // Calculate the next Monday after all existing weeks
    let nextMonday: Date;

    if (weekPlansData && weekPlansData.length > 0) {
      // Find the latest week start date
      const latestWeekStart = weekPlansData
        .map((wp) => new Date(wp.weekStart + "T12:00:00"))
        .sort((a, b) => b.getTime() - a.getTime())[0];

      // Next week is 7 days after the latest
      nextMonday = new Date(latestWeekStart);
      nextMonday.setDate(latestWeekStart.getDate() + 7);
    } else {
      // No existing weeks - start with current week's Monday
      const today = new Date();
      const dayOfWeek = today.getDay();
      nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    }

    const weekStart = nextMonday.toISOString().split("T")[0];

    try {
      const newWeekId = await createWeekPlan({
        weekStart,
        status: "draft",
      });
      // Select the newly created week
      setSelectedWeekId(newWeekId);
    } catch (error) {
      console.error("Failed to create week plan:", error);
    }
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

  const handleCompletePantryAudit = async () => {
    const uncheckedItems = pantryItems.filter((item) => !item.alreadyHave);

    // Add unchecked items to grocery list
    try {
      for (const item of uncheckedItems) {
        await addGroceryItem({
          name: item.name,
          category: "From Meal Plan",
          isOrganic: false,
          weekPlanId: selectedWeekId as Id<"weekPlans"> | undefined,
        });
      }
    } catch (error) {
      console.error("Failed to add items to grocery list:", error);
    }

    setShowPantryAudit(false);
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
            alternatives={alternatives}
            householdMembers={householdMembers}
            onChangeCook={handleChangeCook}
            onToggleEater={handleToggleEater}
            onSelectAlternative={handleSelectAlternative}
            onMoreOptions={handleMoreOptions}
            onUnplan={handleUnplan}
            onClose={handleCloseModal}
            isLoadingAlternatives={isLoadingAlternatives}
            onCustomMeal={handleCustomMeal}
          />
        )}
      </div>
    </RequireAuth>
  );
}
