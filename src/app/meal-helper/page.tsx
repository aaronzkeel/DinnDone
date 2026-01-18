"use client";

import { useState } from "react";
import { MealHelperHome } from "@/components/meal-helper";
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

export default function MealHelperPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleThisWorks = () => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "zylo",
      content: "Great choice! Chicken Stir Fry it is. Katie's on cooking duty tonight. Need the recipe or shopping list?",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
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
