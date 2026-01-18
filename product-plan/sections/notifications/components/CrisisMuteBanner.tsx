import { VolumeX, X } from 'lucide-react'
import type { CrisisDayMute } from '../types'

interface CrisisMuteBannerProps {
  crisisDayMute: CrisisDayMute
  onDisable?: () => void
}

export function CrisisMuteBanner({ crisisDayMute, onDisable }: CrisisMuteBannerProps) {
  if (!crisisDayMute.isActive) return null

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!crisisDayMute.expiresAt) return 'until tomorrow'
    const expires = new Date(crisisDayMute.expiresAt)
    const now = new Date()
    const diffMs = expires.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 0) return `${diffHours}h ${diffMins}m remaining`
    return `${diffMins}m remaining`
  }

  return (
    <div className="mx-4 mt-4 p-3 rounded-xl bg-stone-200 dark:bg-stone-700 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-stone-300 dark:bg-stone-600 flex items-center justify-center">
          <VolumeX size={20} className="text-stone-500 dark:text-stone-400" />
        </div>
        <div>
          <p className="font-medium text-stone-700 dark:text-stone-200 text-sm">
            Crisis Day Mute active
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Notifications paused — {getTimeRemaining()}
          </p>
        </div>
      </div>
      <button
        onClick={onDisable}
        className="p-2 rounded-lg hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
        aria-label="Disable mute"
      >
        <X size={18} className="text-stone-500 dark:text-stone-400" />
      </button>
    </div>
  )
}
