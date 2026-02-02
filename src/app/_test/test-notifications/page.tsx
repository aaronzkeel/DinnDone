"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function TestNotificationsPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const notifications = useQuery(api.notifications.list);
  const createNotification = useMutation(api.notifications.createForSelf);
  const removeNotification = useMutation(api.notifications.remove);

  const [status, setStatus] = useState<string>("");

  const testNotifications = [
    {
      type: "daily-brief" as const,
      message: "TEST_NOTIFICATION_12345: Tonight is Taco Tuesday! Katie is cooking.",
      actions: [
        { id: "got-it", label: "Got it!", isPrimary: true },
        { id: "view-plan", label: "View Plan", isPrimary: false },
      ],
    },
    {
      type: "thaw-guardian" as const,
      message: "TEST_THAW_67890: Move chicken from freezer to fridge for tomorrow's dinner.",
      actions: [
        { id: "done", label: "Done!", isPrimary: true },
        { id: "skip", label: "Skip", isPrimary: false },
      ],
    },
    {
      type: "weekly-plan-ready" as const,
      message: "TEST_WEEKLY_ABCDE: Your meal plan for next week is ready!",
      actions: [
        { id: "approve", label: "Approve", isPrimary: true },
        { id: "edit", label: "Make Changes", isPrimary: false },
      ],
    },
  ];

  const handleCreateTestNotifications = async () => {
    setStatus("Creating test notifications...");
    try {
      for (const notification of testNotifications) {
        await createNotification(notification);
      }
      setStatus(`Created ${testNotifications.length} test notifications!`);
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleDeleteAll = async () => {
    if (!notifications || notifications.length === 0) {
      setStatus("No notifications to delete");
      return;
    }
    setStatus("Deleting all notifications...");
    try {
      for (const notification of notifications) {
        await removeNotification({ notificationId: notification._id });
      }
      setStatus("All notifications deleted!");
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Test Notifications</h1>
        <p>Loading authentication state...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto" style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
      <h1 className="text-2xl font-bold mb-4 font-heading" style={{ color: "var(--color-text)" }}>
        Test Notifications
      </h1>

      {/* Auth Status */}
      <div
        className="p-4 rounded-lg mb-6"
        style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
      >
        <h2 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
          Authentication Status
        </h2>
        <p style={{ color: isAuthenticated ? "var(--color-secondary)" : "var(--color-danger)" }}>
          {isAuthenticated ? "Authenticated" : "Not authenticated - please sign in first"}
        </p>
      </div>

      {/* Actions */}
      {isAuthenticated && (
        <div className="space-y-4 mb-6">
          <button
            onClick={handleCreateTestNotifications}
            className="w-full py-3 px-4 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: "var(--color-secondary)", color: "white" }}
          >
            Create Test Notifications
          </button>

          <button
            onClick={handleDeleteAll}
            className="w-full py-3 px-4 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: "var(--color-danger)", color: "white" }}
          >
            Delete All Notifications
          </button>
        </div>
      )}

      {/* Status Message */}
      {status && (
        <div
          className="p-4 rounded-lg mb-6"
          style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
        >
          <p style={{ color: "var(--color-text)" }}>{status}</p>
        </div>
      )}

      {/* Current Notifications */}
      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
      >
        <h2 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
          Current Notifications ({notifications?.length ?? 0})
        </h2>
        {notifications === undefined ? (
          <p style={{ color: "var(--color-muted)" }}>Loading...</p>
        ) : notifications.length === 0 ? (
          <p style={{ color: "var(--color-muted)" }}>No notifications in database</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li
                key={n._id}
                className="p-2 rounded text-sm"
                style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
              >
                <span className="font-medium">[{n.type}]</span> {n.message.substring(0, 60)}...
                <span className="ml-2 text-xs" style={{ color: "var(--color-muted)" }}>
                  ({n.status})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-6">
        <a
          href="/notifications"
          className="inline-block py-2 px-4 rounded-lg font-medium"
          style={{ backgroundColor: "var(--color-primary)", color: "white" }}
        >
          Go to Notifications Page
        </a>
      </div>
    </div>
  );
}
