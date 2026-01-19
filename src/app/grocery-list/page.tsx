'use client'

import { useState } from 'react'
import { GroceryList } from '@/components/grocery-list'
import { RequireAuth } from '@/components/RequireAuth'
import type { GroceryItem, GroceryStore } from '@/types/grocery'

// Sample data for initial rendering - will be replaced with real API data later
const initialStores: GroceryStore[] = [
  { id: 'store-meijer', name: 'Meijer' },
  { id: 'store-costco', name: 'Costco' },
  { id: 'store-aldi', name: 'Aldi' },
  { id: 'store-trader-joes', name: "Trader Joe's" },
]

const initialItems: GroceryItem[] = [
  {
    id: 'gi-001',
    name: 'Spinach',
    category: 'Produce',
    quantity: '1 bunch',
    isChecked: false,
    organicRequired: true,
    storeId: 'store-aldi',
    mealSources: [{ mealId: 'pm-003', mealName: "Mom's Chicken Stir Fry", date: '2024-01-17' }],
  },
  {
    id: 'gi-002',
    name: 'Strawberries',
    category: 'Produce',
    quantity: '1 lb',
    isChecked: false,
    organicRequired: true,
    storeId: 'store-costco',
  },
  {
    id: 'gi-003',
    name: 'Avocados',
    category: 'Produce',
    quantity: '3',
    isChecked: false,
    organicRequired: false,
    storeId: 'store-trader-joes',
  },
  {
    id: 'gi-004',
    name: 'Bananas',
    category: 'Produce',
    quantity: '1 bunch',
    isChecked: false,
    organicRequired: false,
    storeId: 'store-aldi',
  },
  {
    id: 'gi-005',
    name: 'Grapes',
    category: 'Produce',
    quantity: '1 lb',
    isChecked: false,
    organicRequired: true,
    storeId: 'store-meijer',
  },
  {
    id: 'gi-006',
    name: 'Eggs',
    category: 'Dairy',
    quantity: '1 dozen',
    isChecked: false,
    organicRequired: true,
    storeId: 'store-meijer',
  },
  {
    id: 'gi-007',
    name: 'Greek Yogurt',
    category: 'Dairy',
    quantity: '32 oz',
    isChecked: false,
    organicRequired: false,
    storeId: 'store-costco',
  },
  {
    id: 'gi-008',
    name: 'Butter',
    category: 'Dairy',
    quantity: '1 lb',
    isChecked: false,
    organicRequired: true,
    storeId: 'store-costco',
  },
  {
    id: 'gi-009',
    name: 'Chicken Thighs',
    category: 'Meat',
    quantity: '2 lbs',
    isChecked: false,
    organicRequired: true,
    storeId: 'store-meijer',
    mealSources: [
      { mealId: 'pm-001', mealName: 'Sheet Pan Salmon & Asparagus', date: '2024-01-15' },
      { mealId: 'pm-003', mealName: "Mom's Chicken Stir Fry", date: '2024-01-17' },
    ],
  },
  {
    id: 'gi-010',
    name: 'Ground Turkey',
    category: 'Meat',
    quantity: '1 lb',
    isChecked: false,
    organicRequired: true,
    storeId: 'store-aldi',
  },
  {
    id: 'gi-011',
    name: 'Olive Oil',
    category: 'Pantry',
    quantity: '1 bottle',
    isChecked: false,
    organicRequired: false,
    storeId: 'store-costco',
  },
  {
    id: 'gi-012',
    name: 'Black Beans',
    category: 'Pantry',
    quantity: '2 cans',
    isChecked: false,
    organicRequired: false,
    storeId: 'store-aldi',
    mealSources: [{ mealId: 'pm-002', mealName: 'Taco Tuesday', date: '2024-01-16' }],
  },
  {
    id: 'gi-013',
    name: 'Frozen Berries',
    category: 'Frozen',
    quantity: '1 bag',
    isChecked: true,
    organicRequired: true,
    storeId: 'store-costco',
  },
  {
    id: 'gi-014',
    name: 'Almond Milk',
    category: 'Dairy',
    quantity: '1/2 gallon',
    isChecked: true,
    organicRequired: false,
    storeId: 'store-trader-joes',
  },
  {
    id: 'gi-015',
    name: 'Salsa',
    category: 'Pantry',
    quantity: '1 jar',
    isChecked: true,
    organicRequired: false,
    storeId: 'store-trader-joes',
  },
]

export default function GroceryListPage() {
  const [stores, setStores] = useState<GroceryStore[]>(initialStores)
  const [items, setItems] = useState<GroceryItem[]>(initialItems)

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
    // Move items from deleted store to unassigned
    setItems((prev) => prev.map((item) => (item.storeId === id ? { ...item, storeId: undefined } : item)))
  }

  const handleVoiceInput = () => {
    // Placeholder for voice input - will be implemented later
    console.log('Voice input triggered')
  }

  return (
    <RequireAuth>
      <div className="h-[calc(100vh-120px)]">
        <GroceryList
          stores={stores}
          items={items}
          syncStatus="synced"
          onAddItem={handleAddItem}
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
    </RequireAuth>
  )
}
