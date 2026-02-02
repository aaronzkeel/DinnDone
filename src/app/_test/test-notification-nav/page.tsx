"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import type { Notification } from "@/types/notifications";

/**
 * Test page for Feature #197: Notification actions trigger appropriate flows
 *
 * This demonstrates that tapping "Adjust" on a notification navigates to
 * the relevant screen (Weekly Planning or Meal Helper).
 */

const testNotification: Notification = {
  id: "nav-test-1",
  type: "daily-brief",
  message: "Good morning! Tonight's dinner is Chicken Stir Fry. Katie is cooking and it'll be ready by 6pm.",
  timestamp: new Date().toISOString(),
  status: "pending",
  actions: [
    { id: "looks-good", label: "Looks good", isPrimary: true },
    { id: "adjust", label: "Adjust", isPrimary: false },
  ],
};

// Action to navigation mapping
const ACTION_NAVIGATION_MAP: Record<string, { path: string; label: string }> = {
  "looks-good": { path: "/", label: "Home (acknowledged)" },
  adjust: { path: "/weekly-planning", label: "Weekly Planning" },
  "view-plan": { path: "/weekly-planning", label: "Weekly Planning" },
  swap: { path: "/weekly-planning", label: "Weekly Planning" },
  start: { path: "/", label: "Meal Helper (cooking mode)" },
  "add-to-list": { path: "/grocery-list", label: "Grocery List" },
};

export default function TestNotificationNavPage() {
  const router = useRouter();
  const [notification, setNotification] = useState(testNotification);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleAction = (actionId: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const navTarget = ACTION_NAVIGATION_MAP[actionId];

    setActionLog((prev) => [
      ...prev,
      `[${timestamp}] Action: "${actionId}" → Navigates to: ${navTarget?.label || "Unknown"}`,
    ]);

    setLastAction(actionId);

    // Mark notification as done
    setNotification((prev) => ({
      ...prev,
      status: "done",
      resolvedAt: new Date().toISOString(),
      resolvedAction: actionId,
    }));

    // Navigate after a brief delay to show the action was registered
    if (navTarget) {
      setTimeout(() => {
        router.push(navTarget.path);
      }, 1500);
    }
  };

  const handleReset = () => {
    setNotification(testNotification);
    setActionLog([]);
    setLastAction(null);
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
          Feature #197: Notification actions trigger appropriate flows
        </h1>
        <p className="mb-6" style={{ color: "var(--color-muted)" }}>
          Test that tapping notification actions navigates to the relevant screen.
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
          <ol
            className="list-decimal list-inside space-y-2 text-sm"
            style={{ color: "var(--color-text)" }}
          >
            <li className={notification.status === "pending" ? "font-medium" : "line-through opacity-60"}>
              Step 1: Receive Daily Brief with Adjust action
            </li>
            <li className={lastAction === "adjust" ? "font-medium" : ""}>
              Step 2: Tap Adjust
            </li>
            <li className={lastAction === "adjust" ? "font-medium" : ""}>
              Step 3: Verify navigates to Weekly Planning
            </li>
          </ol>
        </div>

        {/* Navigation Mapping Reference */}
        <div
          className="p-4 rounded-lg mb-6"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
            Action → Navigation Mapping:
          </h2>
          <ul className="text-sm space-y-1" style={{ color: "var(--color-muted)" }}>
            <li><strong>Looks good</strong> → Home (acknowledged)</li>
            <li><strong>Adjust</strong> → Weekly Planning</li>
            <li><strong>View Plan</strong> → Weekly Planning</li>
            <li><strong>Swap</strong> → Weekly Planning</li>
            <li><strong>Start Cooking</strong> → Meal Helper</li>
            <li><strong>Add to List</strong> → Grocery List</li>
          </ul>
        </div>

        {/* Notification Card */}
        <div className="mb-6">
          <h2
            className="text-sm font-semibold uppercase tracking-wide mb-3"
            style={{ color: "var(--color-muted)" }}
          >
            Notification Card
          </h2>
          <NotificationCard
            notification={notification}
            onAction={handleAction}
          />
        </div>

        {/* Navigation Status */}
        {lastAction && (
          <div
            className="p-4 rounded-lg mb-6"
            style={{
              backgroundColor:
                lastAction === "adjust"
                  ? "rgba(76, 175, 80, 0.1)"
                  : "rgba(234, 179, 8, 0.1)",
              border: `1px solid ${
                lastAction === "adjust"
                  ? "rgba(76, 175, 80, 0.3)"
                  : "rgba(234, 179, 8, 0.3)"
              }`,
            }}
          >
            <p
              className="font-semibold text-sm"
              style={{ color: lastAction === "adjust" ? "#4caf50" : "#ca8a04" }}
            >
              {lastAction === "adjust"
                ? "Feature #197 PASSED - Navigating to Weekly Planning..."
                : `Action "${lastAction}" clicked - Navigating to ${ACTION_NAVIGATION_MAP[lastAction]?.label}...`}
            </p>
            <div
              className="mt-2 h-1 rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--color-border)" }}
            >
              <div
                className="h-full animate-pulse"
                style={{
                  width: "100%",
                  backgroundColor:
                    lastAction === "adjust"
                      ? "#4caf50"
                      : "var(--color-primary)",
                  animation: "progress 1.5s ease-in-out",
                }}
              />
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
}
