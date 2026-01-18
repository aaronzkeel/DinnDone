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

// Default preferences
const defaultPreferences: NotificationPreferences = {
  userId: "current-user",
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

function NotificationsContent() {
  // Fetch notifications from Convex
  const convexNotifications = useQuery(api.notifications.list);
  const markDone = useMutation(api.notifications.markDone);

  // View state: "list" or "settings"
  const [view, setView] = useState<"list" | "settings">("list");

  const [crisisDayMute, setCrisisDayMute] = useState<CrisisDayMute>({
    isActive: false,
  });

  // Notification preferences state (would be stored in Convex in production)
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(defaultPreferences);

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

  const handleAction = async (notificationId: string, actionId: string) => {
    try {
      // Call Convex mutation to mark notification as done
      await markDone({
        notificationId: notificationId as Parameters<typeof markDone>[0]["notificationId"],
        actionId,
      });
    } catch (error) {
      console.error("Failed to mark notification as done:", error);
    }
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
    // TODO: Navigate to or open preview modal
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

  // Show loading state while fetching
  if (convexNotifications === undefined) {
    return (
      <div
        className="flex items-center justify-center h-[calc(100vh-120px)]"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="text-center">
          <div
            className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-2"
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
