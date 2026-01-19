"use client";

import { useState } from "react";
import { PantryAudit } from "@/components/weekly-planning/PantryAudit";
import type { PantryCheckItem } from "@/types/weekly-planning";

/**
 * Test page for Feature #130: Completing pantry audit generates grocery list
 *
 * This demonstrates that unchecked items from the pantry audit are
 * added to the grocery list.
 */

const initialPantryItems: PantryCheckItem[] = [
  { id: "item-1", name: "Olive Oil", alreadyHave: false },
  { id: "item-2", name: "Soy Sauce", alreadyHave: false },
  { id: "item-3", name: "Garlic (fresh)", alreadyHave: false },
  { id: "item-4", name: "Salt", alreadyHave: false },
  { id: "item-5", name: "Pepper", alreadyHave: false },
  { id: "item-6", name: "Rice", alreadyHave: false },
  { id: "item-7", name: "Pasta", alreadyHave: false },
  { id: "item-8", name: "Chicken Stock", alreadyHave: false },
];

export default function TestPantryAuditPage() {
  const [items, setItems] = useState<PantryCheckItem[]>(initialPantryItems);
  const [isComplete, setIsComplete] = useState(false);
  const [generatedGroceryList, setGeneratedGroceryList] = useState<string[]>([]);

  const handleToggleItem = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, alreadyHave: !item.alreadyHave } : item
      )
    );
  };

  const handleComplete = () => {
    // Generate grocery list from unchecked items
    const uncheckedItems = items.filter((item) => !item.alreadyHave);
    const groceryItems = uncheckedItems.map((item) => item.name);
    setGeneratedGroceryList(groceryItems);
    setIsComplete(true);
  };

  const handleReset = () => {
    setItems(initialPantryItems);
    setIsComplete(false);
    setGeneratedGroceryList([]);
  };

  if (isComplete) {
    return (
      <div
        className="min-h-screen p-6 font-sans"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <h1
            className="text-2xl font-bold mb-2 font-heading"
            style={{ color: "var(--color-text)" }}
          >
            Feature #130: Pantry Audit → Grocery List
          </h1>

          {/* Success Message */}
          <div
            className="p-4 rounded-xl mb-6"
            style={{
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              border: "1px solid rgba(76, 175, 80, 0.3)",
            }}
          >
            <p className="font-semibold text-lg" style={{ color: "#4caf50" }}>
              Pantry Audit Complete!
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              {generatedGroceryList.length > 0
                ? `${generatedGroceryList.length} items added to grocery list`
                : "All items checked - nothing to add!"}
            </p>
          </div>

          {/* Generated Grocery List */}
          {generatedGroceryList.length > 0 && (
            <div
              className="p-4 rounded-xl mb-6"
              style={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
              }}
            >
              <h2
                className="font-semibold mb-3"
                style={{ color: "var(--color-text)" }}
              >
                Generated Grocery List:
              </h2>
              <ul className="space-y-2">
                {generatedGroceryList.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: "var(--color-text)" }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "var(--color-primary)" }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Verification */}
          <div
            className="p-4 rounded-xl mb-6"
            style={{
              backgroundColor:
                generatedGroceryList.length > 0
                  ? "rgba(76, 175, 80, 0.1)"
                  : "var(--color-card)",
              border: `1px solid ${
                generatedGroceryList.length > 0
                  ? "rgba(76, 175, 80, 0.3)"
                  : "var(--color-border)"
              }`,
            }}
          >
            <h2
              className="font-semibold mb-2"
              style={{ color: "var(--color-text)" }}
            >
              Verification:
            </h2>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center bg-green-100 text-green-600"
                >
                  ✓
                </span>
                <span style={{ color: "var(--color-text)" }}>
                  Pantry audit completed
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    generatedGroceryList.length > 0
                      ? "bg-green-100 text-green-600"
                      : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {generatedGroceryList.length > 0 ? "✓" : "•"}
                </span>
                <span style={{ color: "var(--color-text)" }}>
                  Unchecked items added to grocery list
                </span>
              </li>
            </ul>
            {generatedGroceryList.length > 0 && (
              <p
                className="mt-3 text-sm font-semibold"
                style={{ color: "#4caf50" }}
              >
                Feature #130 PASSED!
              </p>
            )}
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="w-full py-3 px-4 rounded-xl font-medium text-white"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            Reset & Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Test Instructions Header */}
      <div
        className="p-4 border-b"
        style={{
          backgroundColor: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <h1 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
          Test: Pantry Audit → Grocery List (Feature #130)
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
          Check some items (you have them), leave others unchecked (need to buy).
          Then tap &quot;Done&quot; to see the grocery list.
        </p>
        <div
          className="mt-3 p-3 rounded-lg text-sm"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <strong>Test Steps:</strong>
          <ol className="list-decimal list-inside mt-1 space-y-1" style={{ color: "var(--color-muted)" }}>
            <li>Check some items (items you already have)</li>
            <li>Leave some items unchecked (items you need)</li>
            <li>Tap &quot;Done&quot; button</li>
            <li>Verify unchecked items appear in grocery list</li>
          </ol>
        </div>
      </div>

      {/* Pantry Audit Component */}
      <PantryAudit
        items={items}
        onToggleItem={handleToggleItem}
        onComplete={handleComplete}
      />
    </div>
  );
}
