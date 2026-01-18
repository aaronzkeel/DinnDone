"use client";

import { useState } from "react";
import { MealHelperHome, MealOptionDetails, EmergencyExit, WeekSwapList } from "@/components/meal-helper";
import { RequireAuth } from "@/components/RequireAuth";
import type {
  HouseholdMember,
  PlannedMealSummary,
  ChatMessage,
} from "@/types/meal-helper";

// Sample data for initial UI (will be replaced with real data from Convex)
const sampleUser: HouseholdMember = {
  id: "1",
  name: "Aaron",
  isAdmin: true,
};

const sampleHouseholdMembers: HouseholdMember[] = [
  { id: "1", name: "Aaron", isAdmin: true },
  { id: "2", name: "Katie", isAdmin: true },
  { id: "3", name: "Lizzie", isAdmin: false },
  { id: "4", name: "Ethan", isAdmin: false },
  { id: "5", name: "Elijah", isAdmin: false },
];

const sampleTonightMeal: PlannedMealSummary = {
  id: "1",
  mealName: "Chicken Stir Fry",
  effortTier: "middle",
  prepTime: 15,
  cookTime: 20,
  cleanupRating: "medium",
  ingredients: [
    "Chicken breast",
    "Bell peppers",
    "Broccoli",
    "Soy sauce",
    "Garlic",
    "Ginger",
    "Rice",
  ],
  isFlexMeal: true,
  assignedCookId: "2",
};

// Sample week meals for swap list
const sampleWeekMeals: Array<PlannedMealSummary & { dayLabel: string }> = [
  {
    id: "1",
    dayLabel: "Monday (Tonight)",
    mealName: "Chicken Stir Fry",
    effortTier: "middle",
    prepTime: 15,
    cookTime: 20,
    cleanupRating: "medium",
    ingredients: ["Chicken breast", "Bell peppers", "Broccoli", "Soy sauce"],
    isFlexMeal: true,
    assignedCookId: "2",
  },
  {
    id: "2",
    dayLabel: "Tuesday",
    mealName: "Taco Night",
    effortTier: "super-easy",
    prepTime: 10,
    cookTime: 15,
    cleanupRating: "low",
    ingredients: ["Ground beef", "Taco shells", "Cheese", "Lettuce", "Salsa"],
    isFlexMeal: false,
    assignedCookId: "1",
  },
  {
    id: "3",
    dayLabel: "Wednesday",
    mealName: "Spaghetti Bolognese",
    effortTier: "middle",
    prepTime: 15,
    cookTime: 30,
    cleanupRating: "medium",
    ingredients: ["Ground beef", "Pasta", "Tomato sauce", "Onion", "Garlic"],
    isFlexMeal: false,
    assignedCookId: "2",
  },
  {
    id: "4",
    dayLabel: "Thursday",
    mealName: "Grilled Salmon",
    effortTier: "middle",
    prepTime: 10,
    cookTime: 20,
    cleanupRating: "low",
    ingredients: ["Salmon fillets", "Lemon", "Asparagus", "Olive oil"],
    isFlexMeal: false,
    assignedCookId: "1",
  },
  {
    id: "5",
    dayLabel: "Friday",
    mealName: "Pizza Night",
    effortTier: "super-easy",
    prepTime: 5,
    cookTime: 20,
    cleanupRating: "low",
    ingredients: ["Pizza dough", "Mozzarella", "Pepperoni", "Tomato sauce"],
    isFlexMeal: true,
    assignedCookId: "2",
  },
  {
    id: "6",
    dayLabel: "Saturday",
    mealName: "Beef Stew",
    effortTier: "more-prep",
    prepTime: 30,
    cookTime: 120,
    cleanupRating: "medium",
    ingredients: ["Beef chuck", "Potatoes", "Carrots", "Onions", "Beef broth"],
    isFlexMeal: false,
    assignedCookId: "1",
  },
  {
    id: "7",
    dayLabel: "Sunday",
    mealName: "Roast Chicken",
    effortTier: "more-prep",
    prepTime: 20,
    cookTime: 90,
    cleanupRating: "high",
    ingredients: ["Whole chicken", "Potatoes", "Carrots", "Herbs", "Butter"],
    isFlexMeal: false,
    assignedCookId: "2",
  },
];

// View states for the meal helper page
type ViewState = "home" | "meal-details" | "emergency-exit" | "week-swap";

