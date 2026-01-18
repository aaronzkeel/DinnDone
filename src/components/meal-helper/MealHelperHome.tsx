"use client";

import type { MealHelperHomeProps } from "@/types/meal-helper";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { MealSuggestionCard } from "./MealSuggestionCard";
import { TonightPlanCard } from "./TonightPlanCard";

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
  isLoading = false,
}: MealHelperHomeProps) {
  return (
    <div
      className="flex flex-col h-full min-h-[calc(100vh-120px)]"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="px-4 pt-4 pb-3 space-y-3">
        <TonightPlanCard meal={tonightMeal} householdMembers={householdMembers} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={onThisWorks}
            className="px-4 py-3 rounded-xl text-white font-semibold hover:opacity-90 active:scale-[0.99] transition-all"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            This works
          </button>
          <button
            onClick={onNewPlan}
            className="px-4 py-3 rounded-xl font-semibold hover:opacity-80 active:scale-[0.99] transition-all"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            New plan
          </button>
          <button
            onClick={onImWiped}
            className="px-4 py-3 rounded-xl font-semibold hover:opacity-80 active:scale-[0.99] transition-all"
            style={{
              backgroundColor: "transparent",
              border: "1px dashed var(--color-muted)",
              color: "var(--color-muted)",
            }}
          >
            I&apos;m wiped
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenInventoryCheck}
          className="w-full text-left text-sm font-semibold hover:opacity-80"
          style={{ color: "var(--color-muted)" }}
        >
          Check what we&apos;ve got
        </button>

        {panel}
      </div>

      <div className="flex-1 overflow-auto px-4 pb-2">
        {messages.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-medium" style={{ color: "var(--color-text)" }}>
              Hey {currentUser.name}.
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              Want to stick with tonight&apos;s plan or adjust it?
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

            {/* Loading indicator while waiting for AI response */}
            {isLoading && (
              <div className="flex items-center gap-2 ml-10 mt-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "var(--color-primary)", opacity: 0.2 }}
                >
                  <span style={{ color: "var(--color-primary)" }} className="text-sm font-bold">
                    Z
                  </span>
                </div>
                <div
                  className="rounded-2xl rounded-bl-md px-4 py-3"
                  style={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: "var(--color-muted)", animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: "var(--color-muted)", animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: "var(--color-muted)", animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ChatInput onSendMessage={onSendMessage} onVoiceInput={onVoiceInput} disabled={isLoading} />
    </div>
  );
}
