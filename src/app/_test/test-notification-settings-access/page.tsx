"use client";

import { useState } from "react";
import { NotificationsList, NotificationSettings } from "@/components/notifications";
import type {
  Notification,
  CrisisDayMute,
  NotificationPreferences,
  NotificationType,
  FandomVoice,
} from "@/types/notifications";

/**
 * Test page for Feature #169: Notification settings accessible
 *
 * This demonstrates that tapping the settings icon opens the NotificationSettings view.
 * Bypasses auth for testing purposes.
 */

// Default preferences
const defaultPreferences: NotificationPreferences = {
  userId: "test-user",
  enabledTypes: [
    "daily-brief",
    "strategic-pivot",
    "thaw-guardian",
    "weekly-plan-ready",
    "cook-reminder",
  ],
  quietHoursStart: "21:00",
  quietHoursEnd: "07:00",
  fandomVoice: "default",
  pushEnabled: true,
};

// Sample notifications for testing
const sampleNotifications: Notification[] = [
  {
    id: "test-1",
    type: "daily-brief",
    message: "Good evening! Tonight's dinner is Pasta Primavera. Sarah is cooking.",
    timestamp: new Date().toISOString(),
    status: "pending",
    actions: [
      { id: "got-it", label: "Got it!", isPrimary: true },
      { id: "adjust", label: "Adjust", isPrimary: false },
    ],
  },
  {
    id: "test-2",
    type: "thaw-guardian",
    message: "Move salmon from freezer to fridge for tomorrow's dinner.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: "pending",
    actions: [
      { id: "done", label: "Done!", isPrimary: true },
      { id: "skip", label: "Skip", isPrimary: false },
    ],
  },
];

export default function TestNotificationSettingsAccessPage() {
  // View state: "list" or "settings"
  const [view, setView] = useState<"list" | "settings">("list");

  const [crisisDayMute, setCrisisDayMute] = useState<CrisisDayMute>({
    isActive: false,
  });

  const [preferences, setPreferences] =
    useState<NotificationPreferences>(defaultPreferences);

  const handleAction = (notificationId: string, actionId: string) => {
    console.log(`Action: ${actionId} on notification: ${notificationId}`);
  };

  const handleToggleCrisisMute = () => {
    setCrisisDayMute((prev) => ({
      isActive: !prev.isActive,
      activatedAt: !prev.isActive ? new Date().toISOString() : undefined,
      expiresAt: !prev.isActive
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : undefined,
    }));
  };

  const handleOpenSettings = () => {
    setView("settings");
  };

  const handleOpenPreview = () => {
    console.log("Open notification preview");
  };

  // Settings handlers
  const handleToggleType = (type: NotificationType) => {
    setPreferences((prev) => ({
      ...prev,
      enabledTypes: prev.enabledTypes.includes(type)
        ? prev.enabledTypes.filter((t) => t !== type)
        : [...prev.enabledTypes, type],
    }));
  };

  const handleUpdateQuietHours = (start: string, end: string) => {
    setPreferences((prev) => ({
      ...prev,
      quietHoursStart: start,
      quietHoursEnd: end,
    }));
  };

  const handleChangeFandomVoice = (voice: FandomVoice) => {
    setPreferences((prev) => ({
      ...prev,
      fandomVoice: voice,
    }));
  };

  const handleTogglePush = () => {
    setPreferences((prev) => ({
      ...prev,
      pushEnabled: !prev.pushEnabled,
    }));
  };

  const handleResetDefaults = () => {
    setPreferences(defaultPreferences);
  };

  const handleBackFromSettings = () => {
    setView("list");
  };

  // Show settings view
  if (view === "settings") {
    return (
      <div className="h-[calc(100vh-120px)]">
        <NotificationSettings
          preferences={preferences}
          onToggleType={handleToggleType}
          onUpdateQuietHours={handleUpdateQuietHours}
          onChangeFandomVoice={handleChangeFandomVoice}
          onTogglePush={handleTogglePush}
          onResetDefaults={handleResetDefaults}
          onBack={handleBackFromSettings}
        />
      </div>
    );
  }

  // Show notifications list with settings button
  return (
    <div className="h-[calc(100vh-120px)]">
      <NotificationsList
        notifications={sampleNotifications}
        crisisDayMute={crisisDayMute}
        onAction={handleAction}
        onToggleCrisisMute={handleToggleCrisisMute}
        onOpenSettings={handleOpenSettings}
        onOpenPreview={handleOpenPreview}
      />
    </div>
  );
}
