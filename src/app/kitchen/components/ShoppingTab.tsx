'use client'

import { useMemo, useCallback, useState } from 'react'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { GroceryList } from '@/components/grocery-list'
import { GroceryZyloChat } from '@/components/grocery-list/GroceryZyloChat'
import { toGroceryStore, toGroceryItem } from '@/lib/grocery-adapters'

interface GroceryAction {
  type: 'add' | 'move' | 'check' | 'uncheck' | 'remove' | 'createStore'
  itemName: string
  quantity?: string
  storeId?: string
  storeName?: string
  isOrganic?: boolean
}

interface ChatMessage {
  role: 'user' | 'zylo'
  content: string
  timestamp: string
}

export function ShoppingTab() {
  // Chat messages state
  const [messages, setMessages] = useState<ChatMessage[]>([])

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

  // AI Action
  const groceryChat = useAction(api.ai.groceryChat)

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
      const newStoreId = await addStore({ name })
      return newStoreId
    } catch (error) {
      console.error('Failed to add store:', error)
      return null
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

  // Add message to chat
  const handleAddMessage = useCallback((role: 'user' | 'zylo', content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        role,
        content,
        timestamp: new Date().toISOString(),
      },
    ])
  }, [])

  // Zylo chat handler
  const handleZyloMessage = useCallback(
    async (message: string) => {
      try {
        const result = await groceryChat({
          message,
          availableStores: stores.map((s) => ({ id: s.id, name: s.name })),
          currentItems: items.map((i) => ({
            id: i.id,
            name: i.name,
            storeId: i.storeId,
            storeName: stores.find((s) => s.id === i.storeId)?.name,
            isChecked: i.isChecked,
          })),
        })

        return result
      } catch (error) {
        console.error('Zylo chat error:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
    [groceryChat, stores, items]
  )

  // Execute Zylo actions - handles createStore and links items to new stores
  const handleExecuteActions = useCallback(
    async (actions: GroceryAction[]) => {
      // Track newly created store IDs by name
      const newStoreIds: Record<string, string> = {}

      for (const action of actions) {
        try {
          switch (action.type) {
            case 'createStore': {
              // Create the new store and track its ID
              const newStoreId = await addStore({ name: action.itemName })
              if (newStoreId) {
                newStoreIds[action.storeName || action.itemName] = newStoreId
              }
              break
            }

            case 'add': {
              // If storeId is "NEW", look up the newly created store
              let finalStoreId = action.storeId
              if (action.storeId === 'NEW' && action.storeName && newStoreIds[action.storeName]) {
                finalStoreId = newStoreIds[action.storeName]
              }

              await addItem({
                name: action.itemName,
                quantity: action.quantity || '1',
                storeId: finalStoreId && finalStoreId !== 'NEW' ? (finalStoreId as Id<'stores'>) : undefined,
                category: 'Other',
                isOrganic: action.isOrganic || false,
              })
              break
            }

            case 'check':
            case 'uncheck': {
              const item = items.find(
                (i) => i.name.toLowerCase() === action.itemName.toLowerCase()
              )
              if (item) {
                await toggleChecked({ id: item.id as Id<'groceryItems'> })
              }
              break
            }

            case 'move': {
              const itemToMove = items.find(
                (i) => i.name.toLowerCase() === action.itemName.toLowerCase()
              )
              if (itemToMove && action.storeId) {
                await reorderItem({
                  id: itemToMove.id as Id<'groceryItems'>,
                  storeId: action.storeId as Id<'stores'>,
                  beforeId: null,
                })
              }
              break
            }

            case 'remove': {
              const itemToRemove = items.find(
                (i) => i.name.toLowerCase() === action.itemName.toLowerCase()
              )
              if (itemToRemove) {
                await removeItem({ id: itemToRemove.id as Id<'groceryItems'> })
              }
              break
            }
          }
        } catch (error) {
          console.error(`Failed to execute action ${action.type}:`, error)
        }
      }
    },
    [items, addItem, addStore, toggleChecked, reorderItem, removeItem]
  )

  // Handle store selection for items without a store
  const handleStoreSelect = useCallback(
    async (storeId: string, itemNames: string[]) => {
      for (const itemName of itemNames) {
        await addItem({
          name: itemName,
          quantity: '1',
          storeId: storeId as Id<'stores'>,
          category: 'Other',
          isOrganic: false,
        })
      }
    },
    [addItem]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
          <p style={{ color: 'var(--color-muted)' }}>Loading grocery list...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/*
        Grocery List content area.
        Bottom padding reserves space for the fixed Zylo chat input (approx 72px)
        so content doesn't get hidden behind it.
      */}
      <div style={{ paddingBottom: '80px' }}>
        <GroceryList
          stores={stores}
          items={items}
          syncStatus="synced"
          onAddItem={handleAddItem}
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

      {/*
        Zylo Chat - messages area + fixed input at bottom.
        The chat input is position:fixed and sits above the bottom nav.
      */}
      <GroceryZyloChat
        stores={stores}
        messages={messages}
        onSendMessage={handleZyloMessage}
        onExecuteActions={handleExecuteActions}
        onAddMessage={handleAddMessage}
        onStoreSelect={handleStoreSelect}
        isLoading={isLoading}
      />
    </div>
  )
}
