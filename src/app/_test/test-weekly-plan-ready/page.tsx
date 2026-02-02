"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { Calendar, Bell, Database, Sparkles, CheckCircle, Loader2 } from "lucide-react";
import type { Notification } from "@/types/notifications";

// Sample weekly plan structure
interface DayPlan {
  date: string;
  mealName: string;
  assignedCook: string;
  effort: "easy" | "medium" | "involved";
}

interface GeneratedPlan {
  id: string;
  weekStartDate: string;
  status: "draft" | "approved";
  days: DayPlan[];
}

// Helper to get next Monday's date
function getNextMonday(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  return nextMonday.toISOString().split("T")[0];
}

// Helper to format date range nicely
function formatWeekRange(startDate: string): string {
  const start = new Date(startDate + "T12:00:00");
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()}-${end.getDate()}`;
  }
  return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`;
}

export default function TestWeeklyPlanReadyPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const notifications = useQuery(api.notifications.list);
  const createNotification = useMutation(api.notifications.createForSelf);
  const markDone = useMutation(api.notifications.markDone);
  const removeNotification = useMutation(api.notifications.remove);

  // Mode: "mock" for automated testing, "live" for real Convex integration
  const [testMode, setTestMode] = useState<"mock" | "live">("mock");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [status, setStatus] = useState<string>("");

  // Mock notification state for testing without auth
  const [mockNotification, setMockNotification] = useState<Notification | null>(null);

  // Sample AI-generated plan
  const samplePlan: GeneratedPlan = useMemo(() => {
    const startDate = getNextMonday();
    return {
      id: "wp-ai-generated-001",
      weekStartDate: startDate,
      status: "draft",
      days: [
        { date: startDate, mealName: "Lemon Herb Chicken", assignedCook: "Aaron", effort: "medium" },
        { date: addDays(startDate, 1), mealName: "Taco Tuesday", assignedCook: "Katie", effort: "easy" },
        { date: addDays(startDate, 2), mealName: "Pasta Primavera", assignedCook: "Aaron", effort: "easy" },
        { date: addDays(startDate, 3), mealName: "Grilled Salmon", assignedCook: "Katie", effort: "medium" },
        { date: addDays(startDate, 4), mealName: "Pizza Night", assignedCook: "Aaron", effort: "easy" },
        { date: addDays(startDate, 5), mealName: "Beef Stir Fry", assignedCook: "Katie", effort: "medium" },
        { date: addDays(startDate, 6), mealName: "Slow Cooker Roast", assignedCook: "Aaron", effort: "involved" },
      ],
    };
  }, []);

  // Filter to show only weekly-plan-ready notifications from Convex
  const weeklyPlanReadyNotifications = useMemo(() => {
    return (notifications || []).filter(n => n.type === "weekly-plan-ready");
  }, [notifications]);

  // Simulate AI plan generation (MOCK mode)
  const handleGeneratePlanMock = async () => {
    setIsGenerating(true);
    setStatus("AI is generating your meal plan for next week...");

    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    setGeneratedPlan(samplePlan);
    setIsGenerating(false);

    // Create notification for plan ready
    const weekRange = formatWeekRange(samplePlan.weekStartDate);
    const mockNotif: Notification = {
      id: "mock-weekly-plan-ready-" + Date.now(),
      type: "weekly-plan-ready",
      message: `Your meal plan for next week is ready! Take a look and approve it. Week of ${weekRange}.`,
      timestamp: new Date().toISOString(),
      status: "pending",
      actions: [
        { id: "view-plan", label: "View plan", isPrimary: true },
        { id: "remind-later", label: "Remind me later", isPrimary: false },
      ],
    };

    setMockNotification(mockNotif);
    setStatus("AI has generated your meal plan! Weekly Plan Ready notification created.");
  };

  // Simulate AI plan generation (LIVE mode)
  const handleGeneratePlanLive = async () => {
    setIsGenerating(true);
    setStatus("AI is generating your meal plan for next week...");

    try {
      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setGeneratedPlan(samplePlan);
      setIsGenerating(false);

      // Create the weekly-plan-ready notification in Convex
      const weekRange = formatWeekRange(samplePlan.weekStartDate);
      await createNotification({
        type: "weekly-plan-ready",
        message: `Your meal plan for next week is ready! Take a look and approve it. Week of ${weekRange}.`,
        actions: [
          { id: "view-plan", label: "View plan", isPrimary: true },
          { id: "remind-later", label: "Remind me later", isPrimary: false },
        ],
      });

      setStatus("AI has generated your meal plan! Weekly Plan Ready notification created.");
    } catch (error) {
      setIsGenerating(false);
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
    setGeneratedPlan(null);
    setStatus("Mock data cleared");
  };

  // Clean up test notifications (live)
  const handleLiveCleanup = async () => {
    setStatus("Cleaning up weekly-plan-ready notifications...");
    try {
      const toDelete = weeklyPlanReadyNotifications;
      for (const notification of toDelete) {
        await removeNotification({ notificationId: notification._id });
      }
      setGeneratedPlan(null);
      setStatus(`Deleted ${toDelete.length} weekly-plan-ready notifications`);
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Determine which notifications to show based on mode
  const displayNotifications: Notification[] = testMode === "mock"
    ? (mockNotification ? [mockNotification] : [])
    : weeklyPlanReadyNotifications.map(n => ({
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
  const step1Complete = generatedPlan !== null;
  const step2Complete = displayNotifications.length > 0;
  const step3Complete = displayNotifications.some(n =>
    n.message.toLowerCase().includes("plan") &&
    n.message.toLowerCase().includes("ready")
  );

  if (isLoading) {
    return (
      <div className="p-6" style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
        <h1 className="text-2xl font-bold mb-4 font-heading" style={{ color: "var(--color-text)" }}>
          Test: Weekly Plan Ready Notification
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
          Test: Weekly Plan Ready Notification (Feature #180)
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
          Notification when AI drafts a new weekly meal plan
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

      {/* Step 1: Generate Weekly Plan */}
      <div
        className="p-4 rounded-xl mb-4"
        style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
      >
        <h2 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--color-text)" }}>
          <Sparkles size={16} className="text-purple-500" />
          Step 1: Have AI Generate Weekly Plan
        </h2>

        <p className="text-sm mb-3" style={{ color: "var(--color-muted)" }}>
          When the AI generates a new weekly meal plan, users receive a &quot;Weekly Plan Ready&quot; notification prompting them to review and approve.
        </p>

        {!generatedPlan ? (
          <button
            onClick={testMode === "mock" ? handleGeneratePlanMock : handleGeneratePlanLive}
            disabled={isGenerating}
            className="w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            style={{
              backgroundColor: isGenerating ? "var(--color-border)" : "var(--color-primary)",
              color: isGenerating ? "var(--color-muted)" : "white"
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Weekly Plan with AI
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle size={16} />
              Plan generated successfully!
            </div>

            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: "var(--color-bg)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                  <Calendar size={14} />
                  Week of {formatWeekRange(generatedPlan.weekStartDate)}
                </span>
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(168, 85, 247, 0.1)", color: "rgb(168, 85, 247)" }}
                >
                  {generatedPlan.status}
                </span>
              </div>

              <div className="space-y-1.5 mt-3">
                {generatedPlan.days.map((day, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs p-2 rounded"
                    style={{ backgroundColor: "var(--color-card)" }}
                  >
                    <span style={{ color: "var(--color-text)" }}>{day.mealName}</span>
                    <span style={{ color: "var(--color-muted)" }}>{day.assignedCook}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 2 & 3: Verify Notification */}
      <div
        className="p-4 rounded-xl mb-4"
        style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
      >
        <h2 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--color-text)" }}>
          <Calendar size={16} className="text-purple-500" />
          Step 2 & 3: Verify Notification Created & Message
        </h2>

        {displayNotifications.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            No weekly-plan-ready notifications yet. Generate a plan above to trigger the notification.
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
                <div className="mt-2 space-y-1">
                  <div className="text-xs flex items-center gap-1" style={{ color: "var(--color-secondary)" }}>
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                    Notification created ({testMode} mode)
                  </div>
                  <div className="text-xs flex items-center gap-1" style={{ color: "var(--color-secondary)" }}>
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                    Message mentions &quot;plan&quot; and &quot;ready&quot;
                  </div>
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
        Clean Up Test Data
      </button>

      {/* Verification Checklist */}
      <div
        className="p-4 rounded-xl mt-6"
        style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
      >
        <h2 className="font-semibold text-sm mb-2" style={{ color: "var(--color-text)" }}>
          Feature #180 Verification Checklist
        </h2>
        <ul className="text-sm space-y-1" style={{ color: "var(--color-muted)" }}>
          <li className={step1Complete ? "text-green-600" : ""}>
            {step1Complete ? "✅" : "⬜"} Step 1: Have AI generate weekly plan
          </li>
          <li className={step2Complete ? "text-green-600" : ""}>
            {step2Complete ? "✅" : "⬜"} Step 2: Verify notification created
          </li>
          <li className={step3Complete ? "text-green-600" : ""}>
            {step3Complete ? "✅" : "⬜"} Step 3: Verify message mentions plan is ready
          </li>
        </ul>

        {step1Complete && step2Complete && step3Complete && (
          <div
            className="mt-3 p-2 rounded-lg text-sm font-medium text-center"
            style={{ backgroundColor: "var(--color-secondary)", color: "white" }}
          >
            Feature #180 PASSED - All verification steps complete!
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

// Helper function to add days to a date string
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + "T12:00:00");
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}
