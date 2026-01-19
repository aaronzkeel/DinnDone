"use client";

import { TonightPlanCard } from "@/components/meal-helper/TonightPlanCard";
import type { PlannedMealSummary, HouseholdMember, EffortTier } from "@/types/meal-helper";

// Sample household members
const householdMembers: HouseholdMember[] = [
  { id: "hm-001", name: "Aaron", isAdmin: true },
  { id: "hm-002", name: "Katie", isAdmin: true },
];

// Create sample meals with different effort tiers
const createMeal = (
  id: string,
  name: string,
  effortTier: EffortTier,
  cookId: string
): PlannedMealSummary => ({
  id,
  mealName: name,
  effortTier,
  prepTime: effortTier === "super-easy" ? 5 : effortTier === "middle" ? 15 : 30,
  cookTime: effortTier === "super-easy" ? 10 : effortTier === "middle" ? 25 : 60,
  cleanupRating: effortTier === "super-easy" ? "low" : effortTier === "middle" ? "medium" : "high",
  ingredients: ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
  isFlexMeal: false,
  assignedCookId: cookId,
});

// Three meals with different effort tiers
const superEasyMeal = createMeal("1", "Taco Night", "super-easy", "hm-001");
const mediumMeal = createMeal("2", "Chicken Stir Fry", "middle", "hm-002");
const morePrepMeal = createMeal("3", "Slow Cooker Pot Roast", "more-prep", "hm-001");

export default function TestEffortTiersPage() {
  return (
    <div
      style={{
        backgroundColor: "var(--color-bg)",
        minHeight: "calc(100vh - 120px)",
      }}
    >
      {/* Header */}
      <div
        className="p-4 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h1
          className="font-heading font-bold text-lg"
          style={{ color: "var(--color-text)" }}
        >
          Test: Effort Tier Badge Colors (Feature #98)
        </h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Verify: Easy=green/lime, Medium=gold/yellow, Involved=orange
        </p>
      </div>

      {/* Effort Tier Legend */}
      <div className="p-4">
        <div
          className="p-4 rounded-xl mb-4"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2
            className="font-semibold mb-3"
            style={{ color: "var(--color-text)" }}
          >
            Expected Badge Colors:
          </h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-200">
                Super Easy
              </span>
              <span className="text-sm" style={{ color: "var(--color-muted)" }}>
                = Green/Lime
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200">
                Medium
              </span>
              <span className="text-sm" style={{ color: "var(--color-muted)" }}>
                = Gold/Yellow
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200">
                More Prep
              </span>
              <span className="text-sm" style={{ color: "var(--color-muted)" }}>
                = Orange
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Super Easy (Green) */}
        <div className="mb-6">
          <h3
            className="font-semibold mb-2 flex items-center gap-2"
            style={{ color: "var(--color-text)" }}
          >
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold bg-lime-500 text-white">
              1
            </span>
            Super Easy Meal (should show GREEN badge)
          </h3>
          <TonightPlanCard
            meal={superEasyMeal}
            householdMembers={householdMembers}
          />
        </div>

        {/* Step 2: Medium (Gold/Yellow) */}
        <div className="mb-6">
          <h3
            className="font-semibold mb-2 flex items-center gap-2"
            style={{ color: "var(--color-text)" }}
          >
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold bg-yellow-500 text-white">
              2
            </span>
            Medium Meal (should show GOLD badge)
          </h3>
          <TonightPlanCard
            meal={mediumMeal}
            householdMembers={householdMembers}
          />
        </div>

        {/* Step 3: More Prep (Orange) */}
        <div className="mb-6">
          <h3
            className="font-semibold mb-2 flex items-center gap-2"
            style={{ color: "var(--color-text)" }}
          >
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold bg-orange-500 text-white">
              3
            </span>
            More Prep Meal (should show ORANGE badge)
          </h3>
          <TonightPlanCard
            meal={morePrepMeal}
            householdMembers={householdMembers}
          />
        </div>

        {/* Verification Checklist */}
        <div
          className="p-4 rounded-xl"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2
            className="font-semibold mb-3"
            style={{ color: "var(--color-text)" }}
          >
            Verification Checklist:
          </h2>
          <ul className="space-y-2 text-sm" style={{ color: "var(--color-text)" }}>
            <li className="flex items-start gap-2">
              <span>1.</span>
              <span>Taco Night card shows &quot;Super Easy&quot; badge in <strong>GREEN/LIME</strong> color</span>
            </li>
            <li className="flex items-start gap-2">
              <span>2.</span>
              <span>Chicken Stir Fry card shows &quot;Medium&quot; badge in <strong>GOLD/YELLOW</strong> color</span>
            </li>
            <li className="flex items-start gap-2">
              <span>3.</span>
              <span>Slow Cooker Pot Roast card shows &quot;More Prep&quot; badge in <strong>ORANGE</strong> color</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
