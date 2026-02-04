'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import type { GroceryItem, GroceryStore } from '@/types/grocery'
import { GroceryListItem } from './GroceryListItem'

/*
 * Store section colors using design tokens.
 * Colors cycle through the app's palette for visual distinction.
 */
const STORE_COLORS = [
  {
    // Sage green (secondary) - most common
    bg: 'var(--color-secondary)',
    bgTint: 'rgba(79, 110, 68, 0.12)',
    text: 'var(--color-secondary)',
  },
  {
    // Gold (primary accent)
    bg: 'var(--color-primary)',
    bgTint: 'var(--color-primary-tint)',
    text: 'var(--color-primary)',
  },
  {
    // Muted earth tone
    bg: 'var(--color-muted)',
    bgTint: 'rgba(107, 92, 77, 0.1)',
    text: 'var(--color-muted)',
  },
  {
    // Brick red (danger) - for variety
    bg: 'var(--color-danger)',
    bgTint: 'rgba(185, 74, 52, 0.1)',
    text: 'var(--color-danger)',
  },
]

// Unassigned section uses gold accent
const UNASSIGNED_COLOR = {
  bg: 'var(--color-primary)',
  bgTint: 'var(--color-primary-tint)',
  text: 'var(--color-primary)',
}

function getStoreColor(index: number, isUnassigned: boolean) {
  if (isUnassigned) return UNASSIGNED_COLOR
  return STORE_COLORS[index % STORE_COLORS.length]
}

interface StoreSectionProps {
  store: GroceryStore | null // null = Unassigned
  storeIndex: number
  items: GroceryItem[]
  density: 'comfortable' | 'compact'
  isDropTarget?: boolean
  draggingItemId: string | null
  activeDropTarget: string | null
  onToggleChecked?: (id: string) => void
  onDeleteItem?: (id: string) => void
  onUpdateItem?: (id: string, updates: { name?: string; quantity?: string; organicRequired?: boolean }) => void
  onMoveItem?: (id: string, options: { storeId?: string; beforeId?: string | null }) => void
  onAddItem?: (name: string, options?: { storeId?: string; quantity?: string }) => void
  onDragStart?: (itemId: string) => void
  onDragEnd?: () => void
  onSetDropTarget?: (key: string | null) => void
  parseItemInput: (input: string) => { name: string; quantity?: string }
}

