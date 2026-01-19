'use client'

import { useMemo, useState } from 'react'
import { Mic, Cloud, CloudOff, Loader2, Store, Settings2, Plus, Trash2, ChevronDown, ChevronUp, AlignJustify, List } from 'lucide-react'
import type { GroceryListProps, GroceryItem, GroceryStore } from '@/types/grocery'
import { GroceryListItem } from './GroceryListItem'

// (We keep category on items for future use, but ordering is manual via drag-and-drop.)

function normalizeStoreId(stores: GroceryStore[], storeId?: string): string | undefined {
  if (!storeId) return undefined
  return stores.some((s) => s.id === storeId) ? storeId : undefined
}

function groupByStore(items: GroceryItem[], stores: GroceryStore[]): Array<{ storeId?: string; storeName: string; items: GroceryItem[] }> {
  const byStore = new Map<string, GroceryItem[]>()
  const unassigned: GroceryItem[] = []

  for (const item of items) {
    const normalizedId = normalizeStoreId(stores, item.storeId)
    if (!normalizedId) {
      unassigned.push(item)
      continue
    }

    const list = byStore.get(normalizedId) || []
    list.push(item)
    byStore.set(normalizedId, list)
  }

  const result: Array<{ storeId?: string; storeName: string; items: GroceryItem[] }> = []

  for (const store of stores) {
    const storeItems = byStore.get(store.id) || []
    if (storeItems.length > 0) {
      result.push({ storeId: store.id, storeName: store.name, items: storeItems })
    }
  }

  if (unassigned.length > 0) {
    result.push({ storeId: undefined, storeName: 'Unassigned', items: unassigned })
  }

  return result
}

function isStoreDropTarget(activeDropTarget: string | null, dropKey: string): boolean {
  if (!activeDropTarget) return false
  return activeDropTarget === dropKey || activeDropTarget.startsWith(`${dropKey}::`)
}

/**
 * Parse item input to extract name and optional quantity.
 * Supports formats like:
 * - "Apples 2 lbs" → name: "Apples", quantity: "2 lbs"
 * - "Chicken breast 1.5 lb" → name: "Chicken breast", quantity: "1.5 lb"
 * - "Milk (2 gallons)" → name: "Milk", quantity: "2 gallons"
 * - "Eggs x12" → name: "Eggs", quantity: "12"
 * - "3 onions" → name: "onions", quantity: "3"
 * - "Just apples" → name: "Just apples", quantity: undefined
 */
function parseItemInput(input: string): { name: string; quantity?: string } {
  const trimmed = input.trim()
  if (!trimmed) return { name: '' }

  // Pattern 1: Quantity in parentheses at end - "Milk (2 gallons)"
  const parenMatch = trimmed.match(/^(.+?)\s*\(([^)]+)\)$/)
  if (parenMatch) {
    return { name: parenMatch[1].trim(), quantity: parenMatch[2].trim() }
  }

  // Pattern 2: "x" prefix for quantity - "Eggs x12" or "Eggs x 12"
  const xMatch = trimmed.match(/^(.+?)\s*x\s*(\d+(?:\.\d+)?)\s*$/)
  if (xMatch) {
    return { name: xMatch[1].trim(), quantity: xMatch[2] }
  }

  // Pattern 3: Number + unit at end - "Apples 2 lbs", "Chicken breast 1.5 lb"
  // This regex looks for a number (possibly decimal) followed by optional unit at end
  const endQuantityMatch = trimmed.match(/^(.+?)\s+(\d+(?:\.\d+)?(?:\s*(?:lbs?|oz|g|kg|cups?|gallons?|liters?|pints?|quarts?|dozen|pack|bunch|bag|box|can|jar|bottle|ct|count|pcs?|pieces?|slices?|servings?)?)?)\s*$/i)
  if (endQuantityMatch && endQuantityMatch[1].length > 0) {
    return { name: endQuantityMatch[1].trim(), quantity: endQuantityMatch[2].trim() }
  }

  // Pattern 4: Leading number - "3 onions", "2 dozen eggs"
  const leadingMatch = trimmed.match(/^(\d+(?:\.\d+)?(?:\s+(?:dozen|pack|bunch|bag|box|can|jar|bottle|ct|count))?)\s+(.+)$/i)
  if (leadingMatch) {
    return { name: leadingMatch[2].trim(), quantity: leadingMatch[1].trim() }
  }

  // No quantity detected
  return { name: trimmed }
}

