import { ChevronRight, Clock } from 'lucide-react'
import type { PlannedMealSummary } from '../types'

export interface WeekSwapListProps {
  meals: Array<PlannedMealSummary & { dayLabel?: string }>
  onSelect?: (mealId: string) => void
}

export function WeekSwapList({ meals, onSelect }: WeekSwapListProps) {
  if (meals.length === 0) return null

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-700">
        <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
          Pick a meal from this week
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Fastest option if you already planned for the ingredients.
        </p>
      </div>

      <div className="divide-y divide-stone-100 dark:divide-stone-700">
        {meals.map((meal) => {
          const totalTime = meal.prepTime + meal.cookTime
          return (
            <button
              key={meal.id}
              type="button"
              onClick={() => onSelect?.(meal.id)}
              className="w-full text-left px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-700/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                    {meal.dayLabel || 'This week'}
                  </div>
                  <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                    {meal.mealName}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} />
                      {totalTime}m
                    </span>
                    <span className="text-stone-300 dark:text-stone-600" aria-hidden="true">|</span>
                    <span className="truncate">{meal.ingredients.slice(0, 3).join(', ')}{meal.ingredients.length > 3 ? '…' : ''}</span>
                  </div>
                </div>

                <ChevronRight size={18} className="text-stone-400 dark:text-stone-500 flex-shrink-0 mt-1" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
