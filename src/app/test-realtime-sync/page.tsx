"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export default function TestRealtimeSyncPage() {
  const [newMealName, setNewMealName] = useState("");
  const [selectedWeekPlanId, setSelectedWeekPlanId] = useState<Id<"weekPlans"> | null>(null);

  // Real-time query for week plans
  const weekPlans = useQuery(api.weekPlans.list);

  // Real-time query for meals (if a week plan is selected)
  const meals = useQuery(
    api.weekPlans.getMeals,
    selectedWeekPlanId ? { weekPlanId: selectedWeekPlanId } : "skip"
  );

  // Mutations
  const createWeekPlan = useMutation(api.weekPlans.create);
  const updateStatus = useMutation(api.weekPlans.updateStatus);

  const handleCreateWeekPlan = async () => {
    const today = new Date();
    const monday = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    monday.setDate(today.getDate() - daysToMonday);
    const weekStart = monday.toISOString().split("T")[0];

    try {
      const id = await createWeekPlan({
        weekStart,
        status: "draft",
      });
      console.log("Created week plan:", id);
      setSelectedWeekPlanId(id);
    } catch (error) {
      console.error("Error creating week plan:", error);
    }
  };

  const handleUpdateStatus = async (id: Id<"weekPlans">, newStatus: "draft" | "approved" | "in-progress" | "completed") => {
    try {
      await updateStatus({ id, status: newStatus });
      console.log("Updated status to:", newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh", padding: "16px" }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
          Test: Real-time Sync (Feature #147)
        </h1>
        <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>
          Open this page in two browser tabs/windows to verify real-time sync.
          Changes made in one tab should appear immediately in the other.
        </p>

        {/* Instructions */}
        <div
          className="p-4 rounded-lg mb-4"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
            How to Test Real-time Sync:
          </h2>
          <ol className="text-sm space-y-1" style={{ color: "var(--color-muted)" }}>
            <li>1. Open this page in a second browser tab</li>
            <li>2. In Tab 1: Create a new week plan or change status</li>
            <li>3. In Tab 2: Verify the change appears instantly (no refresh)</li>
            <li>4. Try changing status back and forth between tabs</li>
          </ol>
        </div>

        {/* Create Week Plan */}
        <div
          className="p-4 rounded-lg mb-4"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
            Create Week Plan
          </h2>
          <button
            onClick={handleCreateWeekPlan}
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            Create This Week&apos;s Plan
          </button>
        </div>

        {/* Week Plans List (Real-time) */}
        <div
          className="p-4 rounded-lg mb-4"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
            Week Plans (Live Data from Convex)
          </h2>

          {weekPlans === undefined ? (
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>Loading...</p>
          ) : weekPlans.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              No week plans yet. Create one above.
            </p>
          ) : (
            <div className="space-y-2">
              {weekPlans.map((plan) => (
                <div
                  key={plan._id}
                  className={`p-3 rounded-lg border ${
                    selectedWeekPlanId === plan._id ? "border-2" : ""
                  }`}
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: selectedWeekPlanId === plan._id
                      ? "var(--color-primary)"
                      : "var(--color-border)",
                  }}
                  onClick={() => setSelectedWeekPlanId(plan._id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium" style={{ color: "var(--color-text)" }}>
                        Week of {plan.weekStart}
                      </p>
                      <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                        ID: {plan._id}
                      </p>
                    </div>
                    <span
                      className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${plan.status === "draft"
                          ? "bg-gray-200 text-gray-600"
                          : "bg-green-100 text-green-700"}
                      `}
                    >
                      {plan.status}
                    </span>
                  </div>

                  {/* Status change buttons */}
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {(["draft", "approved", "in-progress", "completed"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(plan._id, status);
                        }}
                        disabled={plan.status === status}
                        className={`
                          px-2 py-1 text-xs rounded
                          ${plan.status === status
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"}
                        `}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-time indicator */}
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
            Real-time Connection Status
          </h2>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--color-secondary)" }}
            />
            <span className="text-sm" style={{ color: "var(--color-muted)" }}>
              Connected to Convex - updates sync automatically
            </span>
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--color-muted)" }}>
            Last update: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}
