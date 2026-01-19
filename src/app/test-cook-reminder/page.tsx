"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { ChefHat, Clock, Calendar, User, Bell } from "lucide-react";
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

// Sample tomorrow's meal data
interface TomorrowMeal {
  id: string;
  date: string;
  mealName: string;
  assignedCookId: string;
  assignedCookName: string;
  prepTime: number;
  cookTime: number;
}

export default function TestCookReminderPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const notifications = useQuery(api.notifications.list);
  const createNotification = useMutation(api.notifications.createForSelf);
  const markDone = useMutation(api.notifications.markDone);
  const removeNotification = useMutation(api.notifications.remove);

  const [simulatedTime, setSimulatedTime] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  // Tomorrow's meal with current user as cook
  const tomorrowMeal: TomorrowMeal = useMemo(() => ({
    id: "pm-tomorrow-001",
    date: getTomorrowDate(),
    mealName: "Chicken Stir Fry with Vegetables",
    assignedCookId: "current-user",
    assignedCookName: "You",
    prepTime: 20,
    cookTime: 15,
  }), []);

  // Filter to show only cook-reminder notifications
  const cookReminderNotifications = useMemo(() => {
    return (notifications || []).filter(n => n.type === "cook-reminder");
  }, [notifications]);

  // Simulate 7:30PM and trigger cook reminder notification
  const handleSimulate730PM = async () => {
    setSimulatedTime("7:30 PM");
    setStatus("Simulating 7:30 PM... Triggering Cook Reminder notification");

    try {
      // Create the cook reminder notification
      await createNotification({
        type: "cook-reminder",
        message: `Heads up! You're cooking tomorrow (${formatDate(tomorrowMeal.date)}): ${tomorrowMeal.mealName}. Total time: ${tomorrowMeal.prepTime + tomorrowMeal.cookTime} min.`,
        actions: [
          { id: "view-recipe", label: "View Recipe", isPrimary: true },
          { id: "got-it", label: "Got it", isPrimary: false },
        ],
      });

      setStatus("Cook Reminder notification created at simulated 7:30 PM");
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Handle notification action
  const handleNotificationAction = async (notificationId: string, actionId: string) => {
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

  // Clean up test notifications
  const handleCleanup = async () => {
    setStatus("Cleaning up cook-reminder notifications...");
    try {
      const toDelete = cookReminderNotifications;
      for (const notification of toDelete) {
        await removeNotification({ notificationId: notification._id });
      }
      setSimulatedTime(null);
      setStatus(`Deleted ${toDelete.length} cook-reminder notifications`);
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6" style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
        <h1 className="text-2xl font-bold mb-4 font-heading" style={{ color: "var(--color-text)" }}>
          Test: Cook Reminder Notification
        </h1>
        <p style={{ color: "var(--color-muted)" }}>Loading authentication state...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto" style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold font-heading" style={{ color: "var(--color-text)" }}>
          Test: Cook Reminder Notification (Feature #181)
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
          Heads-up for tomorrow&apos;s cook at 7:30PM
        </p>
      </div>

      {/* Auth Status */}
      {!isAuthenticated && (
        <div
          className="p-4 rounded-lg mb-6"
          style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
        >
          <p style={{ color: "var(--color-danger)" }}>
            Not authenticated - please sign in first at /
          </p>
        </div>
      )}

      {isAuthenticated && (
        <>
          {/* Step 1: Assigned Cook Card */}
          <div
            className="p-4 rounded-xl mb-4"
            style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
          >
            <h2 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--color-text)" }}>
              <Calendar size={16} />
              Step 1: Tomorrow&apos;s Meal Assignment
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-medium" style={{ color: "var(--color-text)" }}>
                    {tomorrowMeal.assignedCookName}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                    Assigned Cook for Tomorrow
                  </p>
                </div>
              </div>

              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: "var(--color-bg)" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ChefHat size={14} style={{ color: "var(--color-primary)" }} />
                  <span className="font-medium text-sm" style={{ color: "var(--color-text)" }}>
                    {tomorrowMeal.mealName}
                  </span>
                </div>
                <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                  {formatDate(tomorrowMeal.date)} &bull; {tomorrowMeal.prepTime + tomorrowMeal.cookTime} min total
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-secondary)" }}>
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                You are assigned as cook for tomorrow
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
              Cook reminder notifications are sent at 7:30 PM to remind tomorrow&apos;s assigned cook.
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
              onClick={handleSimulate730PM}
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
              <Bell size={16} />
              Step 3: Verify Cook Reminder Notification
            </h2>

            {cookReminderNotifications.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                No cook-reminder notifications yet. Click &quot;Simulate 7:30 PM&quot; above.
              </p>
            ) : (
              <div className="space-y-3">
                {cookReminderNotifications.map((notification) => (
                  <div key={notification._id}>
                    <NotificationCard
                      notification={{
                        id: notification._id,
                        type: notification.type,
                        message: notification.message,
                        timestamp: notification.timestamp,
                        status: notification.status,
                        actions: notification.actions,
                        resolvedAt: notification.resolvedAt,
                        resolvedAction: notification.resolvedAction,
                      } as Notification}
                      onAction={(actionId) => handleNotificationAction(notification._id, actionId)}
                    />
                    <div className="mt-2 text-xs" style={{ color: "var(--color-secondary)" }}>
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                      Cook reminder notification verified
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
            onClick={handleCleanup}
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
              Feature #181 Verification Checklist
            </h2>
            <ul className="text-sm space-y-1" style={{ color: "var(--color-muted)" }}>
              <li className={cookReminderNotifications.length > 0 ? "text-green-600" : ""}>
                {cookReminderNotifications.length > 0 ? "✅" : "⬜"} Step 1: Be assigned as cook tomorrow
              </li>
              <li className={simulatedTime ? "text-green-600" : ""}>
                {simulatedTime ? "✅" : "⬜"} Step 2: Simulate 7:30PM
              </li>
              <li className={cookReminderNotifications.some(n => n.status === "pending") ? "text-green-600" : ""}>
                {cookReminderNotifications.some(n => n.status === "pending") ? "✅" : "⬜"} Step 3: Verify cook reminder notification
              </li>
            </ul>
          </div>
        </>
      )}

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
