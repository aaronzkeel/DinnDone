"use client";

import { Plus, Check, Circle } from "lucide-react";
import type { WeekSummary, PlanStatus } from "@/types/weekly-planning";

interface WeekSelectorProps {
  weeks: WeekSummary[];
  selectedWeekId: string;
  onSelectWeek?: (weekId: string) => void;
  onAddWeek?: () => void;
}

const statusIcons: Record<PlanStatus, React.ReactNode> = {
  draft: <Circle size={8} className="text-[var(--color-muted)]" />,
  approved: <Check size={10} className="text-[var(--color-secondary)]" />,
  "in-progress": (
    <Circle
      size={8}
      className="text-[var(--color-primary)] fill-[var(--color-primary)]"
    />
  ),
  completed: <Check size={10} className="text-[var(--color-muted)]" />,
};

export function WeekSelector({
  weeks,
  selectedWeekId,
  onSelectWeek,
  onAddWeek,
}: WeekSelectorProps) {
  return (
    <div
      className="border-b"
      style={{
        backgroundColor: "var(--color-card)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto">
        {weeks.map((week) => {
          const isSelected = week.id === selectedWeekId;
          return (
            <button
              key={week.id}
              onClick={() => onSelectWeek?.(week.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0
                ${
                  isSelected
                    ? "bg-[var(--color-primary)] bg-opacity-20 text-[var(--color-primary)]"
                    : "bg-[var(--color-border)] text-[var(--color-muted)] hover:bg-opacity-80"
                }
              `}
            >
              {statusIcons[week.status]}
              <span>{week.label}</span>
            </button>
          );
        })}

        {/* Add week button */}
        <button
          onClick={onAddWeek}
          className="flex items-center justify-center w-8 h-8 rounded-full transition-colors flex-shrink-0"
          style={{
            backgroundColor: "var(--color-border)",
            color: "var(--color-muted)",
          }}
          aria-label="Add another week"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