export function StoreSection({
  store,
  storeIndex,
  items,
  density,
  isDropTarget,
  draggingItemId,
  activeDropTarget,
  onToggleChecked,
  onDeleteItem,
  onUpdateItem,
  onMoveItem,
  onAddItem,
  onDragStart,
  onDragEnd,
  onSetDropTarget,
  parseItemInput,
}: StoreSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [newItemValue, setNewItemValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const storeId = store?.id
  const storeName = store?.name || 'Unassigned'
  const dropKey = storeId || 'unassigned'

  // Sort items: unchecked first, then checked
  const uncheckedItems = items.filter((item) => !item.isChecked)
  const checkedItems = items.filter((item) => item.isChecked)
  const sortedItems = [...uncheckedItems, ...checkedItems]

  const totalItems = items.length
  const doneItems = checkedItems.length

  const color = getStoreColor(storeIndex, !store)

  // Auto-focus input when adding
  useEffect(() => {
    if (isAddingItem && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAddingItem])

  const handleAddItem = () => {
    const { name, quantity } = parseItemInput(newItemValue)
    if (!name) return

    onAddItem?.(name, { storeId, quantity })
    setNewItemValue('')
    // Keep input open for batch entry
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddItem()
    } else if (e.key === 'Escape') {
      setIsAddingItem(false)
      setNewItemValue('')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!draggingItemId) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    onSetDropTarget?.(dropKey)
  }

  const handleDragEnter = () => {
    if (!draggingItemId) return
    onSetDropTarget?.(dropKey)
  }

  const handleDragLeave = () => {
    onSetDropTarget?.(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const itemId = e.dataTransfer.getData('text/plain') || draggingItemId
    if (!itemId) return

    onMoveItem?.(itemId, { storeId, beforeId: null })
    onSetDropTarget?.(null)
  }

  return (
    <div
      className={`mb-4 rounded-2xl overflow-hidden transition-all duration-200 ${
        isDropTarget ? 'ring-2 ring-[var(--color-primary)] ring-opacity-50' : ''
      }`}
      style={{
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)',
      }}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Store Header */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:opacity-90"
        style={{
          backgroundColor: color.bgTint,
        }}
        aria-expanded={!isCollapsed}
        aria-controls={`store-section-${dropKey}`}
      >
        <div className="flex items-center gap-2">
          {isCollapsed ? (
            <ChevronRight size={18} style={{ color: color.text }} />
          ) : (
            <ChevronDown size={18} style={{ color: color.text }} />
          )}
          <span
            className="text-sm font-bold uppercase tracking-wide"
            style={{ color: color.text }}
          >
            {storeName}
          </span>
        </div>

        {/* Count badge - only show when collapsed */}
        {isCollapsed && (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: 'var(--color-bg)',
              color: color.text,
            }}
          >
            {totalItems} item{totalItems !== 1 ? 's' : ''}{doneItems > 0 && ` · ${doneItems} done`}
          </span>
        )}
      </button>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div id={`store-section-${dropKey}`}>
          {/* Add Item Input */}
          <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            {isAddingItem ? (
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newItemValue}
                  onChange={(e) => setNewItemValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => {
                    if (!newItemValue.trim()) {
                      setIsAddingItem(false)
                    }
                  }}
                  placeholder={`Add item to ${storeName}...`}
                  className="flex-1 h-10 px-3 rounded-xl text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!newItemValue.trim()}
                  className="h-10 px-4 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition-colors"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingItem(true)}
                className="flex items-center gap-2 w-full py-2 text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--color-muted)' }}
              >
                <Plus size={16} />
                <span>Add item to {storeName}...</span>
              </button>
            )}
          </div>

          {/* Items List */}
          <div className="py-1">
            {sortedItems.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                  No items yet
                </p>
              </div>
            ) : (
              sortedItems.map((item) => {
                const itemDropKey = `${dropKey}::${item.id}`
                const isItemDropTarget = activeDropTarget === itemDropKey

                // Find actual index in unchecked or checked list for move up/down
                const isChecked = item.isChecked
                const listForItem = isChecked ? checkedItems : uncheckedItems
                const indexInList = listForItem.findIndex((i) => i.id === item.id)

                return (
                  <GroceryListItem
                    key={item.id}
                    item={item}
                    onToggle={() => onToggleChecked?.(item.id)}
                    onDelete={() => onDeleteItem?.(item.id)}
                    onUpdateName={(name) => onUpdateItem?.(item.id, { name })}
                    onUpdateQuantity={(quantity) => onUpdateItem?.(item.id, { quantity })}
                    onToggleOrganic={() => onUpdateItem?.(item.id, { organicRequired: !item.organicRequired })}
                    enableDrag={!item.isChecked}
                    onDragStart={(itemId) => onDragStart?.(itemId)}
                    onDragEnd={() => onDragEnd?.()}
                    onDragOver={draggingItemId ? () => onSetDropTarget?.(itemDropKey) : undefined}
                    onDropBefore={() => {
                      if (!draggingItemId) return
                      onMoveItem?.(draggingItemId, { storeId, beforeId: item.id })
                      onSetDropTarget?.(null)
                    }}
                    isDropTarget={isItemDropTarget}
                    density={density}
                    onMoveUp={
                      !isChecked && indexInList > 0
                        ? () => {
                            const prevItem = listForItem[indexInList - 1]
                            onMoveItem?.(item.id, { storeId, beforeId: prevItem.id })
                          }
                        : undefined
                    }
                    onMoveDown={
                      !isChecked && indexInList < listForItem.length - 1
                        ? () => {
                            const afterNextItem = listForItem[indexInList + 2]
                            onMoveItem?.(item.id, { storeId, beforeId: afterNextItem?.id ?? null })
                          }
                        : undefined
                    }
                  />
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