export function GroceryList({
  stores,
  items,
  syncStatus = 'synced',
  onAddItem,
  onVoiceInput,
  onToggleChecked,
  onDeleteItem,
  onUpdateItem,
  onMoveItem,
  onAddStore,
  onRenameStore,
  onDeleteStore,
}: GroceryListProps) {
  const [activeStoreFilter, setActiveStoreFilter] = useState<string>('all')
  const [isManagingStores, setIsManagingStores] = useState(false)
  const [newStoreName, setNewStoreName] = useState('')
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null)
  const [activeDropTarget, setActiveDropTarget] = useState<string | null>(null)

  const [addingToStoreKey, setAddingToStoreKey] = useState<string | null>(null)
  const [draftNewItemName, setDraftNewItemName] = useState('')

  const [showDone, setShowDone] = useState(false)
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')

  // Separate active and checked items
  const activeItems = items.filter((item) => !item.isChecked)
  const checkedItems = items.filter((item) => item.isChecked)

  const activeByStoreAll = useMemo(() => groupByStore(activeItems, stores), [activeItems, stores])
  const checkedByStoreAll = useMemo(() => groupByStore(checkedItems, stores), [checkedItems, stores])

  const activeByStore = useMemo(() => {
    if (activeStoreFilter === 'all') return activeByStoreAll
    if (activeStoreFilter === 'unassigned') {
      return activeByStoreAll.filter((g) => !g.storeId)
    }
    return activeByStoreAll.filter((g) => g.storeId === activeStoreFilter)
  }, [activeByStoreAll, activeStoreFilter])

  const checkedByStore = useMemo(() => {
    if (activeStoreFilter === 'all') return checkedByStoreAll
    if (activeStoreFilter === 'unassigned') {
      return checkedByStoreAll.filter((g) => !g.storeId)
    }
    return checkedByStoreAll.filter((g) => g.storeId === activeStoreFilter)
  }, [checkedByStoreAll, activeStoreFilter])

  const handleInlineAdd = (storeId?: string) => {
    const { name, quantity } = parseItemInput(draftNewItemName)
    if (!name) return
    onAddItem?.(name, { storeId, quantity })
    setDraftNewItemName('')
    setAddingToStoreKey(null)
  }

  return (
    <div className="flex flex-col h-full bg-stone-50 dark:bg-stone-900">
      {/* Desktop max-width container for comfortable reading */}
      <div className="w-full max-w-2xl mx-auto">
      {/* Input area - sticky at top */}
      <div className="sticky top-0 z-10 bg-stone-50 dark:bg-stone-900 px-4 pt-4 pb-3 border-b border-stone-200 dark:border-stone-800">
        {/* Header with total count */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-stone-800 dark:text-stone-100">
            Grocery List
          </h1>
          <span className="text-sm font-medium text-stone-500 dark:text-stone-400" data-testid="total-item-count">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-200">
            <Store size={16} className="text-stone-500 dark:text-stone-400" />
            <span>Stores</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setDensity(density === 'comfortable' ? 'compact' : 'comfortable')}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label={density === 'comfortable' ? 'Switch to compact view' : 'Switch to comfortable view'}
              title={density === 'comfortable' ? 'Compact view' : 'Comfortable view'}
            >
              {density === 'comfortable' ? <List size={18} /> : <AlignJustify size={18} />}
            </button>
            <button
              type="button"
              onClick={onVoiceInput}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <Mic size={16} />
              Voice
            </button>
            <button
              type="button"
              onClick={() => setIsManagingStores(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <Settings2 size={16} />
              Edit
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <button
            type="button"
            onClick={() => setActiveStoreFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors whitespace-nowrap flex-shrink-0 ${
              activeStoreFilter === 'all'
                ? 'bg-yellow-100 dark:bg-yellow-900/40 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700'
            }`}
          >
            All
          </button>
          {stores.map((store) => (
            <button
              key={store.id}
              type="button"
              onClick={() => setActiveStoreFilter(store.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors whitespace-nowrap flex-shrink-0 ${
                activeStoreFilter === store.id
                  ? 'bg-yellow-100 dark:bg-yellow-900/40 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700'
              }`}
            >
              {store.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setActiveStoreFilter('unassigned')}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors whitespace-nowrap flex-shrink-0 ${
              activeStoreFilter === 'unassigned'
                ? 'bg-yellow-100 dark:bg-yellow-900/40 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700'
            }`}
          >
            Unassigned
          </button>
        </div>

        {/* Sync status indicator */}
        <div className="flex items-center justify-end gap-1.5 mt-2 text-xs">
          {syncStatus === 'synced' && (
            <>
              <Cloud size={12} className="text-stone-400 dark:text-stone-500" />
              <span className="text-stone-400 dark:text-stone-500">Synced</span>
            </>
          )}
          {syncStatus === 'syncing' && (
            <>
              <Loader2 size={12} className="text-yellow-500 animate-spin" />
              <span className="text-yellow-600 dark:text-yellow-400">Syncing...</span>
            </>
          )}
          {syncStatus === 'offline' && (
            <>
              <CloudOff size={12} className="text-stone-400 dark:text-stone-500" />
              <span className="text-stone-400 dark:text-stone-500">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* List area */}
      <div className="flex-1 overflow-auto">
        {/* Active items grouped by store */}
        {activeByStore.length > 0 && (
          <div className="py-2">
            {activeByStore.map((group) => {
              const sorted = group.items
              const dropKey = group.storeId || 'unassigned'
              const isActiveDrop = isStoreDropTarget(activeDropTarget, dropKey)
              return (
                <div
                  key={dropKey}
                  className={`mb-5 rounded-2xl ${isActiveDrop ? 'ring-2 ring-yellow-300 dark:ring-yellow-600' : ''}`}
                  onDragOver={(e) => {
                    if (!draggingItemId) return
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                    setActiveDropTarget(dropKey)
                  }}
                  onDragEnter={() => {
                    if (!draggingItemId) return
                    setActiveDropTarget(dropKey)
                  }}
                  onDragLeave={() => {
                    setActiveDropTarget((prev) => {
                      if (!prev) return prev
                      return prev === dropKey || prev.startsWith(`${dropKey}::`) ? null : prev
                    })
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    const itemId = e.dataTransfer.getData('text/plain') || draggingItemId
                    if (!itemId) return

                    const newStoreId = group.storeId
                    const item = items.find((i) => i.id === itemId)
                    if (!item) return

                    if ((item.storeId || undefined) === (newStoreId || undefined)) {
                      setActiveDropTarget(null)
                      setDraggingItemId(null)
                      return
                    }

                    onMoveItem?.(itemId, { storeId: newStoreId, beforeId: null })
                    setActiveDropTarget(null)
                    setDraggingItemId(null)
                  }}
                >
                  <div className="px-4 pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                        {group.storeName}
                      </span>
                      <span className="text-xs text-stone-400 dark:text-stone-500">
                        {sorted.length}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-0">
                    {sorted.map((item) => {
                      const itemDropKey = `${dropKey}::${item.id}`
                      const isDropTarget = activeDropTarget === itemDropKey
                      return (
                        <div key={item.id}>
                          <GroceryListItem
                            item={item}
                            onToggle={() => onToggleChecked?.(item.id)}
                            onDelete={() => onDeleteItem?.(item.id)}
                            onUpdateName={(name) => onUpdateItem?.(item.id, { name })}
                            onUpdateQuantity={(quantity) => onUpdateItem?.(item.id, { quantity })}
                            enableDrag={true}
                            onDragStart={(itemId) => setDraggingItemId(itemId)}
                            onDragEnd={() => {
                              setDraggingItemId(null)
                              setActiveDropTarget(null)
                            }}
                            onDragOver={draggingItemId ? () => setActiveDropTarget(itemDropKey) : undefined}
                            onDropBefore={() => {
                              if (!draggingItemId) return
                              onMoveItem?.(draggingItemId, { storeId: group.storeId, beforeId: item.id })
                              setActiveDropTarget(null)
                              setDraggingItemId(null)
                            }}
                            isDropTarget={isDropTarget}
                            density={density}
                          />
                        </div>
                      )
                    })}

                    {/* Inline add row */}
                    <div className="px-4 py-2">
                      {addingToStoreKey === dropKey ? (
                        <form
                          className="flex gap-2"
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleInlineAdd(group.storeId)
                          }}
                        >
                          <input
                            autoFocus
                            value={draftNewItemName}
                            onChange={(e) => setDraftNewItemName(e.target.value)}
                            placeholder="Add an item…"
                            className="flex-1 h-10 px-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
                          />
                          <button
                            type="submit"
                            className="h-10 px-4 rounded-xl bg-yellow-500 dark:bg-yellow-600 text-white font-semibold"
                          >
                            Add
                          </button>
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setAddingToStoreKey(dropKey)
                            setDraftNewItemName('')
                          }}
                          className="w-full text-left text-sm font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100"
                        >
                          + Add item
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {activeItems.length === 0 && checkedItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-stone-400 dark:text-stone-500">
                <path d="M8 12h16M8 16h12M8 20h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-stone-500 dark:text-stone-400 font-medium">Your list is empty</p>
            <p className="text-stone-400 dark:text-stone-500 text-sm mt-1 mb-4">
              Add your first item to get started
            </p>
            {addingToStoreKey === 'empty-state' ? (
              <form
                className="flex gap-2 w-full max-w-xs"
                onSubmit={(e) => {
                  e.preventDefault()
                  const { name, quantity } = parseItemInput(draftNewItemName)
                  if (!name) return
                  onAddItem?.(name, { quantity })
                  setDraftNewItemName('')
                  setAddingToStoreKey(null)
                }}
              >
                <input
                  autoFocus
                  value={draftNewItemName}
                  onChange={(e) => setDraftNewItemName(e.target.value)}
                  placeholder="Item name..."
                  className="flex-1 h-11 px-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
                />
                <button
                  type="submit"
                  className="h-11 px-5 rounded-xl bg-yellow-500 dark:bg-yellow-600 text-white font-semibold hover:bg-yellow-600 dark:hover:bg-yellow-500 transition-colors"
                >
                  Add
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAddingToStoreKey('empty-state')
                  setDraftNewItemName('')
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-500 dark:bg-yellow-600 text-white font-semibold hover:bg-yellow-600 dark:hover:bg-yellow-500 transition-colors"
              >
                <Plus size={18} />
                Add first item
              </button>
            )}
          </div>
        )}

        {/* Checked items section */}
        {checkedByStore.length > 0 && (
          <div className="border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setShowDone((prev) => !prev)}
              className="w-full flex items-center justify-between px-4 py-3"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">
                Done ({checkedItems.length})
              </span>
              {showDone ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 dark:text-stone-400">
                  Hide
                  <ChevronUp size={14} />
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 dark:text-stone-400">
                  Show
                  <ChevronDown size={14} />
                </span>
              )}
            </button>

            {showDone && (
              <div className="pb-3">
                {checkedByStore.map((group) => {
                  const sorted = group.items
                  return (
                    <div key={group.storeId || 'unassigned'} className="mt-3">
                      <div className="px-4 pb-1">
                        <span className="text-xs font-bold uppercase tracking-wide text-stone-400 dark:text-stone-500">
                          {group.storeName} ({sorted.length})
                        </span>
                      </div>
                      {sorted.map((item) => (
                        <GroceryListItem
                          key={item.id}
                          item={item}
                          onToggle={() => onToggleChecked?.(item.id)}
                          onDelete={() => onDeleteItem?.(item.id)}
                          onUpdateName={(name) => onUpdateItem?.(item.id, { name })}
                          onUpdateQuantity={(quantity) => onUpdateItem?.(item.id, { quantity })}
                          density={density}
                        />
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
      </div>{/* End desktop max-width container */}

      {/* Store manager */}
      {isManagingStores && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-stone-900/40"
            onClick={() => setIsManagingStores(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 bg-white dark:bg-stone-900 rounded-t-3xl border-t border-stone-200 dark:border-stone-700 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">Stores</div>
                <div className="text-xs text-stone-500 dark:text-stone-400">Add, rename, or remove stores.</div>
              </div>
              <button
                type="button"
                onClick={() => setIsManagingStores(false)}
                className="text-sm font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100"
              >
                Done
              </button>
            </div>

            <div className="mt-4 space-y-2 max-h-[50vh] overflow-auto">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center gap-2 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-2"
                >
                  <input
                    value={store.name}
                    onChange={(e) => onRenameStore?.(store.id, e.target.value)}
                    className="flex-1 bg-transparent text-sm font-semibold text-stone-800 dark:text-stone-100 focus:outline-none"
                    aria-label="Store name"
                  />
                  <button
                    type="button"
                    onClick={() => onDeleteStore?.(store.id)}
                    className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-white/70 dark:hover:bg-stone-700 transition-colors"
                    aria-label="Delete store"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                const trimmed = newStoreName.trim()
                if (!trimmed) return
                onAddStore?.(trimmed)
                setNewStoreName('')
              }}
            >
              <input
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                placeholder="Add a store…"
                className="flex-1 h-11 px-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
              />
              <button
                type="submit"
                className="h-11 px-4 rounded-xl bg-yellow-500 dark:bg-yellow-600 text-white font-semibold inline-flex items-center gap-2 hover:bg-yellow-600 dark:hover:bg-yellow-500 transition-colors"
              >
                <Plus size={16} />
                Add
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
