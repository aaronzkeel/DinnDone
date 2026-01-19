"use client";

import { useState } from "react";
import { MealHelperHome, EmergencyExit } from "@/components/meal-helper";
import type { HouseholdMember, ChatMessage } from "@/types/meal-helper";

// Sample user for testing
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

type ViewState = "home" | "emergency-exit";

/**
 * Test page for Feature #95: Empty state when no plan exists
 *
 * This page simulates the Meal Helper view when no weekly plan exists.
 * Expected behavior:
 * - Message: "No meal planned for tonight"
 * - CTA: "Go to Weekly Planning" link
 * - "I'm wiped" option still available
 * - No broken UI or errors
 */
export default function TestMealHelperEmptyPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>("home");

  const handleImWiped = () => {
    setCurrentView("emergency-exit");
  };

  const handleEmergencyOption = (optionId: string) => {
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

  const handleBack = () => {
    setCurrentView("home");
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

    // Add Zylo response after a short delay
    setTimeout(() => {
      const zyloMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "zylo",
        content: "I see there's no meal planned yet! Head over to Weekly Planning to set up your week, or just tell me what you're in the mood for and I can help. 🍽️",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, zyloMessage]);
    }, 500);
  };

  // Render EmergencyExit when "I'm wiped" is clicked
  if (currentView === "emergency-exit") {
    return (
      <EmergencyExit
        onBack={handleBack}
        onChooseOption={handleEmergencyOption}
      />
    );
  }

  return (
    <MealHelperHome
      currentUser={sampleUser}
      tonightMeal={null} // No meal planned - triggers empty state
      householdMembers={sampleHouseholdMembers}
      messages={messages}
      onImWiped={handleImWiped}
      onSendMessage={handleSendMessage}
      onVoiceInput={() => console.log("Voice input triggered")}
    />
  );
}
