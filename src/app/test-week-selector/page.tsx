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

// Generate available weeks including past weeks (for history)
function generateWeeks(): WeekSummary[] {
  const today = new Date();
  const currentDay = today.getDay();
  const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - daysToMonday);
  thisMonday.setHours(0, 0, 0, 0);

  const weeks: WeekSummary[] = [];

  // Generate 3 past weeks + current week + 4 future weeks = 8 total
  for (let i = -3; i < 5; i++) {
    const weekStart = new Date(thisMonday);
    weekStart.setDate(thisMonday.getDate() + (i * 7));
    const weekStartDate = weekStart.toISOString().split("T")[0];

    // Past weeks are completed, current is in-progress, next is approved, rest are draft
    let status: WeekSummary["status"] = "draft";
    if (i < 0) {
      status = "completed"; // Past weeks
    } else if (i === 0) {
      status = "in-progress"; // This week
    } else if (i === 1) {
      status = "approved"; // Next week
    }

    weeks.push({
      id: `wp-${i + 4}`, // IDs 1-3 are past, 4 is current, 5+ are future
      weekStartDate,
      label: getWeekLabel(weekStart),
      status,
    });
  }

  return weeks;
}

export default function TestWeekSelectorPage() {
  const [weeks] = useState<WeekSummary[]>(generateWeeks);
  const [selectedWeekId, setSelectedWeekId] = useState("wp-4"); // wp-4 is "This Week"

  const selectedWeek = weeks.find(w => w.id === selectedWeekId);
  const selectedIndex = weeks.findIndex(w => w.id === selectedWeekId);

  // Navigation handlers
  const handleNavigatePrevious = () => {
    if (selectedIndex > 0) {
      setSelectedWeekId(weeks[selectedIndex - 1].id);
    }
  };

  const handleNavigateNext = () => {
    if (selectedIndex < weeks.length - 1) {
      setSelectedWeekId(weeks[selectedIndex + 1].id);
    }
  };

  const canNavigatePrevious = selectedIndex > 0;
  const canNavigateNext = selectedIndex < weeks.length - 1;

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
        onNavigatePrevious={handleNavigatePrevious}
        onNavigateNext={handleNavigateNext}
        canNavigatePrevious={canNavigatePrevious}
        canNavigateNext={canNavigateNext}
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
            Feature #111 Checklist
          </h2>
          <ul className="space-y-1 text-sm" style={{ color: "var(--color-muted)" }}>
            <li>Step 1: View Weekly Planning - ✓ This test page shows WeekSelector</li>
            <li>Step 2: Verify week selector shows date range - Check labels above</li>
            <li>Step 3: Verify current week is selected by default - Check "This Week" has highlight</li>
          </ul>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
        >
          <h2 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
            Feature #113 Checklist (Previous Week Navigation)
          </h2>
          <ul className="space-y-1 text-sm" style={{ color: "var(--color-muted)" }}>
            <li>Step 1: Click previous week arrow (left chevron) - Use ← button</li>
            <li>Step 2: Verify dates update to previous week - Check Selected Week Details</li>
            <li>Step 3: Verify historical meals display - Past weeks show &quot;completed&quot; status</li>
          </ul>
          <div className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>
            <p><strong>Navigation Status:</strong></p>
            <p>Can navigate previous: {canNavigatePrevious ? "Yes" : "No (at oldest week)"}</p>
            <p>Can navigate next: {canNavigateNext ? "Yes" : "No (at newest week)"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
