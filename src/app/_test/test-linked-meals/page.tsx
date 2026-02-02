"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { GroceryList } from "@/components/grocery-list";
import type { GroceryItem, GroceryStore } from "@/types/grocery";

// Test page for Feature #38: Linked meals show on item
// Creates test data with grocery items linked to planned meals

export default function TestLinkedMealsPage() {
  // Convex queries
  const convexStores = useQuery(api.stores.list);
  const convexItems = useQuery(api.groceryItems.listWithMealDetails);
  const weekPlans = useQuery(api.weekPlans.list);

  // Convex mutations
  const toggleItem = useMutation(api.groceryItems.toggleChecked);
  const deleteItem = useMutation(api.groceryItems.remove);
  const seedStores = useMutation(api.stores.seedDefaults);
  const seedLinkedMealItems = useMutation(api.groceryItems.seedLinkedMealItems);
  const seedSampleWeekPlan = useMutation(api.weekPlans.seedSampleWeekPlan);

  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeedingItems, setIsSeedingItems] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);

  // Convert Convex stores to component format
  const stores: GroceryStore[] = (convexStores || []).map((s) => ({
    id: s._id,
    name: s.name,
  }));

  // Convert Convex items to component format
  const items: GroceryItem[] = (convexItems || []).map((i) => ({
    id: i._id,
    name: i.name,
    quantity: i.quantity || "1",
    category: (i.category || "Other") as GroceryItem["category"],
    isChecked: i.isChecked,
    organicRequired: i.isOrganic,
    storeId: i.storeId,
    mealSources: i.mealSources || [],
  }));

  // Seed stores if none exist
  useEffect(() => {
    if (convexStores && convexStores.length === 0 && !isSeeding) {
      setIsSeeding(true);
      seedStores().then(() => setIsSeeding(false));
    }
  }, [convexStores, seedStores, isSeeding]);

  // Find items that have meal sources linked
  const itemsWithMeals = items.filter((i) => i.mealSources && i.mealSources.length > 0);

  // Add test items linked to meals using the seeder mutation
  const handleSeedLinkedItems = async () => {
    setIsSeedingItems(true);
    setSeedError(null);
    try {
      // First ensure we have meals to link to
      console.log("Seeding week plan with meals...");
      await seedSampleWeekPlan();

      // Now create items linked to meals
      console.log("Creating linked grocery items...");
      const result = await seedLinkedMealItems();
      console.log("Created test items:", result);
    } catch (error) {
      console.error("Error seeding items:", error);
      setSeedError(error instanceof Error ? error.message : "Failed to create test items");
    } finally {
      setIsSeedingItems(false);
    }
  };

  const handleToggleChecked = async (id: string) => {
    await toggleItem({ id: id as Id<"groceryItems"> });
  };

  const handleDeleteItem = async (id: string) => {
    await deleteItem({ id: id as Id<"groceryItems"> });
  };

  // Loading state
  if (convexStores === undefined || convexItems === undefined) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="text-center">
          <div
            className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-2"
            style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}
          />
          <p style={{ color: "var(--color-muted)" }}>Loading grocery list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Test info banner */}
      <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-3 border-b border-blue-200 dark:border-blue-800">
        <h1 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
          Feature #38: Linked Meals Show on Item
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
          Items linked to planned meals should show a &quot;Meals (N)&quot; button. Tapping shows which meals need this item.
        </p>
      </div>

      {/* Status panel */}
      <div className="px-4 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-sm" style={{ color: "var(--color-text)" }}>
            <span className="font-semibold">Total items:</span> {items.length}
          </div>
          <div className="text-sm" style={{ color: "var(--color-text)" }}>
            <span className="font-semibold">Items with meal links:</span> {itemsWithMeals.length}
          </div>
          <div className="text-sm" style={{ color: "var(--color-text)" }}>
            <span className="font-semibold">Week plans:</span> {weekPlans?.length || 0}
          </div>
        </div>

        {itemsWithMeals.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
            <p className="text-sm font-semibold text-green-800 dark:text-green-200">
              ✅ Found {itemsWithMeals.length} item(s) with linked meals:
            </p>
            <ul className="mt-2 space-y-1">
              {itemsWithMeals.map((item) => (
                <li key={item.id} className="text-sm text-green-700 dark:text-green-300">
                  <span className="font-semibold">{item.name}</span>
                  {" → "}
                  {item.mealSources?.map((m) => m.mealName).join(", ")}
                </li>
              ))}
            </ul>
          </div>
        )}

        {itemsWithMeals.length === 0 && (
          <div className="mt-3 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ No items with linked meals found. Click the button below to create test items.
            </p>
            <button
              onClick={handleSeedLinkedItems}
              disabled={isSeedingItems}
              className="mt-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isSeedingItems ? "Creating..." : "Create Test Items with Linked Meals"}
            </button>
            {seedError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{seedError}</p>
            )}
          </div>
        )}
      </div>

      {/* Grocery list */}
      <div className="h-[calc(100vh-280px)]">
        <GroceryList
          stores={stores}
          items={items}
          syncStatus="synced"
          onToggleChecked={handleToggleChecked}
          onDeleteItem={handleDeleteItem}
        />
      </div>
    </div>
  );
}