export default function MealHelperPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>("home");

  const handleThisWorks = () => {
    // Open MealOptionDetails screen when "This works" is tapped
    setCurrentView("meal-details");
  };

  const handleNewPlan = () => {
    // Open WeekSwapList screen when "New plan" is tapped
    setCurrentView("week-swap");
  };

  const handleImWiped = () => {
    // Open EmergencyExit screen when "I'm wiped" is tapped
    setCurrentView("emergency-exit");
  };

  const handleEmergencyOption = (optionId: string) => {
    // Map option IDs to friendly names
    const optionNames: Record<string, string> = {
      leftovers: "leftovers night",
      freezer: "something from the freezer",
      takeout: "grabbing takeout",
    };
    const optionName = optionNames[optionId] || optionId;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "zylo",
      content: `Perfect! ${optionName.charAt(0).toUpperCase() + optionName.slice(1)} it is. No judgment, just fed. That's a win! 💛`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setCurrentView("home");
  };

  const handleOpenInventoryCheck = () => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "zylo",
      content: "Let's do a quick inventory check! What do you see in the fridge right now?",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate Zylo response
    setTimeout(() => {
      const zyloMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "zylo",
        content: "Got it! Let me think about that... Based on what you've told me, I'd suggest keeping tonight's plan. The stir fry is quick and everyone likes it!",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, zyloMessage]);
    }, 1000);
  };

  const handleVoiceInput = () => {
    console.log("Voice input triggered");
    // TODO: Implement voice input
  };

  const handleBack = () => {
    setCurrentView("home");
  };

  const handleCookThis = () => {
    // Add confirmation message and return to home view
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "zylo",
      content: "Great choice! Chicken Stir Fry it is. Katie's on cooking duty tonight. Need the recipe or shopping list?",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setCurrentView("home");
  };

  const handleIngredientCheck = (response: "yes" | "not-sure" | "no") => {
    let message = "";
    switch (response) {
      case "yes":
        message = "Perfect! You're all set. Let me know if you need the recipe steps.";
        break;
      case "not-sure":
        message = "No worries! Let's do a quick pantry check. I'll walk you through the ingredients.";
        break;
      case "no":
        message = "Got it! I'll add the missing ingredients to your grocery list. Would you like me to check what you need?";
        break;
    }
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "zylo",
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setCurrentView("home");
  };

  const handleSwapMealSelect = (mealId: string) => {
    // Find the selected meal to get its name
    const selectedMeal = sampleWeekMeals.find((m) => m.id === mealId);
    const mealName = selectedMeal?.mealName || "the selected meal";

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "zylo",
      content: `Great choice! I've swapped tonight's meal to ${mealName}. The original meal has been moved to later in the week.`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setCurrentView("home");
  };

  // Render WeekSwapList when "New plan" is clicked
  if (currentView === "week-swap") {
    return (
      <RequireAuth>
        <WeekSwapList
          meals={sampleWeekMeals}
          currentMealId={sampleTonightMeal.id}
          onSelect={handleSwapMealSelect}
          onBack={handleBack}
        />
      </RequireAuth>
    );
  }

  // Render MealOptionDetails when "This works" is clicked
  if (currentView === "meal-details") {
    return (
      <RequireAuth>
        <MealOptionDetails
          meal={sampleTonightMeal}
          householdMembers={sampleHouseholdMembers}
          onBack={handleBack}
          onCookThis={handleCookThis}
          onIngredientCheck={handleIngredientCheck}
        />
      </RequireAuth>
    );
  }

  // Render EmergencyExit when "I'm wiped" is clicked
  if (currentView === "emergency-exit") {
    return (
      <RequireAuth>
        <EmergencyExit
          onBack={handleBack}
          onChooseOption={handleEmergencyOption}
        />
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <MealHelperHome
        currentUser={sampleUser}
        tonightMeal={sampleTonightMeal}
        householdMembers={sampleHouseholdMembers}
        messages={messages}
        onThisWorks={handleThisWorks}
        onNewPlan={handleNewPlan}
        onImWiped={handleImWiped}
        onOpenInventoryCheck={handleOpenInventoryCheck}
        onSendMessage={handleSendMessage}
        onVoiceInput={handleVoiceInput}
      />
    </RequireAuth>
  );
}
