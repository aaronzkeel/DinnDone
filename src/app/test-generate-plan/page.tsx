"use client";

import { useState } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Sparkles, Loader2, Check, Clock, Users, AlertTriangle, Edit2, X, Plus } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

interface GeneratedMeal {
  dayOfWeek: string;
  date: string;
  mealName: string;
  effortTier: "super-easy" | "middle" | "more-prep";
  prepTime: number;
  cookTime: number;
  cleanupRating: "low" | "medium" | "high";
  ingredients: string[];
  isFlexMeal: boolean;
  assignedCook?: string; // Added after generation
}

// Household cooks for rotation
const HOUSEHOLD_COOKS = ["Aaron", "Katie"];

// Common dietary preferences for quick selection
const COMMON_DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Dairy-free",
  "Nut-free",
  "No shellfish",
  "No pork",
  "No beef",
  "Low-sodium",
  "No spicy food",
];

// List of common familiar family meals (for 80/20 detection)
const FAMILIAR_MEALS = [
  "taco", "tacos", "burrito", "enchilada", "quesadilla", "fajita",
  "spaghetti", "pasta", "lasagna", "mac and cheese", "macaroni",
  "pizza", "grilled cheese",
  "chicken", "grilled chicken", "baked chicken", "fried chicken", "chicken stir fry", "chicken stir-fry",
  "stir fry", "stir-fry", "fried rice",
  "burger", "hamburger", "cheeseburger", "meatloaf",
  "salmon", "fish", "shrimp", "fish sticks",
  "steak", "beef", "pot roast", "roast",
  "pork chop", "pork",
  "soup", "chili", "stew",
  "rice", "beans",
  "sandwich", "hot dog", "sloppy joe",
  "casserole", "noodle",
];

// Check if a meal name is familiar
function isFamiliarMeal(mealName: string): boolean {
  const lowerName = mealName.toLowerCase();
  return FAMILIAR_MEALS.some(familiar => lowerName.includes(familiar));
}

// Check if a meal respects dietary preferences
function mealRespectsPreferences(meal: GeneratedMeal, preferences: string[]): { respects: boolean; violations: string[] } {
  if (preferences.length === 0) return { respects: true, violations: [] };

  const violations: string[] = [];
  const mealLower = meal.mealName.toLowerCase();
  const ingredientsLower = meal.ingredients.map(i => i.toLowerCase()).join(" ");
  const allContent = `${mealLower} ${ingredientsLower}`;

  preferences.forEach(pref => {
    const prefLower = pref.toLowerCase();

    // Check for vegetarian/vegan violations
    if (prefLower === "vegetarian" || prefLower === "vegan") {
      const meatKeywords = ["chicken", "beef", "pork", "steak", "bacon", "turkey", "ham", "sausage", "meatball", "ground meat", "lamb", "duck", "fish", "salmon", "shrimp", "seafood", "crab", "lobster", "tuna"];
      const foundMeat = meatKeywords.find(meat => allContent.includes(meat));
      if (foundMeat) {
        violations.push(`Contains ${foundMeat} (violates ${pref})`);
      }
    }

    // Check for dairy-free violations
    if (prefLower === "dairy-free") {
      const dairyKeywords = ["cheese", "milk", "cream", "butter", "yogurt", "parmesan", "mozzarella", "cheddar"];
      const foundDairy = dairyKeywords.find(dairy => allContent.includes(dairy));
      if (foundDairy) {
        violations.push(`Contains ${foundDairy} (violates ${pref})`);
      }
    }

    // Check for gluten-free violations
    if (prefLower === "gluten-free") {
      const glutenKeywords = ["pasta", "bread", "flour", "tortilla", "noodle", "spaghetti", "bun", "breaded", "crusted"];
      const foundGluten = glutenKeywords.find(gluten => allContent.includes(gluten));
      if (foundGluten) {
        violations.push(`Contains ${foundGluten} (violates ${pref})`);
      }
    }

    // Check for nut-free violations
    if (prefLower === "nut-free") {
      const nutKeywords = ["peanut", "almond", "cashew", "walnut", "pecan", "pistachio", "hazelnut", "nut"];
      const foundNut = nutKeywords.find(nut => allContent.includes(nut));
      if (foundNut) {
        violations.push(`Contains ${foundNut} (violates ${pref})`);
      }
    }

    // Check for shellfish-free violations
    if (prefLower === "no shellfish") {
      const shellfishKeywords = ["shrimp", "crab", "lobster", "clam", "mussel", "oyster", "scallop"];
      const foundShellfish = shellfishKeywords.find(sf => allContent.includes(sf));
      if (foundShellfish) {
        violations.push(`Contains ${foundShellfish} (violates ${pref})`);
      }
    }

    // Check for pork-free violations
    if (prefLower === "no pork") {
      const porkKeywords = ["pork", "bacon", "ham", "sausage", "pepperoni", "prosciutto"];
      const foundPork = porkKeywords.find(p => allContent.includes(p));
      if (foundPork) {
        violations.push(`Contains ${foundPork} (violates ${pref})`);
      }
    }

    // Check for beef-free violations
    if (prefLower === "no beef") {
      const beefKeywords = ["beef", "steak", "burger", "meatball", "ground beef", "roast"];
      const foundBeef = beefKeywords.find(b => allContent.includes(b));
      if (foundBeef) {
        violations.push(`Contains ${foundBeef} (violates ${pref})`);
      }
    }
  });

  return { respects: violations.length === 0, violations };
}

