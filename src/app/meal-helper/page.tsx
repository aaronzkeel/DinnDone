"use client";

import { useState } from "react";
import { MealHelperHome, MealOptionDetails } from "@/components/meal-helper";
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

// View states for the meal helper page
type ViewState = "home" | "meal-details";

export default function MealHelperPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>("home");

  const handleThisWorks = () => {
    // Open MealOptionDetails screen when "This works" is tapped
    setCurrentView("meal-details");
  };

  const handleNewPlan = () => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "zylo",
      content: "No problem! Let me show you some other options from this week's plan that we could swap in.",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleImWiped = () => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "zylo",
      content: "I totally get it! Here are some zero-effort options: 1) Order in from your favorite spot, 2) Cereal night (kids love it), 3) Frozen pizza emergency stash. No judgment here! 💛",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
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
