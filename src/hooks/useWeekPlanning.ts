/**
 * Custom hooks for weekly planning page
 *
 * Extracted from page.tsx to reduce complexity and enable reuse.
 * These hooks handle data fetching, UI state, and AI orchestration.
 */

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id, Doc } from "../../convex/_generated/dataModel";
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
  WeekPlan,
  WeekSummary,
} from "@/types/weekly-planning";
import type { HouseholdMember } from "@/types/household";
import type { PlanningMessage } from "@/components/weekly-planning/PlanningChat";

// =============================================================================
// Types
// =============================================================================

export type PlanningMode = "idle" | "quick" | "discuss" | "post-gen" | "pantry";

// Recent meal type from Convex
export interface RecentMeal {
  name: string;
  date: string;
}

export interface WeekPlanDataResult {
  // Raw Convex data
  householdMembersData: Doc<"householdMembers">[] | undefined;
  weekPlansData: Doc<"weekPlans">[] | undefined;
  recipesData: Doc<"recipes">[] | undefined;
  recentMealsData: RecentMeal[] | undefined;
  groceryItemsData: Doc<"groceryItems">[] | undefined;

  // Transformed data
  householdMembers: HouseholdMember[];
  availableWeeks: WeekSummary[];
  selectedWeekPlan: WeekPlan | null;
  currentUser: HouseholdMember;

  // Loading state
  isLoading: boolean;

  // Selected week management
  selectedWeekId: string | null;
  setSelectedWeekId: (id: string | null) => void;

  // Selected meal sync helper
  syncSelectedMeal: (meal: PlannedMeal | null) => PlannedMeal | null;
}

export interface WeekPlanStateResult {
  // Modal state
  selectedMeal: PlannedMeal | null;
  setSelectedMeal: (meal: PlannedMeal | null) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  showMealDetails: boolean;
  setShowMealDetails: (show: boolean) => void;

  // Generation state
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;

  // Pantry state
  showPantryAudit: boolean;
  setShowPantryAudit: (show: boolean) => void;
  pantryItems: PantryCheckItem[];
  setPantryItems: React.Dispatch<React.SetStateAction<PantryCheckItem[]>>;

  // Alternatives state
  alternatives: MealAlternative[];
  setAlternatives: (alts: MealAlternative[]) => void;
  isLoadingAlternatives: boolean;
  setIsLoadingAlternatives: (loading: boolean) => void;

  // Planning drawer state
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  chatMessages: PlanningMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<PlanningMessage[]>>;
  planningMode: PlanningMode;
  setPlanningMode: (mode: PlanningMode) => void;
  isAiThinking: boolean;
  setIsAiThinking: (thinking: boolean) => void;
  missingItems: string[];
  setMissingItems: (items: string[]) => void;

  // Helper to add messages
  addMessage: (role: "user" | "zylo", content: string) => void;

  // Reset handlers
  handleCloseModal: () => void;
}

// =============================================================================
// useWeekPlanData - Convex queries and data loading
// =============================================================================

export function useWeekPlanData(): WeekPlanDataResult {
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null);

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

  // Auto-select current week (containing today) when data loads.
  // This is intentional initialization that only runs once when weeks first load.
  useEffect(() => {
    if (availableWeeks.length > 0 && !selectedWeekId) {
      const today = new Date();
      const currentWeek = availableWeeks.find((week) => {
        const weekStart = new Date(week.weekStartDate + "T12:00:00");
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return today >= weekStart && today <= weekEnd;
      });

      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: one-time initialization when data loads
      setSelectedWeekId(currentWeek?.id ?? availableWeeks[0].id);
    }
  }, [availableWeeks, selectedWeekId]);

  // Loading state
  const isLoading =
    householdMembersData === undefined ||
    weekPlansData === undefined ||
    (selectedWeekId !== null && selectedWeekData === undefined);

  // Helper to sync selectedMeal with latest Convex data
  const syncSelectedMeal = useCallback(
    (currentMeal: PlannedMeal | null): PlannedMeal | null => {
      if (!currentMeal || !selectedWeekPlan) return currentMeal;
      const updatedMeal = selectedWeekPlan.meals.find((m) => m.id === currentMeal.id);
      if (updatedMeal && JSON.stringify(updatedMeal) !== JSON.stringify(currentMeal)) {
        return updatedMeal;
      }
      return currentMeal;
    },
    [selectedWeekPlan]
  );

  return {
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
  };
}

