"use client";

import { useState } from "react";
import { WeekPlanView, PantryAudit } from "@/components/weekly-planning";
import type {
  HouseholdMember,
  WeekSummary,
  WeekPlan,
  PantryCheckItem,
} from "@/types/weekly-planning";

// Sample data - full family for testing eater display
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
];

const initialWeekPlan: WeekPlan = {
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
      ingredients: ["Salmon fillets", "Asparagus", "Lemon", "Olive oil"],
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
      eaterIds: ["hm-001", "hm-002", "hm-003", "hm-004"],
      servings: 4,
      ingredients: ["Ground turkey", "Taco seasoning", "Tortillas", "Cheese"],
      isFlexMeal: true,
      isUnplanned: false,
    },
    {
      id: "pm-003",
      date: "2024-01-17",
      dayOfWeek: "Wednesday",
      mealName: "Pasta Primavera",
      effortTier: "middle",
      prepTime: 15,
      cookTime: 20,
      cleanupRating: "medium",
      assignedCookId: "hm-001",
      eaterIds: ["hm-001", "hm-002", "hm-003"],
      servings: 3,
      ingredients: ["Pasta", "Vegetables", "Olive oil", "Parmesan"],
      isFlexMeal: false,
      isUnplanned: false,
    },
    {
      id: "pm-004",
      date: "2024-01-18",
      dayOfWeek: "Thursday",
      mealName: "Chicken Stir Fry",
      effortTier: "middle",
      prepTime: 20,
      cookTime: 15,
      cleanupRating: "medium",
      assignedCookId: "hm-002",
      eaterIds: ["hm-002", "hm-003", "hm-004", "hm-005"],
      servings: 4,
      ingredients: ["Chicken breast", "Broccoli", "Soy sauce", "Rice"],
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
      ingredients: ["Order from Luigi's"],
      isFlexMeal: false,
      isUnplanned: false,
    },
    {
      id: "pm-006",
      date: "2024-01-20",
      dayOfWeek: "Saturday",
      mealName: "Grilled Burgers",
      effortTier: "middle",
      prepTime: 15,
      cookTime: 10,
      cleanupRating: "medium",
      assignedCookId: "hm-001",
      eaterIds: ["hm-001", "hm-002"],
      servings: 2,
      ingredients: ["Ground beef", "Buns", "Cheese", "Lettuce", "Tomato"],
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
      ingredients: ["Beef roast", "Potatoes", "Carrots", "Onion", "Broth"],
      isFlexMeal: false,
      isUnplanned: false,
    },
  ],
};

// Extract all unique ingredients from the week's meals
function extractIngredientsFromMeals(meals: typeof initialWeekPlan.meals): PantryCheckItem[] {
  const ingredientSet = new Set<string>();

  meals.forEach(meal => {
    meal.ingredients.forEach(ingredient => {
      // Skip special entries like "Order from Luigi's"
      if (!ingredient.toLowerCase().includes("order from")) {
        ingredientSet.add(ingredient);
      }
    });
  });

  // Convert to PantryCheckItem array with unique IDs
  return Array.from(ingredientSet).map((name, index) => ({
    id: `ingredient-${index}`,
    name,
    alreadyHave: false,
  }));
}

// Get pantry items from the week's planned meals
const initialPantryItems: PantryCheckItem[] = extractIngredientsFromMeals(initialWeekPlan.meals);

type ViewState = "week-plan" | "pantry-audit";

