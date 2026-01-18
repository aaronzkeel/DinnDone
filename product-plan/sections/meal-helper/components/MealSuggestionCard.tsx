import { Clock, Sparkles, Check, X, RefreshCw } from 'lucide-react'
import type { MealSuggestion } from '../types'

interface MealSuggestionCardProps {
  suggestion: MealSuggestion
  onAccept?: () => void
  onReject?: () => void
  onSomethingElse?: () => void
}

const effortLabels = {
  'super-easy': 'Super Easy',
  'middle': 'Medium',
  'more-prep': 'More Prep',
}

const effortColors = {
  'super-easy': 'bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-300',
  'middle': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  'more-prep': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
}

const cleanupIcons = {
  'low': '1 pan',
  'medium': '2-3 dishes',
  'high': 'Full cleanup',
}

export function MealSuggestionCard({
  suggestion,
  onAccept,
  onReject,
  onSomethingElse,
}: MealSuggestionCardProps) {
  const totalTime = suggestion.prepTime + suggestion.cookTime

  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-700">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-stone-800 dark:text-stone-100 truncate">
              {suggestion.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${effortColors[suggestion.effortTier]}`}>
                {effortLabels[suggestion.effortTier]}
              </span>
              {suggestion.isFlexMeal && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-300 flex items-center gap-1">
                  <Sparkles size={10} />
                  Flex Meal
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-400">
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{totalTime} min total</span>
          </div>
          <div className="text-stone-400 dark:text-stone-500">|</div>
          <div className="flex items-center gap-1.5">
            <span>{cleanupIcons[suggestion.cleanupRating]}</span>
          </div>
        </div>

        <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
          {suggestion.briefInstructions}
        </p>

        {/* Ingredients preview */}
        <div className="flex flex-wrap gap-1 pt-1">
          {suggestion.ingredients.slice(0, 4).map((ingredient, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400"
            >
              {ingredient}
            </span>
          ))}
          {suggestion.ingredients.length > 4 && (
            <span className="text-xs px-2 py-0.5 text-stone-400 dark:text-stone-500">
              +{suggestion.ingredients.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-stone-50 dark:bg-stone-900 border-t border-stone-100 dark:border-stone-700 flex gap-2">
        <button
          onClick={onAccept}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-yellow-500 dark:bg-yellow-600 text-white font-medium text-sm hover:bg-yellow-600 dark:hover:bg-yellow-500 active:scale-98 transition-all"
        >
          <Check size={16} />
          Let's do it
        </button>
        <button
          onClick={onReject}
          className="px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
          aria-label="Reject"
        >
          <X size={16} />
        </button>
        <button
          onClick={onSomethingElse}
          className="px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
          aria-label="Something else"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  )
}
