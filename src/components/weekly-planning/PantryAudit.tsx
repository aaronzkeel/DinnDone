"use client";

import { ArrowLeft, Check } from "lucide-react";
import type { PantryAuditProps } from "@/types/weekly-planning";

export function PantryAudit({ items, onToggleItem, onComplete }: PantryAuditProps) {
  const checkedCount = items.filter((item) => item.alreadyHave).length;
  const totalCount = items.length;

  return (
    <div
      className="min-h-[calc(100vh-120px)]"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="px-4 pt-4 pb-3">
        <button
          onClick={onComplete}
          className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity"
          style={{ color: "var(--color-muted)" }}
        >
          <ArrowLeft size={16} />
          Back to week plan
        </button>
      </div>

      <div className="px-4 pb-6">
        <h1
          className="text-xl font-bold font-heading"
          style={{ color: "var(--color-text)" }}
        >
          Pantry Audit
        </h1>
        <p className="mt-2" style={{ color: "var(--color-muted)" }}>
          Check what staples you have on hand. This helps us generate an accurate grocery list.
        </p>

        {/* Progress indicator */}
        <div
          className="mt-4 p-3 rounded-xl border"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-sm font-medium"
              style={{ color: "var(--color-text)" }}
            >
              Progress
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--color-primary)" }}
            >
              {checkedCount} of {totalCount}
            </span>
          </div>
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: "var(--color-border)" }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                backgroundColor: "var(--color-primary)",
                width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Items list */}
        <div className="mt-6 space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onToggleItem?.(item.id)}
              className="w-full text-left p-4 rounded-xl border transition-all active:scale-[0.99]"
              style={{
                backgroundColor: item.alreadyHave
                  ? "var(--color-secondary)"
                  : "var(--color-card)",
                borderColor: item.alreadyHave
                  ? "var(--color-secondary)"
                  : "var(--color-border)",
                opacity: item.alreadyHave ? 0.2 : 1,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    backgroundColor: item.alreadyHave
                      ? "var(--color-secondary)"
                      : "transparent",
                    borderColor: item.alreadyHave
                      ? "var(--color-secondary)"
                      : "var(--color-border)",
                  }}
                >
                  {item.alreadyHave && <Check size={16} className="text-white" />}
                </div>
                <span
                  className="font-medium"
                  style={{ color: "var(--color-text)" }}
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
            className="w-full px-6 py-4 rounded-xl text-white font-semibold transition-colors hover:opacity-90 active:scale-[0.99]"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            Done
          </button>
          <p
            className="mt-3 text-sm text-center"
            style={{ color: "var(--color-muted)" }}
          >
            You can update these anytime from the settings
          </p>
        </div>
      </div>
    </div>
  );
}
