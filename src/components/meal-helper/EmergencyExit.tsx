"use client";

import { ArrowLeft, Utensils, Snowflake, Store } from "lucide-react";
import type { EmergencyExitProps } from "@/types/meal-helper";

const options = [
  {
    id: "leftovers",
    title: "Leftovers night",
    description: "Heat and eat. Zero shame. Big win.",
    icon: Utensils,
  },
  {
    id: "freezer",
    title: "Freezer save",
    description: "Something frozen + something fresh on the side.",
    icon: Snowflake,
  },
  {
    id: "takeout",
    title: "Clean takeout",
    description: "Grab something decent and move on with your life.",
    icon: Store,
  },
] as const;

export function EmergencyExit({ onBack, onChooseOption }: EmergencyExitProps) {
  return (
    <div
      className="min-h-[calc(100vh-120px)]"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="px-4 pt-4 pb-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity"
          style={{ color: "var(--color-muted)" }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="px-4">
        <h1
          className="text-xl font-bold font-heading"
          style={{ color: "var(--color-text)" }}
        >
          Emergency Exit
        </h1>
        <p className="mt-2" style={{ color: "var(--color-muted)" }}>
          Gotcha. Let&apos;s get everyone fed with as little effort as possible.
        </p>

        <div className="mt-4 space-y-2">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => onChooseOption?.(option.id)}
                className="w-full text-left rounded-2xl border px-4 py-3 hover:opacity-90 transition-all active:scale-[0.99]"
                style={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "var(--color-primary)", opacity: 0.2 }}
                  >
                    <Icon size={18} style={{ color: "var(--color-primary)" }} />
                  </div>
                  <div>
                    <div
                      className="font-semibold"
                      style={{ color: "var(--color-text)" }}
                    >
                      {option.title}
                    </div>
                    <div
                      className="text-sm mt-0.5"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {option.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-sm" style={{ color: "var(--color-muted)" }}>
          If you want to say more, go for it. If not, no problem.
        </p>
      </div>
    </div>
  );
}
