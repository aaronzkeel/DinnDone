'use client'

import { useState } from 'react'
import { GroceryList } from '@/components/grocery-list'
import type { GroceryItem, GroceryStore } from '@/types/grocery'

// Test page for verifying Feature #24: Items grouped by store
// This bypasses auth for testing purposes

const testStores: GroceryStore[] = [
  { id: 'store-meijer', name: 'Meijer' },
  { id: 'store-costco', name: 'Costco' },
  { id: 'store-aldi', name: 'Aldi' },
  { id: 'store-trader-joes', name: "Trader Joe's" },
  { id: 'store-target', name: 'Target' },
  { id: 'store-whole-foods', name: 'Whole Foods Market' },
  { id: 'store-kroger', name: 'Kroger' },
]

const testItems: GroceryItem[] = [
  // Meijer items
  {
    id: 'gi-001',
    name: 'Grapes',
    category: 'Produce',
    quantity: '1 lb',
    isChecked: false,
    organicRequired: true,
    storeId: 'store-meijer',
  },
  {
    id: 'gi-002',
    name: 'Eggs',
    category: 'Dairy',
    quantity: '1 dozen',
    isChecked: false,
    organicRequired: true,
    storeId: 'store-meijer',
  },
  {
    id: 'gi-003',
    name: 'Chicken Thighs',
    category: 'Meat',
    quantity: '2 lbs',
    isChecked: false,
    organicRequired: true,
    storeId: 'store-meijer',
    mealSources: [
      { mealId: 'meal-1', mealName: 'Chicken Stir Fry', date: '2026-01-19' },
      { mealId: 'meal-2', mealName: 'Grilled Chicken Salad', date: '2026-01-21' },
    ],
  },
  // Costco items
  {
    id: 'gi-004',
    name: 'Strawberries',
    category: 'Produce',
    quantity: '1 lb',
    isChecked: false,
    organicRequired: true,
    storeId: 'store-costco',
  },
  {
    id: 'gi-005',
    name: 'Greek Yogurt',
    category: 'Dairy',
    quantity: '32 oz',
    isChecked: false,
    organicRequired: false,
    storeId: 'store-costco',
  },
  // Aldi items
  {
    id: 'gi-006',
    name: 'Spinach',
    category: 'Produce',
    quantity: '1 bunch',
    isChecked: false,
    organicRequired: true,
    storeId: 'store-aldi',
  },
  {
    id: 'gi-007',
    name: 'Bananas',
    category: 'Produce',
    quantity: '1 bunch',
    isChecked: false,
    organicRequired: false,
    storeId: 'store-aldi',
  },
  // Trader Joe's items
  {
    id: 'gi-008',
    name: 'Avocados',
    category: 'Produce',
    quantity: '3',
    isChecked: false,
    organicRequired: false,
    storeId: 'store-trader-joes',
  },
]

export default function TestGroceryListPage() {
  const [stores, setStores] = useState<GroceryStore[]>(testStores)
  const [items, setItems] = useState<GroceryItem[]>(testItems)

  const handleAddItem = (name: string, options?: { storeId?: string; quantity?: string }) => {
    const newItem: GroceryItem = {
      id: `gi-${Date.now()}`,
      name,
      category: 'Other',
      quantity: options?.quantity || '1',
      isChecked: false,
      organicRequired: false,
      storeId: options?.storeId,
    }
    setItems((prev) => [...prev, newItem])
  }

  const handleToggleChecked = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, isChecked: !item.isChecked } : item)))
  }

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleUpdateItem = (id: string, updates: { name?: string; quantity?: string }) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const handleMoveItem = (id: string, options: { storeId?: string; beforeId?: string | null }) => {
    setItems((prev) => {
      const itemIndex = prev.findIndex((item) => item.id === id)
      if (itemIndex === -1) return prev

      const item = { ...prev[itemIndex], storeId: options.storeId }
      const newItems = prev.filter((i) => i.id !== id)

      if (options.beforeId) {
        const beforeIndex = newItems.findIndex((i) => i.id === options.beforeId)
        if (beforeIndex !== -1) {
          newItems.splice(beforeIndex, 0, item)
          return newItems
        }
      }

      return [...newItems, item]
    })
  }

  const handleAddStore = (name: string) => {
    const newStore: GroceryStore = {
      id: `store-${Date.now()}`,
      name,
    }
    setStores((prev) => [...prev, newStore])
  }

  const handleRenameStore = (id: string, name: string) => {
    setStores((prev) => prev.map((store) => (store.id === id ? { ...store, name } : store)))
  }

  const handleDeleteStore = (id: string) => {
    setStores((prev) => prev.filter((store) => store.id !== id))
    setItems((prev) => prev.map((item) => (item.storeId === id ? { ...item, storeId: undefined } : item)))
  }

  const handleVoiceInput = () => {
    console.log('Voice input triggered (legacy)')
  }

  const handleVoiceResult = (transcript: string) => {
    console.log('Voice input result:', transcript)
    // Parse the transcript and add as item (reusing existing add logic)
    handleAddItem(transcript)
  }

  return (
    <div className="h-[calc(100vh-120px)]">
      <GroceryList
        stores={stores}
        items={items}
        syncStatus="synced"
        onAddItem={handleAddItem}
        onVoiceInput={handleVoiceInput}
        onVoiceResult={handleVoiceResult}
        onToggleChecked={handleToggleChecked}
        onDeleteItem={handleDeleteItem}
        onUpdateItem={handleUpdateItem}
        onMoveItem={handleMoveItem}
        onAddStore={handleAddStore}
        onRenameStore={handleRenameStore}
        onDeleteStore={handleDeleteStore}
      />
    </div>
  )
}