// =============================================================================
// useWeekPlanState - UI state management
// =============================================================================

export function useWeekPlanState(): WeekPlanStateResult {
  // Modal state
  const [selectedMeal, setSelectedMeal] = useState<PlannedMeal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMealDetails, setShowMealDetails] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);

  // Pantry state
  const [showPantryAudit, setShowPantryAudit] = useState(false);
  const [pantryItems, setPantryItems] = useState<PantryCheckItem[]>([]);

  // Alternatives state
  const [alternatives, setAlternatives] = useState<MealAlternative[]>([]);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);

  // Planning drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<PlanningMessage[]>([]);
  const [planningMode, setPlanningMode] = useState<PlanningMode>("idle");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [missingItems, setMissingItems] = useState<string[]>([]);

  // Helper to add messages to chat
  const addMessage = useCallback((role: "user" | "zylo", content: string) => {
    const message: PlanningMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role,
      content,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, message]);
  }, []);

  // Reset modal state
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedMeal(null);
    setAlternatives([]);
    setIsLoadingAlternatives(false);
    setShowMealDetails(false);
  }, []);

  return {
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
  };
}

// =============================================================================
// usePlanningAI - AI action orchestration
// =============================================================================

interface UsePlanningAIProps {
  // Data dependencies
  selectedWeekPlan: WeekPlan | null;
  householdMembersData: Doc<"householdMembers">[] | undefined;
  householdMembers: HouseholdMember[];
  recipesData: Doc<"recipes">[] | undefined;
  recentMealsData: RecentMeal[] | undefined;
  groceryItemsData: Doc<"groceryItems">[] | undefined;
  selectedWeekId: string | null;

  // State values
  chatMessages: PlanningMessage[];
  planningMode: PlanningMode;
  missingItems: string[];

  // State setters
  setPlanningMode: (mode: PlanningMode) => void;
  setIsAiThinking: (thinking: boolean) => void;
  setMissingItems: (items: string[]) => void;
  setAlternatives: (alts: MealAlternative[]) => void;
  setIsLoadingAlternatives: (loading: boolean) => void;
  setIsGenerating: (generating: boolean) => void;
  addMessage: (role: "user" | "zylo", content: string) => void;
  setSelectedWeekId: (id: string | null) => void;
}

export interface PlanningAIResult {
  // AI actions
  handleQuickPlan: () => Promise<void>;
  handleDiscussPlan: () => Promise<void>;
  handleSendMessage: (content: string) => Promise<void>;
  handleMoreOptions: (meal: PlannedMeal) => Promise<void>;
  handleGeneratePlan: () => Promise<void>;
  handleAddMissingToGroceryList: () => Promise<void>;

  // Meal mutations
  updateMealMutation: ReturnType<typeof useMutation<typeof api.weekPlans.updateMeal>>;
  createWeekPlanMutation: ReturnType<typeof useMutation<typeof api.weekPlans.create>>;
  deleteWeekPlanMutation: ReturnType<typeof useMutation<typeof api.weekPlans.deleteWeekPlan>>;
  addMealMutation: ReturnType<typeof useMutation<typeof api.weekPlans.addMeal>>;
  addGroceryItemMutation: ReturnType<typeof useMutation<typeof api.groceryItems.add>>;
  updateStatusMutation: ReturnType<typeof useMutation<typeof api.weekPlans.updateStatus>>;
  createRecipeMutation: ReturnType<typeof useMutation<typeof api.recipes.create>>;
  removeGroceryItemByNameMutation: ReturnType<typeof useMutation<typeof api.groceryItems.removeByName>>;
}

