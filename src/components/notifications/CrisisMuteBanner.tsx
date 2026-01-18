"use client";

import { VolumeX, X } from "lucide-react";
import type { CrisisMuteBannerProps } from "@/types/notifications";

export function CrisisMuteBanner({ crisisDayMute, onDisable }: CrisisMuteBannerProps) {
  if (!crisisDayMute.isActive) return null;

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!crisisDayMute.expiresAt) return "until tomorrow";
    const expires = new Date(crisisDayMute.expiresAt);
    const now = new Date();
    const diffMs = expires.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) return `${diffHours}h ${diffMins}m remaining`;
    return `${diffMins}m remaining`;
  };

  return (
    <div
      className="mx-4 mt-4 p-3 rounded-xl flex items-center justify-between"
      style={{ backgroundColor: "var(--color-border)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--color-muted)", opacity: 0.3 }}
        >
          <VolumeX size={20} style={{ color: "var(--color-muted)" }} />
        </div>
        <div>
          <p className="font-medium text-sm" style={{ color: "var(--color-text)" }}>
            Crisis Day Mute active
          </p>
          <p className="text-xs" style={{ color: "var(--color-muted)" }}>
            Notifications paused — {getTimeRemaining()}
          </p>
        </div>
      </div>
      <button
        onClick={onDisable}
        className="p-2 rounded-lg transition-colors hover:opacity-80"
        aria-label="Disable mute"
      >
        <X size={18} style={{ color: "var(--color-muted)" }} />
      </button>
    </div>
  );
}