export default function TestApprovePlanPage() {
  const [weekPlan, setWeekPlan] = useState<WeekPlan>(initialWeekPlan);
  const [view, setView] = useState<ViewState>("week-plan");
  const [pantryItems, setPantryItems] = useState<PantryCheckItem[]>(initialPantryItems);
  const [isAdminMode, setIsAdminMode] = useState(true);

  // Current user changes based on admin toggle
  const currentUser: HouseholdMember = {
    id: isAdminMode ? "hm-001" : "hm-003",
    name: isAdminMode ? "Aaron" : "Tommy (kid)",
    isAdmin: isAdminMode,
  };

  const handleApprovePlan = () => {
    // Approve the plan
    setWeekPlan((prev) => ({
      ...prev,
      status: "approved",
      approvedBy: currentUser.id,
      approvedAt: new Date().toISOString(),
    }));
    // Open pantry audit screen
    setView("pantry-audit");
  };

  const handleSelectWeek = () => {
    // Only one week in this test
  };

  const handleSelectMeal = (mealId: string) => {
    console.log("Selected meal:", mealId);
  };

  const handleAddWeek = () => {
    console.log("Add week");
  };

  const handlePantryAudit = () => {
    setView("pantry-audit");
  };

  const handleTogglePantryItem = (itemId: string) => {
    setPantryItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, alreadyHave: !item.alreadyHave } : item
      )
    );
  };

  const handlePantryAuditComplete = () => {
    setView("week-plan");
  };

  // Show PantryAudit screen after approval
  if (view === "pantry-audit") {
    return (
      <div style={{ backgroundColor: "var(--color-bg)", minHeight: "calc(100vh - 120px)" }}>
        <div className="p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
          <h1 className="font-heading font-bold text-lg" style={{ color: "var(--color-text)" }}>
            Test: Approve Plan (Feature #127)
          </h1>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Pantry Audit opened after plan approval
          </p>
          <div
            className="mt-2 p-2 rounded-lg text-sm"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <strong>Plan Status:</strong>{" "}
            <span style={{ color: "var(--color-secondary)", fontWeight: "bold" }}>
              APPROVED
            </span>
            <span style={{ color: "var(--color-muted)", marginLeft: "8px" }}>
              - Now showing Pantry Audit
            </span>
          </div>
        </div>
        <PantryAudit
          items={pantryItems}
          onToggleItem={handleTogglePantryItem}
          onComplete={handlePantryAuditComplete}
        />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "calc(100vh - 120px)" }}>
      <div className="p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <h1 className="font-heading font-bold text-lg" style={{ color: "var(--color-text)" }}>
          Test: Approve Plan (Feature #126, #127, #137)
        </h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Click &quot;Looks good&quot; to approve plan and trigger Pantry Audit
        </p>

        {/* User type toggle - Feature #137 */}
        <div
          className="mt-2 p-2 rounded-lg text-sm flex items-center justify-between"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div>
            <strong>Current User:</strong>{" "}
            <span style={{ color: "var(--color-text)" }}>{currentUser.name}</span>
            <span
              className="ml-2 px-2 py-0.5 rounded text-xs"
              style={{
                backgroundColor: isAdminMode ? "var(--color-secondary)" : "var(--color-muted)",
                color: "white",
              }}
            >
              {isAdminMode ? "Admin" : "Viewer"}
            </span>
          </div>
          <button
            onClick={() => setIsAdminMode(!isAdminMode)}
            className="px-3 py-1 rounded text-sm font-medium"
            style={{
              backgroundColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            Switch to {isAdminMode ? "Kid" : "Admin"}
          </button>
        </div>

        <div
          className="mt-2 p-2 rounded-lg text-sm"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <strong>Plan Status:</strong>{" "}
          <span
            style={{
              color: weekPlan.status === "approved" ? "var(--color-secondary)" : "var(--color-primary)",
              fontWeight: "bold",
            }}
          >
            {weekPlan.status.toUpperCase()}
          </span>
          {weekPlan.approvedAt && (
            <span style={{ color: "var(--color-muted)", marginLeft: "8px" }}>
              (Approved at {new Date(weekPlan.approvedAt).toLocaleTimeString()})
            </span>
          )}
        </div>
      </div>
      <WeekPlanView
        currentUser={currentUser}
        availableWeeks={availableWeeks.map((w) => ({ ...w, status: weekPlan.status }))}
        selectedWeekPlan={weekPlan}
        householdMembers={householdMembers}
        onSelectWeek={handleSelectWeek}
        onSelectMeal={handleSelectMeal}
        onApprovePlan={handleApprovePlan}
        onAddWeek={handleAddWeek}
        onTapMeal={handleSelectMeal}
        onPantryAudit={handlePantryAudit}
      />
    </div>
  );
}
