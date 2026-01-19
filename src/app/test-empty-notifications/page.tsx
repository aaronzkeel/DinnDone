"use client";

import { NotificationsList } from "@/components/notifications";
import type { Notification } from "@/types/notifications";

export default function TestEmptyNotificationsPage() {
  // Empty notifications array to test empty state
  const emptyNotifications: Notification[] = [];

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
      <div className="p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <h1 className="font-heading font-bold text-lg" style={{ color: "var(--color-text)" }}>
          Test: Empty Notifications (Feature #183)
        </h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Verify empty state shows &quot;All caught up!&quot; message
        </p>
      </div>

      <div style={{ height: "calc(100vh - 200px)" }}>
        <NotificationsList
          notifications={emptyNotifications}
          crisisDayMute={{
            isActive: false,
          }}
          onAction={(notificationId, actionId) => {
            console.log("Action:", notificationId, actionId);
          }}
          onToggleCrisisMute={() => {
            console.log("Toggle crisis mute");
          }}
        />
      </div>
    </div>
  );
}
