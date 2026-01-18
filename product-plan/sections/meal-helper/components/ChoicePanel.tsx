export interface ChoicePanelOption {
  id: string
  label: string
  description?: string
}

export interface ChoicePanelProps {
  title: string
  note?: string
  options: ChoicePanelOption[]
  onSelect?: (id: string) => void
}

export function ChoicePanel({ title, note, options, onSelect }: ChoicePanelProps) {
  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-700">
        <div className="text-sm font-semibold text-stone-800 dark:text-stone-100">
          {title}
        </div>
        {note && (
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {note}
          </div>
        )}
      </div>

      <div className="p-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect?.(option.id)}
            className="w-full text-left rounded-xl px-3 py-2 hover:bg-stone-50 dark:hover:bg-stone-700/40 transition-colors"
          >
            <div className="text-sm font-semibold text-stone-800 dark:text-stone-100">
              {option.label}
            </div>
            {option.description && (
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {option.description}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
