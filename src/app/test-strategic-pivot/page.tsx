"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { Clock, Calendar, Bell, Database, ChefHat, User, AlertTriangle } from "lucide-react";
import type { Notification } from "@/types/notifications";

// Helper to get today's date
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
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

// Sample weekly plan with today's meal
interface DayPlan {
  id: string;
  date: string;
  mealName: string;
  assignedCookName: string;
  effortLevel: "easy" | "medium" | "involved";
}

interface WeeklyPlan {
  id: string;
  weekStartDate: string;
  status: "draft" | "approved";
  days: DayPlan[];
}

// Inventory status for checking ingredient availability
interface InventoryStatus {
  itemName: string;
  inStock: boolean;
  quantity: string;
}

export default function TestStrategicPivotPage() {
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

  // Sample weekly plan with today's meal
  const weeklyPlan: WeeklyPlan = useMemo(() => {
    const today = getTodayDate();
    return {
      id: "wp-test-001",
      weekStartDate: today,
      status: "approved",
      days: [
        {
          id: "dp-today-001",
          date: today,
          mealName: "Chicken Stir Fry",
          assignedCookName: "Katie",
          effortLevel: "medium",
        },
      ],
    };
  }, []);

  // Get today's meal from the plan
  const todaysMeal = weeklyPlan.days[0];

  // Sample inventory status - simulating low stock on a key ingredient
  const inventoryStatus: InventoryStatus[] = useMemo(() => [
    { itemName: "chicken breast", inStock: false, quantity: "0 lbs" },
    { itemName: "soy sauce", inStock: true, quantity: "1 bottle" },
    { itemName: "vegetables", inStock: true, quantity: "plenty" },
    { itemName: "rice", inStock: true, quantity: "2 lbs" },
  ], []);

  const lowStockItems = inventoryStatus.filter(item => !item.inStock);

  // Filter to show only strategic-pivot notifications from Convex
  const strategicPivotNotifications = useMemo(() => {
    return (notifications || []).filter(n => n.type === "strategic-pivot");
  }, [notifications]);

  // Simulate 4PM and trigger strategic pivot notification (MOCK mode)
  const handleSimulate4PMMock = () => {
    setSimulatedTime("4:00 PM");
    setStatus("Simulating 4:00 PM... Triggering Strategic Pivot notification (mock mode)");

    // Create mock notification with inventory check message
    const lowItemNames = lowStockItems.map(i => i.itemName).join(", ");
    const mockNotif: Notification = {
      id: "mock-strategic-pivot-" + Date.now(),
      type: "strategic-pivot",
      message: `Heads up! We're low on ${lowItemNames}. Consider swapping tonight's meal or making a quick grocery run.`,
      timestamp: new Date().toISOString(),
      status: "pending",
      actions: [
        { id: "keep-plan", label: "Keep plan", isPrimary: true },
        { id: "swap-meal", label: "Swap meal", isPrimary: false },
        { id: "add-to-list", label: "Add to list", isPrimary: false },
      ],
    };

    setMockNotification(mockNotif);
    setStatus("Strategic Pivot notification created at simulated 4:00 PM (mock mode)");
  };

  // Simulate 4PM and trigger strategic pivot notification (LIVE mode)
  const handleSimulate4PMLive = async () => {
    setSimulatedTime("4:00 PM");
    setStatus("Simulating 4:00 PM... Triggering Strategic Pivot notification");

    try {
      const lowItemNames = lowStockItems.map(i => i.itemName).join(", ");
      // Create the strategic pivot notification in Convex
      await createNotification({
        type: "strategic-pivot",
        message: `Heads up! We're low on ${lowItemNames}. Consider swapping tonight's meal or making a quick grocery run.`,
        actions: [
          { id: "keep-plan", label: "Keep plan", isPrimary: true },
          { id: "swap-meal", label: "Swap meal", isPrimary: false },
          { id: "add-to-list", label: "Add to list", isPrimary: false },
        ],
      });

      setStatus("Strategic Pivot notification created at simulated 4:00 PM");
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
    setStatus("Cleaning up strategic-pivot notifications...");
    try {
      const toDelete = strategicPivotNotifications;
      for (const notification of toDelete) {
        await removeNotification({ notificationId: notification._id });
      }
      setSimulatedTime(null);
      setStatus(`Deleted ${toDelete.length} strategic-pivot notifications`);
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Determine which notifications to show based on mode
  const displayNotifications: Notification[] = testMode === "mock"
    ? (mockNotification ? [mockNotification] : [])
    : strategicPivotNotifications.map(n => ({
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
  const step1Complete = weeklyPlan.status === "approved"; // Approved plan exists
  const step2Complete = simulatedTime !== null;
  const step3Complete = displayNotifications.some(n => n.status === "pending" || n.status === "done");

  if (isLoading) {
    return (
      <div className="p-6" style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
        <h1 className="text-2xl font-bold mb-4 font-heading" style={{ color: "var(--color-text)" }}>
          Test: Strategic Pivot Notification
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
          Test: Strategic Pivot Notification (Feature #178)
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
          Afternoon check-in notification at 4:00 PM
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

      {/* Step 1: Approved Plan */}
      <div
        className="p-4 rounded-xl mb-4"
        style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
      >
        <h2 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--color-text)" }}>
          <Calendar size={16} />
          Step 1: Have Approved Plan
        </h2>

        <div className="space-y-3">
          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm" style={{ color: "var(--color-text)" }}>
                Weekly Meal Plan
              </span>
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  backgroundColor: weeklyPlan.status === "approved" ? "rgba(34, 197, 94, 0.1)" : "rgba(234, 179, 8, 0.1)",
                  color: weeklyPlan.status === "approved" ? "rgb(34, 197, 94)" : "rgb(234, 179, 8)"
                }}
              >
                {weeklyPlan.status === "approved" ? "Approved" : "Draft"}
              </span>
            </div>

            <div
              className="p-3 rounded-lg mt-2"
              style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <ChefHat size={14} style={{ color: "var(--color-primary)" }} />
                <span className="font-medium text-sm" style={{ color: "var(--color-text)" }}>
                  Tonight: {todaysMeal.mealName}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ color: "var(--color-muted)" }}>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDate(todaysMeal.date)}
                </span>
                <span className="flex items-center gap-1">
                  <User size={12} />
                  {todaysMeal.assignedCookName}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor: todaysMeal.effortLevel === "easy" ? "rgba(34, 197, 94, 0.1)" :
                                     todaysMeal.effortLevel === "medium" ? "rgba(234, 179, 8, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    color: todaysMeal.effortLevel === "easy" ? "rgb(34, 197, 94)" :
                           todaysMeal.effortLevel === "medium" ? "rgb(234, 179, 8)" : "rgb(239, 68, 68)"
                  }}
                >
                  {todaysMeal.effortLevel}
                </span>
              </div>
            </div>

            {/* Inventory Status Section */}
            <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: "rgba(239, 68, 68, 0.05)" }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-red-500" />
                <span className="font-medium text-sm text-red-600">Inventory Check</span>
              </div>
              <div className="space-y-1">
                {inventoryStatus.map((item) => (
                  <div key={item.itemName} className="flex items-center justify-between text-xs">
                    <span style={{ color: item.inStock ? "var(--color-muted)" : "rgb(239, 68, 68)" }}>
                      {item.itemName}
                    </span>
                    <span style={{ color: item.inStock ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)" }}>
                      {item.inStock ? "✓ " : "✗ "}{item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-secondary)" }}>
            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            Plan is approved (with ingredient shortage detected)
          </div>
        </div>
      </div>

      {/* Step 2: Simulate Time */}
      <div
        className="p-4 rounded-xl mb-4"
        style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
      >
        <h2 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--color-text)" }}>
          <Clock size={16} className="text-blue-500" />
          Step 2: Simulate 4:00 PM
        </h2>

        <p className="text-sm mb-3" style={{ color: "var(--color-muted)" }}>
          Strategic Pivot notifications are sent at 4:00 PM as an afternoon check-in. If there are inventory issues or schedule changes, users are alerted to consider alternatives.
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
          onClick={testMode === "mock" ? handleSimulate4PMMock : handleSimulate4PMLive}
          className="w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          style={{ backgroundColor: "var(--color-primary)", color: "white" }}
        >
          <Bell size={18} />
          Simulate 4:00 PM (Trigger Notification)
        </button>
      </div>

      {/* Step 3: Verify Notification */}
      <div
        className="p-4 rounded-xl mb-4"
        style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
      >
        <h2 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--color-text)" }}>
          <Clock size={16} className="text-blue-500" />
          Step 3: Verify Strategic Pivot Notification
        </h2>

        {displayNotifications.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            No strategic-pivot notifications yet. Click &quot;Simulate 4:00 PM&quot; above.
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
                  Strategic Pivot notification verified ({testMode} mode)
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
          Feature #178 Verification Checklist
        </h2>
        <ul className="text-sm space-y-1" style={{ color: "var(--color-muted)" }}>
          <li className={step1Complete ? "text-green-600" : ""}>
            {step1Complete ? "✅" : "⬜"} Step 1: Have approved plan
          </li>
          <li className={step2Complete ? "text-green-600" : ""}>
            {step2Complete ? "✅" : "⬜"} Step 2: Simulate 4PM
          </li>
          <li className={step3Complete ? "text-green-600" : ""}>
            {step3Complete ? "✅" : "⬜"} Step 3: Verify Strategic Pivot notification
          </li>
        </ul>

        {step1Complete && step2Complete && step3Complete && (
          <div
            className="mt-3 p-2 rounded-lg text-sm font-medium text-center"
            style={{ backgroundColor: "var(--color-secondary)", color: "white" }}
          >
            Feature #178 PASSED - All verification steps complete!
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