export function usePlanningAI(props: UsePlanningAIProps): PlanningAIResult {
  const {
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
  } = props;

  // Convex mutations
  const updateMeal = useMutation(api.weekPlans.updateMeal);
  const updateStatus = useMutation(api.weekPlans.updateStatus);
  const createWeekPlan = useMutation(api.weekPlans.create);
  const addGroceryItem = useMutation(api.groceryItems.add);
  const addMeal = useMutation(api.weekPlans.addMeal);
  const createRecipe = useMutation(api.recipes.create);
  const deleteWeekPlan = useMutation(api.weekPlans.deleteWeekPlan);
  const removeGroceryItemByName = useMutation(api.groceryItems.removeByName);

  // AI actions
  const generateWeekPlan = useAction(api.ai.generateWeekPlan);
  const suggestAlternatives = useAction(api.ai.suggestAlternatives);
  const quickGeneratePlan = useAction(api.ai.quickGeneratePlan);
  const generatePlanWithConversation = useAction(api.ai.generatePlanWithConversation);
  const updateMealFromChat = useAction(api.ai.updateMealFromChat);
  const aiChat = useAction(api.ai.chat);
  const analyzePantry = useAction(api.ai.analyzePantry);

  // Debouncing refs
  const lastSuggestCallRef = useRef<number>(0);
  const lastGenerateCallRef = useRef<number>(0);
  const lastQuickPlanCallRef = useRef<number>(0);
  const SUGGEST_DEBOUNCE_MS = 1500;
  const GENERATE_DEBOUNCE_MS = 2000;
  const QUICK_PLAN_DEBOUNCE_MS = 2000;

  // Handle quick plan generation
  const handleQuickPlan = useCallback(async () => {
    if (!householdMembersData || householdMembersData.length === 0) {
      addMessage("zylo", "I need at least one household member to plan meals. Head to Settings to add someone!");
      return;
    }
    if (!selectedWeekPlan) {
      addMessage("zylo", "Let me set up a week plan for you first...");
      try {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const thisMonday = new Date(today);
        thisMonday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

        const year = thisMonday.getFullYear();
        const month = String(thisMonday.getMonth() + 1).padStart(2, "0");
        const day = String(thisMonday.getDate()).padStart(2, "0");
        const weekStart = `${year}-${month}-${day}`;

        const newWeekId = await createWeekPlan({ weekStart, status: "draft" });
        setSelectedWeekId(newWeekId);
        addMessage("zylo", "Week created! Give me a second to load it...");
        return;
      } catch {
        addMessage("zylo", "Hmm, I couldn't create a week plan. Try refreshing the page.");
        return;
      }
    }

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
        keep: true,
      }));

      const savedRecipes = (recipesData || []).map((r) => ({
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
        const defaultCookId = householdMembersData[0]._id;
        const allMemberIds = householdMembersData.map((m) => m._id);
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
          "Done! Take a look and swap anything you don't like. If you want to discuss anything, let me know - I can change it for you."
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
  }, [
    householdMembersData,
    selectedWeekPlan,
    householdMembers,
    recipesData,
    recentMealsData,
    addMessage,
    setPlanningMode,
    setIsAiThinking,
    setSelectedWeekId,
    createWeekPlan,
    quickGeneratePlan,
    addMeal,
    createRecipe,
  ]);

  // Handle discuss plan generation
  const handleDiscussPlan = useCallback(async () => {
    if (!selectedWeekPlan || !householdMembersData || householdMembersData.length === 0) return;

    setIsAiThinking(true);
    addMessage("zylo", "Sounds like we've got a plan. Let me create it based on what we discussed...");

    try {
      const existingMeals = selectedWeekPlan.meals.map((m) => ({
        date: m.date,
        mealName: m.mealName,
        keep: true,
      }));

      const savedRecipes = (recipesData || []).map((r) => ({
        name: r.name,
        effortTier: r.effortTier,
      }));

      const recentMeals = recentMealsData || [];
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
  }, [
    selectedWeekPlan,
    householdMembersData,
    householdMembers,
    recipesData,
    recentMealsData,
    chatMessages,
    addMessage,
    setPlanningMode,
    setIsAiThinking,
    generatePlanWithConversation,
    addMeal,
    createRecipe,
  ]);

  // Handle chat message send
  const handleSendMessage = useCallback(
    async (content: string) => {
      addMessage("user", content);

      // Pantry mode
      if (planningMode === "pantry" && selectedWeekPlan) {
        setIsAiThinking(true);

        try {
          const havePattern = /(?:i (?:have|got|do have|actually have)|take off|remove|got some)(.*)/i;
          const haveMatch = content.match(havePattern);
          const uncheckedGroceryItems = (groceryItemsData || []).filter((item) => !item.isChecked);

          if (haveMatch && uncheckedGroceryItems.length > 0) {
            const userMentionedItems = haveMatch[1].toLowerCase();
            const itemsToRemove: string[] = [];

            for (const groceryItem of uncheckedGroceryItems) {
              const itemNameLower = groceryItem.name.toLowerCase();
              const itemWords = itemNameLower.split(/\s+/);
              const hasMatch = itemWords.some((word) =>
                word.length > 2 && userMentionedItems.includes(word)
              );

              if (hasMatch || userMentionedItems.includes(itemNameLower)) {
                itemsToRemove.push(groceryItem.name);
              }
            }

            if (itemsToRemove.length > 0) {
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

      // Idle mode - switch to discuss
      if (planningMode === "idle") {
        setPlanningMode("discuss");
      }

      // Discuss mode
      if (planningMode === "discuss" || planningMode === "idle") {
        setIsAiThinking(true);
        try {
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

          for (const msg of chatMessages) {
            aiMessages.push({
              role: msg.role === "zylo" ? "assistant" : "user",
              content: msg.content,
            });
          }
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

      // Post-gen mode - meal change requests
      if (planningMode === "post-gen" && selectedWeekPlan) {
        setIsAiThinking(true);

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
            const savedRecipes = (recipesData || []).map((r) => ({
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
    },
    [
      planningMode,
      selectedWeekPlan,
      groceryItemsData,
      chatMessages,
      recipesData,
      addMessage,
      setPlanningMode,
      setIsAiThinking,
      setMissingItems,
      removeGroceryItemByName,
      analyzePantry,
      aiChat,
      updateMealFromChat,
      updateMeal,
    ]
  );

  // Handle more options (alternatives)
  const handleMoreOptions = useCallback(
    async (meal: PlannedMeal) => {
      if (!selectedWeekPlan) return;

      const now = Date.now();
      if (now - lastSuggestCallRef.current < SUGGEST_DEBOUNCE_MS) {
        return;
      }
      lastSuggestCallRef.current = now;

      setIsLoadingAlternatives(true);
      try {
        const excludeMeals = selectedWeekPlan.meals
          .map((m) => m.mealName)
          .filter((name) => name !== meal.mealName);

        const result = await suggestAlternatives({
          currentMealName: meal.mealName,
          excludeMeals,
        });

        if (result.success && result.alternatives) {
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
    },
    [selectedWeekPlan, setAlternatives, setIsLoadingAlternatives, suggestAlternatives]
  );

  // Handle generate plan (legacy)
  const handleGeneratePlan = useCallback(async () => {
    if (!selectedWeekPlan) return;

    const now = Date.now();
    if (now - lastGenerateCallRef.current < GENERATE_DEBOUNCE_MS) {
      return;
    }
    lastGenerateCallRef.current = now;

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
    } catch (error) {
      console.error("Error generating plan:", error);
      alert(formatErrorForUser("generate the plan", error));
    } finally {
      setIsGenerating(false);
    }
  }, [
    selectedWeekPlan,
    householdMembersData,
    householdMembers,
    setIsGenerating,
    generateWeekPlan,
    addMeal,
  ]);

  // Handle adding missing items to grocery list
  const handleAddMissingToGroceryList = useCallback(async () => {
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
  }, [missingItems, selectedWeekId, addMessage, setMissingItems, addGroceryItem]);

  return {
    handleQuickPlan,
    handleDiscussPlan,
    handleSendMessage,
    handleMoreOptions,
    handleGeneratePlan,
    handleAddMissingToGroceryList,
    updateMealMutation: updateMeal,
    createWeekPlanMutation: createWeekPlan,
    deleteWeekPlanMutation: deleteWeekPlan,
    addMealMutation: addMeal,
    addGroceryItemMutation: addGroceryItem,
    updateStatusMutation: updateStatus,
    createRecipeMutation: createRecipe,
    removeGroceryItemByNameMutation: removeGroceryItemByName,
  };
}
