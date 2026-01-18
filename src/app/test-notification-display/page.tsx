"use client";

import { useState } from "react";
import { NotificationsList } from "@/components/notifications";
import type { Notification, CrisisDayMute, NotificationType } from "@/types/notifications";

// Mock notifications for testing the display
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "daily-brief" as NotificationType,
    message: "Tonight is Taco Tuesday! Katie is cooking. Prep time: 25 minutes.",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
    status: "pending",
    actions: [
      { id: "got-it", label: "Got it!", isPrimary: true },
      { id: "view-plan", label: "View Plan", isPrimary: false },
    ],
  },
  {
    id: "2",
    type: "thaw-guardian" as NotificationType,
    message: "Move chicken from freezer to fridge for tomorrow's dinner.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: "pending",
    actions: [
      { id: "done", label: "Done!", isPrimary: true },
      { id: "skip", label: "Skip", isPrimary: false },
    ],
  },
  {
    id: "3",
    type: "weekly-plan-ready" as NotificationType,
    message: "Your meal plan for next week is ready! 5 easy meals, 2 special dinners.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    status: "done",
    resolvedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    resolvedAction: "approved",
    actions: [
      { id: "approve", label: "Approve", isPrimary: true },
      { id: "edit", label: "Make Changes", isPrimary: false },
    ],
  },
  {
    id: "4",
    type: "cook-reminder" as NotificationType,
    message: "Time to start cooking! Spaghetti and Meatballs - prep begins now.",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    status: "done",
    resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
    resolvedAction: "got-it",
    actions: [
      { id: "got-it", label: "Got it!", isPrimary: true },
    ],
  },
  {
    id: "5",
    type: "strategic-pivot" as NotificationType,
    message: "Plans changed? Swap tonight's meal or activate Crisis Day Mute.",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    status: "dismissed",
    resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    actions: [
      { id: "swap", label: "Swap Meal", isPrimary: true },
      { id: "crisis", label: "Crisis Mode", isPrimary: false },
    ],
  },
];

export default function TestNotificationDisplayPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [crisisDayMute, setCrisisDayMute] = useState<CrisisDayMute>({
    isActive: false,
  });

  const handleAction = (notificationId: string, actionId: string) => {
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

  return (
    <div style={{ minHeight: "100vh" }}>
      <NotificationsList
        notifications={notifications}
        crisisDayMute={crisisDayMute}
        onAction={handleAction}
        onToggleCrisisMute={handleToggleCrisisMute}
        onOpenSettings={() => console.log("Open settings")}
        onOpenPreview={() => console.log("Open preview")}
      />
    </div>
  );
}
