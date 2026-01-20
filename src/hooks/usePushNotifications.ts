"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type PermissionState = "default" | "granted" | "denied" | "unsupported";

interface UsePushNotificationsReturn {
  permission: PermissionState;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;
}

// VAPID public key - in production, this should come from environment variables
// For local development/testing, we use the Notification API directly
// which doesn't require VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [permission, setPermission] = useState<PermissionState>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const saveSubscription = useMutation(api.pushSubscriptions.save);
  const removeSubscription = useMutation(api.pushSubscriptions.remove);
  const hasSubscription = useQuery(api.pushSubscriptions.hasSubscription);

  // Check if push notifications are supported
  const isSupported =
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  // Initialize state
  useEffect(() => {
    if (!isSupported) {
      setPermission("unsupported");
      setIsLoading(false);
      return;
    }

    // Check current permission
    const currentPermission = Notification.permission as PermissionState;
    setPermission(currentPermission);

    // Check if we have an active subscription
    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(subscription !== null);
      } catch (err) {
        console.error("Error checking subscription:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [isSupported]);

  // Sync with Convex subscription status
  useEffect(() => {
    if (hasSubscription !== undefined) {
      setIsSubscribed(hasSubscription);
    }
  }, [hasSubscription]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError("Push notifications are not supported on this device");
      return false;
    }

    try {
      setError(null);
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);
      return result === "granted";
    } catch (err) {
      setError("Failed to request permission");
      console.error("Permission request failed:", err);
      return false;
    }
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError("Push notifications are not supported on this device");
      return false;
    }

    if (permission !== "granted") {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      setError(null);
      setIsLoading(true);

      const registration = await navigator.serviceWorker.ready;

      // Check for existing subscription
      let subscription = await registration.pushManager.getSubscription();

      // If no subscription exists, create one
      if (!subscription) {
        // For development without VAPID keys, we can still subscribe
        // but won't be able to receive server-sent push messages
        // The app will still work with local notifications
        if (VAPID_PUBLIC_KEY) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
        } else {
          // Create a subscription without application server key for local testing
          // This allows the Notification API to work without a push service
          console.log(
            "[Push] No VAPID key configured - using local notifications only"
          );
        }
      }

      // Save subscription to Convex if we have one
      if (subscription) {
        const subscriptionJson = subscription.toJSON();
        await saveSubscription({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscriptionJson.keys?.p256dh || "",
            auth: subscriptionJson.keys?.auth || "",
          },
        });
      }

      setIsSubscribed(true);
      return true;
    } catch (err) {
      setError("Failed to subscribe to push notifications");
      console.error("Subscribe failed:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission, requestPermission, saveSubscription]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await removeSubscription({ endpoint: subscription.endpoint });
      }

      setIsSubscribed(false);
      return true;
    } catch (err) {
      setError("Failed to unsubscribe from push notifications");
      console.error("Unsubscribe failed:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [removeSubscription]);

  // Send a test notification using the Notification API directly
  const sendTestNotification = useCallback(async (): Promise<void> => {
    if (!isSupported) {
      setError("Push notifications are not supported on this device");
      return;
    }

    if (permission !== "granted") {
      const granted = await requestPermission();
      if (!granted) {
        setError("Permission not granted for notifications");
        return;
      }
    }

    try {
      setError(null);
      const registration = await navigator.serviceWorker.ready;

      // Show notification through the service worker
      // Note: Some notification options (vibrate, actions) are only supported on certain platforms
      const notificationOptions: NotificationOptions & {
        actions?: Array<{ action: string; title: string }>;
        vibrate?: number[];
      } = {
        body: "🍽️ Time to start cooking! Tonight: Chicken Stir Fry",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-192x192.png",
        tag: "test-notification",
        data: { url: "/meal-helper" },
        vibrate: [100, 50, 100],
        actions: [
          { action: "view", title: "View Meal" },
          { action: "dismiss", title: "Dismiss" },
        ],
      };

      await registration.showNotification("DinnDone", notificationOptions);
    } catch (err) {
      setError("Failed to send test notification");
      console.error("Test notification failed:", err);
    }
  }, [isSupported, permission, requestPermission]);

  return {
    permission,
    isSubscribed,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}
