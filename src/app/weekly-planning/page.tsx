"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { WeekPlanView, EditDayModal, PantryAudit } from "@/components/weekly-planning";
import { RequireAuth } from "@/components/RequireAuth";
import type {
  HouseholdMember,
  WeekSummary,
  WeekPlan,
  PlannedMeal,
  MealAlternative,
  PantryCheckItem,
} from "@/types/weekly-planning";

// Sample data - will be replaced with Convex queries
const householdMembers: HouseholdMember[] = [
  { id: "hm-001", name: "Aaron", isAdmin: true },
  { id: "hm-002", name: "Katie", isAdmin: true },
  { id: "hm-003", name: "Lizzie", isAdmin: false },
  { id: "hm-004", name: "Ethan", isAdmin: false },
  { id: "hm-005", name: "Elijah", isAdmin: false },
];

const availableWeeks: WeekSummary[] = [
  {
    id: "wp-001",
    weekStartDate: "2024-01-15",
    label: "This Week",
    status: "draft",
  },
  {
    id: "wp-002",
    weekStartDate: "2024-01-22",
    label: "Next Week",
    status: "approved",
  },
  {
    id: "wp-003",
    weekStartDate: "2024-01-29",
    label: "Jan 29 - Feb 4",
    status: "draft",
  },
];

