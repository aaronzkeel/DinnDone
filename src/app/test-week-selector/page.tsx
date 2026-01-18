"use client";

import { useState } from "react";
import { WeekSelector } from "@/components/weekly-planning/WeekSelector";
import type { WeekSummary } from "@/types/weekly-planning";

// Generate week labels based on current date
function getWeekLabel(weekStartDate: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get current week's Monday
  const currentDay = today.getDay();
  const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - daysToMonday);
  thisMonday.setHours(0, 0, 0, 0);

  // Get next week's Monday
  const nextMonday = new Date(thisMonday);
  nextMonday.setDate(thisMonday.getDate() + 7);

  // Compare with the given weekStartDate
  const weekStart = new Date(weekStartDate);
  weekStart.setHours(0, 0, 0, 0);

  if (weekStart.getTime() === thisMonday.getTime()) {
    return "This Week";
  } else if (weekStart.getTime() === nextMonday.getTime()) {
    return "Next Week";
  } else {
    // Format as "Jan 27 - Feb 2"
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const startMonth = weekStart.toLocaleDateString("en-US", { month: "short" });
    const endMonth = weekEnd.toLocaleDateString("en-US", { month: "short" });
    const startDay = weekStart.getDate();
    const endDay = weekEnd.getDate();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}`;
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
    }
  }
}

// Generate available weeks starting from current week
function generateWeeks(): WeekSummary[] {
  const today = new Date();
  const currentDay = today.getDay();
  const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - daysToMonday);
  thisMonday.setHours(0, 0, 0, 0);

  const weeks: WeekSummary[] = [];

  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(thisMonday);
    weekStart.setDate(thisMonday.getDate() + (i * 7));
    const weekStartDate = weekStart.toISOString().split("T")[0];

    weeks.push({
      id: `wp-${i + 1}`,
      weekStartDate,
      label: getWeekLabel(weekStart),
      status: i === 0 ? "in-progress" : i === 1 ? "approved" : "draft",
    });
  }

  return weeks;
}

export default function TestWeekSelectorPage() {
  const [weeks] = useState<WeekSummary[]>(generateWeeks);
  const [selectedWeekId, setSelectedWeekId] = useState("wp-1");

  const selectedWeek = weeks.find(w => w.id === selectedWeekId);

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
      <div className="p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <h1 className="font-heading font-bold text-lg" style={{ color: "var(--color-text)" }}>
          Test: Week Selector (Feature #111)
        </h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Verify week selector displays current week and date range
        </p>
      </div>

      {/* WeekSelector Component */}
      <WeekSelector
        weeks={weeks}
        selectedWeekId={selectedWeekId}
        onSelectWeek={setSelectedWeekId}
        onAddWeek={() => console.log("Add week clicked")}
      />

      {/* Verification Info */}
      <div className="p-4 space-y-4">
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
        >
          <h2 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
            Selected Week Details
          </h2>
          {selectedWeek && (
            <div className="space-y-1 text-sm" style={{ color: "var(--color-muted)" }}>
              <p><strong>ID:</strong> {selectedWeek.id}</p>
              <p><strong>Label:</strong> {selectedWeek.label}</p>
              <p><strong>Start Date:</strong> {selectedWeek.weekStartDate}</p>
              <p><strong>Status:</strong> {selectedWeek.status}</p>
            </div>
          )}
        </div>

        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
        >
          <h2 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
            All Available Weeks
          </h2>
          <ul className="space-y-2 text-sm" style={{ color: "var(--color-muted)" }}>
            {weeks.map(week => (
              <li key={week.id}>
                <strong>{week.label}</strong> ({week.weekStartDate}) - {week.status}
                {week.id === selectedWeekId && <span className="ml-2 text-xs" style={{ color: "var(--color-primary)" }}>(selected)</span>}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
        >
          <h2 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
            Verification Checklist
          </h2>
          <ul className="space-y-1 text-sm" style={{ color: "var(--color-muted)" }}>
            <li>Step 1: View Weekly Planning - ✓ This test page shows WeekSelector</li>
            <li>Step 2: Verify week selector shows date range - Check labels above</li>
            <li>Step 3: Verify current week is selected by default - Check "This Week" has highlight</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
