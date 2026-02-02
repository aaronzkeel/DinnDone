'use client'

import { useMemo } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { GroceryList } from '@/components/grocery-list'
import { toGroceryStore, toGroceryItem } from '@/lib/grocery-adapters'

export function ShoppingTab() {
  // Queries
  const storesData = useQuery(api.stores.list)
  const itemsData = useQuery(api.groceryItems.listWithMealDetails)

  // Mutations
  const addItem = useMutation(api.groceryItems.add)
  const toggleChecked = useMutation(api.groceryItems.toggleChecked)
  const removeItem = useMutation(api.groceryItems.remove)
  const updateItem = useMutation(api.groceryItems.update)
  const reorderItem = useMutation(api.groceryItems.reorder)
  const addStore = useMutation(api.stores.add)
  const updateStore = useMutation(api.stores.update)
  const removeStore = useMutation(api.stores.remove)
  const clearChecked = useMutation(api.groceryItems.clearChecked)

  // Convert Convex data to UI types
  const stores = useMemo(() => {
    if (!storesData) return []
    return storesData.map(toGroceryStore)
  }, [storesData])

  const items = useMemo(() => {
    if (!itemsData) return []
    return itemsData.map(toGroceryItem)
  }, [itemsData])

  // Loading state
  const isLoading = storesData === undefined || itemsData === undefined

  const handleAddItem = async (
    name: string,
    options?: { storeId?: string; quantity?: string }
  ) => {
    try {
      await addItem({
        name,
        quantity: options?.quantity || '1',
        storeId: options?.storeId as Id<'stores'> | undefined,
        category: 'Other',
        isOrganic: false,
      })
    } catch (error) {
      console.error('Failed to add item:', error)
    }
  }

  const handleToggleChecked = async (id: string) => {
    try {
      await toggleChecked({ id: id as Id<'groceryItems'> })
    } catch (error) {
      console.error('Failed to toggle checked:', error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      await removeItem({ id: id as Id<'groceryItems'> })
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  const handleUpdateItem = async (
    id: string,
    updates: { name?: string; quantity?: string; organicRequired?: boolean }
  ) => {
    try {
      await updateItem({
        id: id as Id<'groceryItems'>,
        name: updates.name,
        quantity: updates.quantity,
        isOrganic: updates.organicRequired,
      })
    } catch (error) {
      console.error('Failed to update item:', error)
    }
  }

  const handleMoveItem = async (
    id: string,
    options: { storeId?: string; beforeId?: string | null }
  ) => {
    try {
      // Convert undefined storeId to null to signal "move to unassigned"
      const storeIdArg =
        options.storeId !== undefined
          ? (options.storeId as Id<'stores'>)
          : null

      await reorderItem({
        id: id as Id<'groceryItems'>,
        storeId: storeIdArg,
        beforeId:
          options.beforeId === null
            ? null
            : options.beforeId !== undefined
              ? (options.beforeId as Id<'groceryItems'>)
              : undefined,
      })
    } catch (error) {
      console.error('Failed to move item:', error)
    }
  }

  const handleAddStore = async (name: string) => {
    try {
      await addStore({ name })
    } catch (error) {
      console.error('Failed to add store:', error)
    }
  }

  const handleRenameStore = async (id: string, name: string) => {
    try {
      await updateStore({ id: id as Id<'stores'>, name })
    } catch (error) {
      console.error('Failed to rename store:', error)
    }
  }

  const handleDeleteStore = async (id: string) => {
    try {
      await removeStore({ id: id as Id<'stores'> })
    } catch (error) {
      console.error('Failed to delete store:', error)
    }
  }

  const handleClearChecked = async () => {
    try {
      await clearChecked({})
    } catch (error) {
      console.error('Failed to clear checked items:', error)
    }
  }

  const handleVoiceInput = () => {
    // Placeholder for voice input - will be implemented later
    console.log('Voice input triggered')
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
          <p className="text-[var(--color-text-secondary)]">Loading grocery list...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-200px)]">
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
        onClearChecked={handleClearChecked}
      />
    </div>
  )
}
