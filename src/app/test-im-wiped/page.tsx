"use client";

import { useState } from "react";
import { MealHelperHome, EmergencyExit } from "@/components/meal-helper";
import type {
  HouseholdMember,
  PlannedMealSummary,
  ChatMessage,
} from "@/types/meal-helper";

// Sample data
const sampleUser: HouseholdMember = {
  id: "1",
  name: "Aaron",
  isAdmin: true,
};

const sampleHouseholdMembers: HouseholdMember[] = [
  { id: "1", name: "Aaron", isAdmin: true },
  { id: "2", name: "Katie", isAdmin: true },
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

type ViewState = "home" | "emergency-exit";

export default function TestImWipedPage() {
  const [view, setView] = useState<ViewState>("home");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleImWiped = () => {
    // Feature #71: Open EmergencyExit screen when "I'm wiped" is tapped
    setView("emergency-exit");
  };

  const handleBack = () => {
    setView("home");
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
      content: `Perfect! ${optionName.charAt(0).toUpperCase() + optionName.slice(1)} it is. No judgment, just fed. That is a win!`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setView("home");
  };

  const handleNewPlan = () => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "zylo",
      content:
        "No problem! Let me show you some other options from this week that we could swap in.",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
  };

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg)",
        minHeight: "calc(100vh - 120px)",
      }}
    >
      <div
        className="p-4 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h1
          className="font-heading font-bold text-lg"
          style={{ color: "var(--color-text)" }}
        >
          Test: I am wiped Button (Feature #71)
        </h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Current view:{" "}
          <span style={{ fontWeight: "bold" }}>
            {view === "home" ? "MealHelperHome" : "EmergencyExit"}
          </span>
        </p>
      </div>

      {view === "home" ? (
        <MealHelperHome
          currentUser={sampleUser}
          tonightMeal={sampleTonightMeal}
          householdMembers={sampleHouseholdMembers}
          messages={messages}
          onThisWorks={() => {}}
          onNewPlan={handleNewPlan}
          onImWiped={handleImWiped}
          onOpenInventoryCheck={() => {}}
          onSendMessage={handleSendMessage}
          onVoiceInput={() => {}}
        />
      ) : (
        <EmergencyExit
          onBack={handleBack}
          onChooseOption={handleEmergencyOption}
        />
      )}
    </div>
  );
}
