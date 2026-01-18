import { Settings, Sparkles, VolumeX } from 'lucide-react'
import type { NotificationsListProps } from '../types'
import { CrisisMuteBanner } from './CrisisMuteBanner'
import { NotificationCard } from './NotificationCard'

export function NotificationsList({
  notifications,
  crisisDayMute,
  onAction,
  onToggleCrisisMute,
  onOpenSettings,
  onOpenPreview,
}: NotificationsListProps) {
  const sortedNotifications = [...notifications].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime()
    const timeB = new Date(b.timestamp).getTime()
    return timeB - timeA
  })

  // Separate pending and resolved notifications (newest first)
  const pendingNotifications = sortedNotifications.filter((n) => n.status === 'pending')
  const resolvedNotifications = sortedNotifications.filter((n) => n.status !== 'pending')

  return (
    <div className="flex flex-col h-full bg-stone-50 dark:bg-stone-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
        <h2 className="font-semibold text-stone-800 dark:text-stone-100">Notifications</h2>
        <div className="flex items-center gap-2">
          {/* Crisis Day Mute toggle */}
          <button
            onClick={onToggleCrisisMute}
            className={`
              p-2 rounded-lg transition-colors
              ${crisisDayMute.isActive
                ? 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
              }
            `}
            aria-label={crisisDayMute.isActive ? 'Disable Crisis Day Mute' : 'Enable Crisis Day Mute'}
            title="Crisis Day Mute"
          >
            <VolumeX size={20} />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenPreview}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            aria-label="Notification preview"
            title="Preview"
          >
            <Sparkles size={20} />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            aria-label="Notification settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Crisis Mute Banner */}
      <CrisisMuteBanner crisisDayMute={crisisDayMute} onDisable={onToggleCrisisMute} />

      {/* Notifications list */}
      <div className="flex-1 overflow-auto px-4 py-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
              <VolumeX size={24} className="text-stone-400 dark:text-stone-500" />
            </div>
            <p className="text-stone-500 dark:text-stone-400 font-medium">
              All caught up!
            </p>
            <p className="text-stone-400 dark:text-stone-500 text-sm mt-1">
              No notifications right now
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Pending notifications first */}
            {pendingNotifications.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500 px-1">
                  Needs attention
                </h3>
                {pendingNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onAction={(actionId) => onAction?.(notification.id, actionId)}
                  />
                ))}
              </div>
            )}

            {/* Resolved notifications */}
            {resolvedNotifications.length > 0 && (
              <div className="space-y-3">
                {pendingNotifications.length > 0 && (
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500 px-1 mt-6">
                    Earlier
                  </h3>
                )}
                {resolvedNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onAction={(actionId) => onAction?.(notification.id, actionId)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
