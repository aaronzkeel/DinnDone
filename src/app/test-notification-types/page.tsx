"use client";

import { NotificationCard } from "@/components/notifications/NotificationCard";
import type { Notification } from "@/types/notifications";

// Sample notifications for ALL 7 types to verify icons
const allNotificationTypes: Notification[] = [
  {
    id: "1",
    type: "daily-brief",
    message: "Good morning! Today's plan: Chicken Stir Fry for dinner. Katie is cooking.",
    timestamp: new Date().toISOString(),
    status: "pending",
    actions: [
      { id: "view", label: "View Plan", isPrimary: true },
      { id: "got-it", label: "Got it", isPrimary: false },
    ],
  },
  {
    id: "2",
    type: "strategic-pivot",
    message: "Heads up! We're low on chicken. Consider swapping tonight's meal.",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: "pending",
    actions: [
      { id: "swap", label: "Swap Meal", isPrimary: true },
      { id: "keep", label: "Keep it", isPrimary: false },
    ],
  },
  {
    id: "3",
    type: "thaw-guardian",
    message: "Don't forget to thaw the salmon for tomorrow's dinner!",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: "pending",
    actions: [
      { id: "done", label: "Already done", isPrimary: true },
      { id: "remind", label: "Remind me later", isPrimary: false },
    ],
  },
  {
    id: "4",
    type: "weekly-plan-ready",
    message: "Your meal plan for next week is ready! Take a look and approve it.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "pending",
    actions: [
      { id: "approve", label: "Approve Plan", isPrimary: true },
      { id: "edit", label: "Make Changes", isPrimary: false },
    ],
  },
  {
    id: "5",
    type: "inventory-sos",
    message: "Running low on essentials! Add milk, eggs, and bread to your list.",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: "pending",
    actions: [
      { id: "add", label: "Add to List", isPrimary: true },
      { id: "dismiss", label: "Dismiss", isPrimary: false },
    ],
  },
  {
    id: "6",
    type: "leftover-check",
    message: "You made extra pasta last night. Use it up before it goes bad!",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: "pending",
    actions: [
      { id: "used", label: "Already used", isPrimary: true },
      { id: "remind", label: "Remind me", isPrimary: false },
    ],
  },
  {
    id: "7",
    type: "cook-reminder",
    message: "Time to start dinner! Tonight: Grilled Salmon with Asparagus (45 min)",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: "pending",
    actions: [
      { id: "start", label: "Start Cooking", isPrimary: true },
      { id: "delay", label: "Push 30 min", isPrimary: false },
    ],
  },
];

// Icon reference for verification
const iconReference = [
  { type: "daily-brief", icon: "Sun (☀️)", color: "Yellow" },
  { type: "strategic-pivot", icon: "Clock (🕐)", color: "Blue" },
  { type: "thaw-guardian", icon: "Snowflake (❄️)", color: "Cyan" },
  { type: "weekly-plan-ready", icon: "Calendar (📅)", color: "Purple" },
  { type: "inventory-sos", icon: "AlertCircle (⚠️)", color: "Orange" },
  { type: "leftover-check", icon: "UtensilsCrossed (🍴)", color: "Lime" },
  { type: "cook-reminder", icon: "ChefHat (👨‍🍳)", color: "Amber" },
];

export default function TestNotificationTypesPage() {
  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <h1 className="font-heading font-bold text-lg" style={{ color: "var(--color-text)" }}>
          Test: NotificationCard Type Icons (Feature #159)
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
          Verify that each notification type displays a unique icon
        </p>
      </div>

      {/* Icon Reference Legend */}
      <div className="p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <h2 className="font-semibold text-sm mb-2" style={{ color: "var(--color-text)" }}>
          Expected Icons (from spec):
        </h2>
        <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: "var(--color-muted)" }}>
          {iconReference.map((ref) => (
            <div key={ref.type} className="flex items-center gap-2">
              <span className="font-medium">{ref.type}:</span>
              <span>{ref.icon}</span>
              <span className="text-xs opacity-75">({ref.color})</span>
            </div>
          ))}
        </div>
      </div>

      {/* All 7 Notification Types */}
      <div className="p-4 space-y-3">
        <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--color-text)" }}>
          All 7 Notification Types:
        </h2>
        {allNotificationTypes.map((notification) => (
          <div key={notification.id}>
            <div className="text-xs mb-1 font-mono" style={{ color: "var(--color-muted)" }}>
              Type: {notification.type}
            </div>
            <NotificationCard
              notification={notification}
              onAction={(actionId) => console.log(`Action: ${actionId} on ${notification.type}`)}
            />
          </div>
        ))}
      </div>

      {/* Verification Checklist */}
      <div className="p-4 mt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
        <h2 className="font-semibold text-sm mb-2" style={{ color: "var(--color-text)" }}>
          Verification Checklist:
        </h2>
        <ul className="text-sm space-y-1" style={{ color: "var(--color-muted)" }}>
          <li>✅ daily-brief → Sun icon (yellow background)</li>
          <li>✅ strategic-pivot → Clock icon (blue background)</li>
          <li>✅ thaw-guardian → Snowflake icon (cyan background)</li>
          <li>✅ weekly-plan-ready → Calendar icon (purple background)</li>
          <li>✅ inventory-sos → AlertCircle icon (orange background)</li>
          <li>✅ leftover-check → UtensilsCrossed icon (lime background)</li>
          <li>✅ cook-reminder → ChefHat icon (amber background)</li>
        </ul>
      </div>
    </div>
  );
}
