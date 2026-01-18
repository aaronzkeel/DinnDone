"use client";

import { useState } from "react";
import { NotificationsList } from "@/components/notifications";
import type { Notification, CrisisDayMute } from "@/types/notifications";

// Sample notifications for testing
const sampleNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "daily-brief",
    message: "Good morning! Here's what's cooking today: Chicken Stir Fry for dinner. Katie is cooking.",
    timestamp: new Date().toISOString(),
    status: "pending",
    actions: [
      { id: "view", label: "View Plan", isPrimary: true },
      { id: "dismiss", label: "Got it", isPrimary: false },
    ],
  },
  {
    id: "notif-2",
    type: "thaw-guardian",
    message: "Don't forget to thaw the chicken for tomorrow's dinner!",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "pending",
    actions: [
      { id: "done", label: "Already done", isPrimary: true },
      { id: "remind", label: "Remind me later", isPrimary: false },
    ],
  },
  {
    id: "notif-3",
    type: "cook-reminder",
    message: "Time to start dinner! Tonight: Salmon with Asparagus",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: "done",
    resolvedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    resolvedAction: "done",
  },
];

export default function TestCrisisMutePage() {
  const [crisisDayMute, setCrisisDayMute] = useState<CrisisDayMute>({
    isActive: false,
  });
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);

  const handleToggleCrisisMute = () => {
    setCrisisDayMute((prev) => ({
      isActive: !prev.isActive,
      activatedAt: !prev.isActive ? new Date().toISOString() : undefined,
      expiresAt: !prev.isActive
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : undefined,
    }));
  };

  const handleAction = (notificationId: string, actionId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? { ...n, status: "done" as const, resolvedAt: new Date().toISOString(), resolvedAction: actionId }
          : n
      )
    );
  };

  const handleOpenSettings = () => {
    console.log("Open settings");
  };

  const handleOpenPreview = () => {
    console.log("Open preview");
  };

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "calc(100vh - 120px)" }}>
      <div className="p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <h1 className="font-heading font-bold text-lg" style={{ color: "var(--color-text)" }}>
          Test: Crisis Day Mute (Feature #164)
        </h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Testing Crisis Day Mute toggle visibility and default state
        </p>
        <div
          className="mt-2 p-2 rounded-lg text-sm"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <strong>Status:</strong> Crisis Mute is currently{" "}
          <span
            style={{
              color: crisisDayMute.isActive ? "var(--color-danger)" : "var(--color-secondary)",
              fontWeight: "bold",
            }}
          >
            {crisisDayMute.isActive ? "ON" : "OFF (default)"}
          </span>
        </div>
      </div>
      <NotificationsList
        notifications={notifications}
        crisisDayMute={crisisDayMute}
        onAction={handleAction}
        onToggleCrisisMute={handleToggleCrisisMute}
        onOpenSettings={handleOpenSettings}
        onOpenPreview={handleOpenPreview}
      />
    </div>
  );
}