const weekPlans: Record<string, WeekPlan> = {
  "wp-001": {
    id: "wp-001",
    weekStartDate: "2024-01-15",
    status: "draft",
    meals: [
      {
        id: "pm-001",
        date: "2024-01-15",
        dayOfWeek: "Monday",
        mealName: "Sheet Pan Salmon & Asparagus",
        effortTier: "super-easy",
        prepTime: 10,
        cookTime: 20,
        cleanupRating: "low",
        assignedCookId: "hm-001",
        eaterIds: ["hm-001", "hm-002", "hm-003", "hm-004", "hm-005"],
        servings: 5,
        ingredients: [
          "Salmon fillets",
          "Asparagus",
          "Lemon",
          "Olive oil",
          "Dill",
        ],
        isFlexMeal: false,
        isUnplanned: false,
      },
      {
        id: "pm-002",
        date: "2024-01-16",
        dayOfWeek: "Tuesday",
        mealName: "Taco Tuesday",
        effortTier: "super-easy",
        prepTime: 10,
        cookTime: 15,
        cleanupRating: "medium",
        assignedCookId: "hm-002",
        eaterIds: ["hm-001", "hm-002", "hm-003", "hm-004", "hm-005"],
        servings: 6,
        ingredients: [
          "Ground turkey",
          "Taco seasoning",
          "Tortillas",
          "Cheese",
          "Lettuce",
          "Tomato",
          "Sour cream",
        ],
        isFlexMeal: true,
        isUnplanned: false,
      },
      {
        id: "pm-003",
        date: "2024-01-17",
        dayOfWeek: "Wednesday",
        mealName: "Mom's Chicken Stir Fry",
        effortTier: "middle",
        prepTime: 20,
        cookTime: 15,
        cleanupRating: "medium",
        assignedCookId: "hm-002",
        eaterIds: ["hm-002", "hm-003", "hm-004", "hm-005"],
        servings: 4,
        ingredients: [
          "Chicken breast",
          "Broccoli",
          "Carrots",
          "Soy sauce",
          "Ginger",
          "Garlic",
          "Rice",
        ],
        isFlexMeal: true,
        isUnplanned: false,
      },
      {
        id: "pm-004",
        date: "2024-01-18",
        dayOfWeek: "Thursday",
        mealName: "Turkey Spinach Skillet",
        effortTier: "super-easy",
        prepTime: 5,
        cookTime: 15,
        cleanupRating: "low",
        assignedCookId: "hm-001",
        eaterIds: ["hm-001", "hm-002", "hm-003", "hm-004", "hm-005"],
        servings: 5,
        ingredients: ["Ground turkey", "Spinach", "Garlic", "Onion", "Rice"],
        isFlexMeal: true,
        isUnplanned: false,
      },
      {
        id: "pm-005",
        date: "2024-01-19",
        dayOfWeek: "Friday",
        mealName: "Pizza Night",
        effortTier: "super-easy",
        prepTime: 5,
        cookTime: 0,
        cleanupRating: "low",
        assignedCookId: "hm-001",
        eaterIds: ["hm-001", "hm-002", "hm-003", "hm-004", "hm-005"],
        servings: 5,
        ingredients: ["Order from Luigi's (gluten-free option for Lizzie)"],
        isFlexMeal: false,
        isUnplanned: false,
      },
      {
        id: "pm-006",
        date: "2024-01-20",
        dayOfWeek: "Saturday",
        mealName: "Grilled Salmon Burgers",
        effortTier: "middle",
        prepTime: 15,
        cookTime: 10,
        cleanupRating: "medium",
        assignedCookId: "hm-001",
        eaterIds: ["hm-001", "hm-002", "hm-003", "hm-004", "hm-005"],
        servings: 5,
        ingredients: [
          "Salmon",
          "Burger buns",
          "Lettuce",
          "Tomato",
          "Avocado",
          "Sweet potato fries",
        ],
        isFlexMeal: false,
        isUnplanned: false,
      },
      {
        id: "pm-007",
        date: "2024-01-21",
        dayOfWeek: "Sunday",
        mealName: "Slow Cooker Pot Roast",
        effortTier: "more-prep",
        prepTime: 25,
        cookTime: 480,
        cleanupRating: "medium",
        assignedCookId: "hm-002",
        eaterIds: ["hm-002", "hm-003", "hm-004", "hm-005"],
        servings: 4,
        ingredients: [
          "Beef roast",
          "Potatoes",
          "Carrots",
          "Onion",
          "Beef broth",
          "Herbs",
        ],
        isFlexMeal: false,
        isUnplanned: false,
      },
    ],
  },
  "wp-002": {
    id: "wp-002",
    weekStartDate: "2024-01-22",
    status: "approved",
    approvedBy: "hm-001",
    approvedAt: "2024-01-14T19:00:00Z",
    meals: [
      {
        id: "pm-008",
        date: "2024-01-22",
        dayOfWeek: "Monday",
        mealName: "Lemon Herb Salmon",
        effortTier: "super-easy",
        prepTime: 10,
        cookTime: 20,
        cleanupRating: "low",
        assignedCookId: "hm-001",
        eaterIds: ["hm-001", "hm-002", "hm-003", "hm-004", "hm-005"],
        servings: 5,
        ingredients: ["Salmon", "Lemon", "Herbs", "Olive oil"],
        isFlexMeal: false,
        isUnplanned: false,
      },
      {
        id: "pm-009",
        date: "2024-01-23",
        dayOfWeek: "Tuesday",
        mealName: "Taco Tuesday",
        effortTier: "super-easy",
        prepTime: 10,
        cookTime: 15,
        cleanupRating: "medium",
        assignedCookId: "hm-002",
        eaterIds: ["hm-001", "hm-002", "hm-003", "hm-004", "hm-005"],
        servings: 6,
        ingredients: [
          "Ground turkey",
          "Taco seasoning",
          "Tortillas",
          "Toppings",
        ],
        isFlexMeal: true,
        isUnplanned: false,
      },
      {
        id: "pm-010",
        date: "2024-01-24",
        dayOfWeek: "Wednesday",
        mealName: "Pasta Primavera",
        effortTier: "middle",
        prepTime: 15,
        cookTime: 20,
        cleanupRating: "medium",
        assignedCookId: "hm-002",
        eaterIds: ["hm-001", "hm-002", "hm-003", "hm-004", "hm-005"],
        servings: 5,
        ingredients: ["Pasta", "Seasonal vegetables", "Olive oil", "Parmesan"],
        isFlexMeal: true,
        isUnplanned: false,
      },
      {
        id: "pm-011",
        date: "2024-01-25",
        dayOfWeek: "Thursday",
        mealName: "Black Bean Quesadillas",
        effortTier: "super-easy",
        prepTime: 5,
        cookTime: 10,
        cleanupRating: "low",
        assignedCookId: "hm-001",
        eaterIds: ["hm-001", "hm-002", "hm-003", "hm-004", "hm-005"],
        servings: 5,
        ingredients: ["Tortillas", "Black beans", "Cheese", "Salsa"],
        isFlexMeal: true,
        isUnplanned: false,
      },
      {
        id: "pm-012",
        date: "2024-01-26",
        dayOfWeek: "Friday",
        mealName: "Pizza Night",
        effortTier: "super-easy",
        prepTime: 5,
        cookTime: 0,
        cleanupRating: "low",
        assignedCookId: "hm-001",
        eaterIds: ["hm-001", "hm-002", "hm-003", "hm-004", "hm-005"],
        servings: 5,
        ingredients: ["Order from Luigi's"],
        isFlexMeal: false,
        isUnplanned: false,
      },
      {
        id: "pm-013",
        date: "2024-01-27",
        dayOfWeek: "Saturday",
        mealName: "Grilled Fish Tacos",
        effortTier: "middle",
        prepTime: 15,
        cookTime: 15,
        cleanupRating: "medium",
        assignedCookId: "hm-001",
        eaterIds: ["hm-001", "hm-002", "hm-003", "hm-004", "hm-005"],
        servings: 5,
        ingredients: ["White fish", "Tortillas", "Cabbage", "Lime crema"],
        isFlexMeal: false,
        isUnplanned: false,
      },
      {
        id: "pm-014",
        date: "2024-01-28",
        dayOfWeek: "Sunday",
        mealName: "Roast Chicken & Vegetables",
        effortTier: "more-prep",
        prepTime: 20,
        cookTime: 60,
        cleanupRating: "medium",
        assignedCookId: "hm-002",
        eaterIds: ["hm-002", "hm-003", "hm-004", "hm-005"],
        servings: 4,
        ingredients: [
          "Whole chicken",
          "Potatoes",
          "Carrots",
          "Onion",
          "Herbs",
        ],
        isFlexMeal: false,
        isUnplanned: false,
      },
    ],
  },
  "wp-003": {
    id: "wp-003",
    weekStartDate: "2024-01-29",
    status: "draft",
    meals: [],
  },
};

