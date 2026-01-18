import { ArrowLeft, Clock, ChefHat, Sparkles } from 'lucide-react'
import type { MealOptionDetailsProps } from '../types'

const effortLabels = {
  'super-easy': 'Super Easy',
  'middle': 'Medium',
  'more-prep': 'More Prep',
} as const

const effortColors = {
  'super-easy': 'bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-200',
  'middle': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
  'more-prep': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
} as const

const cleanupLabels = {
  'low': 'Low cleanup',
  'medium': 'Medium cleanup',
  'high': 'High cleanup',
} as const

export function MealOptionDetails({
  meal,
  householdMembers,
  onCookThis,
  onBack,
  onIngredientCheck,
}: MealOptionDetailsProps) {
  const cook = meal.assignedCookId
    ? householdMembers.find((member) => member.id === meal.assignedCookId)
    : undefined
  const totalTime = meal.prepTime + meal.cookTime

  return (
    <div className="flex flex-col min-h-full bg-stone-50 dark:bg-stone-900">
      <div className="px-4 pt-4 pb-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="px-4">
        <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-700">
            <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              {meal.mealName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${effortColors[meal.effortTier]}`}>
                {effortLabels[meal.effortTier]}
              </span>
              {meal.isFlexMeal && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-200">
                  <Sparkles size={12} />
                  Flex meal
                </span>
              )}
            </div>
          </div>

          <div className="px-4 py-3 space-y-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-600 dark:text-stone-300">
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} />
                {totalTime} min
              </span>
              <span className="text-stone-300 dark:text-stone-600" aria-hidden="true">|</span>
              <span>{cleanupLabels[meal.cleanupRating]}</span>
              {cook && (
                <>
                  <span className="text-stone-300 dark:text-stone-600" aria-hidden="true">|</span>
                  <span className="inline-flex items-center gap-1.5">
                    <ChefHat size={14} />
                    {cook.name} cooking
                  </span>
                </>
              )}
            </div>

            <div>
              <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                Ingredients
              </h2>
              <ul className="mt-2 space-y-1 text-sm text-stone-700 dark:text-stone-300">
                {meal.ingredients.map((ingredient) => (
                  <li key={ingredient} className="flex items-start gap-2">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600 flex-shrink-0" />
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 p-3">
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                Do you have the ingredients?
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onIngredientCheck?.('yes')}
                  className="px-3 py-1.5 rounded-lg bg-yellow-500 dark:bg-yellow-600 text-white text-sm font-semibold hover:bg-yellow-600 dark:hover:bg-yellow-500 transition-colors"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => onIngredientCheck?.('not-sure')}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 text-sm font-semibold hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                >
                  Not sure
                </button>
                <button
                  type="button"
                  onClick={() => onIngredientCheck?.('no')}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 text-sm font-semibold hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                >
                  No
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                Plan
              </h2>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                {meal.briefInstructions || 'Keep it simple: prep a few things, cook, and call it a win.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 mt-auto">
        <button
          onClick={onCookThis}
          className="w-full px-4 py-3 rounded-xl bg-yellow-500 dark:bg-yellow-600 text-white font-semibold hover:bg-yellow-600 dark:hover:bg-yellow-500 active:scale-[0.99] transition-all"
        >
          Cook this
        </button>
      </div>
    </div>
  )
}
