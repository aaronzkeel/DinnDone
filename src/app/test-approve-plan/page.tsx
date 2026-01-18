"use client";

import { useState } from "react";
import { WeekPlanView } from "@/components/weekly-planning";
import type {
  HouseholdMember,
  WeekSummary,
  WeekPlan,
  PlannedMeal,
} from "@/types/weekly-planning";

// Sample data
const householdMembers: HouseholdMember[] = [
  { id: "hm-001", name: "Aaron", isAdmin: true },
  { id: "hm-002", name: "Katie", isAdmin: true },
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
      eaterIds: ["hm-001", "hm-002"],
      servings: 2,
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
      eaterIds: ["hm-001", "hm-002"],
      servings: 2,
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
      eaterIds: ["hm-001", "hm-002"],
      servings: 2,
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
      eaterIds: ["hm-001", "hm-002"],
      servings: 2,
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
      eaterIds: ["hm-001", "hm-002"],
      servings: 2,
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
      eaterIds: ["hm-001", "hm-002"],
      servings: 2,
      ingredients: ["Beef roast", "Potatoes", "Carrots", "Onion", "Broth"],
      isFlexMeal: false,
      isUnplanned: false,
    },
  ],
};

const currentUser: HouseholdMember = {
  id: "hm-001",
  name: "Aaron",
  isAdmin: true,
};

export default function TestApprovePlanPage() {
  const [weekPlan, setWeekPlan] = useState<WeekPlan>(initialWeekPlan);

  const handleApprovePlan = () => {
    setWeekPlan((prev) => ({
      ...prev,
      status: "approved",
      approvedBy: currentUser.id,
      approvedAt: new Date().toISOString(),
    }));
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
    console.log("Pantry audit");
  };

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "calc(100vh - 120px)" }}>
      <div className="p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <h1 className="font-heading font-bold text-lg" style={{ color: "var(--color-text)" }}>
          Test: Approve Plan (Feature #126)
        </h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Testing "Looks good" button approves plan
        </p>
        <div
          className="mt-2 p-2 rounded-lg text-sm"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <strong>Current Status:</strong>{" "}
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
