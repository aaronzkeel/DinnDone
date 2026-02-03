"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Id } from "../../../convex/_generated/dataModel";
import { WeekPlanView, EditDayModal, PantryAudit } from "@/components/weekly-planning";
import { PlanningDrawer } from "@/components/weekly-planning/PlanningDrawer";
import { PlanningChat } from "@/components/weekly-planning/PlanningChat";
import { MealOptionDetails } from "@/components/meal-helper/MealOptionDetails";
import type { QuickAction } from "@/components/weekly-planning/QuickActionButtons";
import { RequireAuth } from "@/components/RequireAuth";
import { cleanupRatingReverseMap } from "@/lib/meal-adapters";
import type { EffortTier, CleanupRating, PantryCheckItem } from "@/types/weekly-planning";
import { MessageCircle } from "lucide-react";
import {
  useWeekPlanData,
  useWeekPlanState,
  usePlanningAI,
} from "@/hooks/useWeekPlanning";

export default function WeeklyPlanningPage() {
  const router = useRouter();

  // ==========================================================================
  // Data Layer (Convex queries and transformations)
  // ==========================================================================
  const {
    householdMembersData,
    weekPlansData,
    recipesData,
    recentMealsData,
    groceryItemsData,
    householdMembers,
    availableWeeks,
    selectedWeekPlan,
    currentUser,
    isLoading,
    selectedWeekId,
    setSelectedWeekId,
    syncSelectedMeal,
  } = useWeekPlanData();

  // ==========================================================================
  // UI State Layer
  // ==========================================================================
  const {
    selectedMeal,
    setSelectedMeal,
    isModalOpen,
    setIsModalOpen,
    showMealDetails,
    setShowMealDetails,
    isGenerating,
    setIsGenerating,
    showPantryAudit,
    setShowPantryAudit,
    pantryItems,
    setPantryItems,
    alternatives,
    setAlternatives,
    isLoadingAlternatives,
    setIsLoadingAlternatives,
    isDrawerOpen,
    setIsDrawerOpen,
    chatMessages,
    setChatMessages,
    planningMode,
    setPlanningMode,
    isAiThinking,
    setIsAiThinking,
    missingItems,
    setMissingItems,
    addMessage,
    handleCloseModal,
  } = useWeekPlanState();

  // ==========================================================================
  // AI Layer (actions and mutations)
  // ==========================================================================
  const {
    handleQuickPlan,
    handleDiscussPlan,
    handleSendMessage,
    handleMoreOptions,
    handleAddMissingToGroceryList,
    updateMealMutation,
    createWeekPlanMutation,
    deleteWeekPlanMutation,
    addGroceryItemMutation,
    updateStatusMutation,
  } = usePlanningAI({
    selectedWeekPlan,
    householdMembersData,
    householdMembers,
    recipesData,
    recentMealsData,
    groceryItemsData,
    selectedWeekId,
    chatMessages,
    planningMode,
    missingItems,
    setPlanningMode,
    setIsAiThinking,
    setMissingItems,
    setAlternatives,
    setIsLoadingAlternatives,
    setIsGenerating,
    addMessage,
    setSelectedWeekId,
  });

  // ==========================================================================
  // Sync selected meal with Convex data when it updates
  // ==========================================================================
  useEffect(() => {
    if (selectedMeal && selectedWeekPlan) {
      const synced = syncSelectedMeal(selectedMeal);
      if (synced !== selectedMeal) {
        setSelectedMeal(synced);
      }
    }
  }, [selectedWeekPlan, selectedMeal, syncSelectedMeal, setSelectedMeal]);

  // ==========================================================================
  // Event Handlers (thin wrappers that orchestrate state + AI)
  // ==========================================================================

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

  const handleChangeCook = async (newCookId: string) => {
    if (!selectedMeal) return;
    try {
      await updateMealMutation({
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

      await updateMealMutation({
        id: selectedMeal.id as Id<"plannedMeals">,
        eaterIds: newEaters.map((id) => id as Id<"householdMembers">),
      });
    } catch (error) {
      console.error("Failed to toggle eater:", error);
    }
  };

  const handleSelectAlternative = async (alternativeId: string) => {
    if (!selectedMeal) return;
    const alternative = alternatives.find((a) => a.id === alternativeId);
    if (!alternative) return;

    try {
      await updateMealMutation({
        id: selectedMeal.id as Id<"plannedMeals">,
        name: alternative.mealName,
        effortTier: alternative.effortTier as EffortTier,
        prepTime: alternative.prepTime,
        cookTime: alternative.cookTime,
        cleanupRating: cleanupRatingReverseMap[alternative.cleanupRating as CleanupRating],
        isFlexMeal: alternative.isFlexMeal,
        ingredients: alternative.ingredients,
        steps: alternative.steps,
      });
      handleCloseModal();
    } catch (error) {
      console.error("Failed to swap meal:", error);
    }
  };

  const handleUnplan = async () => {
    if (!selectedMeal) return;
    try {
      await updateMealMutation({
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
      await updateMealMutation({
        id: selectedMeal.id as Id<"plannedMeals">,
        name: mealName,
        effortTier: effortTier,
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
      await updateStatusMutation({
        id: selectedWeekPlan.id as Id<"weekPlans">,
        status: "approved",
        approvedBy: currentUser.id as Id<"householdMembers">,
      });

      // Extract unique ingredients from all meals to create pantry items
      const allIngredients = selectedWeekPlan.meals.flatMap((meal) => meal.ingredients);
      const uniqueIngredientNames = [...new Set(allIngredients.map((ing) => ing.name))];

      const items: PantryCheckItem[] = uniqueIngredientNames.map((ingredientName, index) => ({
        id: `pantry-${index}`,
        name: ingredientName,
        alreadyHave: false,
      }));

      setPantryItems(items);
      setShowPantryAudit(true);
    } catch (error) {
      console.error("Failed to approve plan:", error);
    }
  };

  const handleAddWeek = async () => {
    let nextMonday: Date;

    if (weekPlansData && weekPlansData.length > 0) {
      const latestWeekStart = weekPlansData
        .map((wp) => new Date(wp.weekStart + "T12:00:00"))
        .sort((a, b) => b.getTime() - a.getTime())[0];

      nextMonday = new Date(latestWeekStart);
      nextMonday.setDate(latestWeekStart.getDate() + 7);
    } else {
      const today = new Date();
      const dayOfWeek = today.getDay();
      nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    }

    const year = nextMonday.getFullYear();
    const month = String(nextMonday.getMonth() + 1).padStart(2, "0");
    const day = String(nextMonday.getDate()).padStart(2, "0");
    const weekStart = `${year}-${month}-${day}`;

    try {
      const newWeekId = await createWeekPlanMutation({
        weekStart,
        status: "draft",
      });
      setSelectedWeekId(newWeekId);
    } catch (error) {
      console.error("Failed to create week plan:", error);
    }
  };

  const handleDeleteWeek = async () => {
    if (!selectedWeekPlan) return;

    try {
      await deleteWeekPlanMutation({ id: selectedWeekPlan.id as Id<"weekPlans"> });
      setSelectedWeekId(null);
    } catch (error) {
      console.error("Failed to delete week plan:", error);
    }
  };

  const handlePantryAudit = () => {
    if (!selectedWeekPlan) return;

    setIsDrawerOpen(true);
    setPlanningMode("pantry");
    setMissingItems([]);
    setChatMessages([]);

    const allIngredients = selectedWeekPlan.meals.flatMap((meal) => meal.ingredients);
    const uniqueIngredients = [...new Set(allIngredients.map((ing) => ing.name))];

    const existingGroceryItems = groceryItemsData || [];
    const uncheckedItems = existingGroceryItems.filter((item) => !item.isChecked);

    if (uncheckedItems.length > 0) {
      addMessage(
        "zylo",
        `I see you already have ${uncheckedItems.length} item${uncheckedItems.length > 1 ? "s" : ""} on your grocery list from this plan. Do you have more to add, or want to check what's there?`
      );
    } else {
      addMessage(
        "zylo",
        `Let's check what you have on hand! Your meal plan needs ${uniqueIngredients.length} different ingredients. Just tell me what's in your fridge and pantry, and I'll figure out what's missing.`
      );
    }
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

    try {
      for (const item of uncheckedItems) {
        await addGroceryItemMutation({
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

  // ==========================================================================
  // Planning Drawer Handlers
  // ==========================================================================

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
    setPlanningMode("idle");
    setChatMessages([]);

    const existingMeals = selectedWeekPlan?.meals || [];
    const userName = currentUser.name || "there";

    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = dayNames[dayOfWeek];

    const weekStart = selectedWeekPlan?.weekStartDate;
    let isCurrentWeek = false;
    let isMidWeek = false;

    if (weekStart) {
      const weekStartDate = new Date(weekStart + "T12:00:00");
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);

      isCurrentWeek = today >= weekStartDate && today <= weekEndDate;
      isMidWeek = dayOfWeek !== 1;
    }

    if (existingMeals.length > 0) {
      const mealsList = existingMeals.map((m) => `${m.dayOfWeek}: ${m.mealName}`).join(", ");
      addMessage(
        "zylo",
        `Hi ${userName}! I see you already have some meals planned (${mealsList}). Want me to keep these and fill in the rest, or start fresh?`
      );
    } else if (isCurrentWeek && isMidWeek) {
      addMessage(
        "zylo",
        `Hi ${userName}! It's ${todayName} - do you already have a plan for tonight, or should I include today in the plan? Also, how's your energy this week?`
      );
    } else {
      addMessage(
        "zylo",
        `Hi ${userName}, I'm ready to help you get dinners planned! How's your energy? Any busy nights or special circumstances? Anything you share will help me help you.`
      );
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const getQuickActions = (): QuickAction[] => {
    if (planningMode === "idle") {
      return [
        { id: "quick", label: "Just plan it for me", variant: "primary" },
        { id: "discuss", label: "Let's discuss first", variant: "outline" },
      ];
    }
    if (planningMode === "discuss") {
      return [
        { id: "ready", label: "Ready to plan!", variant: "primary" },
      ];
    }
    if (planningMode === "pantry") {
      const existingGroceryItems = groceryItemsData || [];
      const uncheckedCount = existingGroceryItems.filter((item) => !item.isChecked).length;

      if (missingItems.length > 0) {
        return [
          { id: "add-all-to-list", label: `Add ${missingItems.length} to list`, variant: "primary" },
          { id: "have-more", label: "I have more to add", variant: "outline" },
          ...(uncheckedCount > 0 ? [{ id: "view-grocery-list", label: "View Grocery List", variant: "outline" as const }] : []),
          { id: "done-pantry", label: "Done", variant: "outline" },
        ];
      }
      return [
        ...(uncheckedCount > 0 ? [{ id: "view-grocery-list", label: "View Grocery List", variant: "primary" as const }] : []),
        { id: "done-pantry", label: "Done", variant: uncheckedCount > 0 ? "outline" as const : "primary" as const },
      ];
    }
    return [];
  };

  const handleQuickAction = async (actionId: string) => {
    if (actionId === "quick") {
      await handleQuickPlan();
    } else if (actionId === "discuss") {
      setPlanningMode("discuss");
      addMessage("zylo", "Got it, what's on your mind? Feel free to ramble - I'll help you figure this out.");
    } else if (actionId === "ready") {
      await handleDiscussPlan();
    } else if (actionId === "add-all-to-list") {
      await handleAddMissingToGroceryList();
    } else if (actionId === "have-more") {
      addMessage("zylo", "No problem! What else do you have on hand?");
    } else if (actionId === "view-grocery-list") {
      router.push("/grocery-list");
    } else if (actionId === "done-pantry") {
      handleCloseDrawer();
    }
  };

  // ==========================================================================
  // Render
  // ==========================================================================

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
          onViewMeal={(mealId) => {
            const meal = selectedWeekPlan?.meals.find((m) => m.id === mealId);
            if (meal) {
              setSelectedMeal(meal);
              setShowMealDetails(true);
              setIsModalOpen(true);
            }
          }}
          onPantryAudit={handlePantryAudit}
          onGeneratePlan={handleOpenDrawer}
          isGenerating={isGenerating}
          onDeleteWeek={handleDeleteWeek}
        />

        {/* Edit Day Modal or Meal Details */}
        {isModalOpen && selectedMeal && (
          showMealDetails ? (
            <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
              <MealOptionDetails
                meal={{
                  id: selectedMeal.id,
                  mealName: selectedMeal.mealName,
                  effortTier: selectedMeal.effortTier,
                  prepTime: selectedMeal.prepTime,
                  cookTime: selectedMeal.cookTime,
                  cleanupRating: selectedMeal.cleanupRating,
                  isFlexMeal: selectedMeal.isFlexMeal,
                  assignedCookId: selectedMeal.assignedCookId,
                  eaterIds: selectedMeal.eaterIds,
                  ingredients: selectedMeal.ingredients,
                  prepSteps: selectedMeal.steps,
                }}
                householdMembers={householdMembers}
                onBack={() => setShowMealDetails(false)}
                onCookThis={() => {
                  setShowMealDetails(false);
                  handleCloseModal();
                }}
              />
            </div>
          ) : (
            <EditDayModal
              currentMeal={selectedMeal}
              alternatives={alternatives}
              householdMembers={householdMembers}
              onChangeCook={handleChangeCook}
              onToggleEater={handleToggleEater}
              onSelectAlternative={handleSelectAlternative}
              onMoreOptions={() => selectedMeal && handleMoreOptions(selectedMeal)}
              onUnplan={handleUnplan}
              onClose={handleCloseModal}
              isLoadingAlternatives={isLoadingAlternatives}
              onCustomMeal={handleCustomMeal}
              onViewMealDetails={() => setShowMealDetails(true)}
            />
          )
        )}

        {/* Floating Zylo Tab - visible when drawer is closed */}
        {!isDrawerOpen && (
          <button
            onClick={handleOpenDrawer}
            className="fixed left-1/2 -translate-x-1/2 z-30 transition-all hover:opacity-90 active:scale-95"
            style={{ bottom: "var(--bottom-nav-total)" }}
            aria-label="Chat with Zylo"
          >
            <div
              className="px-4 py-2 text-sm font-medium shadow-lg rounded-t-xl flex items-center gap-2"
              style={{
                backgroundColor: "var(--color-card)",
                color: "var(--color-text)",
                borderTop: "1px solid var(--color-border)",
                borderLeft: "1px solid var(--color-border)",
                borderRight: "1px solid var(--color-border)",
              }}
            >
              <MessageCircle size={16} />
              Zylo Chat
            </div>
          </button>
        )}

        {/* Planning Drawer */}
        <PlanningDrawer
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          title="Plan with Zylo"
        >
          <PlanningChat
            messages={chatMessages}
            quickActions={getQuickActions()}
            onQuickAction={handleQuickAction}
            onSendMessage={handleSendMessage}
            isLoading={isAiThinking}
            inputPlaceholder={
              planningMode === "discuss"
                ? "Tell me about your week..."
                : planningMode === "post-gen"
                  ? "e.g., Make Wednesday leftovers"
                  : planningMode === "pantry"
                    ? "e.g., chicken, rice, onions, eggs..."
                    : "Type a message..."
            }
            showInput={true}
          />
        </PlanningDrawer>
      </div>
    </RequireAuth>
  );
}
