"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { useConvex } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { GroceryList } from "@/components/grocery-list";
import type { GroceryItem, GroceryStore, DuplicateItemInfo } from "@/types/grocery";

// Test page for verifying Feature #26: Added item saves to Convex
// This bypasses auth for testing purposes

export default function TestGroceryConvexPage() {
  // Convex client for imperative queries
  const convex = useConvex();

  // Convex queries
  const convexStores = useQuery(api.stores.list);
  const convexItems = useQuery(api.groceryItems.listWithMealDetails);

  // Convex mutations
  const addStore = useMutation(api.stores.add);
  const updateStore = useMutation(api.stores.update);
  const deleteStore = useMutation(api.stores.remove);
  const seedStores = useMutation(api.stores.seedDefaults);

  const addItem = useMutation(api.groceryItems.add);
  const toggleItem = useMutation(api.groceryItems.toggleChecked);
  const updateItem = useMutation(api.groceryItems.update);
  const deleteItem = useMutation(api.groceryItems.remove);
  const reorderItem = useMutation(api.groceryItems.reorder);
  const mergeQuantity = useMutation(api.groceryItems.mergeQuantity);

  const [isSeeding, setIsSeeding] = useState(false);

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

  const handleAddItem = async (name: string, options?: { storeId?: string; quantity?: string }) => {
    if (!stores.length) {
      console.error("No stores available. Please seed stores first.");
      return;
    }

    // Use provided storeId or first store as default
    const storeId = options?.storeId || stores[0].id;

    await addItem({
      name,
      quantity: options?.quantity || "1",
      storeId: storeId as Id<"stores">,
      category: "Other",
      isOrganic: false,
    });
  };

  const handleToggleChecked = async (id: string) => {
    await toggleItem({ id: id as Id<"groceryItems"> });
  };

  const handleDeleteItem = async (id: string) => {
    await deleteItem({ id: id as Id<"groceryItems"> });
  };

  const handleUpdateItem = async (
    id: string,
    updates: { name?: string; quantity?: string }
  ) => {
    await updateItem({
      id: id as Id<"groceryItems">,
      name: updates.name,
      quantity: updates.quantity,
    });
  };

  const handleMoveItem = async (
    id: string,
    options: { storeId?: string; beforeId?: string | null }
  ) => {
    await reorderItem({
      id: id as Id<"groceryItems">,
      storeId: options.storeId ? (options.storeId as Id<"stores">) : undefined,
      beforeId: options.beforeId ? (options.beforeId as Id<"groceryItems">) : null,
    });
  };

  const handleAddStore = async (name: string) => {
    await addStore({ name });
  };

  const handleRenameStore = async (id: string, name: string) => {
    await updateStore({ id: id as Id<"stores">, name });
  };

  const handleDeleteStore = async (id: string) => {
    await deleteStore({ id: id as Id<"stores"> });
  };

  const handleVoiceInput = () => {
    console.log("Voice input triggered");
  };

  // Check for duplicate items
  const handleCheckDuplicate = useCallback(async (name: string): Promise<{ exists: boolean; item: DuplicateItemInfo | null }> => {
    const result = await convex.query(api.groceryItems.findDuplicate, { name });
    if (result.exists && result.item) {
      return {
        exists: true,
        item: {
          id: result.item.id,
          name: result.item.name,
          quantity: result.item.quantity || undefined,
          storeId: result.item.storeId,
        },
      };
    }
    return { exists: false, item: null };
  }, [convex]);

  // Merge quantity with existing item
  const handleMergeQuantity = async (existingItemId: string, additionalQuantity: string) => {
    await mergeQuantity({
      id: existingItemId as Id<"groceryItems">,
      additionalQuantity,
    });
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
          <p style={{ color: "var(--color-muted)" }}>Loading grocery list from Convex...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)]">
      {/* Debug info banner */}
      <div className="bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 text-sm border-b border-yellow-200 dark:border-yellow-800">
        <span className="font-semibold" style={{ color: "var(--color-text)" }}>
          Convex Test Mode:
        </span>{" "}
        <span style={{ color: "var(--color-muted)" }}>
          {stores.length} stores, {items.length} items (data persisted to database)
        </span>
      </div>

      <GroceryList
        stores={stores}
        items={items}
        syncStatus="synced"
        onAddItem={handleAddItem}
        onCheckDuplicate={handleCheckDuplicate}
        onMergeQuantity={handleMergeQuantity}
        onVoiceInput={handleVoiceInput}
        onToggleChecked={handleToggleChecked}
        onDeleteItem={handleDeleteItem}
        onUpdateItem={handleUpdateItem}
        onMoveItem={handleMoveItem}
        onAddStore={handleAddStore}
        onRenameStore={handleRenameStore}
        onDeleteStore={handleDeleteStore}
      />
    </div>
  );
}
