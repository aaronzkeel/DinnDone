"use client";

import { useState } from "react";
import { NotificationsList } from "@/components/notifications";
import type { Notification, CrisisDayMute } from "@/types/notifications";

// Sample notifications for initial UI (will be replaced with real data from Convex)
const sampleNotifications: Notification[] = [
  {
    id: "1",
    type: "daily-brief",
    message: "Tonight: Tacos! Katie is cooking. Don't forget to check if we have lime.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    status: "pending",
    actions: [
      { id: "got-it", label: "Got it!", isPrimary: true },
      { id: "view-plan", label: "View Plan", isPrimary: false },
    ],
  },
  {
    id: "2",
    type: "thaw-guardian",
    message: "Heads up! Tomorrow's dinner is Chicken Stir Fry. Time to move chicken from freezer to fridge.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    status: "pending",
    actions: [
      { id: "done", label: "Done!", isPrimary: true },
      { id: "skip", label: "Skip", isPrimary: false },
    ],
  },
  {
    id: "3",
    type: "weekly-plan-ready",
    message: "Your meal plan for next week is ready! Take a look and make any swaps.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    status: "done",
    resolvedAction: "Approved",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [crisisDayMute, setCrisisDayMute] = useState<CrisisDayMute>({
    isActive: false,
  });

  const handleAction = (notificationId: string, actionId: string) => {
    // Mark the notification as done with the action taken
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? {
              ...n,
              status: "done" as const,
              resolvedAt: new Date().toISOString(),
              resolvedAction: actionId,
            }
          : n
      )
    );
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
    // TODO: Navigate to or open settings modal
    console.log("Open notification settings");
  };

  const handleOpenPreview = () => {
    // TODO: Navigate to or open preview modal
    console.log("Open notification preview");
  };

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
