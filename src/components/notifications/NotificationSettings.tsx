"use client";

import { ArrowLeft, Bell, BellOff, Moon, Sparkles, RotateCcw } from "lucide-react";
import type {
  NotificationSettingsProps,
  NotificationType,
  FandomVoice,
} from "@/types/notifications";

const notificationTypes: Array<{
  type: NotificationType;
  label: string;
  description: string;
}> = [
  {
    type: "daily-brief",
    label: "7AM Daily Brief",
    description: "What's thawing today + tonight's plan",
  },
  {
    type: "strategic-pivot",
    label: "4PM Strategic Pivot",
    description: "Last-minute meal check-in",
  },
  {
    type: "thaw-guardian",
    label: "7:30PM Thaw Guardian",
    description: "Reminder to move tomorrow's protein to fridge",
  },
  {
    type: "weekly-plan-ready",
    label: "Weekly Plan Ready",
    description: "When your next week is ready to review",
  },
  {
    type: "leftover-check",
    label: "Leftover Check",
    description: "Don't let food go to waste reminders",
  },
  {
    type: "inventory-sos",
    label: "Inventory SOS",
    description: "Quick ingredient checks for family",
  },
  {
    type: "cook-reminder",
    label: "Cook Reminder",
    description: "Heads-up when you're scheduled to cook",
  },
];

const fandomVoices: Array<{ value: FandomVoice; label: string }> = [
  { value: "default", label: "Default" },
  { value: "samwise", label: "Samwise (LOTR)" },
  { value: "nacho-libre", label: "Nacho Libre" },
  { value: "harry-potter", label: "Harry Potter" },
  { value: "star-wars", label: "Star Wars" },
  { value: "the-office", label: "The Office" },
];

export function NotificationSettings({
  preferences,
  onToggleType,
  onUpdateQuietHours,
  onChangeFandomVoice,
  onTogglePush,
  onResetDefaults,
  onBack,
}: NotificationSettingsProps) {
  return (
    <div className="min-h-full" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="px-4 pt-4 pb-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-80"
          style={{ color: "var(--color-muted)" }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="px-4 pb-6">
        <h1
          className="text-xl font-bold font-heading"
          style={{ color: "var(--color-text)" }}
        >
          Notification Settings
        </h1>
        <p className="mt-2" style={{ color: "var(--color-muted)" }}>
          Control when and how Zylo reaches out
        </p>

        {/* Push Notifications Master Toggle */}
        <div className="mt-6">
          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {preferences.pushEnabled ? (
                  <Bell size={20} style={{ color: "var(--color-primary)" }} />
                ) : (
                  <BellOff size={20} style={{ color: "var(--color-muted)" }} />
                )}
                <div>
                  <h3
                    className="font-semibold"
                    style={{ color: "var(--color-text)" }}
                  >
                    Push Notifications
                  </h3>
                  <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                    {preferences.pushEnabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
              <button
                onClick={onTogglePush}
                className="relative w-12 h-7 rounded-full transition-colors"
                style={{
                  backgroundColor: preferences.pushEnabled
                    ? "var(--color-primary)"
                    : "var(--color-border)",
                }}
                aria-label={
                  preferences.pushEnabled
                    ? "Disable push notifications"
                    : "Enable push notifications"
                }
              >
                <div
                  className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform"
                  style={{
                    transform: preferences.pushEnabled
                      ? "translateX(20px)"
                      : "translateX(0)",
                  }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="mt-6">
          <h2
            className="text-sm font-semibold uppercase mb-3"
            style={{ color: "var(--color-muted)" }}
          >
            Nudge Types
          </h2>
          <div className="space-y-2">
            {notificationTypes.map(({ type, label, description }) => {
              const isEnabled = preferences.enabledTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => onToggleType?.(type)}
                  disabled={!preferences.pushEnabled}
                  className="w-full text-left p-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "var(--color-card)",
                    border: isEnabled
                      ? "2px solid var(--color-primary)"
                      : "1px solid var(--color-border)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3
                        className="font-semibold"
                        style={{ color: "var(--color-text)" }}
                      >
                        {label}
                      </h3>
                      <p
                        className="text-sm mt-0.5"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {description}
                      </p>
                    </div>
                    <div
                      className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-3"
                      style={{
                        backgroundColor: isEnabled
                          ? "var(--color-primary)"
                          : "var(--color-border)",
                      }}
                    >
                      <div
                        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                        style={{
                          transform: isEnabled
                            ? "translateX(20px)"
                            : "translateX(0)",
                        }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="mt-6">
          <h2
            className="text-sm font-semibold uppercase mb-3"
            style={{ color: "var(--color-muted)" }}
          >
            Quiet Hours
          </h2>
          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex items-start gap-3">
              <Moon size={20} className="mt-0.5" style={{ color: "var(--color-primary)" }} />
              <div className="flex-1">
                <h3
                  className="font-semibold"
                  style={{ color: "var(--color-text)" }}
                >
                  Do Not Disturb
                </h3>
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--color-muted)" }}
                >
                  No notifications during these hours
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <input
                    type="time"
                    value={preferences.quietHoursStart || "21:00"}
                    onChange={(e) =>
                      onUpdateQuietHours?.(
                        e.target.value,
                        preferences.quietHoursEnd || "07:00"
                      )
                    }
                    className="px-3 py-2 rounded-lg text-sm"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text)",
                    }}
                  />
                  <span style={{ color: "var(--color-muted)" }}>to</span>
                  <input
                    type="time"
                    value={preferences.quietHoursEnd || "07:00"}
                    onChange={(e) =>
                      onUpdateQuietHours?.(
                        preferences.quietHoursStart || "21:00",
                        e.target.value
                      )
                    }
                    className="px-3 py-2 rounded-lg text-sm"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fandom Voice */}
        <div className="mt-6">
          <h2
            className="text-sm font-semibold uppercase mb-3"
            style={{ color: "var(--color-muted)" }}
          >
            Fandom Voice (Optional)
          </h2>
          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex items-start gap-3">
              <Sparkles size={20} className="mt-0.5" style={{ color: "var(--color-primary)" }} />
              <div className="flex-1">
                <h3
                  className="font-semibold"
                  style={{ color: "var(--color-text)" }}
                >
                  Notification Voice
                </h3>
                <p
                  className="text-sm mt-1 mb-3"
                  style={{ color: "var(--color-muted)" }}
                >
                  Add personality to your nudges
                </p>
                <select
                  value={preferences.fandomVoice}
                  onChange={(e) =>
                    onChangeFandomVoice?.(e.target.value as FandomVoice)
                  }
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                  }}
                >
                  {fandomVoices.map((voice) => (
                    <option key={voice.value} value={voice.value}>
                      {voice.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Reset to Defaults */}
        <div className="mt-6 pb-20">
          <button
            onClick={onResetDefaults}
            className="w-full px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 hover:opacity-80"
            style={{
              backgroundColor: "transparent",
              border: "1px solid var(--color-border)",
              color: "var(--color-muted)",
            }}
          >
            <RotateCcw size={18} />
            Reset to defaults
          </button>
        </div>
      </div>
    </div>
  );
}
