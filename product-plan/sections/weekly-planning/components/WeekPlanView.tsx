import { Check, ClipboardList } from 'lucide-react'
import type { WeekPlanViewProps } from '../types'
import { WeekSelector } from './WeekSelector'
import { DayCard } from './DayCard'

interface WeekPlanViewFullProps extends WeekPlanViewProps {
  /** Called when user taps a day card */
  onTapMeal?: (mealId: string) => void
  /** Called when user wants to check pantry */
  onPantryAudit?: () => void
}

export function WeekPlanView({
  currentUser,
  availableWeeks,
  selectedWeekPlan,
  householdMembers,
  onSelectWeek,
  onSelectMeal,
  onApprovePlan,
  onAddWeek,
  onTapMeal,
  onPantryAudit,
}: WeekPlanViewFullProps) {
  // Check if today is in this week
  const today = new Date().toISOString().split('T')[0]

  const isDraft = selectedWeekPlan.status === 'draft'
  const isAdmin = currentUser.isAdmin

  return (
    <div className="flex flex-col h-full bg-stone-50 dark:bg-stone-900">
      {/* Week selector */}
      <WeekSelector
        weeks={availableWeeks}
        selectedWeekId={selectedWeekPlan.id}
        onSelectWeek={onSelectWeek}
        onAddWeek={onAddWeek}
      />

      {/* Status badge */}
      <div className="px-4 py-2 flex items-center justify-between">
        <div className={`
          text-xs font-medium px-2 py-1 rounded-full
          ${isDraft
            ? 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-400'
            : 'bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-300'
          }
        `}>
          {selectedWeekPlan.status === 'draft' && 'Draft'}
          {selectedWeekPlan.status === 'approved' && 'Approved'}
          {selectedWeekPlan.status === 'in-progress' && 'In Progress'}
          {selectedWeekPlan.status === 'completed' && 'Completed'}
        </div>

        <div className="flex items-center gap-2">
          {/* Pantry Audit button */}
          <button
            onClick={onPantryAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <ClipboardList size={14} />
            Pantry Audit
          </button>

          {isDraft && isAdmin && (
            <button
              onClick={onApprovePlan}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500 dark:bg-yellow-600 text-white text-sm font-medium hover:bg-yellow-600 dark:hover:bg-yellow-500 transition-colors"
            >
              <Check size={14} />
              Looks good
            </button>
          )}
        </div>
      </div>

      {/* Meal cards */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        <div className="space-y-2">
          {selectedWeekPlan.meals.map((meal) => (
            <DayCard
              key={meal.id}
              meal={meal}
              householdMembers={householdMembers}
              isToday={meal.date === today}
              onTap={() => {
                onTapMeal?.(meal.id)
                onSelectMeal?.(meal.id)
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
