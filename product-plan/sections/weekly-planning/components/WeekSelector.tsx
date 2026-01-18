import { Plus, Check, Circle } from 'lucide-react'
import type { WeekSummary } from '../types'

interface WeekSelectorProps {
  weeks: WeekSummary[]
  selectedWeekId: string
  onSelectWeek?: (weekId: string) => void
  onAddWeek?: () => void
}

const statusIcons = {
  'draft': <Circle size={8} className="text-stone-400" />,
  'approved': <Check size={10} className="text-lime-500" />,
  'in-progress': <Circle size={8} className="text-yellow-500 fill-yellow-500" />,
  'completed': <Check size={10} className="text-stone-400" />,
}

export function WeekSelector({
  weeks,
  selectedWeekId,
  onSelectWeek,
  onAddWeek,
}: WeekSelectorProps) {
  return (
    <div className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
      <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto">
        {weeks.map((week) => {
          const isSelected = week.id === selectedWeekId
          return (
            <button
              key={week.id}
              onClick={() => onSelectWeek?.(week.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0
                ${isSelected
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  : 'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-600'
                }
              `}
            >
              {statusIcons[week.status]}
              <span>{week.label}</span>
            </button>
          )
        })}

        {/* Add week button */}
        <button
          onClick={onAddWeek}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors flex-shrink-0"
          aria-label="Add another week"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}
