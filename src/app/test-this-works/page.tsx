"use client";

import { useState } from "react";
import { MealHelperHome, MealOptionDetails } from "@/components/meal-helper";
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
  briefInstructions:
    "Slice the chicken and veggies. Stir fry the chicken first until golden, then add veggies. Season with soy sauce, garlic, and ginger. Serve over rice.",
};

export default function TestThisWorksPage() {
  const [view, setView] = useState<"home" | "details">("home");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleThisWorks = () => {
    setView("details");
  };

  const handleBack = () => {
    setView("home");
  };

  const handleCookThis = () => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "zylo",
      content:
        "Awesome! You're all set with Chicken Stir Fry tonight. Katie's on cooking duty. Have a great dinner! 🍳",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setView("home");
  };

  const handleIngredientCheck = (response: "yes" | "not-sure" | "no") => {
    if (response === "yes") {
      handleCookThis();
    } else if (response === "no") {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "zylo",
        content:
          "No worries! I'll add the missing ingredients to your grocery list. Want to pick a different meal for tonight?",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setView("home");
    } else {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "zylo",
        content:
          "Let me help! Do a quick fridge check for: chicken, soy sauce, and fresh veggies. If you have those, you're good to go!",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setView("home");
    }
  };

  const handleNewPlan = () => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "zylo",
      content:
        "No problem! Let me show you some other options from this week's plan that we could swap in.",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleImWiped = () => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "zylo",
      content:
        "I totally get it! Here are some zero-effort options: 1) Order in, 2) Cereal night, 3) Frozen pizza. No judgment! 💛",
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

    setTimeout(() => {
      const zyloMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "zylo",
        content:
          "Got it! I'd suggest keeping tonight's plan. The stir fry is quick and everyone likes it!",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, zyloMessage]);
    }, 500);
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
          Test: This Works Button (Feature #69)
        </h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Current view:{" "}
          <span style={{ fontWeight: "bold" }}>
            {view === "home" ? "MealHelperHome" : "MealOptionDetails"}
          </span>
        </p>
      </div>

      {view === "home" ? (
        <MealHelperHome
          currentUser={sampleUser}
          tonightMeal={sampleTonightMeal}
          householdMembers={sampleHouseholdMembers}
          messages={messages}
          onThisWorks={handleThisWorks}
          onNewPlan={handleNewPlan}
          onImWiped={handleImWiped}
          onOpenInventoryCheck={() => {}}
          onSendMessage={handleSendMessage}
          onVoiceInput={() => {}}
        />
      ) : (
        <MealOptionDetails
          meal={sampleTonightMeal}
          householdMembers={sampleHouseholdMembers}
          onBack={handleBack}
          onCookThis={handleCookThis}
          onIngredientCheck={handleIngredientCheck}
        />
      )}
    </div>
  );
}
