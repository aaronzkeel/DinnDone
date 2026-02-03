"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { WeekPlanView, EditDayModal, PantryAudit } from "@/components/weekly-planning";
import { PlanningDrawer } from "@/components/weekly-planning/PlanningDrawer";
import { PlanningChat, type PlanningMessage } from "@/components/weekly-planning/PlanningChat";
import { MealOptionDetails } from "@/components/meal-helper/MealOptionDetails";
import type { QuickAction } from "@/components/weekly-planning/QuickActionButtons";
import { RequireAuth } from "@/components/RequireAuth";
import {
  toHouseholdMember,
  toWeekSummary,
  toWeekPlan,
  cleanupRatingReverseMap,
} from "@/lib/meal-adapters";
import { formatErrorForUser } from "@/lib/errorUtils";
import type {
  PlannedMeal,
  MealAlternative,
  PantryCheckItem,
  EffortTier,
  CleanupRating,
} from "@/types/weekly-planning";
import { MessageCircle } from "lucide-react";

export default function WeeklyPlanningPage() {
  const router = useRouter();
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<PlannedMeal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMealDetails, setShowMealDetails] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPantryAudit, setShowPantryAudit] = useState(false);
  const [pantryItems, setPantryItems] = useState<PantryCheckItem[]>([]);
  const [alternatives, setAlternatives] = useState<MealAlternative[]>([]);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);

  // Planning drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<PlanningMessage[]>([]);
  const [planningMode, setPlanningMode] = useState<"idle" | "quick" | "discuss" | "post-gen" | "pantry">("idle");
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Pantry mode state
  const [missingItems, setMissingItems] = useState<string[]>([]);

  // Convex queries
  const householdMembersData = useQuery(api.householdMembers.list);
  const weekPlansData = useQuery(api.weekPlans.list);
  const selectedWeekData = useQuery(
    api.weekPlans.getWithMeals,
    selectedWeekId ? { id: selectedWeekId as Id<"weekPlans"> } : "skip"
  );
  const recipesData = useQuery(api.recipes.list);
  const recentMealsData = useQuery(api.weekPlans.getRecentMeals, { daysBack: 14 });
  const groceryItemsData = useQuery(
    api.groceryItems.listByWeekPlan,
    selectedWeekId ? { weekPlanId: selectedWeekId as Id<"weekPlans"> } : "skip"
  );

  // Convex mutations
  const updateMeal = useMutation(api.weekPlans.updateMeal);
  const updateStatus = useMutation(api.weekPlans.updateStatus);
  const createWeekPlan = useMutation(api.weekPlans.create);
  const addGroceryItem = useMutation(api.groceryItems.add);
  const addMeal = useMutation(api.weekPlans.addMeal);
  const createRecipe = useMutation(api.recipes.create);
  const deleteWeekPlan = useMutation(api.weekPlans.deleteWeekPlan);

  // AI actions
  const generateWeekPlan = useAction(api.ai.generateWeekPlan);
  const suggestAlternatives = useAction(api.ai.suggestAlternatives);
  const quickGeneratePlan = useAction(api.ai.quickGeneratePlan);
  const generatePlanWithConversation = useAction(api.ai.generatePlanWithConversation);
  const updateMealFromChat = useAction(api.ai.updateMealFromChat);
  const aiChat = useAction(api.ai.chat);
  const analyzePantry = useAction(api.ai.analyzePantry);
  const removeGroceryItemByName = useMutation(api.groceryItems.removeByName);

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

  // Auto-select current week (containing today) when data loads
  useEffect(() => {
    if (availableWeeks.length > 0 && !selectedWeekId) {
      // Find the week containing today
      const today = new Date();
      const currentWeek = availableWeeks.find((week) => {
        const weekStart = new Date(week.weekStartDate + "T12:00:00");
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return today >= weekStart && today <= weekEnd;
      });

      // If found, select it; otherwise fall back to first week
      setSelectedWeekId(currentWeek?.id ?? availableWeeks[0].id);
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
    setShowMealDetails(false);
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

  // Debounced ref for suggestAlternatives to prevent spam
  const lastSuggestCallRef = useRef<number>(0);
  const SUGGEST_DEBOUNCE_MS = 1500;

  const handleMoreOptions = async () => {
    if (!selectedMeal || !selectedWeekPlan) return;

    // Debounce: ignore calls within 1500ms of last call
    const now = Date.now();
    if (now - lastSuggestCallRef.current < SUGGEST_DEBOUNCE_MS) {
      return;
    }
    lastSuggestCallRef.current = now;

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
        // AI returns ingredients as string[], so map them to Ingredient[]
        const newAlternatives: MealAlternative[] = result.alternatives.map((alt, index) => ({
          id: `ai-alt-${Date.now()}-${index}`,
          mealName: alt.mealName,
          effortTier: alt.effortTier,
          prepTime: alt.prepTime,
          cookTime: alt.cookTime,
          cleanupRating: alt.cleanupRating,
          briefDescription: alt.briefDescription,
          isFlexMeal: alt.isFlexMeal,
          ingredients: (alt.ingredients || []).map((ing: string) => ({ name: ing, quantity: "" })),
          steps: alt.steps || [],
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
      await updateStatus({
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

    // Format as YYYY-MM-DD in local timezone (avoid UTC shift from toISOString)
    const year = nextMonday.getFullYear();
    const month = String(nextMonday.getMonth() + 1).padStart(2, "0");
    const day = String(nextMonday.getDate()).padStart(2, "0");
    const weekStart = `${year}-${month}-${day}`;

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

  const handleDeleteWeek = async () => {
    if (!selectedWeekPlan) return;

    try {
      await deleteWeekPlan({ id: selectedWeekPlan.id as Id<"weekPlans"> });
      // Reset selection - the useEffect will auto-select another week if available
      setSelectedWeekId(null);
    } catch (error) {
      console.error("Failed to delete week plan:", error);
    }
  };

  const handlePantryAudit = () => {
    if (!selectedWeekPlan) return;

    // Open drawer in pantry mode
    setIsDrawerOpen(true);
    setPlanningMode("pantry");
    setMissingItems([]);
    setChatMessages([]);

    // Count unique ingredients for context
    const allIngredients = selectedWeekPlan.meals.flatMap((meal) => meal.ingredients);
    const uniqueIngredients = [...new Set(allIngredients.map((ing) => ing.name))];

    // Check if there are already grocery items from this week's plan
    const existingGroceryItems = groceryItemsData || [];
    const uncheckedItems = existingGroceryItems.filter((item) => !item.isChecked);

    if (uncheckedItems.length > 0) {
      // User already has items on the list from this plan
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

  // Debounced ref for generateWeekPlan to prevent spam
  const lastGenerateCallRef = useRef<number>(0);
  const GENERATE_DEBOUNCE_MS = 2000;

  const handleGeneratePlan = async () => {
    if (!selectedWeekPlan) return;

    // Debounce: ignore calls within 2000ms of last call
    const now = Date.now();
    if (now - lastGenerateCallRef.current < GENERATE_DEBOUNCE_MS) {
      return;
    }
    lastGenerateCallRef.current = now;

    // Need at least one household member as default cook
    if (!householdMembersData || householdMembersData.length === 0) {
      alert("Please add at least one household member before generating a plan.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateWeekPlan({
        weekStartDate: selectedWeekPlan.weekStartDate,
        householdSize: householdMembers.length,
      });

      if (!result.success) {
        console.error("Failed to generate plan:", result.error);
        alert("Failed to generate plan: " + (result.error || "Unknown error"));
        return;
      }

      // Save each generated meal to the database
      if (result.meals && result.meals.length > 0) {
        const defaultCookId = householdMembersData[0]._id;
        const allMemberIds = householdMembersData.map((m) => m._id);

        for (const meal of result.meals) {
          await addMeal({
            weekPlanId: selectedWeekPlan.id as Id<"weekPlans">,
            date: meal.date,
            dayOfWeek: meal.dayOfWeek,
            name: meal.mealName,
            effortTier: meal.effortTier,
            prepTime: meal.prepTime,
            cookTime: meal.cookTime,
            cleanupRating: cleanupRatingReverseMap[meal.cleanupRating],
            cookId: defaultCookId,
            eaterIds: allMemberIds,
            ingredients: meal.ingredients.map((name) => ({ name, quantity: "as needed" })),
            steps: meal.steps || [],
            isFlexMeal: meal.isFlexMeal,
          });
        }
      }
      // Convex will auto-update via the query subscription
    } catch (error) {
      console.error("Error generating plan:", error);
      alert(formatErrorForUser("generate the plan", error));
    } finally {
      setIsGenerating(false);
    }
  };

  // =========================================================================
  // Planning Drawer Handlers
  // =========================================================================

  const addMessage = (role: "user" | "zylo", content: string) => {
    const message: PlanningMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role,
      content,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, message]);
  };

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
    setPlanningMode("idle");
    setChatMessages([]);

    // Build opening message based on existing meals and current day
    const existingMeals = selectedWeekPlan?.meals || [];
    const userName = currentUser.name || "there";

    // Check if we're planning the current week mid-week
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, etc.
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = dayNames[dayOfWeek];

    // Check if selected week contains today
    const weekStart = selectedWeekPlan?.weekStartDate;
    let isCurrentWeek = false;
    let isMidWeek = false;

    if (weekStart) {
      const weekStartDate = new Date(weekStart + "T12:00:00");
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);

      isCurrentWeek = today >= weekStartDate && today <= weekEndDate;
      // Mid-week = not Monday (day 1)
      isMidWeek = dayOfWeek !== 1;
    }

    if (existingMeals.length > 0) {
      const mealsList = existingMeals.map((m) => `${m.dayOfWeek}: ${m.mealName}`).join(", ");
      addMessage(
        "zylo",
        `Hi ${userName}! I see you already have some meals planned (${mealsList}). Want me to keep these and fill in the rest, or start fresh?`
      );
    } else if (isCurrentWeek && isMidWeek) {
      // Mid-week on current week - ask about tonight
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
    // Keep messages and mode so conversation persists when reopened
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

      // Show "Add all to list" only if there are missing items
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
      addMessage("zylo", "Got it, what's on your mind? Feel free to ramble — I'll help you figure this out.");
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

  // Debounced ref for quickGeneratePlan to prevent spam
  const lastQuickPlanCallRef = useRef<number>(0);
  const QUICK_PLAN_DEBOUNCE_MS = 2000;

  const handleQuickPlan = async () => {
    if (!householdMembersData || householdMembersData.length === 0) {
      addMessage("zylo", "I need at least one household member to plan meals. Head to Settings to add someone!");
      return;
    }
    if (!selectedWeekPlan) {
      addMessage("zylo", "Let me set up a week plan for you first...");
      // Try to create a week plan
      try {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;
        const thisMonday = new Date(today);
        thisMonday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // Go back to this Monday

        const year = thisMonday.getFullYear();
        const month = String(thisMonday.getMonth() + 1).padStart(2, "0");
        const day = String(thisMonday.getDate()).padStart(2, "0");
        const weekStart = `${year}-${month}-${day}`;

        const newWeekId = await createWeekPlan({ weekStart, status: "draft" });
        setSelectedWeekId(newWeekId);
        addMessage("zylo", "Week created! Give me a second to load it...");
        return; // Will retry when week loads
      } catch (error) {
        addMessage("zylo", "Hmm, I couldn't create a week plan. Try refreshing the page.");
        return;
      }
    }

    // Debounce: ignore calls within 2000ms of last call
    const now = Date.now();
    if (now - lastQuickPlanCallRef.current < QUICK_PLAN_DEBOUNCE_MS) {
      return;
    }
    lastQuickPlanCallRef.current = now;

    setPlanningMode("quick");
    addMessage("zylo", "On it!");
    setIsAiThinking(true);

    try {
      const existingMeals = selectedWeekPlan.meals.map((m) => ({
        date: m.date,
        mealName: m.mealName,
        keep: true, // Keep all existing meals by default
      }));

      const savedRecipes = (recipesData || []).map((r: { name: string; effortTier: "super-easy" | "middle" | "more-prep" }) => ({
        name: r.name,
        effortTier: r.effortTier,
      }));

      const recentMeals = recentMealsData || [];

      const result = await quickGeneratePlan({
        weekStartDate: selectedWeekPlan.weekStartDate,
        householdSize: householdMembers.length,
        existingMeals,
        savedRecipes,
        recentMeals,
      });

      if (result.success && result.meals) {
        // Save generated meals to database
        const defaultCookId = householdMembersData[0]._id;
        const allMemberIds = householdMembersData.map((m) => m._id);

        // Build Set for O(1) lookups instead of O(n) .find() inside loop
        const existingDatesSet = new Set(selectedWeekPlan.meals.map((m) => m.date));

        for (const meal of result.meals) {
          // Skip if we already have a meal for this date
          if (existingDatesSet.has(meal.date)) continue;

          await addMeal({
            weekPlanId: selectedWeekPlan.id as Id<"weekPlans">,
            date: meal.date,
            dayOfWeek: meal.dayOfWeek,
            name: meal.mealName,
            effortTier: meal.effortTier,
            prepTime: meal.prepTime,
            cookTime: meal.cookTime,
            cleanupRating: cleanupRatingReverseMap[meal.cleanupRating],
            cookId: defaultCookId,
            eaterIds: allMemberIds,
            ingredients: meal.ingredients.map((name) => ({ name, quantity: "as needed" })),
            steps: meal.steps || [],
            isFlexMeal: meal.isFlexMeal,
          });

          // Auto-save new meals to recipe library (dedupes internally)
          if (!meal.fromRecipeLibrary) {
            await createRecipe({
              name: meal.mealName,
              effortTier: meal.effortTier,
              prepTime: meal.prepTime,
              cookTime: meal.cookTime,
              cleanupRating: cleanupRatingReverseMap[meal.cleanupRating],
              ingredients: meal.ingredients.map((name) => ({ name, quantity: "as needed" })),
              steps: meal.steps || [],
              isFlexMeal: meal.isFlexMeal,
            });
          }
        }

        addMessage(
          "zylo",
          "Done! Take a look and swap anything you don't like. If you want to discuss anything, let me know — I can change it for you."
        );
        setPlanningMode("post-gen");
      } else {
        addMessage("zylo", `Hmm, I had trouble creating the plan: ${result.error || "Unknown error"}. Want to try again?`);
        setPlanningMode("idle");
      }
    } catch (error) {
      console.error("Quick plan error:", error);
      addMessage("zylo", formatErrorForUser("create your meal plan", error, "Sorry, something went wrong. Want to try again?"));
      setPlanningMode("idle");
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleAddMissingToGroceryList = async () => {
    if (missingItems.length === 0) {
      addMessage("zylo", "Looks like you have everything you need! No items to add.");
      return;
    }

    try {
      for (const item of missingItems) {
        await addGroceryItem({
          name: item,
          category: "From Meal Plan",
          isOrganic: false,
          weekPlanId: selectedWeekId as Id<"weekPlans"> | undefined,
        });
      }
      addMessage(
        "zylo",
        `Added ${missingItems.length} item${missingItems.length > 1 ? "s" : ""} to your grocery list. You're all set!`
      );
      setMissingItems([]);
    } catch (error) {
      console.error("Failed to add items to grocery list:", error);
      addMessage("zylo", formatErrorForUser("add items to your grocery list", error));
    }
  };

  const handleDiscussPlan = async () => {
    if (!selectedWeekPlan || !householdMembersData || householdMembersData.length === 0) return;

    setIsAiThinking(true);
    addMessage("zylo", "Sounds like we've got a plan. Let me create it based on what we discussed...");

    try {
      const existingMeals = selectedWeekPlan.meals.map((m) => ({
        date: m.date,
        mealName: m.mealName,
        keep: true,
      }));

      const savedRecipes = (recipesData || []).map((r: { name: string; effortTier: "super-easy" | "middle" | "more-prep" }) => ({
        name: r.name,
        effortTier: r.effortTier,
      }));

      const recentMeals = recentMealsData || [];

      // Convert chat messages to conversation history
      const conversationHistory = chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = await generatePlanWithConversation({
        weekStartDate: selectedWeekPlan.weekStartDate,
        householdSize: householdMembers.length,
        existingMeals,
        savedRecipes,
        recentMeals,
        conversationHistory,
      });

      if (result.success && result.meals) {
        const defaultCookId = householdMembersData[0]._id;
        const allMemberIds = householdMembersData.map((m) => m._id);

        // Build Set for O(1) lookups instead of O(n) .find() inside loop
        const existingDatesSet = new Set(selectedWeekPlan.meals.map((m) => m.date));

        for (const meal of result.meals) {
          if (existingDatesSet.has(meal.date)) continue;

          await addMeal({
            weekPlanId: selectedWeekPlan.id as Id<"weekPlans">,
            date: meal.date,
            dayOfWeek: meal.dayOfWeek,
            name: meal.mealName,
            effortTier: meal.effortTier,
            prepTime: meal.prepTime,
            cookTime: meal.cookTime,
            cleanupRating: cleanupRatingReverseMap[meal.cleanupRating],
            cookId: defaultCookId,
            eaterIds: allMemberIds,
            ingredients: meal.ingredients.map((name) => ({ name, quantity: "as needed" })),
            steps: meal.steps || [],
            isFlexMeal: meal.isFlexMeal,
          });

          // Auto-save new meals to recipe library (dedupes internally)
          if (!meal.fromRecipeLibrary) {
            await createRecipe({
              name: meal.mealName,
              effortTier: meal.effortTier,
              prepTime: meal.prepTime,
              cookTime: meal.cookTime,
              cleanupRating: cleanupRatingReverseMap[meal.cleanupRating],
              ingredients: meal.ingredients.map((name) => ({ name, quantity: "as needed" })),
              steps: meal.steps || [],
              isFlexMeal: meal.isFlexMeal,
            });
          }
        }

        addMessage(
          "zylo",
          "Done! I created your plan based on our conversation. Take a look and let me know if you want to change anything."
        );
        setPlanningMode("post-gen");
      } else {
        addMessage("zylo", `Hmm, I had trouble: ${result.error || "Unknown error"}. Want to try again?`);
        setPlanningMode("discuss");
      }
    } catch (error) {
      console.error("Discuss plan error:", error);
      addMessage("zylo", formatErrorForUser("create your plan", error, "Sorry, something went wrong. Want to try again?"));
      setPlanningMode("discuss");
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    addMessage("user", content);

    // If in pantry mode, check if user is saying they HAVE something on the list
    if (planningMode === "pantry" && selectedWeekPlan) {
      setIsAiThinking(true);

      try {
        // Check if user is saying they have something (to remove from grocery list)
        const havePattern = /(?:i (?:have|got|do have|actually have)|take off|remove|got some)(.*)/i;
        const haveMatch = content.match(havePattern);
        const uncheckedGroceryItems = (groceryItemsData || []).filter((item) => !item.isChecked);

        if (haveMatch && uncheckedGroceryItems.length > 0) {
          const userMentionedItems = haveMatch[1].toLowerCase();
          const itemsToRemove: string[] = [];

          // Check each grocery item to see if user mentioned having it
          for (const groceryItem of uncheckedGroceryItems) {
            const itemNameLower = groceryItem.name.toLowerCase();
            // Check for partial match - item name words in user text
            const itemWords = itemNameLower.split(/\s+/);
            const hasMatch = itemWords.some((word) =>
              word.length > 2 && userMentionedItems.includes(word)
            );

            if (hasMatch || userMentionedItems.includes(itemNameLower)) {
              itemsToRemove.push(groceryItem.name);
            }
          }

          if (itemsToRemove.length > 0) {
            // Remove the items from grocery list
            for (const itemName of itemsToRemove) {
              await removeGroceryItemByName({ name: itemName });
            }

            const remainingCount = uncheckedGroceryItems.length - itemsToRemove.length;
            addMessage(
              "zylo",
              `Got it! Removed ${itemsToRemove.join(", ")} from your grocery list. ${remainingCount > 0 ? `${remainingCount} item${remainingCount > 1 ? "s" : ""} remaining.` : "Your list is all set!"}`
            );
            setIsAiThinking(false);
            return;
          }
        }

        // Otherwise, do normal pantry analysis
        // Get unique ingredient names from meal plan
        const allIngredients = selectedWeekPlan.meals.flatMap((meal) => meal.ingredients);
        const uniqueIngredients = [...new Set(allIngredients.map((ing) => ing.name))];

        const result = await analyzePantry({
          userHasOnHand: content,
          neededIngredients: uniqueIngredients,
        });

        if (result.success) {
          setMissingItems(result.missingItems || []);
          addMessage("zylo", result.zyloResponse || "Got it!");
        } else {
          addMessage("zylo", "I had trouble checking that. Could you tell me more about what you have?");
        }
      } catch (error) {
        console.error("Pantry analysis error:", error);
        addMessage("zylo", formatErrorForUser("check your pantry", error, "Something went wrong. Try describing what you have again?"));
      } finally {
        setIsAiThinking(false);
      }
      return;
    }

    // If in idle mode, switch to discuss mode and continue to AI processing
    if (planningMode === "idle") {
      setPlanningMode("discuss");
      // Don't return - fall through to discuss mode AI processing below
    }

    // In discuss mode (or just switched from idle), have a conversation with Zylo
    if (planningMode === "discuss" || planningMode === "idle") {
      setIsAiThinking(true);
      try {
        // Build conversation history for AI
        const systemPrompt = `You are Zylo, a friendly meal planning assistant for DinnDone. You're helping a busy caregiver plan their week of dinners.

Your job right now is to have a brief, supportive conversation to understand their needs:
- Energy level and how tired they are
- Any busy nights or special circumstances
- What ingredients they have or need to use up
- Any preferences or restrictions

Keep responses SHORT (1-3 sentences). Be warm and empathetic. Don't suggest specific meals yet - just listen and acknowledge. When you feel you have enough info, gently suggest they tap "Ready to plan!" so you can create their meal plan.`;

        const aiMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
          { role: "system", content: systemPrompt },
        ];

        // Add conversation history
        for (const msg of chatMessages) {
          aiMessages.push({
            role: msg.role === "zylo" ? "assistant" : "user",
            content: msg.content,
          });
        }
        // Add the new user message
        aiMessages.push({ role: "user", content });

        const result = await aiChat({ messages: aiMessages, maxTokens: 150 });

        if (result.success && result.content) {
          addMessage("zylo", result.content);
        } else {
          addMessage("zylo", "I hear you! Keep sharing - when you're ready, tap 'Ready to plan!' and I'll create your meals.");
        }
      } catch (error) {
        console.error("Chat error:", error);
        addMessage("zylo", formatErrorForUser("process your message", error, "Got it! Feel free to share more, or tap 'Ready to plan!' when you're ready."));
      } finally {
        setIsAiThinking(false);
      }
      return;
    }

    // In post-gen mode, try to interpret as a meal change request
    if (planningMode === "post-gen" && selectedWeekPlan) {
      setIsAiThinking(true);

      // Try to find which day the user is talking about
      const dayPatterns = [
        { day: "Monday", pattern: /monday/i },
        { day: "Tuesday", pattern: /tuesday/i },
        { day: "Wednesday", pattern: /wednesday/i },
        { day: "Thursday", pattern: /thursday/i },
        { day: "Friday", pattern: /friday/i },
        { day: "Saturday", pattern: /saturday/i },
        { day: "Sunday", pattern: /sunday/i },
      ];

      let targetMeal = null;
      for (const { day, pattern } of dayPatterns) {
        if (pattern.test(content)) {
          targetMeal = selectedWeekPlan.meals.find((m) => m.dayOfWeek === day);
          break;
        }
      }

      if (targetMeal) {
        try {
          const savedRecipes = (recipesData || []).map((r: { name: string; effortTier: "super-easy" | "middle" | "more-prep" }) => ({
            name: r.name,
            effortTier: r.effortTier,
          }));

          const result = await updateMealFromChat({
            currentMealName: targetMeal.mealName,
            dayOfWeek: targetMeal.dayOfWeek,
            date: targetMeal.date,
            instruction: content,
            savedRecipes,
          });

          if (result.success && result.updatedMeal) {
            await updateMeal({
              id: targetMeal.id as Id<"plannedMeals">,
              name: result.updatedMeal.mealName,
              effortTier: result.updatedMeal.effortTier,
              prepTime: result.updatedMeal.prepTime,
              cookTime: result.updatedMeal.cookTime,
              cleanupRating: cleanupRatingReverseMap[result.updatedMeal.cleanupRating],
              isFlexMeal: result.updatedMeal.isFlexMeal,
            });
            addMessage("zylo", result.zyloResponse || "Done!");
          } else {
            addMessage("zylo", "I couldn't quite understand that change. Could you be more specific about what you'd like?");
          }
        } catch (error) {
          console.error("Update meal error:", error);
          addMessage("zylo", formatErrorForUser("update that meal", error, "Something went wrong updating that meal. Want to try again?"));
        }
      } else {
        addMessage("zylo", "I'm not sure which day you mean. Try saying something like 'Make Wednesday leftovers' or 'Change Tuesday to pizza'.");
      }

      setIsAiThinking(false);
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
              onMoreOptions={handleMoreOptions}
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
