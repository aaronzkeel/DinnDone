"use client";

import { useConvexAuth } from "convex/react";
import { SignInButton } from "@/components/SignInButton";
import { MealHelperHome } from "@/components/meal-helper";
import type { HouseholdMember, PlannedMealSummary, ChatMessage } from "@/types/meal-helper";

// Sample data - will be replaced with real data from Convex
const sampleHouseholdMembers: HouseholdMember[] = [
  { id: "hm-001", name: "Aaron", isAdmin: true },
  { id: "hm-002", name: "Katie", isAdmin: true },
  { id: "hm-003", name: "Lizzie", isAdmin: false },
  { id: "hm-004", name: "Ethan", isAdmin: false },
  { id: "hm-005", name: "Elijah", isAdmin: false },
];

const sampleTonightMeal: PlannedMealSummary = {
  id: "pm-001",
  mealName: "One-Pan Chicken & Peppers",
  effortTier: "super-easy",
  prepTime: 10,
  cookTime: 25,
  cleanupRating: "low",
  ingredients: ["Chicken thighs", "Bell peppers", "Olive oil", "Garlic", "Italian seasoning"],
  briefInstructions: "Season chicken, toss peppers in oil, roast together at 425F for 25 min.",
  isFlexMeal: false,
  assignedCookId: "hm-001",
};

// Start with empty messages to show the welcome state
const sampleMessages: ChatMessage[] = [];

export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div
        className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center font-sans"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="animate-pulse" style={{ color: "var(--color-muted)" }}>
          Loading...
        </div>
      </div>
    );
  }

  // Show sign-in page for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div
        className="flex min-h-[calc(100vh-120px)] flex-col font-sans"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <main className="flex flex-1 items-center justify-center px-4">
          <div
            className="w-full max-w-md rounded-lg p-8 text-center"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <h1
              className="text-3xl font-semibold tracking-tight font-heading mb-4"
              style={{ color: "var(--color-text)" }}
            >
              Welcome to Dinner Bell
            </h1>
            <p className="text-lg mb-8" style={{ color: "var(--color-muted)" }}>
              Your AI-powered meal planning companion
            </p>
            <SignInButton />
          </div>
        </main>
      </div>
    );
  }

  // Show MealHelperHome for authenticated users
  const currentUser = sampleHouseholdMembers[0]; // Aaron for now

  const handleThisWorks = () => {
    console.log("This works clicked");
  };

  const handleNewPlan = () => {
    console.log("New plan clicked");
  };

  const handleImWiped = () => {
    console.log("I'm wiped clicked");
  };

  const handleOpenInventoryCheck = () => {
    console.log("Opening inventory check");
  };

  const handleSendMessage = (content: string) => {
    console.log("Message sent:", content);
  };

  const handleVoiceInput = () => {
    console.log("Voice input clicked");
  };

  return (
    <MealHelperHome
      currentUser={currentUser}
      tonightMeal={sampleTonightMeal}
      householdMembers={sampleHouseholdMembers}
      messages={sampleMessages}
      onThisWorks={handleThisWorks}
      onNewPlan={handleNewPlan}
      onImWiped={handleImWiped}
      onOpenInventoryCheck={handleOpenInventoryCheck}
      onSendMessage={handleSendMessage}
      onVoiceInput={handleVoiceInput}
    />
  );
}
