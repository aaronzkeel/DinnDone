'use client'

import { useRef, useState, useCallback } from 'react'
import { Leaf, Check, GripVertical, Info } from 'lucide-react'
import type { GroceryItem, MealSource } from '@/types/grocery'

interface GroceryListItemProps {
  item: GroceryItem
  onToggle?: () => void
  onUpdateName?: (name: string) => void
  onUpdateQuantity?: (quantity: string) => void
  onToggleOrganic?: () => void
  onDelete?: () => void
  enableDrag?: boolean
  onDragStart?: (itemId: string) => void
  onDragEnd?: () => void
  onDragOver?: () => void
  onDropBefore?: () => void
  isDropTarget?: boolean
  density?: 'comfortable' | 'compact'
  /** Keyboard alternative for drag: move item up in the list */
  onMoveUp?: () => void
  /** Keyboard alternative for drag: move item down in the list */
  onMoveDown?: () => void
}

export function GroceryListItem({
  item,
  onToggle,
  onUpdateName,
  onUpdateQuantity,
  onToggleOrganic,
  onDelete,
  enableDrag,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDropBefore,
  isDropTarget,
  density = 'comfortable',
  onMoveUp,
  onMoveDown,
}: GroceryListItemProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingQuantity, setIsEditingQuantity] = useState(false)
  // Track item.id to reset local state when item changes
  const [editingItemId, setEditingItemId] = useState(item.id)
  const [nameValue, setNameValue] = useState(item.name)
  const [quantityValue, setQuantityValue] = useState(item.quantity)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const quantityInputRef = useRef<HTMLInputElement>(null)
  const [showMealsPopover, setShowMealsPopover] = useState(false)

  const mealSources = item.mealSources || []
  const hasMealSources = mealSources.length > 0

  // Reset local editing state when item changes (controlled component pattern)
  if (editingItemId !== item.id) {
    setEditingItemId(item.id)
    setNameValue(item.name)
    setQuantityValue(item.quantity)
    setIsEditingName(false)
    setIsEditingQuantity(false)
  }

  // Use callback refs to focus inputs when editing starts
  const handleNameInputRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      node.focus()
      node.select()
    }
    // Store ref for other uses
    (nameInputRef as React.MutableRefObject<HTMLInputElement | null>).current = node
  }, [])

  const handleQuantityInputRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      node.focus()
      node.select()
    }
    // Store ref for other uses
    (quantityInputRef as React.MutableRefObject<HTMLInputElement | null>).current = node
  }, [])

  const submitName = () => {
    const trimmed = nameValue.trim()
    if (trimmed && trimmed !== item.name) {
      onUpdateName?.(trimmed)
    } else {
      setNameValue(item.name)
    }
    setIsEditingName(false)
  }

  const submitQuantity = () => {
    const trimmed = quantityValue.trim()
    if (trimmed && trimmed !== item.quantity) {
      onUpdateQuantity?.(trimmed)
    } else {
      setQuantityValue(item.quantity)
    }
    setIsEditingQuantity(false)
  }

  const formatMealDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div
      onDragOver={(e) => {
        if (item.isChecked) return
        if (!onDragOver) return
        e.preventDefault()
        onDragOver()
      }}
      onDrop={(e) => {
        if (item.isChecked) return
        if (!onDropBefore) return
        e.preventDefault()
        onDropBefore()
      }}
      className={`
        group flex items-center gap-2.5 px-4
        ${density === 'compact' ? 'py-0.5' : 'py-1.5'}
        transition-all duration-200 ease-out
        ${!item.isChecked ? 'hover:bg-[var(--color-bg)]' : ''}
        ${isDropTarget ? 'bg-[var(--color-primary)]/10' : ''}
      `}
    >
      {/* Drag handle with keyboard support */}
      {!item.isChecked && (
        <button
          type="button"
          draggable={Boolean(enableDrag)}
          onDragStart={(e) => {
            if (!enableDrag) return
            e.dataTransfer.setData('text/plain', item.id)
            e.dataTransfer.effectAllowed = 'move'
            onDragStart?.(item.id)
          }}
          onDragEnd={() => onDragEnd?.()}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp' && onMoveUp) {
              e.preventDefault()
              onMoveUp()
            } else if (e.key === 'ArrowDown' && onMoveDown) {
              e.preventDefault()
              onMoveDown()
            }
          }}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center cursor-grab active:cursor-grabbing rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-1"
          style={{ color: 'var(--color-muted)' }}
          aria-label={`Reorder ${item.name}. Use arrow keys to move up or down, or drag to reorder`}
          title="Drag or use arrow keys to reorder"
        >
          <GripVertical size={16} />
        </button>
      )}

      {/* Checkbox - 44px touch target for accessibility */}
      <button
        onClick={onToggle}
        className={`
          flex-shrink-0 w-11 h-11 -m-2
          flex items-center justify-center
          transition-all duration-150
        `}
        aria-label={item.isChecked ? `Uncheck ${item.name}` : `Check ${item.name}`}
      >
        <span
          className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
          style={{
            backgroundColor: item.isChecked ? 'var(--color-secondary)' : 'transparent',
            borderColor: item.isChecked ? 'var(--color-secondary)' : 'var(--color-border)',
          }}
        >
          {item.isChecked && (
            <Check size={14} className="text-white" strokeWidth={3} />
          )}
        </span>
      </button>

      {/* Item details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <input
              ref={handleNameInputRef}
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={submitName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitName()
                if (e.key === 'Escape') {
                  setNameValue(item.name)
                  setIsEditingName(false)
                }
              }}
              className="bg-transparent outline-none text-base font-semibold"
              style={{
                borderBottom: '2px solid var(--color-primary)',
                color: 'var(--color-text)',
              }}
              disabled={item.isChecked}
              aria-label="Edit item name"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                if (item.isChecked) return
                setIsEditingName(true)
              }}
              className="text-left truncate text-base font-semibold transition-colors"
              style={{
                color: item.isChecked ? 'var(--color-muted)' : 'var(--color-text)',
                cursor: item.isChecked ? 'default' : 'pointer',
              }}
              disabled={item.isChecked}
              aria-label={`Edit ${item.name}`}
              title={item.name}
            >
              {item.name}
            </button>
          )}

          {isEditingQuantity ? (
            <input
              ref={handleQuantityInputRef}
              value={quantityValue}
              onChange={(e) => setQuantityValue(e.target.value)}
              onBlur={submitQuantity}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitQuantity()
                if (e.key === 'Escape') {
                  setQuantityValue(item.quantity)
                  setIsEditingQuantity(false)
                }
              }}
              className="w-20 bg-transparent outline-none text-sm font-semibold"
              style={{
                borderBottom: '2px solid var(--color-primary)',
                color: 'var(--color-text)',
              }}
              disabled={item.isChecked}
              aria-label="Edit quantity"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                if (item.isChecked) return
                setIsEditingQuantity(true)
              }}
              className="px-2 py-0.5 rounded-lg text-sm font-semibold flex-shrink-0 transition-colors"
              style={{
                color: item.isChecked ? 'var(--color-muted)' : 'var(--color-text)',
                backgroundColor: item.isChecked ? 'transparent' : 'var(--color-bg)',
                cursor: item.isChecked ? 'default' : 'pointer',
              }}
              disabled={item.isChecked}
              aria-label="Edit quantity"
              title="Click to edit quantity"
            >
              {item.quantity}
            </button>
          )}

          {/* Organic badge - clickable to toggle */}
          {!item.isChecked && (
            <button
              type="button"
              onClick={onToggleOrganic}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full flex-shrink-0 transition-colors ${
                !item.organicRequired ? 'opacity-0 group-hover:opacity-100 focus:opacity-100' : ''
              }`}
              style={{
                backgroundColor: item.organicRequired ? 'rgba(79, 110, 68, 0.15)' : 'var(--color-bg)',
                color: item.organicRequired ? 'var(--color-secondary)' : 'var(--color-muted)',
              }}
              aria-label={item.organicRequired ? `Remove organic from ${item.name}` : `Mark ${item.name} as organic`}
              title={item.organicRequired ? 'Click to remove organic' : 'Click to mark as organic'}
            >
              <Leaf size={12} strokeWidth={2.5} />
              <span className="text-xs font-semibold">Organic</span>
            </button>
          )}
        </div>

      </div>

      {/* Delete button - 44px touch target for accessibility */}
      <button
        onClick={onDelete}
        className="flex-shrink-0 w-11 h-11 -m-2 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-150 hover:bg-[var(--color-bg)]"
        style={{ color: 'var(--color-muted)' }}
        aria-label="Delete item"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>

      {/* View meals */}
      {hasMealSources && !item.isChecked && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMealsPopover((prev) => !prev)}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-all duration-150 hover:opacity-80"
            style={{
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-muted)',
            }}
            aria-label={`Meals (${mealSources.length})`}
            title="Meals"
          >
            <Info size={14} />
            <span>Meals ({mealSources.length})</span>
          </button>

          {showMealsPopover && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMealsPopover(false)} />
              <div
                className="absolute right-0 top-full mt-1 z-20 w-60 p-3 rounded-xl shadow-lg"
                style={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-muted)' }}>
                  For {mealSources.length} meal{mealSources.length > 1 ? 's' : ''}:
                </p>
                <ul className="space-y-1">
                  {mealSources.map((meal: MealSource) => (
                    <li key={meal.mealId} className="text-sm" style={{ color: 'var(--color-text)' }}>
                      {meal.mealName}
                      <span className="ml-1 text-xs" style={{ color: 'var(--color-muted)' }}>
                        {formatMealDate(meal.date)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
