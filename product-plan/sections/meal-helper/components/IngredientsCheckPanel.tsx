import type { PlannedMealSummary } from '../types'

export interface IngredientsCheckPanelProps {
  meal: PlannedMealSummary
  prompt?: string
  yesLabel?: string
  notSureLabel?: string
  noLabel?: string
  onYes?: () => void
  onNotSure?: () => void
  onNo?: () => void
}

export function IngredientsCheckPanel({
  meal,
  prompt = 'Do you have these ingredients?',
  yesLabel = 'Yes',
  notSureLabel = 'Not sure',
  noLabel = 'No',
  onYes,
  onNotSure,
  onNo,
}: IngredientsCheckPanelProps) {
  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-700">
        <div className="text-sm font-semibold text-stone-800 dark:text-stone-100">
          {prompt}
        </div>
        <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          For: <span className="font-semibold">{meal.mealName}</span>
        </div>
      </div>

      <div className="px-4 py-3">
        <ul className="space-y-1 text-sm text-stone-700 dark:text-stone-300">
          {meal.ingredients.map((ingredient) => (
            <li key={ingredient} className="flex items-start gap-2">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600 flex-shrink-0" />
              <span>{ingredient}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onYes}
            className="px-4 py-2 rounded-xl bg-yellow-500 dark:bg-yellow-600 text-white font-semibold text-sm"
          >
            {yesLabel}
          </button>
          <button
            type="button"
            onClick={onNotSure}
            className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-semibold text-sm"
          >
            {notSureLabel}
          </button>
          <button
            type="button"
            onClick={onNo}
            className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-semibold text-sm"
          >
            {noLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
