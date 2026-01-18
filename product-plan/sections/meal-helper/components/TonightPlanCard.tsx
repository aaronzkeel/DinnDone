import { Clock, Sparkles, ChefHat } from 'lucide-react'
import type { PlannedMealSummary, HouseholdMember } from '../types'

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

export interface TonightPlanCardProps {
  meal: PlannedMealSummary
  householdMembers: HouseholdMember[]
}

export function TonightPlanCard({ meal, householdMembers }: TonightPlanCardProps) {
  const cook = meal.assignedCookId
    ? householdMembers.find((member) => member.id === meal.assignedCookId)
    : undefined

  const totalTime = meal.prepTime + meal.cookTime

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-700 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide uppercase text-stone-500 dark:text-stone-400">
            Tonight's plan
          </p>
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 truncate">
            {meal.mealName}
          </h2>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${effortColors[meal.effortTier]}`}>
            {effortLabels[meal.effortTier]}
          </span>
          {meal.isFlexMeal && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-200">
              <Sparkles size={12} />
              Flex
            </span>
          )}
        </div>
      </div>

      <div className="px-4 py-3 space-y-2">
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

        <div className="flex flex-wrap gap-1.5">
          {meal.ingredients.slice(0, 5).map((ingredient) => (
            <span
              key={ingredient}
              className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300"
            >
              {ingredient}
            </span>
          ))}
          {meal.ingredients.length > 5 && (
            <span className="text-xs text-stone-400 dark:text-stone-500">
              +{meal.ingredients.length - 5} more
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
