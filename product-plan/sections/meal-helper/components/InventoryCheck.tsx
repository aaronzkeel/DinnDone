import { ArrowLeft, Mic, Send } from 'lucide-react'
import { useState } from 'react'
import type { InventoryCheckProps } from '../types'

export function InventoryCheck({ onBack, onSubmit, onVoiceInput }: InventoryCheckProps) {
  const [notes, setNotes] = useState('')

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
          Check what we've got
        </h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Quick brain dump. Fridge, freezer, pantry, and any spices/staples that matter.
        </p>

        <div className="mt-4 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-4">
          <label className="text-sm font-semibold text-stone-800 dark:text-stone-200">
            What's on hand?
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            placeholder="Example: chicken thighs, ground turkey, sad spinach, tortillas, rice, soy sauce, garlic, frozen peas…"
            className="mt-2 w-full rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-3 py-2 text-sm text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
          />

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onVoiceInput}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-semibold hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
            >
              <Mic size={16} />
              Use voice
            </button>
            <button
              type="button"
              onClick={() => onSubmit?.(notes)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-yellow-500 dark:bg-yellow-600 text-white font-semibold hover:bg-yellow-600 dark:hover:bg-yellow-500 transition-colors"
            >
              <Send size={16} />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
