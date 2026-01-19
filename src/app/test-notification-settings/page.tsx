"use client";

import { useState } from "react";
import { NotificationSettings } from "@/components/notifications";
import type {
  NotificationPreferences,
  NotificationType,
  FandomVoice,
} from "@/types/notifications";

// Test page for verifying Feature #174: Fandom Voice selector available
// This bypasses auth for testing purposes

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

export default function TestNotificationSettingsPage() {
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(defaultPreferences);

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

  const handleBack = () => {
    // Just log for testing
    console.log("Back button clicked");
  };

  return (
    <div className="h-[calc(100vh-120px)]">
      <NotificationSettings
        preferences={preferences}
        onToggleType={handleToggleType}
        onUpdateQuietHours={handleUpdateQuietHours}
        onChangeFandomVoice={handleChangeFandomVoice}
        onTogglePush={handleTogglePush}
        onResetDefaults={handleResetDefaults}
        onBack={handleBack}
      />
    </div>
  );
}
