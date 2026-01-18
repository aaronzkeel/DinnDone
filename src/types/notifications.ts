// Notification Types for Dinner Bell

export type NotificationType =
  | "daily-brief"
  | "strategic-pivot"
  | "thaw-guardian"
  | "weekly-plan-ready"
  | "inventory-sos"
  | "leftover-check"
  | "cook-reminder";

export type NotificationStatus = "pending" | "done" | "dismissed";

export type FandomVoice =
  | "default"
  | "nacho-libre"
  | "samwise"
  | "harry-potter"
  | "star-wars"
  | "the-office";

export interface NotificationAction {
  id: string;
  label: string;
  isPrimary: boolean;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string; // ISO timestamp
  status: NotificationStatus;
  actions?: NotificationAction[];
  resolvedAt?: string; // ISO timestamp
  resolvedAction?: string; // which action was taken
}

export interface CrisisDayMute {
  isActive: boolean;
  activatedAt?: string; // ISO timestamp
  expiresAt?: string; // ISO timestamp (24 hours after activation)
}

export interface NotificationPreferences {
  userId: string;
  enabledTypes: NotificationType[];
  quietHoursStart?: string; // HH:MM format
  quietHoursEnd?: string; // HH:MM format
  fandomVoice: FandomVoice;
  pushEnabled: boolean;
}

// Component Props
export interface NotificationsListProps {
  /** List of notifications to display */
  notifications: Notification[];
  /** Crisis Day Mute status */
  crisisDayMute: CrisisDayMute;
  /** Called when user taps an action on a notification */
  onAction?: (notificationId: string, actionId: string) => void;
  /** Called when user toggles Crisis Day Mute */
  onToggleCrisisMute?: () => void;
  /** Called when user opens settings */
  onOpenSettings?: () => void;
  /** Called when user opens notification preview */
  onOpenPreview?: () => void;
}

export interface NotificationCardProps {
  /** The notification to display */
  notification: Notification;
  /** Called when user taps an action */
  onAction?: (actionId: string) => void;
}

export interface CrisisMuteBannerProps {
  /** Mute status */
  crisisDayMute: CrisisDayMute;
  /** Called when user taps to disable */
  onDisable?: () => void;
}

export interface NotificationSettingsProps {
  /** Current preferences */
  preferences: NotificationPreferences;
  /** Called when user toggles a notification type */
  onToggleType?: (type: NotificationType) => void;
  /** Called when user updates quiet hours */
  onUpdateQuietHours?: (start: string, end: string) => void;
  /** Called when user changes fandom voice */
  onChangeFandomVoice?: (voice: FandomVoice) => void;
  /** Called when user toggles push notifications */
  onTogglePush?: () => void;
  /** Called when user resets to defaults */
  onResetDefaults?: () => void;
  /** Called when user taps back button */
  onBack?: () => void;
}
