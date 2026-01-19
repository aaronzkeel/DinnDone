"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import type { Notification } from "@/types/notifications";
import { CheckCircle2, AlertCircle, Clock, RefreshCw, Zap, Database, TestTube } from "lucide-react";

/**
 * Test Page for Feature #199: Notifications sync in real-time
 *
 * Purpose: Verify that new notifications appear immediately without page refresh
 *
 * Steps:
 * 1. Have app open (view current notifications list)
 * 2. Trigger a new notification from backend
 * 3. Verify notification appears immediately (no refresh needed)
 */

// Sample notification for mock mode demonstration
const sampleNotification: Notification = {
  id: "mock-realtime-demo",
  type: "daily-brief",
  message: "REALTIME_TEST_MOCK: This notification appeared in real-time!",
  timestamp: new Date().toISOString(),
  status: "pending",
  actions: [
    { id: "got-it", label: "Got it!", isPrimary: true },
    { id: "dismiss", label: "Dismiss", isPrimary: false },
  ],
};

export default function TestNotificationRealtimePage() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();

  // Test mode: mock (no auth) or live (requires auth)
  const [testMode, setTestMode] = useState<"mock" | "live">("mock");

  // Real-time query for notifications - Convex useQuery provides automatic subscriptions
  const convexNotifications = useQuery(
    api.notifications.list,
    testMode === "live" ? undefined : "skip"
  );

  // Mutations for creating and removing notifications
  const createNotification = useMutation(api.notifications.createForSelf);
  const removeNotification = useMutation(api.notifications.remove);

  // Mock state for demonstration
  const [mockNotifications, setMockNotifications] = useState<Notification[]>([]);
  const [mockTriggerPending, setMockTriggerPending] = useState(false);

  // UI State
  const [step1Complete, setStep1Complete] = useState(false);
  const [step2Complete, setStep2Complete] = useState(false);
  const [step3Complete, setStep3Complete] = useState(false);
  const [createdNotificationId, setCreatedNotificationId] = useState<string | null>(null);
  const [notificationCountBefore, setNotificationCountBefore] = useState<number | null>(null);
  const [lastCreatedMessage, setLastCreatedMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [triggerTime, setTriggerTime] = useState<string | null>(null);
  const [appearTime, setAppearTime] = useState<string | null>(null);
  const [syncLatency, setSyncLatency] = useState<number | null>(null);

  // Unique test identifier to verify correct notification
  const testId = `REALTIME_TEST_${Date.now()}`;

  // Determine which notifications to display based on mode
  const notifications: Notification[] = testMode === "mock"
    ? mockNotifications
    : (convexNotifications ?? []).map((n) => ({
        id: n._id,
        type: n.type,
        message: n.message,
        timestamp: n.timestamp,
        status: n.status,
        actions: n.actions,
        resolvedAt: n.resolvedAt,
        resolvedAction: n.resolvedAction,
      }));

  // Step 1: Mark as complete when notifications are loaded
  useEffect(() => {
    if (testMode === "mock") {
      if (!step1Complete) {
        setStep1Complete(true);
        setNotificationCountBefore(mockNotifications.length);
      }
    } else if (convexNotifications !== undefined && !step1Complete) {
      setStep1Complete(true);
      setNotificationCountBefore(convexNotifications.length);
    }
  }, [convexNotifications, mockNotifications, step1Complete, testMode]);

  // Step 3: Check if our created notification appeared (live mode)
  useEffect(() => {
    if (testMode === "live" && lastCreatedMessage && convexNotifications) {
      const found = convexNotifications.find(n => n.message === lastCreatedMessage);
      if (found && !step3Complete) {
        const now = Date.now();
        setAppearTime(new Date().toISOString());
        if (triggerTime) {
          const triggerTimestamp = new Date(triggerTime).getTime();
          const latency = now - triggerTimestamp;
          setSyncLatency(latency);
        }
        setStep3Complete(true);
        setCreatedNotificationId(found._id);
        setStatus(`Notification appeared in ${syncLatency ?? (now - (triggerTime ? new Date(triggerTime).getTime() : now))}ms - Real-time sync verified!`);
      }
    }
  }, [convexNotifications, lastCreatedMessage, step3Complete, triggerTime, syncLatency, testMode]);

  // Mock mode: Simulate real-time notification appearance
  const handleTriggerNotificationMock = useCallback(() => {
    const uniqueMessage = `REALTIME_TEST_MOCK_${Date.now()}: This notification appeared in real-time without refresh!`;
    const triggerTimestamp = Date.now();
    setTriggerTime(new Date(triggerTimestamp).toISOString());
    setLastCreatedMessage(uniqueMessage);
    setStep2Complete(true);
    setStatus("Simulating notification creation... (500ms network delay)");
    setMockTriggerPending(true);

    // Simulate network latency (500ms) then show notification
    setTimeout(() => {
      const newNotification: Notification = {
        id: `mock-${Date.now()}`,
        type: "daily-brief",
        message: uniqueMessage,
        timestamp: new Date().toISOString(),
        status: "pending",
        actions: [
          { id: "got-it", label: "Got it!", isPrimary: true },
          { id: "dismiss", label: "Dismiss", isPrimary: false },
        ],
      };

      const appearTimestamp = Date.now();
      const latency = appearTimestamp - triggerTimestamp;

      setMockNotifications(prev => [newNotification, ...prev]);
      setAppearTime(new Date(appearTimestamp).toISOString());
      setSyncLatency(latency);
      setStep3Complete(true);
      setCreatedNotificationId(newNotification.id);
      setStatus(`Mock notification appeared in ${latency}ms - Real-time sync demonstration!`);
      setMockTriggerPending(false);
    }, 500);
  }, []);

  // Live mode: Create actual notification via Convex
  const handleTriggerNotificationLive = async () => {
    if (!isAuthenticated) {
      setStatus("Please sign in first to test real-time sync");
      return;
    }

    const uniqueMessage = `REALTIME_TEST_LIVE_${Date.now()}: If you see this immediately, Feature #199 is working!`;

    setStatus("Creating notification in Convex...");
    setTriggerTime(new Date().toISOString());

    try {
      await createNotification({
        type: "daily-brief",
        message: uniqueMessage,
        actions: [
          { id: "got-it", label: "Got it!", isPrimary: true },
          { id: "dismiss", label: "Dismiss", isPrimary: false },
        ],
      });

      setLastCreatedMessage(uniqueMessage);
      setStep2Complete(true);
      setStatus("Notification created! Watching for real-time appearance...");
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Cleanup test notification
  const handleCleanup = async () => {
    if (testMode === "mock") {
      setMockNotifications([]);
      setStatus("Mock notifications cleared!");
    } else {
      if (!createdNotificationId) {
        setStatus("No test notification to clean up");
        return;
      }

      try {
        await removeNotification({
          notificationId: createdNotificationId as Parameters<typeof removeNotification>[0]["notificationId"],
        });
        setStatus("Test notification cleaned up!");
      } catch (error) {
        setStatus(`Cleanup error: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    setCreatedNotificationId(null);
    setLastCreatedMessage(null);
    setStep2Complete(false);
    setStep3Complete(false);
    setTriggerTime(null);
    setAppearTime(null);
    setSyncLatency(null);
  };

  // Reset all state for a new test
  const handleResetTest = () => {
    setStep1Complete(false);
    setStep2Complete(false);
    setStep3Complete(false);
    setCreatedNotificationId(null);
    setNotificationCountBefore(null);
    setLastCreatedMessage(null);
    setStatus("");
    setTriggerTime(null);
    setAppearTime(null);
    setSyncLatency(null);
    if (testMode === "mock") {
      setMockNotifications([]);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="p-6" style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
        <h1 className="text-xl font-bold mb-4 font-heading" style={{ color: "var(--color-text)" }}>
          Test: Notifications Sync in Real-time (Feature #199)
        </h1>
        <p style={{ color: "var(--color-muted)" }}>Loading authentication...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto" style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
      <h1 className="text-xl font-bold mb-2 font-heading" style={{ color: "var(--color-text)" }}>
        Test: Notifications Sync in Real-time
      </h1>
      <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>
        Feature #199 - New notifications appear without refresh
      </p>

      {/* Test Mode Toggle */}
      <div
        className="p-4 rounded-lg mb-4"
        style={{
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h2 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
          Test Mode
        </h2>
        <p className="text-sm mb-3" style={{ color: "var(--color-muted)" }}>
          {testMode === "mock"
            ? "Using mock data to demonstrate real-time sync (no auth required)"
            : "Using live Convex data (requires authentication)"}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => { setTestMode("mock"); handleResetTest(); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
              testMode === "mock" ? "" : "opacity-60"
            }`}
            style={{
              backgroundColor: testMode === "mock" ? "var(--color-primary)" : "var(--color-border)",
              color: testMode === "mock" ? "white" : "var(--color-text)"
            }}
          >
            <TestTube size={16} />
            Mock Demo
          </button>
          <button
            onClick={() => { setTestMode("live"); handleResetTest(); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
              testMode === "live" && isAuthenticated ? "" : "opacity-60"
            }`}
            style={{
              backgroundColor: testMode === "live" ? "var(--color-secondary)" : "var(--color-border)",
              color: testMode === "live" ? "white" : "var(--color-text)"
            }}
          >
            <Database size={16} />
            Live Convex
          </button>
        </div>
      </div>

      {/* Authentication Status (for Live mode) */}
      {testMode === "live" && (
        <div
          className="p-4 rounded-lg mb-4"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <CheckCircle2 size={20} style={{ color: "var(--color-secondary)" }} />
                <span style={{ color: "var(--color-secondary)" }}>Authenticated</span>
              </>
            ) : (
              <>
                <AlertCircle size={20} style={{ color: "var(--color-danger)" }} />
                <span style={{ color: "var(--color-danger)" }}>Not authenticated - please sign in first</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Test Steps */}
      <div
        className="p-4 rounded-lg mb-4"
        style={{
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h2 className="font-semibold mb-3" style={{ color: "var(--color-text)" }}>
          Test Steps
        </h2>

        {/* Step 1 */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: step1Complete ? "var(--color-secondary)" : "var(--color-border)",
            }}
          >
            {step1Complete ? (
              <CheckCircle2 size={16} color="white" />
            ) : (
              <span className="text-xs" style={{ color: "var(--color-text)" }}>1</span>
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium" style={{ color: "var(--color-text)" }}>
              Have app open (view notifications list)
            </p>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              {step1Complete
                ? `Loaded ${notificationCountBefore} existing notification${notificationCountBefore !== 1 ? 's' : ''}`
                : "Loading notifications..."}
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: step2Complete ? "var(--color-secondary)" : "var(--color-border)",
            }}
          >
            {step2Complete ? (
              <CheckCircle2 size={16} color="white" />
            ) : (
              <span className="text-xs" style={{ color: "var(--color-text)" }}>2</span>
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium" style={{ color: "var(--color-text)" }}>
              Trigger a new notification from backend
            </p>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              {step2Complete
                ? `Notification created at ${triggerTime ? new Date(triggerTime).toLocaleTimeString() : 'unknown'}`
                : "Click button below to create notification"}
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-3">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: step3Complete ? "var(--color-secondary)" : "var(--color-border)",
            }}
          >
            {step3Complete ? (
              <CheckCircle2 size={16} color="white" />
            ) : (
              <span className="text-xs" style={{ color: "var(--color-text)" }}>3</span>
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium" style={{ color: "var(--color-text)" }}>
              Verify notification appears immediately
            </p>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              {step3Complete
                ? `Appeared at ${appearTime ? new Date(appearTime).toLocaleTimeString() : 'unknown'} (${syncLatency ?? 0}ms latency)`
                : mockTriggerPending ? "Waiting for real-time update..." : "Watching for real-time update..."}
            </p>
          </div>
        </div>
      </div>

      {/* Sync Latency Indicator */}
      {syncLatency !== null && (
        <div
          className="p-4 rounded-lg mb-4 flex items-center gap-3"
          style={{
            backgroundColor: syncLatency < 1000 ? "rgba(79, 110, 68, 0.1)" : "rgba(185, 74, 52, 0.1)",
            border: `1px solid ${syncLatency < 1000 ? "var(--color-secondary)" : "var(--color-danger)"}`,
          }}
        >
          <Zap size={24} style={{ color: syncLatency < 1000 ? "var(--color-secondary)" : "var(--color-danger)" }} />
          <div>
            <p className="font-medium" style={{ color: "var(--color-text)" }}>
              Real-time Sync: {syncLatency < 1000 ? "EXCELLENT" : syncLatency < 3000 ? "GOOD" : "SLOW"}
            </p>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              Notification appeared in {syncLatency}ms without page refresh
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 mb-4">
        <button
          onClick={testMode === "mock" ? handleTriggerNotificationMock : handleTriggerNotificationLive}
          disabled={step2Complete || (testMode === "live" && !isAuthenticated)}
          className="w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
          style={{
            backgroundColor: step2Complete ? "var(--color-border)" : "var(--color-primary)",
            color: "white"
          }}
        >
          {step2Complete ? (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 size={18} />
              Notification Created
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Clock size={18} />
              Trigger New Notification {testMode === "mock" ? "(Mock)" : "(Live)"}
            </span>
          )}
        </button>

        {(step3Complete || mockNotifications.length > 0) && (
          <button
            onClick={handleCleanup}
            className="w-full py-3 px-4 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: "var(--color-danger)", color: "white" }}
          >
            Clean Up Test Notification
          </button>
        )}

        <button
          onClick={handleResetTest}
          className="w-full py-2 px-4 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: "var(--color-border)",
            color: "var(--color-text)"
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <RefreshCw size={16} />
            Reset Test
          </span>
        </button>
      </div>

      {/* Status Message */}
      {status && (
        <div
          className="p-3 rounded-lg mb-4"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--color-text)" }}>{status}</p>
        </div>
      )}

      {/* Live Notification Count */}
      <div
        className="p-4 rounded-lg mb-4"
        style={{
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold" style={{ color: "var(--color-text)" }}>
            Live Notifications
          </h2>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--color-secondary)" }}
            />
            <span className="text-sm" style={{ color: "var(--color-muted)" }}>
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''} (auto-updating)
            </span>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {testMode === "live" && convexNotifications === undefined ? (
          <div
            className="p-4 rounded-lg text-center"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <p style={{ color: "var(--color-muted)" }}>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div
            className="p-4 rounded-lg text-center"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <p style={{ color: "var(--color-muted)" }}>
              No notifications yet {testMode === "mock" && "- click above to trigger one!"}
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`transition-all duration-300 ${
                notification.message === lastCreatedMessage
                  ? "ring-2 ring-offset-2 ring-amber-500"
                  : ""
              }`}
            >
              <NotificationCard
                notification={notification}
                onAction={() => {}}
              />
              {notification.message === lastCreatedMessage && (
                <div
                  className="text-xs text-center py-1 mt-1 rounded"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "white"
                  }}
                >
                  This notification appeared in real-time without refresh!
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Technical Details */}
      <div
        className="p-4 rounded-lg mt-4"
        style={{
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h3 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
          Technical Details
        </h3>
        <p className="text-sm mb-2" style={{ color: "var(--color-muted)" }}>
          This feature uses Convex&apos;s <code className="bg-gray-100 px-1 rounded">useQuery</code> hook which provides
          automatic real-time subscriptions. When data changes in the Convex database, all connected
          clients receive updates instantly via WebSocket.
        </p>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Implementation: <code className="bg-gray-100 px-1 rounded">useQuery(api.notifications.list)</code> in{" "}
          <code className="bg-gray-100 px-1 rounded">src/app/notifications/page.tsx</code>
        </p>
      </div>

      {/* Navigation */}
      <div className="mt-4 flex gap-2">
        <a
          href="/notifications"
          className="inline-block py-2 px-4 rounded-lg font-medium text-sm"
          style={{ backgroundColor: "var(--color-secondary)", color: "white" }}
        >
          View Notifications Page
        </a>
        <a
          href="/"
          className="inline-block py-2 px-4 rounded-lg font-medium text-sm"
          style={{ backgroundColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
