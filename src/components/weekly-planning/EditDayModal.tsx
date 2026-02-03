"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Clock, ChefHat, Users, Sparkles, Loader2, PenLine } from "lucide-react";
import type {
  PlannedMeal,
  MealAlternative,
  HouseholdMember,
} from "@/types/weekly-planning";
import { EFFORT_LABELS, EFFORT_DOTS } from "@/lib/effort-tiers";

export interface EditDayModalProps {
  /** Current meal being edited */
  currentMeal: PlannedMeal;
  /** Alternative meal suggestions */
  alternatives: MealAlternative[];
  /** All household members */
  householdMembers: HouseholdMember[];
  /** Current user's ID (for determining what they can toggle) */
  currentUserId?: string;
  /** Whether the current user is an admin (can toggle anyone's eating status) */
  isAdmin?: boolean;
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
  /** Whether alternatives are being loaded from AI */
  isLoadingAlternatives?: boolean;
  /** Called when user enters a custom meal */
  onCustomMeal?: (mealName: string, effortTier: "super-easy" | "middle" | "more-prep") => void;
  /** Called when user taps the current meal to view details */
  onViewMealDetails?: () => void;
}

export function EditDayModal({
  currentMeal,
  alternatives,
  householdMembers,
  currentUserId,
  isAdmin = true,
  canChangeCook = true,
  onChangeCook,
  onToggleEater,
  onSelectAlternative,
  onMoreOptions,
  onUnplan,
  onClose,
  isLoadingAlternatives = false,
  onCustomMeal,
  onViewMealDetails,
}: EditDayModalProps) {
  // Custom meal state
  const [customMealName, setCustomMealName] = useState("");
  const [customEffortTier, setCustomEffortTier] = useState<"super-easy" | "middle" | "more-prep">("middle");
  const [showCustomMealForm, setShowCustomMealForm] = useState(false);
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
            <button
              onClick={onViewMealDetails}
              className="w-full text-left p-4 rounded-xl transition-all hover:opacity-90 active:scale-[0.99]"
              style={{
                backgroundColor: "var(--color-primary-tint)",
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
                          i < EFFORT_DOTS[currentMeal.effortTier]
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
              <p
                className="text-xs mt-2"
                style={{ color: "var(--color-primary)" }}
              >
                Tap to see ingredients & directions →
              </p>
            </button>
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
              {!isAdmin && (
                <span className="ml-2 text-xs font-normal">(You can only change your own)</span>
              )}
            </h3>
            <div className="flex flex-wrap gap-2">
              {householdMembers.map((member) => {
                const isEating = currentMeal.eaterIds.includes(member.id);
                // Viewers (non-admins) can only toggle their own eating status
                const canToggle = isAdmin || member.id === currentUserId;
                return (
                  <button
                    key={member.id}
                    onClick={() => canToggle && onToggleEater?.(member.id)}
                    disabled={!canToggle}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: isEating
                        ? "var(--color-secondary)"
                        : "var(--color-border)",
                      color: isEating ? "white" : "var(--color-muted)",
                    }}
                  >
                    {member.name}
                    {!isAdmin && member.id === currentUserId && " (You)"}
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
            {isLoadingAlternatives ? (
              <div
                className="p-6 rounded-xl text-center"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px dashed var(--color-border)",
                }}
              >
                <Loader2
                  size={24}
                  className="animate-spin mx-auto mb-2"
                  style={{ color: "var(--color-primary)" }}
                />
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--color-muted)" }}
                >
                  Zylo is finding alternatives...
                </p>
              </div>
            ) : alternatives.length > 0 ? (
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
                            <span>{EFFORT_LABELS[alt.effortTier]}</span>
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
                                  i < EFFORT_DOTS[alt.effortTier]
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
              <button
                onClick={onMoreOptions}
                className="w-full p-4 rounded-xl text-center transition-all hover:opacity-90"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px dashed var(--color-border)",
                }}
              >
                <Sparkles
                  size={20}
                  className="mx-auto mb-1"
                  style={{ color: "var(--color-primary)" }}
                />
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  Tap to find alternatives
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--color-muted)" }}
                >
                  Zylo will suggest meals similar to {currentMeal.mealName}
                </p>
              </button>
            )}
          </div>

          {/* Custom Meal Entry */}
          <div>
            <button
              onClick={() => setShowCustomMealForm(!showCustomMealForm)}
              className="flex items-center gap-2 text-sm font-medium mb-2"
              style={{ color: "var(--color-primary)" }}
            >
              <PenLine size={14} />
              {showCustomMealForm ? "Hide custom meal" : "Enter your own meal"}
            </button>

            {showCustomMealForm && (
              <div
                className="p-4 rounded-xl space-y-3"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div>
                  <label
                    className="text-xs font-medium mb-1 block"
                    style={{ color: "var(--color-muted)" }}
                  >
                    Meal name
                  </label>
                  <input
                    type="text"
                    value={customMealName}
                    onChange={(e) => setCustomMealName(e.target.value)}
                    placeholder="e.g., Leftover night, Pizza delivery"
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text)",
                    }}
                  />
                </div>

                <div>
                  <label
                    className="text-xs font-medium mb-1 block"
                    style={{ color: "var(--color-muted)" }}
                  >
                    Effort level
                  </label>
                  <div className="flex gap-2">
                    {(["super-easy", "middle", "more-prep"] as const).map((tier) => (
                      <button
                        key={tier}
                        onClick={() => setCustomEffortTier(tier)}
                        className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                        style={{
                          backgroundColor:
                            customEffortTier === tier
                              ? "var(--color-primary)"
                              : "var(--color-card)",
                          color:
                            customEffortTier === tier
                              ? "white"
                              : "var(--color-text)",
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        {EFFORT_LABELS[tier]}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (customMealName.trim() && onCustomMeal) {
                      onCustomMeal(customMealName.trim(), customEffortTier);
                      setCustomMealName("");
                      setShowCustomMealForm(false);
                    }
                  }}
                  disabled={!customMealName.trim()}
                  className="w-full px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "var(--color-secondary)",
                    color: "white",
                  }}
                >
                  Use this meal
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 pb-4">
            <button
              onClick={onMoreOptions}
              disabled={isLoadingAlternatives}
              className="w-full px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {isLoadingAlternatives ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Finding options...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  More options
                </>
              )}
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
