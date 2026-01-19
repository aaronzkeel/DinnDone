"use client";

import { useRef, useEffect, useCallback } from "react";
import { X, Clock, ChefHat, Users, Sparkles } from "lucide-react";
import type {
  PlannedMeal,
  MealAlternative,
  HouseholdMember,
} from "@/types/weekly-planning";

const effortLabels = {
  "super-easy": "Super Easy",
  middle: "Medium",
  "more-prep": "More Prep",
};

const effortDots = {
  "super-easy": 1,
  middle: 2,
  "more-prep": 3,
};

export interface EditDayModalProps {
  /** Current meal being edited */
  currentMeal: PlannedMeal;
  /** Alternative meal suggestions */
  alternatives: MealAlternative[];
  /** All household members */
  householdMembers: HouseholdMember[];
  /** Whether the current user can change the cook (admin only) */
  canChangeCook?: boolean;
  /** Called when user changes the cook */
  onChangeCook?: (newCookId: string) => void;
  /** Called when user toggles an eater */
  onToggleEater?: (memberId: string) => void;
  /** Called when user selects an alternative */
  onSelectAlternative?: (alternativeId: string) => void;
  /** Called when user wants more options */
  onMoreOptions?: () => void;
  /** Called when user chooses "I'll figure it out" */
  onUnplan?: () => void;
  /** Called when user closes modal */
  onClose?: () => void;
}

export function EditDayModal({
  currentMeal,
  alternatives,
  householdMembers,
  canChangeCook = true,
  onChangeCook,
  onToggleEater,
  onSelectAlternative,
  onMoreOptions,
  onUnplan,
  onClose,
}: EditDayModalProps) {
  const cook = householdMembers.find((m) => m.id === currentMeal.assignedCookId);
  const totalTime = currentMeal.prepTime + currentMeal.cookTime;
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Get all focusable elements within the modal
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(focusableSelector)
    ).filter((el) => !el.hasAttribute("disabled"));
  }, []);

  // Focus trap handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift+Tab: if on first element, wrap to last
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: if on last element, wrap to first
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [getFocusableElements]
  );

  // Set up focus trap and initial focus
  useEffect(() => {
    // Focus the close button when modal opens
    closeButtonRef.current?.focus();

    // Add keydown listener for focus trap
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-day-modal-title"
        className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "var(--color-card)" }}
      >
        {/* Header */}
        <div
          className="sticky top-0 px-4 py-3 flex items-center justify-between"
          style={{
            backgroundColor: "var(--color-card)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <h2
            id="edit-day-modal-title"
            className="text-lg font-bold font-heading"
            style={{ color: "var(--color-text)" }}
          >
            Edit Day
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1 rounded-lg hover:opacity-80 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} style={{ color: "var(--color-muted)" }} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Current Meal */}
          <div>
            <h3
              className="text-xs font-semibold uppercase mb-2"
              style={{ color: "var(--color-muted)" }}
            >
              Current Meal
            </h3>
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: "rgba(226, 169, 59, 0.1)",
                border: "1px solid var(--color-primary)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <h4
                  className="font-semibold"
                  style={{ color: "var(--color-text)" }}
                >
                  {currentMeal.mealName}
                </h4>
                <div className="flex gap-0.5 flex-shrink-0 pt-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          i < effortDots[currentMeal.effortTier]
                            ? "var(--color-primary)"
                            : "var(--color-border)",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div
                className="flex items-center gap-4 mt-2 text-sm"
                style={{ color: "var(--color-muted)" }}
              >
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
            <h3
              className="text-xs font-semibold uppercase mb-2"
              style={{ color: "var(--color-muted)" }}
            >
              Change Cook
              {!canChangeCook && (
                <span className="ml-2 text-xs font-normal">(Admin only)</span>
              )}
            </h3>
            <div className="flex flex-wrap gap-2">
              {householdMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => canChangeCook && onChangeCook?.(member.id)}
                  disabled={!canChangeCook}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor:
                      member.id === currentMeal.assignedCookId
                        ? "var(--color-primary)"
                        : "var(--color-border)",
                    color:
                      member.id === currentMeal.assignedCookId
                        ? "white"
                        : "var(--color-text)",
                  }}
                >
                  {member.name}
                </button>
              ))}
            </div>
          </div>

          {/* Who's Eating */}
          <div>
            <h3
              className="text-xs font-semibold uppercase mb-2"
              style={{ color: "var(--color-muted)" }}
            >
              Who&apos;s Eating
            </h3>
            <div className="flex flex-wrap gap-2">
              {householdMembers.map((member) => {
                const isEating = currentMeal.eaterIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    onClick={() => onToggleEater?.(member.id)}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: isEating
                        ? "var(--color-secondary)"
                        : "var(--color-border)",
                      color: isEating ? "white" : "var(--color-muted)",
                    }}
                  >
                    {member.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Swap with Alternative */}
          <div>
            <h3
              className="text-xs font-semibold uppercase mb-2"
              style={{ color: "var(--color-muted)" }}
            >
              Swap with Alternative
            </h3>
            {alternatives.length > 0 ? (
              <div className="space-y-2">
                {alternatives.map((alt) => {
                  const altTotalTime = alt.prepTime + alt.cookTime;
                  return (
                    <button
                      key={alt.id}
                      onClick={() => onSelectAlternative?.(alt.id)}
                      className="w-full text-left p-4 rounded-xl transition-colors hover:opacity-90"
                      style={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4
                            className="font-semibold"
                            style={{ color: "var(--color-text)" }}
                          >
                            {alt.mealName}
                          </h4>
                          <p
                            className="text-sm mt-1"
                            style={{ color: "var(--color-muted)" }}
                          >
                            {alt.briefDescription}
                          </p>
                          <div
                            className="flex items-center gap-3 mt-2 text-xs"
                            style={{ color: "var(--color-muted)" }}
                          >
                            <span>{effortLabels[alt.effortTier]}</span>
                            <span>•</span>
                            <span>{altTotalTime}m</span>
                          </div>
                        </div>
                        <div className="flex gap-0.5 flex-shrink-0 pt-1">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div
                              key={i}
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor:
                                  i < effortDots[alt.effortTier]
                                    ? "var(--color-primary)"
                                    : "var(--color-border)",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div
                className="p-4 rounded-xl text-center"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px dashed var(--color-border)",
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--color-muted)" }}
                >
                  No quick swap options available
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--color-muted)" }}
                >
                  Tap &quot;More options&quot; below to browse all meals or add your own
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 pb-4">
            <button
              onClick={onMoreOptions}
              className="w-full px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-white"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <Sparkles size={18} />
              More options
            </button>
            <button
              onClick={onUnplan}
              className="w-full px-4 py-3 rounded-xl font-medium transition-colors"
              style={{
                backgroundColor: "transparent",
                border: "1px solid var(--color-border)",
                color: "var(--color-muted)",
              }}
            >
              I&apos;ll figure it out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
