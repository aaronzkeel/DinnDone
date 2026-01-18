import { useEffect, useRef, useState } from 'react'
import { Leaf, Check, GripVertical, Info } from 'lucide-react'
import type { GroceryItem, MealSource } from '../types'

interface GroceryListItemProps {
  item: GroceryItem
  onToggle?: () => void
  onUpdateName?: (name: string) => void
  onUpdateQuantity?: (quantity: string) => void
  onDelete?: () => void
  enableDrag?: boolean
  onDragStart?: (itemId: string) => void
  onDragEnd?: () => void
  onDragOver?: () => void
  onDropBefore?: () => void
  isDropTarget?: boolean
  density?: 'comfortable' | 'compact'
}

export function GroceryListItem({
  item,
  onToggle,
  onUpdateName,
  onUpdateQuantity,
  onDelete,
  enableDrag,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDropBefore,
  isDropTarget,
  density = 'comfortable',
}: GroceryListItemProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingQuantity, setIsEditingQuantity] = useState(false)
  const [nameValue, setNameValue] = useState(item.name)
  const [quantityValue, setQuantityValue] = useState(item.quantity)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const quantityInputRef = useRef<HTMLInputElement>(null)
  const [showMealsPopover, setShowMealsPopover] = useState(false)

  const mealSources = item.mealSources || []
  const hasMealSources = mealSources.length > 0

  useEffect(() => {
    setNameValue(item.name)
  }, [item.name])

  useEffect(() => {
    setQuantityValue(item.quantity)
  }, [item.quantity])

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus()
      nameInputRef.current.select()
    }
  }, [isEditingName])

  useEffect(() => {
    if (isEditingQuantity && quantityInputRef.current) {
      quantityInputRef.current.focus()
      quantityInputRef.current.select()
    }
  }, [isEditingQuantity])

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
        ${item.isChecked
          ? 'opacity-60'
          : 'hover:bg-stone-50 dark:hover:bg-stone-800/50'
        }
        ${isDropTarget ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}
      `}
    >
      {/* Drag handle */}
      {!item.isChecked && (
        <div
          draggable={Boolean(enableDrag)}
          onDragStart={(e) => {
            if (!enableDrag) return
            e.dataTransfer.setData('text/plain', item.id)
            e.dataTransfer.effectAllowed = 'move'
            onDragStart?.(item.id)
          }}
          onDragEnd={() => onDragEnd?.()}
          className="
            flex-shrink-0 w-6 h-6
            flex items-center justify-center
            text-stone-300 dark:text-stone-600
            group-hover:text-stone-400 dark:group-hover:text-stone-500
            cursor-grab active:cursor-grabbing
          "
          aria-label="Drag to move to a different store"
          title="Drag to move"
        >
          <GripVertical size={16} />
        </div>
      )}

      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`
          flex-shrink-0 w-6 h-6 rounded-full border-2
          flex items-center justify-center
          transition-all duration-150
          ${item.isChecked
            ? 'bg-yellow-500 border-yellow-500 dark:bg-yellow-600 dark:border-yellow-600'
            : 'border-stone-300 dark:border-stone-600 hover:border-yellow-400 dark:hover:border-yellow-500'
          }
        `}
        aria-label={item.isChecked ? 'Uncheck item' : 'Check item'}
      >
        {item.isChecked && (
          <Check size={14} className="text-white" strokeWidth={3} />
        )}
      </button>

      {/* Item details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <input
              ref={nameInputRef}
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
              className="bg-transparent border-b-2 border-yellow-400 outline-none text-base font-semibold text-stone-800 dark:text-stone-100"
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
              className={`
                text-left truncate text-base font-semibold
                ${item.isChecked
                  ? 'line-through text-stone-400 dark:text-stone-500 cursor-default'
                  : 'text-stone-800 dark:text-stone-100 hover:text-yellow-700 dark:hover:text-yellow-300'
                }
              `}
              disabled={item.isChecked}
              aria-label="Edit item"
              title="Click to edit"
            >
              {item.name}
            </button>
          )}

          {isEditingQuantity ? (
            <input
              ref={quantityInputRef}
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
              className="w-20 bg-transparent border-b-2 border-yellow-400 outline-none text-sm font-semibold text-stone-600 dark:text-stone-300"
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
              className={`
                px-2 py-0.5 rounded-lg text-sm font-semibold flex-shrink-0
                ${item.isChecked
                  ? 'text-stone-400 dark:text-stone-600 cursor-default'
                  : 'text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                }
              `}
              disabled={item.isChecked}
              aria-label="Edit quantity"
              title="Click to edit quantity"
            >
              {item.quantity}
            </button>
          )}

          {/* Organic badge */}
          {item.organicRequired && !item.isChecked && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-lime-100 dark:bg-lime-900/40 text-lime-700 dark:text-lime-400 flex-shrink-0">
              <Leaf size={12} strokeWidth={2.5} />
              <span className="text-xs font-semibold">Organic</span>
            </span>
          )}
        </div>

      </div>

      {/* Delete button (visible on hover/focus) */}
      <button
        onClick={onDelete}
        className="
          flex-shrink-0 p-1.5 rounded-md
          text-stone-400 dark:text-stone-500
          opacity-0 group-hover:opacity-100 focus:opacity-100
          hover:bg-stone-100 dark:hover:bg-stone-700
          hover:text-stone-600 dark:hover:text-stone-300
          transition-all duration-150
        "
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
            className="
              flex-shrink-0 inline-flex items-center gap-1.5
              px-2 py-1 rounded-lg
              text-xs font-semibold
              text-stone-500 dark:text-stone-400
              bg-stone-100 dark:bg-stone-800
              hover:bg-yellow-100 dark:hover:bg-yellow-900/30
              hover:text-yellow-800 dark:hover:text-yellow-200
              transition-all duration-150
            "
            aria-label={`Meals (${mealSources.length})`}
            title="Meals"
          >
            <Info size={14} />
            <span>Meals ({mealSources.length})</span>
          </button>

          {showMealsPopover && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMealsPopover(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-60 p-3 rounded-xl bg-white dark:bg-stone-800 shadow-lg border border-stone-200 dark:border-stone-700">
                <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2">
                  For {mealSources.length} meal{mealSources.length > 1 ? 's' : ''}:
                </p>
                <ul className="space-y-1">
                  {mealSources.map((meal: MealSource) => (
                    <li key={meal.mealId} className="text-sm text-stone-700 dark:text-stone-200">
                      {meal.mealName}
                      <span className="text-stone-400 dark:text-stone-500 ml-1 text-xs">
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
