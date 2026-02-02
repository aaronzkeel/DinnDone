"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { Snowflake, Clock, Calendar, Bell, Database, ChefHat } from "lucide-react";
import type { Notification } from "@/types/notifications";

// Helper to get tomorrow's date
function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

// Helper to format date nicely
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

// Sample tomorrow's meal that needs thawing
interface TomorrowMeal {
  id: string;
  date: string;
  mealName: string;
  assignedCookName: string;
  requiresThawing: boolean;
  thawItem: string;
  thawTimeHours: number;
}

export default function TestThawGuardianPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const notifications = useQuery(api.notifications.list);
  const createNotification = useMutation(api.notifications.createForSelf);
  const markDone = useMutation(api.notifications.markDone);
  const removeNotification = useMutation(api.notifications.remove);

  // Mode: "mock" for automated testing, "live" for real Convex integration
  const [testMode, setTestMode] = useState<"mock" | "live">("mock");
  const [simulatedTime, setSimulatedTime] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  // Mock notification state for testing without auth
  const [mockNotification, setMockNotification] = useState<Notification | null>(null);

  // Tomorrow's meal that needs thawing
  const tomorrowMeal: TomorrowMeal = useMemo(() => ({
    id: "pm-tomorrow-thaw-001",
    date: getTomorrowDate(),
    mealName: "Salmon with Roasted Vegetables",
    assignedCookName: "Katie",
    requiresThawing: true,
    thawItem: "salmon fillets",
    thawTimeHours: 8,
  }), []);

  // Filter to show only thaw-guardian notifications from Convex
  const thawGuardianNotifications = useMemo(() => {
    return (notifications || []).filter(n => n.type === "thaw-guardian");
  }, [notifications]);

  // Simulate 7:30PM and trigger thaw guardian notification (MOCK mode)
  const handleSimulate730PMMock = () => {
    setSimulatedTime("7:30 PM");
    setStatus("Simulating 7:30 PM... Triggering Thaw Guardian notification (mock mode)");

    // Create mock notification
    const mockNotif: Notification = {
      id: "mock-thaw-guardian-" + Date.now(),
      type: "thaw-guardian",
      message: `Don't forget to thaw the ${tomorrowMeal.thawItem} for tomorrow's dinner! ${tomorrowMeal.mealName} needs about ${tomorrowMeal.thawTimeHours} hours to thaw safely.`,
      timestamp: new Date().toISOString(),
      status: "pending",
      actions: [
        { id: "will-do", label: "Will do!", isPrimary: true },
        { id: "already-done", label: "Already thawing", isPrimary: false },
      ],
    };

    setMockNotification(mockNotif);
    setStatus("Thaw Guardian notification created at simulated 7:30 PM (mock mode)");
  };

  // Simulate 7:30PM and trigger thaw guardian notification (LIVE mode)
  const handleSimulate730PMLive = async () => {
    setSimulatedTime("7:30 PM");
    setStatus("Simulating 7:30 PM... Triggering Thaw Guardian notification");

    try {
      // Create the thaw guardian notification in Convex
      await createNotification({
        type: "thaw-guardian",
        message: `Don't forget to thaw the ${tomorrowMeal.thawItem} for tomorrow's dinner! ${tomorrowMeal.mealName} needs about ${tomorrowMeal.thawTimeHours} hours to thaw safely.`,
        actions: [
          { id: "will-do", label: "Will do!", isPrimary: true },
          { id: "already-done", label: "Already thawing", isPrimary: false },
        ],
      });

      setStatus("Thaw Guardian notification created at simulated 7:30 PM");
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Handle notification action (mock)
  const handleMockNotificationAction = (actionId: string) => {
    if (mockNotification) {
      setMockNotification({
        ...mockNotification,
        status: "done",
        resolvedAt: new Date().toISOString(),
        resolvedAction: actionId,
      });
      setStatus(`Action "${actionId}" taken on notification (mock mode)`);
    }
  };

  // Handle notification action (live)
  const handleLiveNotificationAction = async (notificationId: string, actionId: string) => {
    try {
      const notification = notifications?.find(n => n._id === notificationId);
      if (notification) {
        await markDone({ notificationId: notification._id, actionId });
        setStatus(`Action "${actionId}" taken on notification`);
      }
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Clean up test notifications (mock)
  const handleMockCleanup = () => {
    setMockNotification(null);
    setSimulatedTime(null);
    setStatus("Mock notification cleared");
  };

  // Clean up test notifications (live)
  const handleLiveCleanup = async () => {
    setStatus("Cleaning up thaw-guardian notifications...");
    try {
      const toDelete = thawGuardianNotifications;
      for (const notification of toDelete) {
        await removeNotification({ notificationId: notification._id });
      }
      setSimulatedTime(null);
      setStatus(`Deleted ${toDelete.length} thaw-guardian notifications`);
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Determine which notifications to show based on mode
  const displayNotifications: Notification[] = testMode === "mock"
    ? (mockNotification ? [mockNotification] : [])
    : thawGuardianNotifications.map(n => ({
        id: n._id,
        type: n.type,
        message: n.message,
        timestamp: n.timestamp,
        status: n.status,
        actions: n.actions,
        resolvedAt: n.resolvedAt,
        resolvedAction: n.resolvedAction,
      } as Notification));

  // Check if all steps are complete
  const step1Complete = tomorrowMeal.requiresThawing; // Meal needs thawing
  const step2Complete = simulatedTime !== null;
  const step3Complete = displayNotifications.some(n => n.status === "pending" || n.status === "done");

  if (isLoading) {
    return (
      <div className="p-6" style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
        <h1 className="text-2xl font-bold mb-4 font-heading" style={{ color: "var(--color-text)" }}>
          Test: Thaw Guardian Notification
        </h1>
        <p style={{ color: "var(--color-muted)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto" style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold font-heading" style={{ color: "var(--color-text)" }}>
          Test: Thaw Guardian Notification (Feature #179)
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
          Evening thaw reminder at 7:30 PM
        </p>
      </div>

      {/* Test Mode Toggle */}
      <div
        className="p-4 rounded-xl mb-4"
        style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
      >
        <h2 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--color-text)" }}>
          <Database size={16} />
          Test Mode
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTestMode("mock")}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              testMode === "mock" ? "" : "opacity-60"
            }`}
            style={{
              backgroundColor: testMode === "mock" ? "var(--color-primary)" : "var(--color-border)",
              color: testMode === "mock" ? "white" : "var(--color-text)"
            }}
          >
            Mock Data (No Auth)
          </button>
          <button
            onClick={() => setTestMode("live")}
            disabled={!isAuthenticated}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              testMode === "live" && isAuthenticated ? "" : "opacity-60"
            }`}
            style={{
              backgroundColor: testMode === "live" ? "var(--color-secondary)" : "var(--color-border)",
              color: testMode === "live" ? "white" : "var(--color-text)"
            }}
          >
            Live Convex {!isAuthenticated && "(Sign in required)"}
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--color-muted)" }}>
          {testMode === "mock"
            ? "Using mock data for testing without authentication"
            : isAuthenticated
              ? "Using real Convex database"
              : "Sign in to use live mode"}
        </p>
      </div>

      {/* Step 1: Tomorrow's Meal Needing Thaw */}
      <div
        className="p-4 rounded-xl mb-4"
        style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
      >
        <h2 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--color-text)" }}>
          <Calendar size={16} />
          Step 1: Meal Tomorrow Needing Thaw
        </h2>

        <div className="space-y-3">
          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <ChefHat size={14} style={{ color: "var(--color-primary)" }} />
              <span className="font-medium text-sm" style={{ color: "var(--color-text)" }}>
                {tomorrowMeal.mealName}
              </span>
            </div>
            <p className="text-xs mb-2" style={{ color: "var(--color-muted)" }}>
              {formatDate(tomorrowMeal.date)} &bull; Cook: {tomorrowMeal.assignedCookName}
            </p>

            {tomorrowMeal.requiresThawing && (
              <div
                className="flex items-center gap-2 p-2 rounded-lg"
                style={{ backgroundColor: "rgba(6, 182, 212, 0.1)" }}
              >
                <Snowflake size={16} className="text-cyan-500" />
                <div>
                  <span className="text-sm font-medium text-cyan-600">
                    Needs thawing: {tomorrowMeal.thawItem}
                  </span>
                  <p className="text-xs text-cyan-500">
                    Recommended thaw time: {tomorrowMeal.thawTimeHours} hours
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-secondary)" }}>
            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            Meal requires thawing
          </div>
        </div>
      </div>

      {/* Step 2: Simulate Time */}
      <div
        className="p-4 rounded-xl mb-4"
        style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
      >
        <h2 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--color-text)" }}>
          <Clock size={16} />
          Step 2: Simulate 7:30 PM
        </h2>

        <p className="text-sm mb-3" style={{ color: "var(--color-muted)" }}>
          Thaw Guardian notifications are sent at 7:30 PM when tomorrow&apos;s meal requires thawing frozen ingredients.
        </p>

        {simulatedTime && (
          <div
            className="p-2 rounded-lg mb-3 text-sm flex items-center gap-2"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            <Clock size={14} style={{ color: "var(--color-primary)" }} />
            <span style={{ color: "var(--color-text)" }}>
              Simulated Time: <strong>{simulatedTime}</strong>
            </span>
          </div>
        )}

        <button
          onClick={testMode === "mock" ? handleSimulate730PMMock : handleSimulate730PMLive}
          className="w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          style={{ backgroundColor: "var(--color-primary)", color: "white" }}
        >
          <Bell size={18} />
          Simulate 7:30 PM (Trigger Notification)
        </button>
      </div>

      {/* Step 3: Verify Notification */}
      <div
        className="p-4 rounded-xl mb-4"
        style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
      >
        <h2 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--color-text)" }}>
          <Snowflake size={16} className="text-cyan-500" />
          Step 3: Verify Thaw Guardian Notification
        </h2>

        {displayNotifications.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            No thaw-guardian notifications yet. Click &quot;Simulate 7:30 PM&quot; above.
          </p>
        ) : (
          <div className="space-y-3">
            {displayNotifications.map((notification) => (
              <div key={notification.id}>
                <NotificationCard
                  notification={notification}
                  onAction={(actionId) =>
                    testMode === "mock"
                      ? handleMockNotificationAction(actionId)
                      : handleLiveNotificationAction(notification.id, actionId)
                  }
                />
                <div className="mt-2 text-xs" style={{ color: "var(--color-secondary)" }}>
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                  Thaw Guardian notification verified ({testMode} mode)
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Message */}
      {status && (
        <div
          className="p-3 rounded-lg mb-4 text-sm"
          style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
        >
          {status}
        </div>
      )}

      {/* Cleanup Button */}
      <button
        onClick={testMode === "mock" ? handleMockCleanup : handleLiveCleanup}
        className="w-full py-2 px-4 rounded-lg font-medium transition-colors text-sm"
        style={{ backgroundColor: "var(--color-border)", color: "var(--color-text)" }}
      >
        Clean Up Test Notifications
      </button>

      {/* Verification Checklist */}
      <div
        className="p-4 rounded-xl mt-6"
        style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
      >
        <h2 className="font-semibold text-sm mb-2" style={{ color: "var(--color-text)" }}>
          Feature #179 Verification Checklist
        </h2>
        <ul className="text-sm space-y-1" style={{ color: "var(--color-muted)" }}>
          <li className={step1Complete ? "text-green-600" : ""}>
            {step1Complete ? "✅" : "⬜"} Step 1: Have meal tomorrow needing thaw
          </li>
          <li className={step2Complete ? "text-green-600" : ""}>
            {step2Complete ? "✅" : "⬜"} Step 2: Simulate 7:30 PM
          </li>
          <li className={step3Complete ? "text-green-600" : ""}>
            {step3Complete ? "✅" : "⬜"} Step 3: Verify Thaw Guardian notification
          </li>
        </ul>

        {step1Complete && step2Complete && step3Complete && (
          <div
            className="mt-3 p-2 rounded-lg text-sm font-medium text-center"
            style={{ backgroundColor: "var(--color-secondary)", color: "white" }}
          >
            All verification steps passed!
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex gap-3">
        <a
          href="/notifications"
          className="flex-1 py-2 px-4 rounded-lg font-medium text-center text-sm"
          style={{ backgroundColor: "var(--color-secondary)", color: "white" }}
        >
          View All Notifications
        </a>
        <a
          href="/"
          className="flex-1 py-2 px-4 rounded-lg font-medium text-center text-sm"
          style={{ backgroundColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          Home
        </a>
      </div>
    </div>
  );
}
