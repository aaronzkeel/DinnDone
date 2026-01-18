import { ArrowLeft, Check } from 'lucide-react'
import type { PantryAuditProps } from '../types'

export function PantryAudit({ items, onToggleItem, onComplete }: PantryAuditProps) {
  const checkedCount = items.filter((item) => item.alreadyHave).length
  const totalCount = items.length

  return (
    <div className="min-h-full bg-stone-50 dark:bg-stone-900">
      <div className="px-4 pt-4 pb-3">
        <button
          onClick={onComplete}
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100"
        >
          <ArrowLeft size={16} />
          Back to week plan
        </button>
      </div>

      <div className="px-4 pb-6">
        <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
          Pantry Audit
        </h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Check what staples you have on hand. This helps us generate an accurate grocery list.
        </p>

        {/* Progress indicator */}
        <div className="mt-4 p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Progress
            </span>
            <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
              {checkedCount} of {totalCount}
            </span>
          </div>
          <div className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 transition-all duration-300"
              style={{ width: `${(checkedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Items list */}
        <div className="mt-6 space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onToggleItem?.(item.id)}
              className={`
                w-full text-left p-4 rounded-xl border transition-colors
                ${item.alreadyHave
                  ? 'bg-lime-50 dark:bg-lime-950 border-lime-300 dark:border-lime-800'
                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                    w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors
                    ${item.alreadyHave
                      ? 'bg-lime-500 border-lime-500'
                      : 'border-stone-300 dark:border-stone-600'
                    }
                  `}
                >
                  {item.alreadyHave && <Check size={16} className="text-white" />}
                </div>
                <span
                  className={`
                    font-medium
                    ${item.alreadyHave
                      ? 'text-stone-800 dark:text-stone-100'
                      : 'text-stone-700 dark:text-stone-300'
                    }
                  `}
                >
                  {item.name}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Done button */}
        <div className="mt-6">
          <button
            onClick={onComplete}
            className="w-full px-6 py-4 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition-colors"
          >
            Done
          </button>
          <p className="mt-3 text-sm text-center text-stone-500 dark:text-stone-500">
            You can update these anytime from the settings
          </p>
        </div>
      </div>
    </div>
  )
}
