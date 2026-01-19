'use client'

import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, Cloud, CloudOff, Loader2, Store, Settings2, Plus, Trash2, ChevronDown, ChevronUp, AlignJustify, List, AlertTriangle, X } from 'lucide-react'
import type { GroceryListProps, GroceryItem, GroceryStore, DuplicateItemInfo } from '@/types/grocery'
import { GroceryListItem } from './GroceryListItem'
import { useVoiceInput } from '@/hooks/useVoiceInput'

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
  onCheckDuplicate,
  onMergeQuantity,
  onVoiceInput,
  onVoiceResult,
  onToggleChecked,
  onDeleteItem,
  onUpdateItem,
  onMoveItem,
  onAddStore,
  onRenameStore,
  onDeleteStore,
  onClearChecked,
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

  // Duplicate warning modal state
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [duplicateItem, setDuplicateItem] = useState<DuplicateItemInfo | null>(null)
  const [pendingAdd, setPendingAdd] = useState<{ name: string; quantity?: string; storeId?: string } | null>(null)

  // Voice input state - shows toast when voice adds item
  const [voiceAddedItem, setVoiceAddedItem] = useState<string | null>(null)

  // Focus trap for modals
  const storeModalRef = useRef<HTMLDivElement>(null)
  const duplicateModalRef = useRef<HTMLDivElement>(null)

  // Focus trap handler
  const handleFocusTrap = useCallback((e: KeyboardEvent, modalRef: React.RefObject<HTMLDivElement | null>) => {
    if (e.key !== 'Tab' || !modalRef.current) return

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const focusableArray = Array.from(focusableElements)
    if (focusableArray.length === 0) return

    const firstElement = focusableArray[0]
    const lastElement = focusableArray[focusableArray.length - 1]

    if (e.shiftKey) {
      // Shift+Tab: if on first element, go to last
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab: if on last element, go to first
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }, [])

  // Set up focus trap for store management modal
  useEffect(() => {
    if (!isManagingStores) return

    // Focus first element when modal opens
    const timeoutId = setTimeout(() => {
      if (storeModalRef.current) {
        const firstFocusable = storeModalRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        firstFocusable?.focus()
      }
    }, 0)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsManagingStores(false)
        return
      }
      handleFocusTrap(e, storeModalRef)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isManagingStores, handleFocusTrap])

  // Set up focus trap for duplicate warning modal
  useEffect(() => {
    if (!showDuplicateWarning) return

    // Focus first element when modal opens
    const timeoutId = setTimeout(() => {
      if (duplicateModalRef.current) {
        const firstFocusable = duplicateModalRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        firstFocusable?.focus()
      }
    }, 0)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDuplicateModal()
        return
      }
      handleFocusTrap(e, duplicateModalRef)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showDuplicateWarning, handleFocusTrap])

  // Voice input hook - only use if onVoiceResult is provided (component handles voice)
  const voiceInput = useVoiceInput({
    onResult: (transcript) => {
      if (onVoiceResult) {
        onVoiceResult(transcript)
        // Show toast notification
        setVoiceAddedItem(transcript)
        setTimeout(() => setVoiceAddedItem(null), 3000)
      }
    },
  })

  // Handle voice button click
  const handleVoiceClick = () => {
    if (onVoiceResult) {
      // Component handles voice internally
      if (voiceInput.isListening) {
        voiceInput.stopListening()
      } else {
        voiceInput.startListening()
      }
    } else if (onVoiceInput) {
      // Legacy: parent handles voice
      onVoiceInput()
    }
  }

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

  const handleInlineAdd = async (storeId?: string) => {
    const { name, quantity } = parseItemInput(draftNewItemName)
    if (!name) return

    // Check for duplicates if the handler is provided
    if (onCheckDuplicate) {
      const result = await onCheckDuplicate(name)
      if (result.exists && result.item) {
        // Show duplicate warning modal
        setDuplicateItem(result.item)
        setPendingAdd({ name, quantity, storeId })
        setShowDuplicateWarning(true)
        return
      }
    }

    // No duplicate found, add the item
    onAddItem?.(name, { storeId, quantity })
    setDraftNewItemName('')
    setAddingToStoreKey(null)
  }

  const handleDuplicateMerge = () => {
    if (duplicateItem && pendingAdd && onMergeQuantity) {
      onMergeQuantity(duplicateItem.id, pendingAdd.quantity || '1')
    }
    closeDuplicateModal()
  }

  const handleDuplicateAddAnyway = () => {
    if (pendingAdd) {
      onAddItem?.(pendingAdd.name, { storeId: pendingAdd.storeId, quantity: pendingAdd.quantity })
    }
    closeDuplicateModal()
  }

  const closeDuplicateModal = () => {
    setShowDuplicateWarning(false)
    setDuplicateItem(null)
    setPendingAdd(null)
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
              onClick={handleVoiceClick}
              disabled={onVoiceResult && !voiceInput.isSupported}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                voiceInput.isListening
                  ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 animate-pulse'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              } ${onVoiceResult && !voiceInput.isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label={voiceInput.isListening ? 'Stop listening' : 'Start voice input'}
            >
              {voiceInput.isListening ? <MicOff size={16} /> : <Mic size={16} />}
              {voiceInput.isListening ? 'Listening...' : 'Voice'}
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
                    {sorted.map((item, index) => {
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
                            onToggleOrganic={() => onUpdateItem?.(item.id, { organicRequired: !item.organicRequired })}
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
                            onMoveUp={index > 0 ? () => {
                              // Move this item before the previous item
                              const prevItem = sorted[index - 1]
                              onMoveItem?.(item.id, { storeId: group.storeId, beforeId: prevItem.id })
                            } : undefined}
                            onMoveDown={index < sorted.length - 1 ? () => {
                              // Move this item after the next item (before the item after next, or to end)
                              const afterNextItem = sorted[index + 2]
                              onMoveItem?.(item.id, { storeId: group.storeId, beforeId: afterNextItem?.id ?? null })
                            } : undefined}
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

        {/* Empty state for filtered store */}
        {activeStoreFilter !== 'all' && activeByStore.length === 0 && checkedByStore.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
              <Store size={32} className="text-stone-400 dark:text-stone-500" />
            </div>
            <p className="text-stone-500 dark:text-stone-400 font-medium">No items at this store</p>
            <p className="text-stone-400 dark:text-stone-500 text-sm mt-1 mb-4">
              Add items to {activeStoreFilter === 'unassigned' ? 'unassigned' : stores.find(s => s.id === activeStoreFilter)?.name || 'this store'}
            </p>
            {addingToStoreKey === 'filtered-empty' ? (
              <form
                className="flex gap-2 w-full max-w-xs"
                onSubmit={(e) => {
                  e.preventDefault()
                  const { name, quantity } = parseItemInput(draftNewItemName)
                  if (!name) return
                  onAddItem?.(name, { storeId: activeStoreFilter === 'unassigned' ? undefined : activeStoreFilter, quantity })
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
                  setAddingToStoreKey('filtered-empty')
                  setDraftNewItemName('')
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-500 dark:bg-yellow-600 text-white font-semibold hover:bg-yellow-600 dark:hover:bg-yellow-500 transition-colors"
              >
                <Plus size={18} />
                Add item
              </button>
            )}
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
            <div className="flex items-center justify-between px-4 py-3">
              <button
                type="button"
                onClick={() => setShowDone((prev) => !prev)}
                className="flex items-center gap-2"
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
              {showDone && onClearChecked && (
                <button
                  type="button"
                  onClick={onClearChecked}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  aria-label="Clear all checked items"
                >
                  <Trash2 size={14} />
                  Clear checked
                </button>
              )}
            </div>

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
                          onToggleOrganic={() => onUpdateItem?.(item.id, { organicRequired: !item.organicRequired })}
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
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="store-manager-title">
          <div
            className="absolute inset-0 bg-stone-900/40"
            onClick={() => setIsManagingStores(false)}
            aria-hidden="true"
          />
          <div ref={storeModalRef} className="absolute inset-x-0 bottom-0 bg-white dark:bg-stone-900 rounded-t-3xl border-t border-stone-200 dark:border-stone-700 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between">
              <div>
                <div id="store-manager-title" className="text-sm font-semibold text-stone-900 dark:text-stone-100">Stores</div>
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

      {/* Duplicate item warning modal */}
      {showDuplicateWarning && duplicateItem && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="duplicate-warning-title">
          <div
            className="absolute inset-0 bg-stone-900/50"
            onClick={closeDuplicateModal}
            aria-hidden="true"
          />
          <div ref={duplicateModalRef} className="absolute inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 id="duplicate-warning-title" className="text-base font-semibold text-stone-900 dark:text-stone-100">
                  Item already on list
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  <span className="font-medium text-stone-700 dark:text-stone-200">{duplicateItem.name}</span>
                  {duplicateItem.quantity && duplicateItem.quantity !== '1' && (
                    <span> ({duplicateItem.quantity})</span>
                  )}
                  {' '}is already on your list.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {onMergeQuantity && (
                <button
                  type="button"
                  onClick={handleDuplicateMerge}
                  className="w-full py-2.5 px-4 rounded-xl bg-green-600 dark:bg-green-700 text-white font-semibold text-sm hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                >
                  Combine quantities
                </button>
              )}
              <button
                type="button"
                onClick={handleDuplicateAddAnyway}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-semibold text-sm hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                Add anyway
              </button>
              <button
                type="button"
                onClick={closeDuplicateModal}
                className="w-full py-2.5 px-4 rounded-xl text-stone-500 dark:text-stone-400 font-semibold text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice listening modal overlay */}
      {voiceInput.isListening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60" role="dialog" aria-modal="true" aria-label="Voice input active">
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 mx-4 max-w-sm w-full text-center shadow-xl">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center animate-pulse">
              <Mic size={36} className="text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
              Listening...
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
              {voiceInput.transcript || 'Say the name of the item to add'}
            </p>
            {voiceInput.transcript && (
              <p className="text-base font-medium text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 rounded-lg px-3 py-2 mb-4">
                &ldquo;{voiceInput.transcript}&rdquo;
              </p>
            )}
            <button
              type="button"
              onClick={voiceInput.stopListening}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold text-sm hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Voice error toast */}
      {voiceInput.error && (
        <div className="fixed bottom-20 inset-x-4 z-50 max-w-sm mx-auto">
          <div className="bg-red-600 dark:bg-red-700 text-white rounded-xl px-4 py-3 shadow-lg flex items-start gap-3">
            <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{voiceInput.error}</p>
            </div>
            <button
              type="button"
              onClick={voiceInput.clearError}
              className="flex-shrink-0 p-1 rounded hover:bg-red-500 dark:hover:bg-red-600 transition-colors"
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Voice added item toast */}
      {voiceAddedItem && (
        <div className="fixed bottom-20 inset-x-4 z-50 max-w-sm mx-auto">
          <div className="bg-green-600 dark:bg-green-700 text-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
            <Mic size={20} className="flex-shrink-0" />
            <p className="text-sm font-medium flex-1">
              Added &ldquo;{voiceAddedItem}&rdquo; to list
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
