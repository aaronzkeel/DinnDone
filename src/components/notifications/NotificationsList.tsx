"use client";

import { Settings, Sparkles, VolumeX } from "lucide-react";
import type { NotificationsListProps } from "@/types/notifications";
import { CrisisMuteBanner } from "./CrisisMuteBanner";
import { NotificationCard } from "./NotificationCard";

export function NotificationsList({
  notifications,
  crisisDayMute,
  onAction,
  onToggleCrisisMute,
  onOpenSettings,
  onOpenPreview,
}: NotificationsListProps) {
  const sortedNotifications = [...notifications].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeB - timeA;
  });

  // Separate pending and resolved notifications (newest first)
  const pendingNotifications = sortedNotifications.filter((n) => n.status === "pending");
  const resolvedNotifications = sortedNotifications.filter((n) => n.status !== "pending");

  return (
    <div
      className="flex flex-col h-full min-h-[calc(100vh-120px)]"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          backgroundColor: "var(--color-card)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <h2 className="font-semibold font-heading" style={{ color: "var(--color-text)" }}>
          Notifications
        </h2>
        <div className="flex items-center gap-2">
          {/* Crisis Day Mute toggle */}
          <button
            onClick={onToggleCrisisMute}
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: crisisDayMute.isActive ? "var(--color-border)" : "transparent",
              color: crisisDayMute.isActive ? "var(--color-text)" : "var(--color-muted)",
            }}
            aria-label="Crisis Day Mute"
            aria-pressed={crisisDayMute.isActive}
            title="Crisis Day Mute"
          >
            <VolumeX size={20} />
          </button>

          {/* Preview */}
          <button
            onClick={onOpenPreview}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ color: "var(--color-muted)" }}
            aria-label="Notification preview"
            title="Preview"
          >
            <Sparkles size={20} />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ color: "var(--color-muted)" }}
            aria-label="Notification settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Crisis Mute Banner */}
      <CrisisMuteBanner crisisDayMute={crisisDayMute} onDisable={onToggleCrisisMute} />

      {/* Notifications list - dimmed when Crisis Day Mute is active */}
      <div
        className={`flex-1 overflow-auto px-4 py-4 transition-opacity duration-300 ${
          crisisDayMute.isActive ? "opacity-40 pointer-events-none" : ""
        }`}
        aria-hidden={crisisDayMute.isActive}
      >
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: "var(--color-border)" }}
            >
              <VolumeX size={24} style={{ color: "var(--color-muted)" }} />
            </div>
            <p className="font-medium" style={{ color: "var(--color-muted)" }}>
              All caught up!
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              No notifications right now
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Pending notifications first */}
            {pendingNotifications.length > 0 && (
              <div className="space-y-3">
                <h3
                  className="text-xs font-semibold uppercase tracking-wide px-1"
                  style={{ color: "var(--color-muted)" }}
                >
                  Needs attention
                </h3>
                {pendingNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onAction={(actionId) => onAction?.(notification.id, actionId)}
                  />
                ))}
              </div>
            )}

            {/* Resolved notifications */}
            {resolvedNotifications.length > 0 && (
              <div className="space-y-3">
                {pendingNotifications.length > 0 && (
                  <h3
                    className="text-xs font-semibold uppercase tracking-wide px-1 mt-6"
                    style={{ color: "var(--color-muted)" }}
                  >
                    Earlier
                  </h3>
                )}
                {resolvedNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onAction={(actionId) => onAction?.(notification.id, actionId)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
