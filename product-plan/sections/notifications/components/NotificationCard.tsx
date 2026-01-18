import { Sun, Clock, Snowflake, Calendar, AlertCircle, UtensilsCrossed, Check, ChefHat } from 'lucide-react'
import type { Notification } from '../types'

interface NotificationCardProps {
  notification: Notification
  onAction?: (actionId: string) => void
}

const typeIcons = {
  'daily-brief': Sun,
  'strategic-pivot': Clock,
  'thaw-guardian': Snowflake,
  'weekly-plan-ready': Calendar,
  'inventory-sos': AlertCircle,
  'leftover-check': UtensilsCrossed,
  'cook-reminder': ChefHat,
}

const typeColors = {
  'daily-brief': 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
  'strategic-pivot': 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  'thaw-guardian': 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-400',
  'weekly-plan-ready': 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
  'inventory-sos': 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
  'leftover-check': 'bg-lime-100 text-lime-600 dark:bg-lime-900 dark:text-lime-400',
  'cook-reminder': 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400',
}

export function NotificationCard({ notification, onAction }: NotificationCardProps) {
  const Icon = typeIcons[notification.type]
  const colorClass = typeColors[notification.type]

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays}d ago`
  }

  const isPending = notification.status === 'pending'
  const isDone = notification.status === 'done'

  return (
    <div className={`
      p-4 rounded-xl transition-colors
      ${isPending
        ? 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700'
        : 'bg-stone-100 dark:bg-stone-800/50 border border-stone-200/50 dark:border-stone-700/50'
      }
    `}>
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
          <Icon size={18} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`
              text-sm leading-relaxed
              ${isPending
                ? 'text-stone-800 dark:text-stone-100'
                : 'text-stone-500 dark:text-stone-400'
              }
            `}>
              {notification.message}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-stone-400 dark:text-stone-500">
              {formatTime(notification.timestamp)}
            </span>

            {isDone && (
              <span className="flex items-center gap-1 text-xs text-lime-600 dark:text-lime-400">
                <Check size={12} />
                {notification.resolvedAction}
              </span>
            )}
          </div>

          {/* Actions */}
          {isPending && notification.actions && notification.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {notification.actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => onAction?.(action.id)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${action.isPrimary
                      ? 'bg-yellow-500 dark:bg-yellow-600 text-white hover:bg-yellow-600 dark:hover:bg-yellow-500'
                      : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
