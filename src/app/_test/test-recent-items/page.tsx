"use client";

import { useState } from "react";
import { GroceryList } from "@/components/grocery-list";
import type { GroceryItem, GroceryStore } from "@/types/grocery";

/**
 * Test page for Feature #63: Recently checked items can be quickly re-added
 *
 * This demonstrates that cleared items appear in a "Recently Cleared" section
 * and can be tapped to quickly re-add them to the list.
 */

const testStores: GroceryStore[] = [
  { id: "store-meijer", name: "Meijer" },
  { id: "store-costco", name: "Costco" },
];

const initialItems: GroceryItem[] = [
  {
    id: "gi-001",
    name: "Milk",
    category: "Dairy",
    quantity: "1 gallon",
    isChecked: false,
    organicRequired: false,
    storeId: "store-meijer",
  },
  {
    id: "gi-002",
    name: "Eggs",
    category: "Dairy",
    quantity: "1 dozen",
    isChecked: false,
    organicRequired: true,
    storeId: "store-meijer",
  },
  {
    id: "gi-003",
    name: "Bread",
    category: "Bakery",
    quantity: "1 loaf",
    isChecked: false,
    organicRequired: false,
    storeId: "store-meijer",
  },
];

interface RecentItem {
  name: string;
  clearedAt: string;
}

export default function TestRecentItemsPage() {
  const [items, setItems] = useState<GroceryItem[]>(initialItems);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [reAddLog, setReAddLog] = useState<string[]>([]);

  const handleToggleChecked = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  };

  const handleClearChecked = () => {
    // Get the checked items to add to recent
    const clearedItems = items.filter((item) => item.isChecked);

    // Add to recent items
    const newRecentItems: RecentItem[] = clearedItems.map((item) => ({
      name: item.name,
      clearedAt: new Date().toISOString(),
    }));

    setRecentItems((prev) => [...newRecentItems, ...prev].slice(0, 10));

    // Remove checked items from list
    setItems((prev) => prev.filter((item) => !item.isChecked));
  };

  const handleReAddItem = (name: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setReAddLog((prev) => [...prev, `[${timestamp}] Re-added: "${name}"`]);

    // Add the item back to the list
    const newItem: GroceryItem = {
      id: `gi-${Date.now()}`,
      name,
      category: "Other",
      quantity: "1",
      isChecked: false,
      organicRequired: false,
    };
    setItems((prev) => [...prev, newItem]);

    // Remove from recent items
    setRecentItems((prev) => prev.filter((item) => item.name !== name));
  };

  const handleAddItem = (name: string, options?: { storeId?: string; quantity?: string }) => {
    const newItem: GroceryItem = {
      id: `gi-${Date.now()}`,
      name,
      category: "Other",
      quantity: options?.quantity || "1",
      isChecked: false,
      organicRequired: false,
      storeId: options?.storeId,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const checkedCount = items.filter((item) => item.isChecked).length;

  return (
    <div style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Test Header */}
      <div
        className="p-4 border-b"
        style={{
          backgroundColor: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <h1
          className="text-lg font-bold font-heading"
          style={{ color: "var(--color-text)" }}
        >
          Feature #63: Recently Cleared Items
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
          Check items, clear them, then tap to re-add from &quot;Recently Cleared&quot;.
        </p>

        {/* Test Steps */}
        <div
          className="mt-3 p-3 rounded-lg text-sm"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <strong>Test Steps:</strong>
          <ol
            className="list-decimal list-inside mt-1 space-y-1"
            style={{ color: "var(--color-muted)" }}
          >
            <li className={checkedCount > 0 ? "text-green-600 font-medium" : ""}>
              Check off items (tap the checkbox)
              {checkedCount > 0 && ` ✓ (${checkedCount} checked)`}
            </li>
            <li>Tap &quot;Clear checked&quot; to remove them</li>
            <li>
              Find &quot;Recently Cleared&quot; section{" "}
              {recentItems.length > 0 && (
                <span className="text-green-600 font-medium">
                  ✓ ({recentItems.length} items)
                </span>
              )}
            </li>
            <li>Tap an item to re-add it to the list</li>
          </ol>
        </div>

        {/* Re-add Log */}
        {reAddLog.length > 0 && (
          <div
            className="mt-3 p-3 rounded-lg"
            style={{
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              border: "1px solid rgba(76, 175, 80, 0.3)",
            }}
          >
            <p className="font-semibold text-sm" style={{ color: "#4caf50" }}>
              Feature #63 PASSED - Items re-added from history!
            </p>
            <ul className="mt-2 text-xs space-y-1 font-mono" style={{ color: "var(--color-muted)" }}>
              {reAddLog.map((log, i) => (
                <li key={i}>{log}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Grocery List Component */}
      <div className="h-[calc(100vh-300px)]">
        <GroceryList
          stores={testStores}
          items={items}
          syncStatus="synced"
          recentItems={recentItems}
          onAddItem={handleAddItem}
          onToggleChecked={handleToggleChecked}
          onClearChecked={handleClearChecked}
          onReAddItem={handleReAddItem}
          onDeleteItem={(id) => setItems((prev) => prev.filter((item) => item.id !== id))}
          onUpdateItem={(id, updates) =>
            setItems((prev) =>
              prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
            )
          }
          onMoveItem={() => {}}
          onAddStore={() => {}}
          onRenameStore={() => {}}
          onDeleteStore={() => {}}
          onVoiceInput={() => {}}
        />
      </div>
    </div>
  );
}