// Current user - will be replaced with auth
const currentUser: HouseholdMember = {
  id: "hm-001",
  name: "Aaron",
  isAdmin: true,
};

// Sample alternatives for swapping meals
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
  const [selectedWeekId, setSelectedWeekId] = useState("wp-001");
  const [selectedMeal, setSelectedMeal] = useState<PlannedMeal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [localWeekPlans, setLocalWeekPlans] = useState(weekPlans);
  const [showPantryAudit, setShowPantryAudit] = useState(false);
  const [pantryItems, setPantryItems] = useState<PantryCheckItem[]>([]);

  const generateWeekPlan = useAction(api.ai.generateWeekPlan);

  const selectedWeekPlan = localWeekPlans[selectedWeekId] || localWeekPlans["wp-001"];

  const handleSelectWeek = (weekId: string) => {
    setSelectedWeekId(weekId);
  };

  const handleSelectMeal = (mealId: string) => {
    const meal = selectedWeekPlan.meals.find((m) => m.id === mealId);
    if (meal) {
      setSelectedMeal(meal);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMeal(null);
  };

  const handleChangeCook = (newCookId: string) => {
    console.log("Change cook to:", newCookId);
    // TODO: Implement cook change with Convex mutation
  };

  const handleToggleEater = (memberId: string) => {
    console.log("Toggle eater:", memberId);
    // TODO: Implement eater toggle with Convex mutation
  };

  const handleSelectAlternative = (alternativeId: string) => {
    console.log("Selected alternative:", alternativeId);
    handleCloseModal();
    // TODO: Implement meal swap with Convex mutation
  };

  const handleMoreOptions = () => {
    console.log("More options requested");
    // TODO: Show more options from AI
  };

  const handleUnplan = () => {
    console.log("Unplan meal");
    handleCloseModal();
    // TODO: Mark meal as unplanned with Convex mutation
  };

  const handleApprovePlan = () => {
    // Update local state to mark plan as approved
    setLocalWeekPlans((prev) => ({
      ...prev,
      [selectedWeekId]: {
        ...prev[selectedWeekId],
        status: "approved" as const,
        approvedBy: currentUser.id,
        approvedAt: new Date().toISOString(),
      },
    }));
    console.log("Plan approved:", selectedWeekId);

    // Extract unique ingredients from all meals in the week to create pantry items
    const allIngredients = selectedWeekPlan.meals.flatMap((meal) => meal.ingredients);
    const uniqueIngredients = [...new Set(allIngredients)];

    // Create pantry check items from ingredients
    const items: PantryCheckItem[] = uniqueIngredients.map((ingredient, index) => ({
      id: `pantry-${index}`,
      name: ingredient,
      alreadyHave: false,
    }));

    setPantryItems(items);
    setShowPantryAudit(true);
  };

  const handleAddWeek = () => {
    // TODO: Call Convex mutation to generate new week
    console.log("Add new week");
  };

  const handlePantryAudit = () => {
    // Extract unique ingredients from all meals in the week to create pantry items
    const allIngredients = selectedWeekPlan.meals.flatMap((meal) => meal.ingredients);
    const uniqueIngredients = [...new Set(allIngredients)];

    // Create pantry check items from ingredients
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
    // TODO: Generate grocery list from unchecked items
    const uncheckedItems = pantryItems.filter((item) => !item.alreadyHave);
    console.log("Items to add to grocery list:", uncheckedItems.map((i) => i.name));
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const result = await generateWeekPlan({
        weekStartDate: selectedWeekPlan.weekStartDate,
        householdSize: householdMembers.length,
      });

      if (result.success && result.meals) {
        // Convert AI meals to PlannedMeal format
        const newMeals: PlannedMeal[] = result.meals.map((meal, index) => ({
          id: `pm-gen-${selectedWeekId}-${index}`,
          date: meal.date,
          dayOfWeek: meal.dayOfWeek,
          mealName: meal.mealName,
          effortTier: meal.effortTier,
          prepTime: meal.prepTime,
          cookTime: meal.cookTime,
          cleanupRating: meal.cleanupRating,
          assignedCookId: householdMembers[index % 2]?.id || "hm-001", // Alternate between first two members
          eaterIds: householdMembers.map((m) => m.id),
          servings: householdMembers.length,
          ingredients: meal.ingredients,
          isFlexMeal: meal.isFlexMeal,
          isUnplanned: false,
        }));

        // Update local state with new meals
        setLocalWeekPlans((prev) => ({
          ...prev,
          [selectedWeekId]: {
            ...prev[selectedWeekId],
            meals: newMeals,
          },
        }));
      } else {
        console.error("Failed to generate plan:", result.error);
        alert("Failed to generate plan: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error generating plan:", error);
      alert("Error generating plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // If pantry audit is showing, render it instead of the week plan view
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
