import { ArrowLeft, Bell, BellOff, Moon, Sparkles, RotateCcw } from 'lucide-react'
import type { NotificationSettingsProps, NotificationType, FandomVoice } from '../types'

const notificationTypes: Array<{ type: NotificationType; label: string; description: string }> = [
  {
    type: 'daily-brief',
    label: '7AM Daily Brief',
    description: "What's thawing today + tonight's plan",
  },
  {
    type: 'strategic-pivot',
    label: '4PM Strategic Pivot',
    description: 'Last-minute meal check-in',
  },
  {
    type: 'thaw-guardian',
    label: '7:30PM Thaw Guardian',
    description: "Reminder to move tomorrow's protein to fridge",
  },
  {
    type: 'weekly-plan-ready',
    label: 'Weekly Plan Ready',
    description: 'When your next week is ready to review',
  },
  {
    type: 'leftover-check',
    label: 'Leftover Check',
    description: "Don't let food go to waste reminders",
  },
  {
    type: 'inventory-sos',
    label: 'Inventory SOS',
    description: 'Quick ingredient checks for family',
  },
  {
    type: 'cook-reminder',
    label: 'Cook Reminder',
    description: "Heads-up when you're scheduled to cook",
  },
]

const fandomVoices: Array<{ value: FandomVoice; label: string }> = [
  { value: 'default', label: 'Default' },
  { value: 'samwise', label: 'Samwise (LOTR)' },
  { value: 'nacho-libre', label: 'Nacho Libre' },
  { value: 'harry-potter', label: 'Harry Potter' },
  { value: 'star-wars', label: 'Star Wars' },
  { value: 'the-office', label: 'The Office' },
]

interface NotificationSettingsExtendedProps extends NotificationSettingsProps {
  onBack?: () => void
}

export function NotificationSettings({
  preferences,
  onToggleType,
  onUpdateQuietHours,
  onChangeFandomVoice,
  onTogglePush,
  onResetDefaults,
  onBack,
}: NotificationSettingsExtendedProps) {
  return (
    <div className="min-h-full bg-stone-50 dark:bg-stone-900">
      <div className="px-4 pt-4 pb-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="px-4 pb-6">
        <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
          Notification Settings
        </h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Control when and how Zylo reaches out
        </p>

        {/* Push Notifications Master Toggle */}
        <div className="mt-6">
          <div className="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {preferences.pushEnabled ? (
                  <Bell size={20} className="text-yellow-600 dark:text-yellow-400" />
                ) : (
                  <BellOff size={20} className="text-stone-400 dark:text-stone-500" />
                )}
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                    Push Notifications
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    {preferences.pushEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
              <button
                onClick={onTogglePush}
                className={`
                  relative w-12 h-7 rounded-full transition-colors
                  ${preferences.pushEnabled ? 'bg-yellow-500' : 'bg-stone-300 dark:bg-stone-600'}
                `}
              >
                <div
                  className={`
                    absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform
                    ${preferences.pushEnabled ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase mb-3">
            Nudge Types
          </h2>
          <div className="space-y-2">
            {notificationTypes.map(({ type, label, description }) => {
              const isEnabled = preferences.enabledTypes.includes(type)
              return (
                <button
                  key={type}
                  onClick={() => onToggleType?.(type)}
                  disabled={!preferences.pushEnabled}
                  className={`
                    w-full text-left p-4 rounded-xl border transition-colors
                    ${!preferences.pushEnabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-stone-50 dark:hover:bg-stone-800'
                    }
                    ${isEnabled
                      ? 'bg-white dark:bg-stone-800 border-yellow-300 dark:border-yellow-700'
                      : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                        {label}
                      </h3>
                      <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
                        {description}
                      </p>
                    </div>
                    <div
                      className={`
                        relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-3
                        ${isEnabled ? 'bg-yellow-500' : 'bg-stone-300 dark:bg-stone-600'}
                      `}
                    >
                      <div
                        className={`
                          absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform
                          ${isEnabled ? 'translate-x-5' : 'translate-x-0'}
                        `}
                      />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase mb-3">
            Quiet Hours
          </h2>
          <div className="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <div className="flex items-start gap-3">
              <Moon size={20} className="text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                  Do Not Disturb
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                  No notifications during these hours
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <input
                    type="time"
                    value={preferences.quietHoursStart || '21:00'}
                    onChange={(e) => onUpdateQuietHours?.(e.target.value, preferences.quietHoursEnd || '07:00')}
                    className="px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm"
                  />
                  <span className="text-stone-500 dark:text-stone-400">to</span>
                  <input
                    type="time"
                    value={preferences.quietHoursEnd || '07:00'}
                    onChange={(e) => onUpdateQuietHours?.(preferences.quietHoursStart || '21:00', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fandom Voice */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase mb-3">
            Fandom Voice (Optional)
          </h2>
          <div className="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <div className="flex items-start gap-3">
              <Sparkles size={20} className="text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                  Notification Voice
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 mb-3">
                  Add personality to your nudges
                </p>
                <select
                  value={preferences.fandomVoice}
                  onChange={(e) => onChangeFandomVoice?.(e.target.value as FandomVoice)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                >
                  {fandomVoices.map((voice) => (
                    <option key={voice.value} value={voice.value}>
                      {voice.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Reset to Defaults */}
        <div className="mt-6">
          <button
            onClick={onResetDefaults}
            className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            Reset to defaults
          </button>
        </div>
      </div>
    </div>
  )
}
