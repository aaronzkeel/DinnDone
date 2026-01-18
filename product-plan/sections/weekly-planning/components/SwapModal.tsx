import { X, Clock, ChefHat, Users, Sparkles } from 'lucide-react'
import type { SwapModalProps, HouseholdMember } from '../types'

interface SwapModalInternalProps extends SwapModalProps {
  householdMembers: HouseholdMember[]
  onChangeCook?: (newCookId: string) => void
  onToggleEater?: (memberId: string) => void
}

const effortLabels = {
  'super-easy': 'Super Easy',
  'middle': 'Medium',
  'more-prep': 'More Prep',
}

const effortDots = {
  'super-easy': 1,
  'middle': 2,
  'more-prep': 3,
}

export function SwapModal({
  currentMeal,
  alternatives,
  householdMembers,
  onSelectAlternative,
  onChangeCook,
  onToggleEater,
  onMoreOptions,
  onUnplan,
  onClose,
}: SwapModalInternalProps) {
  const cook = householdMembers.find((m) => m.id === currentMeal.assignedCookId)
  const totalTime = currentMeal.prepTime + currentMeal.cookTime

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-white dark:bg-stone-800 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Edit Day
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
          >
            <X size={20} className="text-stone-500 dark:text-stone-400" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Current Meal */}
          <div>
            <h3 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase mb-2">
              Current Meal
            </h3>
            <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-stone-900 dark:text-stone-100">
                  {currentMeal.mealName}
                </h4>
                <div className="flex gap-0.5 flex-shrink-0 pt-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={`
                        w-2 h-2 rounded-full
                        ${i < effortDots[currentMeal.effortTier]
                          ? 'bg-yellow-600 dark:bg-yellow-400'
                          : 'bg-yellow-200 dark:bg-yellow-700'
                        }
                      `}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-stone-600 dark:text-stone-400">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{totalTime}m</span>
                </div>
                {cook && (
                  <div className="flex items-center gap-1">
                    <ChefHat size={14} />
                    <span>{cook.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>{currentMeal.eaterIds.length} eating</span>
                </div>
              </div>
            </div>
          </div>

          {/* Change Cook */}
          <div>
            <h3 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase mb-2">
              Change Cook
            </h3>
            <div className="flex flex-wrap gap-2">
              {householdMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => onChangeCook?.(member.id)}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium transition-colors
                    ${member.id === currentMeal.assignedCookId
                      ? 'bg-yellow-500 text-white'
                      : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
                    }
                  `}
                >
                  {member.name}
                </button>
              ))}
            </div>
          </div>

          {/* Change Who's Eating */}
          <div>
            <h3 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase mb-2">
              Who's Eating
            </h3>
            <div className="flex flex-wrap gap-2">
              {householdMembers.map((member) => {
                const isEating = currentMeal.eaterIds.includes(member.id)
                return (
                  <button
                    key={member.id}
                    onClick={() => onToggleEater?.(member.id)}
                    className={`
                      px-4 py-2 rounded-xl text-sm font-medium transition-colors
                      ${isEating
                        ? 'bg-lime-500 text-white'
                        : 'bg-stone-100 dark:bg-stone-700 text-stone-400 dark:text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-600'
                      }
                    `}
                  >
                    {member.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Swap with Alternative */}
          <div>
            <h3 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase mb-2">
              Swap with Alternative
            </h3>
            <div className="space-y-2">
              {alternatives.map((alt) => {
                const altTotalTime = alt.prepTime + alt.cookTime
                return (
                  <button
                    key={alt.id}
                    onClick={() => onSelectAlternative?.(alt.id)}
                    className="w-full text-left p-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-stone-900 dark:text-stone-100">
                          {alt.mealName}
                        </h4>
                        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                          {alt.briefDescription}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-stone-500 dark:text-stone-400">
                          <span>{effortLabels[alt.effortTier]}</span>
                          <span>•</span>
                          <span>{altTotalTime}m</span>
                        </div>
                      </div>
                      <div className="flex gap-0.5 flex-shrink-0 pt-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className={`
                              w-2 h-2 rounded-full
                              ${i < effortDots[alt.effortTier]
                                ? 'bg-yellow-500 dark:bg-yellow-400'
                                : 'bg-stone-200 dark:bg-stone-600'
                              }
                            `}
                          />
                        ))}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* More Options & Unplan */}
          <div className="space-y-2 pt-2">
            <button
              onClick={onMoreOptions}
              className="w-full px-4 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              More options
            </button>
            <button
              onClick={onUnplan}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 font-medium transition-colors"
            >
              I'll figure it out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
