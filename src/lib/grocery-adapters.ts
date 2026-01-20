/**
 * Adapters to convert between Convex grocery schema types and UI types
 */

import type { Doc, Id } from "../../convex/_generated/dataModel";
import type { GroceryStore, GroceryItem, GroceryCategory, MealSource } from "@/types/grocery";

// Convex grocery item with mealSources populated by listWithMealDetails
type ConvexGroceryItemWithSources = Doc<"groceryItems"> & {
  mealSources?: Array<{ mealId: string; mealName: string; date: string }>;
};

/**
 * Convert a Convex store document to UI GroceryStore
 */
export function toGroceryStore(store: Doc<"stores">): GroceryStore {
  return {
    id: store._id,
    name: store.name,
  };
}

/**
 * Validate that a category string is a valid GroceryCategory
 */
function toGroceryCategory(category: string): GroceryCategory {
  const validCategories: GroceryCategory[] = [
    "Produce",
    "Dairy",
    "Meat",
    "Pantry",
    "Frozen",
    "Bakery",
    "Beverages",
    "Other",
  ];
  return validCategories.includes(category as GroceryCategory)
    ? (category as GroceryCategory)
    : "Other";
}

/**
 * Convert a Convex grocery item (with mealSources) to UI GroceryItem
 */
export function toGroceryItem(item: ConvexGroceryItemWithSources): GroceryItem {
  const mealSources: MealSource[] | undefined = item.mealSources?.map((source) => ({
    mealId: source.mealId,
    mealName: source.mealName,
    date: source.date,
  }));

  return {
    id: item._id,
    name: item.name,
    category: toGroceryCategory(item.category),
    quantity: item.quantity || "1",
    isChecked: item.isChecked,
    organicRequired: item.isOrganic,
    storeId: item.storeId,
    mealSources: mealSources && mealSources.length > 0 ? mealSources : undefined,
  };
}

/**
 * Convert UI storeId (string | undefined) to Convex Id<"stores"> | undefined
 * Note: The page should pass undefined for "unassigned" items
 */
export function toConvexStoreId(storeId: string | undefined): Id<"stores"> | undefined {
  return storeId ? (storeId as Id<"stores">) : undefined;
}

/**
 * Convert UI item id to Convex Id<"groceryItems">
 */
export function toConvexGroceryItemId(id: string): Id<"groceryItems"> {
  return id as Id<"groceryItems">;
}
