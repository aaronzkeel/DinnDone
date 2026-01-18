"use client";

import { useState } from "react";
import { WeekPlanView } from "@/components/weekly-planning";
import type {
  HouseholdMember,
  WeekSummary,
  WeekPlan,
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

export default function WeeklyPlanningPage() {
  const [selectedWeekId, setSelectedWeekId] = useState("wp-001");

  const selectedWeekPlan = weekPlans[selectedWeekId] || weekPlans["wp-001"];

  const handleSelectWeek = (weekId: string) => {
    setSelectedWeekId(weekId);
  };

  const handleSelectMeal = (mealId: string) => {
    // TODO: Open meal detail/edit modal
    console.log("Selected meal:", mealId);
  };

  const handleApprovePlan = () => {
    // TODO: Call Convex mutation to approve plan
    console.log("Approve plan:", selectedWeekId);
  };

  const handleAddWeek = () => {
    // TODO: Call Convex mutation to generate new week
    console.log("Add new week");
  };

  const handlePantryAudit = () => {
    // TODO: Open pantry audit modal
    console.log("Open pantry audit");
  };

  return (
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
      />
    </div>
  );
}
