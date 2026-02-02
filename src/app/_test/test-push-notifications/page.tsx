"use client";

import { useState } from "react";
import { Bell, BellOff, Check, X, Send, AlertCircle } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function TestPushNotificationsPage() {
  const {
    permission,
    isSubscribed,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications();

  const [testStatus, setTestStatus] = useState<string>("");

  const handleRequestPermission = async () => {
    setTestStatus("Requesting permission...");
    const granted = await requestPermission();
    setTestStatus(
      granted
        ? "✅ Permission granted!"
        : "❌ Permission denied or dismissed"
    );
  };

  const handleSubscribe = async () => {
    setTestStatus("Subscribing to push notifications...");
    const success = await subscribe();
    setTestStatus(
      success
        ? "✅ Successfully subscribed!"
        : "❌ Failed to subscribe"
    );
  };

  const handleUnsubscribe = async () => {
    setTestStatus("Unsubscribing...");
    const success = await unsubscribe();
    setTestStatus(
      success
        ? "✅ Successfully unsubscribed!"
        : "❌ Failed to unsubscribe"
    );
  };

  const handleSendTest = async () => {
    setTestStatus("Sending test notification...");
    await sendTestNotification();
    setTestStatus("✅ Test notification sent! Check your notifications.");
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case "granted":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <Check size={14} />
            Granted
          </span>
        );
      case "denied":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <X size={14} />
            Denied
          </span>
        );
      case "unsupported":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <AlertCircle size={14} />
            Unsupported
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle size={14} />
            Not requested
          </span>
        );
    }
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: "var(--color-bg, #FAF3E6)" }}
    >
      <div className="max-w-md mx-auto">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--color-text, #2C2416)" }}
        >
          Push Notifications Test
        </h1>
        <p
          className="text-sm mb-6"
          style={{ color: "var(--color-muted, #6B5C4D)" }}
        >
          Feature #191: PWA push notifications work
        </p>

        {/* Status Cards */}
        <div className="space-y-4 mb-6">
          {/* Permission Status */}
          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: "var(--color-card, #FFFFFF)",
              border: "1px solid var(--color-border, #E5D9C8)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {permission === "granted" ? (
                  <Bell
                    size={24}
                    style={{ color: "var(--color-primary, #4F6E44)" }}
                  />
                ) : (
                  <BellOff
                    size={24}
                    style={{ color: "var(--color-muted, #6B5C4D)" }}
                  />
                )}
                <div>
                  <h3
                    className="font-semibold"
                    style={{ color: "var(--color-text, #2C2416)" }}
                  >
                    Notification Permission
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-muted, #6B5C4D)" }}
                  >
                    {isLoading ? "Checking..." : "Current browser permission"}
                  </p>
                </div>
              </div>
              {!isLoading && getPermissionBadge()}
            </div>
          </div>

          {/* Subscription Status */}
          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: "var(--color-card, #FFFFFF)",
              border: "1px solid var(--color-border, #E5D9C8)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className="font-semibold"
                  style={{ color: "var(--color-text, #2C2416)" }}
                >
                  Push Subscription
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-muted, #6B5C4D)" }}
                >
                  {isLoading ? "Loading..." : "Registration with push service"}
                </p>
              </div>
              {!isLoading && (
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    isSubscribed
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {isSubscribed ? (
                    <>
                      <Check size={14} />
                      Active
                    </>
                  ) : (
                    <>
                      <X size={14} />
                      Inactive
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Test Status */}
        {testStatus && (
          <div
            className="mb-4 p-3 rounded-lg"
            style={{
              backgroundColor: "var(--color-card, #FFFFFF)",
              border: "1px solid var(--color-border, #E5D9C8)",
            }}
          >
            <p
              className="text-sm font-medium"
              style={{ color: "var(--color-text, #2C2416)" }}
            >
              {testStatus}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Step 1: Request Permission */}
          <button
            onClick={handleRequestPermission}
            disabled={isLoading || permission === "unsupported"}
            className="w-full px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor:
                permission === "granted"
                  ? "var(--color-border, #E5D9C8)"
                  : "var(--color-primary, #4F6E44)",
              color:
                permission === "granted"
                  ? "var(--color-muted, #6B5C4D)"
                  : "white",
            }}
          >
            Step 1: Enable Push Permissions
            {permission === "granted" && " ✓"}
          </button>

          {/* Step 2: Subscribe */}
          <button
            onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
            disabled={isLoading || permission !== "granted"}
            className="w-full px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: isSubscribed
                ? "var(--color-border, #E5D9C8)"
                : "var(--color-accent, #D4A853)",
              color: isSubscribed
                ? "var(--color-muted, #6B5C4D)"
                : "var(--color-text, #2C2416)",
            }}
          >
            {isSubscribed ? "Unsubscribe" : "Step 2: Subscribe to Push"}
          </button>

          {/* Step 3: Send Test */}
          <button
            onClick={handleSendTest}
            disabled={isLoading || permission !== "granted"}
            className="w-full px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            style={{
              backgroundColor: "var(--color-primary, #4F6E44)",
              color: "white",
            }}
          >
            <Send size={18} />
            Step 3: Trigger Test Notification
          </button>
        </div>

        {/* Instructions */}
        <div
          className="mt-8 p-4 rounded-xl"
          style={{
            backgroundColor: "var(--color-card, #FFFFFF)",
            border: "1px solid var(--color-border, #E5D9C8)",
          }}
        >
          <h3
            className="font-semibold mb-3"
            style={{ color: "var(--color-text, #2C2416)" }}
          >
            Testing Instructions
          </h3>
          <ol
            className="list-decimal list-inside space-y-2 text-sm"
            style={{ color: "var(--color-muted, #6B5C4D)" }}
          >
            <li>Click &quot;Enable Push Permissions&quot; and allow in browser dialog</li>
            <li>Click &quot;Subscribe to Push&quot; (optional - for server-sent push)</li>
            <li>Click &quot;Trigger Test Notification&quot;</li>
            <li>Verify notification appears in your system notifications</li>
          </ol>
          <p
            className="mt-4 text-xs"
            style={{ color: "var(--color-muted, #6B5C4D)" }}
          >
            Note: On macOS, you may need to allow notifications for Chrome/Safari
            in System Settings &gt; Notifications.
          </p>
        </div>
      </div>
    </div>
  );
}
