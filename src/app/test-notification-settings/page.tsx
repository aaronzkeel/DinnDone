"use client";

import { useState, useEffect } from "react";
import { NotificationSettings } from "@/components/notifications";
import type {
  NotificationPreferences,
  NotificationType,
  FandomVoice,
} from "@/types/notifications";

// Test page for verifying Feature #174: Fandom Voice selector available
// This bypasses auth for testing purposes

const STORAGE_KEY = "dinner-bell-notification-prefs";

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

function loadPreferences(): NotificationPreferences {
  if (typeof window === "undefined") return defaultPreferences;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parse errors
  }
  return defaultPreferences;
}

function savePreferences(prefs: NotificationPreferences): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage errors
  }
}

export default function TestNotificationSettingsPage() {
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(defaultPreferences);
  const [mounted, setMounted] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    setPreferences(loadPreferences());
    setMounted(true);
  }, []);

  const handleToggleType = (type: NotificationType) => {
    setPreferences((prev) => {
      const updated = {
        ...prev,
        enabledTypes: prev.enabledTypes.includes(type)
          ? prev.enabledTypes.filter((t) => t !== type)
          : [...prev.enabledTypes, type],
      };
      savePreferences(updated);
      return updated;
    });
  };

  const handleUpdateQuietHours = (start: string, end: string) => {
    setPreferences((prev) => {
      const updated = {
        ...prev,
        quietHoursStart: start,
        quietHoursEnd: end,
      };
      savePreferences(updated);
      return updated;
    });
  };

  const handleChangeFandomVoice = (voice: FandomVoice) => {
    setPreferences((prev) => {
      const updated = {
        ...prev,
        fandomVoice: voice,
      };
      savePreferences(updated);
      return updated;
    });
  };

  const handleTogglePush = () => {
    setPreferences((prev) => {
      const updated = {
        ...prev,
        pushEnabled: !prev.pushEnabled,
      };
      savePreferences(updated);
      return updated;
    });
  };

  const handleResetDefaults = () => {
    setPreferences(defaultPreferences);
    savePreferences(defaultPreferences);
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
