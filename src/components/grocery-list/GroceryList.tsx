'use client'

import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { Settings2, Plus, Trash2, AlertTriangle, List, AlignJustify } from 'lucide-react'
import type { GroceryListProps, GroceryItem, GroceryStore, DuplicateItemInfo } from '@/types/grocery'
import { StoreSection } from './StoreSection'

function normalizeStoreId(stores: GroceryStore[], storeId?: string): string | undefined {
  if (!storeId) return undefined
  return stores.some((s) => s.id === storeId) ? storeId : undefined
}

function groupByStore(
  items: GroceryItem[],
  stores: GroceryStore[]
): Array<{ store: GroceryStore | null; items: GroceryItem[] }> {
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

  const result: Array<{ store: GroceryStore | null; items: GroceryItem[] }> = []

  // Add stores in order, including empty ones
  for (const store of stores) {
    const storeItems = byStore.get(store.id) || []
    result.push({ store, items: storeItems })
  }

  // Always show unassigned section
  result.push({ store: null, items: unassigned })

  return result
}

function isStoreDropTarget(activeDropTarget: string | null, dropKey: string): boolean {
  if (!activeDropTarget) return false
  return activeDropTarget === dropKey || activeDropTarget.startsWith(`${dropKey}::`)
}

/**
 * Parse item input to extract name and optional quantity.
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
  const endQuantityMatch = trimmed.match(
    /^(.+?)\s+(\d+(?:\.\d+)?(?:\s*(?:lbs?|oz|g|kg|cups?|gallons?|liters?|pints?|quarts?|dozen|pack|bunch|bag|box|can|jar|bottle|ct|count|pcs?|pieces?|slices?|servings?)?)?)\s*$/i
  )
  if (endQuantityMatch && endQuantityMatch[1].length > 0) {
    return { name: endQuantityMatch[1].trim(), quantity: endQuantityMatch[2].trim() }
  }

  // Pattern 4: Leading number - "3 onions", "2 dozen eggs"
  const leadingMatch = trimmed.match(
    /^(\d+(?:\.\d+)?(?:\s+(?:dozen|pack|bunch|bag|box|can|jar|bottle|ct|count))?)\s+(.+)$/i
  )
  if (leadingMatch) {
    return { name: leadingMatch[2].trim(), quantity: leadingMatch[1].trim() }
  }

  // No quantity detected
  return { name: trimmed }
}

export function GroceryList({
  stores,
  items,
  // syncStatus could be used for UI indicator in future
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  syncStatus = 'synced',
  onAddItem,
  onCheckDuplicate,
  onMergeQuantity,
  onToggleChecked,
  onDeleteItem,
  onUpdateItem,
  onMoveItem,
  onAddStore,
  onRenameStore,
  onDeleteStore,
  onClearChecked,
  recentItems,
  onReAddItem,
}: GroceryListProps) {
  const [isManagingStores, setIsManagingStores] = useState(false)
  const [newStoreName, setNewStoreName] = useState('')
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null)
  const [activeDropTarget, setActiveDropTarget] = useState<string | null>(null)
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')

  // Duplicate warning modal state
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [duplicateItem, setDuplicateItem] = useState<DuplicateItemInfo | null>(null)
  const [pendingAdd, setPendingAdd] = useState<{ name: string; quantity?: string; storeId?: string } | null>(null)

  // Focus trap for modals
  const storeModalRef = useRef<HTMLDivElement>(null)
  const duplicateModalRef = useRef<HTMLDivElement>(null)

  // Focus trap handler
  const handleFocusTrap = useCallback(
    (e: KeyboardEvent, modalRef: React.RefObject<HTMLDivElement | null>) => {
      if (e.key !== 'Tab' || !modalRef.current) return

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const focusableArray = Array.from(focusableElements)
      if (focusableArray.length === 0) return

      const firstElement = focusableArray[0]
      const lastElement = focusableArray[focusableArray.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    },
    []
  )

  // Set up focus trap for store management modal
  useEffect(() => {
    if (!isManagingStores) return

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

  // Define closeDuplicateModal before useEffect that uses it
  const closeDuplicateModal = useCallback(() => {
    setShowDuplicateWarning(false)
    setDuplicateItem(null)
    setPendingAdd(null)
  }, [])

  // Set up focus trap for duplicate warning modal
  useEffect(() => {
    if (!showDuplicateWarning) return

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
  }, [showDuplicateWarning, handleFocusTrap, closeDuplicateModal])

  // Group items by store
  const groupedItems = useMemo(() => groupByStore(items, stores), [items, stores])

  // Count totals
  const totalItems = items.length
  const checkedItems = items.filter((item) => item.isChecked).length

  const handleAddItem = async (name: string, options?: { storeId?: string; quantity?: string }) => {
    // Check for duplicates if the handler is provided
    if (onCheckDuplicate) {
      const result = await onCheckDuplicate(name)
      if (result.exists && result.item) {
        // Show duplicate warning modal
        setDuplicateItem(result.item)
        setPendingAdd({ name, quantity: options?.quantity, storeId: options?.storeId })
        setShowDuplicateWarning(true)
        return
      }
    }

    // No duplicate found, add the item
    onAddItem?.(name, options)
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

  return (
    <div style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Desktop max-width container */}
      <div className="w-full max-w-2xl mx-auto">
        {/* Header - sticky at top */}
        <div
          className="sticky top-0 z-10 px-4 pt-4 pb-3"
          style={{
            backgroundColor: 'var(--color-bg)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {/* Header with total count */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold font-heading" style={{ color: 'var(--color-text)' }}>
              Grocery List
            </h1>
            <span className="text-sm font-medium" style={{ color: 'var(--color-muted)' }} data-testid="total-item-count">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
              {checkedItems > 0 && ` (${checkedItems} done)`}
            </span>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              Shopping List
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDensity(density === 'comfortable' ? 'compact' : 'comfortable')}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors hover:opacity-80"
                style={{ color: 'var(--color-muted)' }}
                aria-label={density === 'comfortable' ? 'Switch to compact view' : 'Switch to comfortable view'}
                title={density === 'comfortable' ? 'Compact view' : 'Comfortable view'}
              >
                {density === 'comfortable' ? <List size={18} /> : <AlignJustify size={18} />}
              </button>
              <button
                type="button"
                onClick={() => setIsManagingStores(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors hover:opacity-80"
                style={{ color: 'var(--color-muted)' }}
              >
                <Settings2 size={16} />
                Edit Stores
              </button>
              {checkedItems > 0 && onClearChecked && (
                <button
                  type="button"
                  onClick={onClearChecked}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg transition-colors"
                  style={{ color: 'var(--color-danger)' }}
                  aria-label="Clear all checked items"
                >
                  <Trash2 size={14} />
                  Clear done
                </button>
              )}
            </div>
          </div>
        </div>

        {/* List area */}
        <div className="px-4 py-4">
          {/* Empty state */}
          {items.length === 0 && stores.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: 'var(--color-card)' }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  style={{ color: 'var(--color-muted)' }}
                >
                  <path
                    d="M8 12h16M8 16h12M8 20h8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="font-medium" style={{ color: 'var(--color-muted)' }}>
                Your list is empty
              </p>
              <p className="text-sm mt-1 mb-4" style={{ color: 'var(--color-muted)' }}>
                Add stores first, then start adding items
              </p>
              <button
                type="button"
                onClick={() => setIsManagingStores(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold transition-colors hover:opacity-90"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              >
                <Settings2 size={18} />
                Set up stores
              </button>
            </div>
          )}

          {/* Store Sections */}
          {groupedItems.map((group, index) => {
            const dropKey = group.store?.id || 'unassigned'
            const isActiveDrop = isStoreDropTarget(activeDropTarget, dropKey)

            return (
              <StoreSection
                key={dropKey}
                store={group.store}
                storeIndex={index}
                items={group.items}
                density={density}
                isDropTarget={isActiveDrop}
                draggingItemId={draggingItemId}
                activeDropTarget={activeDropTarget}
                onToggleChecked={onToggleChecked}
                onDeleteItem={onDeleteItem}
                onUpdateItem={onUpdateItem}
                onMoveItem={onMoveItem}
                onAddItem={handleAddItem}
                onDragStart={setDraggingItemId}
                onDragEnd={() => {
                  setDraggingItemId(null)
                  setActiveDropTarget(null)
                }}
                onSetDropTarget={setActiveDropTarget}
                parseItemInput={parseItemInput}
              />
            )
          })}

          {/* Recent Items - Feature #63 */}
          {recentItems && recentItems.length > 0 && (
            <div
              className="pt-3 pb-4 mt-4 border-t"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div
                className="text-xs font-semibold uppercase tracking-wide mb-2"
                style={{ color: 'var(--color-muted)' }}
              >
                Recently Cleared
              </div>
              <div className="flex flex-wrap gap-2">
                {recentItems.slice(0, 8).map((item, index) => (
                  <button
                    key={`${item.name}-${index}`}
                    type="button"
                    onClick={() => onReAddItem?.(item.name)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors hover:opacity-80"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <Plus size={14} />
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Store manager modal */}
      {isManagingStores && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="store-manager-title">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setIsManagingStores(false)}
            aria-hidden="true"
          />
          <div
            ref={storeModalRef}
            className="absolute inset-x-0 bottom-0 rounded-t-3xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
            style={{
              backgroundColor: 'var(--color-bg)',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                id="store-manager-title"
                className="text-base font-semibold"
                style={{ color: 'var(--color-text)' }}
              >
                Manage Stores
              </div>
              <button
                type="button"
                onClick={() => setIsManagingStores(false)}
                className="text-sm font-semibold transition-colors hover:opacity-80"
                style={{ color: 'var(--color-muted)' }}
              >
                Done
              </button>
            </div>

            {/* Add New Store - Always visible at top */}
            <form
              className="flex gap-2 mb-4"
              onSubmit={(e) => {
                e.preventDefault()
                const trimmed = newStoreName.trim()
                if (!trimmed) return
                onAddStore?.(trimmed)
                setNewStoreName('')
              }}
            >
              <input
                autoFocus
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                placeholder="Add new store (e.g., Costco, Aldi)"
                className="flex-1 h-12 px-4 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                style={{
                  backgroundColor: 'var(--color-card)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              />
              <button
                type="submit"
                disabled={!newStoreName.trim()}
                className="h-12 px-5 rounded-xl text-white font-semibold inline-flex items-center gap-2 transition-colors hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              >
                <Plus size={18} />
                Add
              </button>
            </form>

            {/* Existing Stores */}
            {stores.length > 0 && (
              <div className="space-y-2 max-h-[40vh] overflow-auto">
                <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted)' }}>
                  Your Stores
                </div>
                {stores.map((store) => (
                  <div
                    key={store.id}
                    className="flex items-center gap-2 rounded-2xl px-3 py-2"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <input
                      value={store.name}
                      onChange={(e) => onRenameStore?.(store.id, e.target.value)}
                      className="flex-1 bg-transparent text-sm font-semibold focus:outline-none"
                      style={{ color: 'var(--color-text)' }}
                      aria-label="Store name"
                    />
                    <button
                      type="button"
                      onClick={() => onDeleteStore?.(store.id)}
                      className="p-2 rounded-xl transition-colors hover:opacity-80"
                      style={{ color: 'var(--color-muted)' }}
                      aria-label="Delete store"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Duplicate item warning modal */}
      {showDuplicateWarning && duplicateItem && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="duplicate-warning-title"
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={closeDuplicateModal}
            aria-hidden="true"
          />
          <div
            ref={duplicateModalRef}
            className="absolute inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto rounded-2xl shadow-xl p-5"
            style={{
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-danger-tint)' }}
              >
                <AlertTriangle size={20} style={{ color: 'var(--color-danger)' }} />
              </div>
              <div>
                <h3
                  id="duplicate-warning-title"
                  className="text-base font-semibold"
                  style={{ color: 'var(--color-text)' }}
                >
                  Item already on list
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                  <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {duplicateItem.name}
                  </span>
                  {duplicateItem.quantity && duplicateItem.quantity !== '1' && (
                    <span> ({duplicateItem.quantity})</span>
                  )}{' '}
                  is already on your list.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {onMergeQuantity && (
                <button
                  type="button"
                  onClick={handleDuplicateMerge}
                  className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-sm transition-colors hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  Combine quantities
                </button>
              )}
              <button
                type="button"
                onClick={handleDuplicateAddAnyway}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'var(--color-card)',
                  color: 'var(--color-text)',
                }}
              >
                Add anyway
              </button>
              <button
                type="button"
                onClick={closeDuplicateModal}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors hover:opacity-80"
                style={{ color: 'var(--color-muted)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
