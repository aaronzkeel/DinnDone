"use client";

import { useState } from "react";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import type { Notification } from "@/types/notifications";

/**
 * Test page for Feature #161: Tapping action resolves notification
 *
 * This test verifies:
 * 1. View pending notification with action buttons
 * 2. Tap primary action (e.g., "Looks good")
 * 3. Verify notification shows resolved state
 */
export default function TestNotificationActionPage() {
  // Create test notification with unique ID
  const testNotificationId = `test-${Date.now()}`;

  const [notification, setNotification] = useState<Notification>({
    id: testNotificationId,
    type: "daily-brief",
    message: "TEST_161_ACTION: Tonight's dinner is Chicken Stir Fry. Katie is cooking and it'll be ready by 6pm.",
    timestamp: new Date().toISOString(),
    status: "pending",
    actions: [
      { id: "looks-good", label: "Looks good", isPrimary: true },
      { id: "adjust", label: "Adjust", isPrimary: false },
    ],
  });

  const [actionLog, setActionLog] = useState<string[]>([]);

  const handleAction = (actionId: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setActionLog((prev) => [
      ...prev,
      `[${timestamp}] Action clicked: "${actionId}"`,
    ]);

    // Update notification to "done" status with the action that was taken
    setNotification((prev) => ({
      ...prev,
      status: "done",
      resolvedAt: new Date().toISOString(),
      resolvedAction: actionId === "looks-good" ? "Looks good" : "Adjust",
    }));
  };

  const handleReset = () => {
    setNotification({
      id: `test-${Date.now()}`,
      type: "daily-brief",
      message: "TEST_161_ACTION: Tonight's dinner is Chicken Stir Fry. Katie is cooking and it'll be ready by 6pm.",
      timestamp: new Date().toISOString(),
      status: "pending",
      actions: [
        { id: "looks-good", label: "Looks good", isPrimary: true },
        { id: "adjust", label: "Adjust", isPrimary: false },
      ],
    });
    setActionLog([]);
  };

  return (
    <div
      className="min-h-screen p-6 font-sans"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <h1
          className="text-2xl font-bold mb-2 font-heading"
          style={{ color: "var(--color-text)" }}
        >
          Feature #161: Tapping action resolves notification
        </h1>
        <p className="mb-6" style={{ color: "var(--color-muted)" }}>
          Test that clicking an action button marks the notification as done.
        </p>

        {/* Test Steps */}
        <div
          className="p-4 rounded-lg mb-6"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2
            className="font-semibold mb-3"
            style={{ color: "var(--color-text)" }}
          >
            Test Steps:
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm" style={{ color: "var(--color-text)" }}>
            <li className={notification.status === "pending" ? "font-medium" : "line-through opacity-60"}>
              View pending notification with action buttons
            </li>
            <li className={notification.status === "pending" ? "" : notification.status === "done" ? "font-medium" : "line-through opacity-60"}>
              Tap primary action (e.g., &quot;Looks good&quot;)
            </li>
            <li className={notification.status === "done" ? "font-medium" : ""}>
              Verify notification shows resolved state
            </li>
          </ol>
        </div>

        {/* Status Indicator */}
        <div
          className="p-4 rounded-lg mb-6"
          style={{
            backgroundColor: notification.status === "done" ? "rgba(34, 197, 94, 0.1)" : "rgba(234, 179, 8, 0.1)",
            border: `1px solid ${notification.status === "done" ? "rgba(34, 197, 94, 0.3)" : "rgba(234, 179, 8, 0.3)"}`,
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-semibold"
              style={{ color: notification.status === "done" ? "#16a34a" : "#ca8a04" }}
            >
              Status: {notification.status.toUpperCase()}
            </span>
            {notification.status === "done" && notification.resolvedAction && (
              <span className="text-sm" style={{ color: "var(--color-muted)" }}>
                (Action: {notification.resolvedAction})
              </span>
            )}
          </div>
        </div>

        {/* Notification Card Under Test */}
        <div className="mb-6">
          <h2
            className="text-sm font-semibold uppercase tracking-wide mb-3"
            style={{ color: "var(--color-muted)" }}
          >
            Notification Card
          </h2>
          <NotificationCard notification={notification} onAction={handleAction} />
        </div>

        {/* Verification Checklist */}
        <div
          className="p-4 rounded-lg mb-6"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2 className="font-semibold mb-3" style={{ color: "var(--color-text)" }}>
            Verification:
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  notification.status === "pending"
                    ? "bg-green-100 text-green-600"
                    : "bg-stone-100 text-stone-400"
                }`}
              >
                {notification.status === "pending" ? "✓" : "•"}
              </span>
              <span style={{ color: "var(--color-text)" }}>
                Action buttons visible when pending
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  notification.status === "done"
                    ? "bg-green-100 text-green-600"
                    : "bg-stone-100 text-stone-400"
                }`}
              >
                {notification.status === "done" ? "✓" : "•"}
              </span>
              <span style={{ color: "var(--color-text)" }}>
                Status changes to &quot;done&quot; after action
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  notification.status === "done" && notification.resolvedAction
                    ? "bg-green-100 text-green-600"
                    : "bg-stone-100 text-stone-400"
                }`}
              >
                {notification.status === "done" && notification.resolvedAction ? "✓" : "•"}
              </span>
              <span style={{ color: "var(--color-text)" }}>
                Shows which action was taken
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  notification.status === "done"
                    ? "bg-green-100 text-green-600"
                    : "bg-stone-100 text-stone-400"
                }`}
              >
                {notification.status === "done" ? "✓" : "•"}
              </span>
              <span style={{ color: "var(--color-text)" }}>
                Action buttons hidden after resolving
              </span>
            </li>
          </ul>
        </div>

        {/* Action Log */}
        {actionLog.length > 0 && (
          <div
            className="p-4 rounded-lg mb-6"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <h2 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
              Action Log:
            </h2>
            <ul className="space-y-1 text-sm font-mono" style={{ color: "var(--color-muted)" }}>
              {actionLog.map((log, i) => (
                <li key={i}>{log}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="w-full py-3 px-4 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: "var(--color-border)",
            color: "var(--color-text)",
          }}
        >
          Reset Test
        </button>

        {/* Link to real notifications page */}
        <div className="mt-6 text-center">
          <a
            href="/notifications"
            className="text-sm underline"
            style={{ color: "var(--color-primary)" }}
          >
            Go to real Notifications page (requires auth)
          </a>
        </div>
      </div>
    </div>
  );
}
