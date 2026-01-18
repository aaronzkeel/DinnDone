"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { NotificationsList } from "@/components/notifications";
import type { Notification, CrisisDayMute } from "@/types/notifications";

export default function NotificationsPage() {
  // Fetch notifications from Convex
  const convexNotifications = useQuery(api.notifications.list);
  const markDone = useMutation(api.notifications.markDone);

  const [crisisDayMute, setCrisisDayMute] = useState<CrisisDayMute>({
    isActive: false,
  });

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
    // TODO: Navigate to or open settings modal
    console.log("Open notification settings");
  };

  const handleOpenPreview = () => {
    // TODO: Navigate to or open preview modal
    console.log("Open notification preview");
  };

  // Show loading state while fetching
  if (convexNotifications === undefined) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-2" style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}></div>
          <p style={{ color: "var(--color-muted)" }}>Loading notifications...</p>
        </div>
      </div>
    );
  }

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
