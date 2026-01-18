'use client'

import { useState } from 'react'
import { GroceryList } from '@/components/grocery-list'
import type { GroceryItem, GroceryStore } from '@/types/grocery'

// Test page for Feature #43: Empty state shows when no items

const initialStores: GroceryStore[] = [
  { id: 'store-meijer', name: 'Meijer' },
  { id: 'store-costco', name: 'Costco' },
]

export default function TestEmptyGroceryListPage() {
  const [stores, setStores] = useState<GroceryStore[]>(initialStores)
  const [items, setItems] = useState<GroceryItem[]>([])

  const handleAddItem = (name: string, options?: { storeId?: string }) => {
    const newItem: GroceryItem = {
      id: `gi-${Date.now()}`,
      name,
      category: 'Other',
      quantity: '1',
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
    console.log('Voice input triggered')
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="p-4 bg-card border-b border-stone-200 dark:border-stone-700">
        <h1 className="text-lg font-heading font-semibold">Test: Empty Grocery List</h1>
        <p className="text-sm text-muted-foreground">Feature #43: Empty state shows when no items</p>
        <div className="mt-2 flex gap-2">
          <span className="text-xs bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded">
            Items: {items.length}
          </span>
          <button
            type="button"
            onClick={() => setItems([])}
            className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
          >
            Clear All Items
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
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
    </div>
  )
}
