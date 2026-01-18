import type { MealHelperHomeProps } from '../types'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { MealSuggestionCard } from './MealSuggestionCard'
import { TonightPlanCard } from './TonightPlanCard'

export function MealHelperHome({
  currentUser,
  tonightMeal,
  householdMembers,
  messages,
  mealSuggestions = [],
  onAcceptSuggestion,
  onRejectSuggestion,
  onSomethingElse,
  onThisWorks,
  onNewPlan,
  onImWiped,
  onOpenInventoryCheck,
  panel,
  onSendMessage,
  onVoiceInput,
}: MealHelperHomeProps) {
  return (
    <div className="flex flex-col h-full bg-stone-50 dark:bg-stone-900">
      <div className="px-4 pt-4 pb-3 space-y-3">
        <TonightPlanCard meal={tonightMeal} householdMembers={householdMembers} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={onThisWorks}
            className="px-4 py-3 rounded-xl bg-yellow-500 dark:bg-yellow-600 text-white font-semibold hover:bg-yellow-600 dark:hover:bg-yellow-500 active:scale-[0.99] transition-all"
          >
            This works
          </button>
          <button
            onClick={onNewPlan}
            className="px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-semibold hover:bg-stone-50 dark:hover:bg-stone-700 active:scale-[0.99] transition-all"
          >
            New plan
          </button>
          <button
            onClick={onImWiped}
            className="px-4 py-3 rounded-xl border border-dashed border-stone-300 dark:border-stone-600 bg-transparent text-stone-600 dark:text-stone-300 font-semibold hover:bg-stone-100/60 dark:hover:bg-stone-800/60 active:scale-[0.99] transition-all"
          >
            I'm wiped
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenInventoryCheck}
          className="w-full text-left text-sm font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100"
        >
          Check what we've got
        </button>

        {panel}
      </div>

      <div className="flex-1 overflow-auto px-4 pb-2">
        {messages.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-stone-600 dark:text-stone-300 font-medium">
              Hey {currentUser.name}.
            </p>
            <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
              Want to stick with tonight's plan or adjust it?
            </p>
          </div>
        ) : (
          <div className="space-y-1 pt-2">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} currentUser={currentUser} />
            ))}

            {mealSuggestions.length > 0 && (
              <div className="space-y-3 mt-4 ml-10">
                {mealSuggestions.map((suggestion) => (
                  <MealSuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onAccept={() => onAcceptSuggestion?.(suggestion.id)}
                    onReject={() => onRejectSuggestion?.(suggestion.id)}
                    onSomethingElse={() => onSomethingElse?.(suggestion.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ChatInput onSendMessage={onSendMessage} onVoiceInput={onVoiceInput} />
    </div>
  )
}
