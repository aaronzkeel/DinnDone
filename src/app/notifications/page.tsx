"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { NotificationsList, NotificationSettings } from "@/components/notifications";
import { RequireAuth } from "@/components/RequireAuth";
import type {
  Notification,
  CrisisDayMute,
  NotificationPreferences,
  NotificationType,
  FandomVoice,
} from "@/types/notifications";

function NotificationsContent() {
  // Fetch notifications and preferences from Convex
  const convexNotifications = useQuery(api.notifications.list);
  const convexPreferences = useQuery(api.notificationPreferences.get);
  const markDone = useMutation(api.notifications.markDone);
  const updatePreferences = useMutation(api.notificationPreferences.update);
  const toggleCrisisMute = useMutation(api.notificationPreferences.toggleCrisisMute);
  const resetToDefaults = useMutation(api.notificationPreferences.resetToDefaults);

  // View state: "list" or "settings"
  const [view, setView] = useState<"list" | "settings">("list");

  // Convert Convex notifications to component format
  const notifications: Notification[] = useMemo(() => {
    if (!convexNotifications) return [];

    return convexNotifications.map((n) => ({
      id: n._id,
      type: n.type,
      message: n.message,
      timestamp: n.timestamp,
      status: n.status,
      actions: n.actions,
      resolvedAt: n.resolvedAt,
      resolvedAction: n.resolvedAction,
    }));
  }, [convexNotifications]);

  // Convert Convex preferences to component format
  const preferences: NotificationPreferences = useMemo(() => {
    if (!convexPreferences) {
      return {
        userId: "loading",
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
    }

    return {
      userId: convexPreferences.userId ?? "unknown",
      enabledTypes: convexPreferences.enabledTypes as NotificationType[],
      quietHoursStart: convexPreferences.quietHoursStart,
      quietHoursEnd: convexPreferences.quietHoursEnd,
      fandomVoice: convexPreferences.fandomVoice as FandomVoice,
      pushEnabled: convexPreferences.pushEnabled,
    };
  }, [convexPreferences]);

  // Convert crisis day mute from preferences
  const crisisDayMute: CrisisDayMute = useMemo(() => {
    if (!convexPreferences?.crisisDayMute) {
      return { isActive: false };
    }

    return {
      isActive: convexPreferences.crisisDayMute.isActive,
      expiresAt: convexPreferences.crisisDayMute.expiresAt,
    };
  }, [convexPreferences]);

  const handleAction = async (notificationId: string, actionId: string) => {
    try {
      await markDone({
        notificationId: notificationId as Parameters<typeof markDone>[0]["notificationId"],
        actionId,
      });
    } catch (error) {
      console.error("Failed to mark notification as done:", error);
    }
  };

  const handleToggleCrisisMute = async () => {
    try {
      await toggleCrisisMute({});
    } catch (error) {
      console.error("Failed to toggle crisis mute:", error);
    }
  };

  const handleOpenSettings = () => {
    setView("settings");
  };

  const handleOpenPreview = () => {
    console.log("Open notification preview");
  };

  // Settings handlers
  const handleToggleType = async (type: NotificationType) => {
    try {
      const newTypes = preferences.enabledTypes.includes(type)
        ? preferences.enabledTypes.filter((t) => t !== type)
        : [...preferences.enabledTypes, type];

      await updatePreferences({ enabledTypes: newTypes });
    } catch (error) {
      console.error("Failed to toggle notification type:", error);
    }
  };

  const handleUpdateQuietHours = async (start: string, end: string) => {
    try {
      await updatePreferences({
        quietHoursStart: start,
        quietHoursEnd: end,
      });
    } catch (error) {
      console.error("Failed to update quiet hours:", error);
    }
  };

  const handleChangeFandomVoice = async (voice: FandomVoice) => {
    try {
      await updatePreferences({ fandomVoice: voice });
    } catch (error) {
      console.error("Failed to change fandom voice:", error);
    }
  };

  const handleTogglePush = async () => {
    try {
      await updatePreferences({ pushEnabled: !preferences.pushEnabled });
    } catch (error) {
      console.error("Failed to toggle push notifications:", error);
    }
  };

  const handleResetDefaults = async () => {
    try {
      await resetToDefaults({});
    } catch (error) {
      console.error("Failed to reset to defaults:", error);
    }
  };

  const handleBackFromSettings = () => {
    setView("list");
  };

  // Show loading state while fetching
  if (convexNotifications === undefined || convexPreferences === undefined) {
    return (
      <div
        className="flex h-[calc(100vh-120px)] items-center justify-center"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{
              borderColor: "var(--color-primary)",
              borderTopColor: "transparent",
            }}
          ></div>
          <p style={{ color: "var(--color-muted)" }}>Loading notifications...</p>
        </div>
      </div>
    );
  }

  // Show settings view
  if (view === "settings") {
    return (
      <NotificationSettings
        preferences={preferences}
        onToggleType={handleToggleType}
        onUpdateQuietHours={handleUpdateQuietHours}
        onChangeFandomVoice={handleChangeFandomVoice}
        onTogglePush={handleTogglePush}
        onResetDefaults={handleResetDefaults}
        onBack={handleBackFromSettings}
      />
    );
  }

  // Show notifications list
  return (
    <NotificationsList
      notifications={notifications}
      crisisDayMute={crisisDayMute}
      onAction={handleAction}
      onToggleCrisisMute={handleToggleCrisisMute}
      onOpenSettings={handleOpenSettings}
      onOpenPreview={handleOpenPreview}
    />
  );
}

export default function NotificationsPage() {
  return (
    <RequireAuth>
      <NotificationsContent />
    </RequireAuth>
  );
}