export default function TestGeneratePlanPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [meals, setMeals] = useState<GeneratedMeal[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<Id<"householdMembers"> | null>(null);
  const [newPreference, setNewPreference] = useState("");

  // Query household members from Convex
  const householdMembers = useQuery(api.householdMembers.list);
  const updateMember = useMutation(api.householdMembers.update);

  const generateWeekPlan = useAction(api.ai.generateWeekPlan);

  // Get all dietary preferences from household members
  const allDietaryPreferences = householdMembers
    ?.flatMap(m => m.dietaryPreferences || [])
    .filter((v, i, a) => a.indexOf(v) === i) || []; // unique values

  // Get next Monday's date
  const getNextMonday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday.toISOString().split("T")[0];
  };

  // Add a dietary preference to a member
  const handleAddPreference = async (memberId: Id<"householdMembers">, preference: string) => {
    const member = householdMembers?.find(m => m._id === memberId);
    if (!member) return;

    const currentPrefs = member.dietaryPreferences || [];
    if (currentPrefs.includes(preference)) return; // Already has it

    await updateMember({
      id: memberId,
      dietaryPreferences: [...currentPrefs, preference],
    });
    setNewPreference("");
  };

  // Remove a dietary preference from a member
  const handleRemovePreference = async (memberId: Id<"householdMembers">, preference: string) => {
    const member = householdMembers?.find(m => m._id === memberId);
    if (!member) return;

    const currentPrefs = member.dietaryPreferences || [];
    await updateMember({
      id: memberId,
      dietaryPreferences: currentPrefs.filter(p => p !== preference),
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setMeals(null);

    // Build dietary preferences string from all household members
    const dietaryString = allDietaryPreferences.length > 0
      ? allDietaryPreferences.join(", ")
      : undefined;

    try {
      const result = await generateWeekPlan({
        weekStartDate: getNextMonday(),
        householdSize: householdMembers?.length || 5,
        dietaryPreferences: dietaryString,
      });

      if (result.success && result.meals) {
        // Assign cooks using alternating rotation for fair split
        const mealsWithCooks = result.meals.map((meal, index) => ({
          ...meal,
          assignedCook: HOUSEHOLD_COOKS[index % HOUSEHOLD_COOKS.length],
        }));
        setMeals(mealsWithCooks);
      } else {
        setError(result.error || "Unknown error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const getEffortBadgeColor = (tier: string) => {
    switch (tier) {
      case "super-easy":
        return "bg-green-100 text-green-800";
      case "middle":
        return "bg-yellow-100 text-yellow-800";
      case "more-prep":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEffortLabel = (tier: string) => {
    switch (tier) {
      case "super-easy":
        return "Super Easy";
      case "middle":
        return "Medium";
      case "more-prep":
        return "More Prep";
      default:
        return tier;
    }
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="max-w-2xl mx-auto">
        <h1
          className="text-2xl font-bold mb-4 font-heading"
          style={{ color: "var(--color-text)" }}
        >
          Test: AI Meal Plan Generation
        </h1>
        <p className="mb-6" style={{ color: "var(--color-muted)" }}>
          This page tests Feature #132, #133, #134, and <strong>#135: Dietary Preferences</strong>
        </p>

        {/* Step 1: Dietary Preferences Section - Feature #135 */}
        <div
          className="p-4 mb-6 rounded-lg border"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-3 flex items-center gap-2"
            style={{ color: "var(--color-text)" }}
          >
            <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">Step 1</span>
            Household Dietary Preferences (Feature #135)
          </h2>
          <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>
            Set dietary restrictions for household members. These will be sent to the AI when generating the meal plan.
          </p>

          {householdMembers === undefined ? (
            <p style={{ color: "var(--color-muted)" }}>Loading household members...</p>
          ) : householdMembers.length === 0 ? (
            <div className="text-center py-4">
              <p style={{ color: "var(--color-muted)" }}>No household members found.</p>
              <a
                href="/test-household"
                className="text-sm underline"
                style={{ color: "var(--color-primary)" }}
              >
                Seed household members first →
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {householdMembers.map((member) => (
                <div
                  key={member._id}
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium" style={{ color: "var(--color-text)" }}>
                      {member.name}
                      {member.isAdmin && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          Admin
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => setEditingMemberId(editingMemberId === member._id ? null : member._id)}
                      className="text-sm px-2 py-1 rounded flex items-center gap-1"
                      style={{
                        backgroundColor: editingMemberId === member._id ? "var(--color-primary)" : "transparent",
                        color: editingMemberId === member._id ? "white" : "var(--color-primary)",
                        border: `1px solid var(--color-primary)`,
                      }}
                    >
                      <Edit2 size={12} />
                      {editingMemberId === member._id ? "Done" : "Edit"}
                    </button>
                  </div>

                  {/* Current preferences */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(member.dietaryPreferences || []).length === 0 ? (
                      <span className="text-sm italic" style={{ color: "var(--color-muted)" }}>
                        No dietary restrictions
                      </span>
                    ) : (
                      (member.dietaryPreferences || []).map((pref) => (
                        <span
                          key={pref}
                          className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                          style={{
                            backgroundColor: "var(--color-danger-bg, #FEE2E2)",
                            color: "var(--color-danger, #B94A34)",
                          }}
                        >
                          {pref}
                          {editingMemberId === member._id && (
                            <button
                              onClick={() => handleRemovePreference(member._id, pref)}
                              className="hover:opacity-70"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </span>
                      ))
                    )}
                  </div>

                  {/* Edit mode - add preferences */}
                  {editingMemberId === member._id && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
                      <p className="text-xs mb-2" style={{ color: "var(--color-muted)" }}>
                        Quick add:
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {COMMON_DIETARY_OPTIONS.filter(
                          opt => !(member.dietaryPreferences || []).includes(opt)
                        ).map((opt) => (
                          <button
                            key={opt}
                            onClick={() => handleAddPreference(member._id, opt)}
                            className="text-xs px-2 py-1 rounded border hover:opacity-70"
                            style={{
                              borderColor: "var(--color-border)",
                              color: "var(--color-text)",
                            }}
                          >
                            + {opt}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          placeholder="Custom preference..."
                          value={newPreference}
                          onChange={(e) => setNewPreference(e.target.value)}
                          className="flex-1 px-2 py-1 rounded border text-sm"
                          style={{
                            borderColor: "var(--color-border)",
                            backgroundColor: "var(--color-bg)",
                            color: "var(--color-text)",
                          }}
                        />
                        <button
                          onClick={() => {
                            if (newPreference.trim()) {
                              handleAddPreference(member._id, newPreference.trim());
                            }
                          }}
                          disabled={!newPreference.trim()}
                          className="px-3 py-1 rounded text-sm text-white disabled:opacity-50"
                          style={{ backgroundColor: "var(--color-secondary)" }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Summary of all dietary preferences */}
          {allDietaryPreferences.length > 0 && (
            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: "var(--color-bg)" }}>
              <p className="text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                Combined Preferences (sent to AI):
              </p>
              <div className="flex flex-wrap gap-1">
                {allDietaryPreferences.map((pref) => (
                  <span
                    key={pref}
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "white",
                    }}
                  >
                    {pref}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Generate Plan */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">Step 2</span>
          <span className="font-medium" style={{ color: "var(--color-text)" }}>Generate Plan</span>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || householdMembers === undefined}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating plan...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate 7-Day Plan {allDietaryPreferences.length > 0 && `(with ${allDietaryPreferences.length} dietary restriction${allDietaryPreferences.length > 1 ? 's' : ''})`}
            </>
          )}
        </button>

        {error && (
          <div className="p-4 mb-6 rounded-lg bg-red-100 border border-red-300 text-red-800">
            <strong>Error:</strong> {error}
          </div>
        )}

        {meals && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Check className="text-green-600" size={20} />
              <span
                className="font-medium"
                style={{ color: "var(--color-text)" }}
              >
                Generated {meals.length} meals!
              </span>
            </div>

            {/* 80/20 Familiar/New Analysis - Feature #133 */}
            {(() => {
              const familiarCount = meals.filter(m => isFamiliarMeal(m.mealName)).length;
              const newCount = meals.length - familiarCount;
              const meets8020 = familiarCount >= 5 && newCount <= 2;
              return (
                <div
                  className={`p-4 mb-4 rounded-lg border ${meets8020 ? "bg-green-50 border-green-300" : "bg-yellow-50 border-yellow-300"}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-semibold ${meets8020 ? "text-green-800" : "text-yellow-800"}`}>
                      80/20 Analysis (Feature #133)
                    </span>
                    {meets8020 ? (
                      <Check className="text-green-600" size={16} />
                    ) : (
                      <span className="text-yellow-600">⚠️</span>
                    )}
                  </div>
                  <div className={`text-sm ${meets8020 ? "text-green-700" : "text-yellow-700"}`}>
                    <p>Familiar meals: {familiarCount}/7 ({Math.round(familiarCount/7*100)}%)</p>
                    <p>New/adventurous meals: {newCount}/7 ({Math.round(newCount/7*100)}%)</p>
                    <p className="mt-1 font-medium">
                      {meets8020
                        ? "✓ Meets 80/20 requirement (5-6 familiar, 1-2 new)"
                        : "✗ Does not meet 80/20 requirement"}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Cook Rotation Analysis - Feature #134 */}
            {(() => {
              const cookCounts: Record<string, number> = {};
              meals.forEach(m => {
                const cook = m.assignedCook || "Unassigned";
                cookCounts[cook] = (cookCounts[cook] || 0) + 1;
              });
              const cooks = Object.entries(cookCounts);
              const isEven = cooks.every(([_, count]) => count >= 3 && count <= 4);
              return (
                <div
                  className={`p-4 mb-4 rounded-lg border ${isEven ? "bg-green-50 border-green-300" : "bg-yellow-50 border-yellow-300"}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-semibold ${isEven ? "text-green-800" : "text-yellow-800"}`}>
                      Cook Rotation (Feature #134)
                    </span>
                    {isEven ? (
                      <Check className="text-green-600" size={16} />
                    ) : (
                      <span className="text-yellow-600">⚠️</span>
                    )}
                  </div>
                  <div className={`text-sm ${isEven ? "text-green-700" : "text-yellow-700"}`}>
                    {cooks.map(([cook, count]) => (
                      <p key={cook}>{cook}: {count} meals ({Math.round(count/7*100)}%)</p>
                    ))}
                    <p className="mt-1 font-medium">
                      {isEven
                        ? "✓ Cooks are evenly split (3-4 meals each)"
                        : "✗ Cook rotation is uneven"}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Dietary Preferences Analysis - Feature #135 */}
            {(() => {
              if (allDietaryPreferences.length === 0) {
                return (
                  <div className="p-4 mb-4 rounded-lg border bg-gray-50 border-gray-300">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-700">
                        Dietary Preferences (Feature #135)
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>No dietary preferences set for household members.</p>
                      <p className="mt-1 text-xs italic">Set preferences above and regenerate to test dietary compliance.</p>
                    </div>
                  </div>
                );
              }

              const mealResults = meals.map(meal => ({
                meal,
                ...mealRespectsPreferences(meal, allDietaryPreferences)
              }));
              const passingCount = mealResults.filter(r => r.respects).length;
              const allPass = passingCount === meals.length;

              return (
                <div
                  className={`p-4 mb-4 rounded-lg border ${allPass ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">Step 3</span>
                    <span className={`font-semibold ${allPass ? "text-green-800" : "text-red-800"}`}>
                      Dietary Preferences Verification (Feature #135)
                    </span>
                    {allPass ? (
                      <Check className="text-green-600" size={16} />
                    ) : (
                      <AlertTriangle className="text-red-600" size={16} />
                    )}
                  </div>
                  <div className={`text-sm ${allPass ? "text-green-700" : "text-red-700"}`}>
                    <p className="mb-2">
                      <strong>Active preferences:</strong> {allDietaryPreferences.join(", ")}
                    </p>
                    <p>Meals respecting preferences: {passingCount}/7 ({Math.round(passingCount/7*100)}%)</p>

                    {!allPass && (
                      <div className="mt-2 space-y-1">
                        <p className="font-medium">Violations found:</p>
                        {mealResults.filter(r => !r.respects).map((result, idx) => (
                          <div key={idx} className="pl-2 border-l-2 border-red-400">
                            <p className="font-medium">{result.meal.dayOfWeek}: {result.meal.mealName}</p>
                            <ul className="list-disc list-inside text-xs">
                              {result.violations.map((v, i) => (
                                <li key={i}>{v}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="mt-2 font-medium">
                      {allPass
                        ? "✓ All meals respect dietary preferences!"
                        : "✗ Some meals violate dietary preferences (AI may need prompt adjustments)"}
                    </p>
                  </div>
                </div>
              );
            })()}

            <div className="space-y-3">
              {meals.map((meal, index) => {
                const familiar = isFamiliarMeal(meal.mealName);
                const dietaryResult = allDietaryPreferences.length > 0
                  ? mealRespectsPreferences(meal, allDietaryPreferences)
                  : { respects: true, violations: [] };
                return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${!dietaryResult.respects ? "ring-2 ring-red-400" : ""}`}
                  style={{
                    backgroundColor: "var(--color-card)",
                    borderColor: !dietaryResult.respects ? "#F87171" : "var(--color-border)",
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div
                        className="text-sm font-medium"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {meal.dayOfWeek} • {meal.date}
                      </div>
                      <div
                        className="text-lg font-semibold flex items-center gap-2 flex-wrap"
                        style={{ color: "var(--color-text)" }}
                      >
                        {meal.mealName}
                        <span className={`text-xs px-2 py-0.5 rounded ${familiar ? "bg-green-100 text-green-800" : "bg-purple-100 text-purple-800"}`}>
                          {familiar ? "Familiar" : "New"}
                        </span>
                        {allDietaryPreferences.length > 0 && (
                          <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${dietaryResult.respects ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {dietaryResult.respects ? (
                              <><Check size={10} /> Diet OK</>
                            ) : (
                              <><AlertTriangle size={10} /> Diet Issue</>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getEffortBadgeColor(meal.effortTier)}`}
                    >
                      {getEffortLabel(meal.effortTier)}
                    </span>
                  </div>

                  {/* Dietary violation warning */}
                  {!dietaryResult.respects && (
                    <div className="mb-2 p-2 rounded bg-red-50 border border-red-200">
                      <p className="text-xs font-medium text-red-800 mb-1">⚠️ Dietary Violations:</p>
                      <ul className="list-disc list-inside text-xs text-red-700">
                        {dietaryResult.violations.map((v, i) => (
                          <li key={i}>{v}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div
                    className="flex items-center gap-4 text-sm mb-2 flex-wrap"
                    style={{ color: "var(--color-muted)" }}
                  >
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {meal.prepTime + meal.cookTime}m total
                    </span>
                    <span>Cleanup: {meal.cleanupRating}</span>
                    {meal.assignedCook && (
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {meal.assignedCook}
                      </span>
                    )}
                    {meal.isFlexMeal && (
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs">
                        Flex
                      </span>
                    )}
                  </div>

                  <div
                    className="text-sm"
                    style={{ color: "var(--color-muted)" }}
                  >
                    <strong>Ingredients:</strong> {meal.ingredients.join(", ")}
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
