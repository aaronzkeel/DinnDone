"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Calendar, Sparkles } from "lucide-react";
import type { MealHelperHomeProps } from "@/types/meal-helper";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { MealSuggestionCard } from "./MealSuggestionCard";
import { TonightPlanCard } from "./TonightPlanCard";

// Zylo's motivational quotes - encouraging messages for caregivers
const MOTIVATIONAL_QUOTES = [
  "You're not behind, you're human.",
  "Dinner doesn't have to be perfect to be nourishing.",
  "You're doing better than you think.",
  "Fed is best. Everything else is bonus.",
  "Some days are cereal nights. That's okay.",
  "Progress over perfection, always.",
  "You've got this. One meal at a time.",
  "Taking care of yourself is taking care of your family.",
  "Good enough is good enough.",
  "Tomorrow is a fresh start.",
];

// Get a quote that rotates based on date (so it changes daily but is consistent within a day)
function getMotivationalQuote(): string {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
}

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
  onViewMeal,
  onOpenInventoryCheck,
  panel,
  onSendMessage,
  onVoiceInput,
  isLoading = false,
}: MealHelperHomeProps) {
  // Get today's motivational quote (memoized to be stable during render)
  const motivationalQuote = useMemo(() => getMotivationalQuote(), []);

  // Empty state when no plan exists
  if (!tonightMeal) {
    return (
      <div
        className="flex flex-col h-full min-h-[calc(100vh-120px)]"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="px-4 pt-4 pb-3 space-y-4">
          {/* Empty state card */}
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: "var(--color-bg)" }}
            >
              <Calendar
                className="w-8 h-8"
                style={{ color: "var(--color-muted)" }}
              />
            </div>
            <h2
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--color-text)" }}
            >
              No meal planned for tonight
            </h2>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--color-muted)" }}
            >
              Create a weekly plan to see tonight&apos;s meal suggestion here.
            </p>
            <Link
              href="/weekly-planning"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 active:scale-[0.99] transition-all"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <Calendar className="w-4 h-4" />
              Go to Weekly Planning
            </Link>
          </div>

          {/* I'm wiped button still available */}
          <button
            onClick={onImWiped}
            className="w-full px-3 py-2.5 rounded-lg text-sm font-semibold hover:opacity-80 active:scale-[0.99] transition-all"
            style={{
              backgroundColor: "transparent",
              border: "1px dashed var(--color-muted)",
              color: "var(--color-muted)",
            }}
          >
            I&apos;m wiped
          </button>
        </div>

        {/* Chat area for Zylo interactions */}
        <div className="flex-1 overflow-auto px-4 pb-24">
          {messages.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-medium" style={{ color: "var(--color-text)" }}>
                Hey {currentUser.name}.
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
                Need help deciding what to eat?
              </p>
              {/* Zylo's motivational quote */}
              <div
                className="mt-6 mx-auto max-w-xs p-4 rounded-xl"
                style={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="flex items-center gap-2 justify-center mb-2">
                  <Sparkles size={14} style={{ color: "var(--color-primary)" }} />
                  <span
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Zylo says
                  </span>
                </div>
                <p
                  className="text-sm italic font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  &ldquo;{motivationalQuote}&rdquo;
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1 pt-2">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} currentUser={currentUser} />
              ))}

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

  return (
    <div
      className="flex flex-col h-full min-h-[calc(100vh-120px)]"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="px-4 pt-4 pb-3 space-y-3">
        <TonightPlanCard meal={tonightMeal} householdMembers={householdMembers} onView={onViewMeal} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={onThisWorks}
            className="px-3 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 active:scale-[0.99] transition-all"
            style={{ backgroundColor: "var(--color-secondary)" }}
          >
            This works
          </button>
          <button
            onClick={onNewPlan}
            className="px-3 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 active:scale-[0.99] transition-all"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            New plan
          </button>
          <button
            onClick={onImWiped}
            className="px-3 py-2.5 rounded-lg text-sm font-semibold hover:opacity-80 active:scale-[0.99] transition-all"
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

      <div className="flex-1 overflow-auto px-4 pb-24">
        {messages.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-medium" style={{ color: "var(--color-text)" }}>
              Hey {currentUser.name}.
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              Want to stick with tonight&apos;s plan or adjust it?
            </p>
            {/* Zylo's motivational quote */}
            <div
              className="mt-6 mx-auto max-w-xs p-4 rounded-xl"
              style={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div className="flex items-center gap-2 justify-center mb-2">
                <Sparkles size={14} style={{ color: "var(--color-primary)" }} />
                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--color-primary)" }}
                >
                  Zylo says
                </span>
              </div>
              <p
                className="text-sm italic font-medium"
                style={{ color: "var(--color-text)" }}
              >
                &ldquo;{motivationalQuote}&rdquo;
              </p>
            </div>
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
