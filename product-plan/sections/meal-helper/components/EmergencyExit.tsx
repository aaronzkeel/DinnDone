import { ArrowLeft, Utensils, Snowflake, Store } from 'lucide-react'
import type { EmergencyExitProps } from '../types'

const options = [
  {
    id: 'leftovers',
    title: 'Leftovers night',
    description: 'Heat and eat. Zero shame. Big win.',
    icon: Utensils,
  },
  {
    id: 'freezer',
    title: 'Freezer save',
    description: 'Something frozen + something fresh on the side.',
    icon: Snowflake,
  },
  {
    id: 'takeout',
    title: 'Clean takeout',
    description: 'Grab something decent and move on with your life.',
    icon: Store,
  },
] as const

export function EmergencyExit({ onBack, onChooseOption }: EmergencyExitProps) {
  return (
    <div className="min-h-full bg-stone-50 dark:bg-stone-900">
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
        <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
          Emergency Exit
        </h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Gotcha. Let's get everyone fed with as little effort as possible.
        </p>

        <div className="mt-4 space-y-2">
          {options.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.id}
                onClick={() => onChooseOption?.(option.id)}
                className="w-full text-left rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-yellow-700 dark:text-yellow-300" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-900 dark:text-stone-100">
                      {option.title}
                    </div>
                    <div className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
                      {option.description}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <p className="mt-4 text-sm text-stone-500 dark:text-stone-500">
          If you want to say more, go for it. If not, no problem.
        </p>
      </div>
    </div>
  )
}
