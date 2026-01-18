import { ArrowLeft, Sun, Coffee, Moon, CheckCircle, AlertCircle } from 'lucide-react'

interface NotificationPreviewProps {
  onBack?: () => void
}

const nudgeTypes = [
  {
    id: 'daily-brief',
    title: '7AM Daily Brief',
    icon: Sun,
    time: '7:00 AM',
    example: "Tonight: Sheet Pan Salmon (Aaron cooking). All ingredients on hand. Ready to go!",
    why: "Start your day knowing what's for dinner and what (if anything) needs to thaw. Takes the guesswork out of your evening.",
    color: 'amber',
  },
  {
    id: 'strategic-pivot',
    title: '4PM Strategic Pivot',
    icon: Coffee,
    time: '4:00 PM',
    example: "Still on for Taco Tuesday tomorrow? Just checking — tap if plans changed.",
    why: "Life happens. This gives you a chance to adjust plans before it's too late to pivot to something easier.",
    color: 'lime',
  },
  {
    id: 'thaw-guardian',
    title: '7:30PM Thaw Guardian',
    icon: Moon,
    time: '7:30 PM',
    example: "Friendly reminder: move chicken to fridge tonight for Wednesday's stir fry.",
    why: "Prevent the morning panic of frozen protein. Move it to the fridge before bed and wake up ready to cook.",
    color: 'blue',
  },
]

export function NotificationPreview({ onBack }: NotificationPreviewProps) {
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
          Notification Preview
        </h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Here's what each nudge does and why it helps
        </p>

        {/* Nudge Types */}
        <div className="mt-6 space-y-6">
          {nudgeTypes.map(({ id, title, icon: Icon, time, example, why, color }) => (
            <div key={id} className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center
                    ${color === 'amber' ? 'bg-yellow-100 dark:bg-yellow-900/40' : ''}
                    ${color === 'lime' ? 'bg-lime-100 dark:bg-lime-900/40' : ''}
                    ${color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/40' : ''}
                  `}
                >
                  <Icon
                    size={20}
                    className={`
                      ${color === 'amber' ? 'text-yellow-700 dark:text-yellow-300' : ''}
                      ${color === 'lime' ? 'text-lime-700 dark:text-lime-300' : ''}
                      ${color === 'blue' ? 'text-blue-700 dark:text-blue-300' : ''}
                    `}
                  />
                </div>
                <div>
                  <h2 className="font-semibold text-stone-900 dark:text-stone-100">
                    {title}
                  </h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {time}
                  </p>
                </div>
              </div>

              {/* Example Notification Card */}
              <div className="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <div className="flex items-start gap-3">
                  <div
                    className={`
                      w-2 h-2 rounded-full mt-2 flex-shrink-0
                      ${color === 'amber' ? 'bg-yellow-500' : ''}
                      ${color === 'lime' ? 'bg-lime-500' : ''}
                      ${color === 'blue' ? 'bg-blue-500' : ''}
                    `}
                  />
                  <div className="flex-1">
                    <p className="text-stone-800 dark:text-stone-200">
                      {example}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <button className="px-4 py-2 rounded-lg bg-yellow-500 text-white text-sm font-medium hover:bg-yellow-600 transition-colors">
                        Looks good
                      </button>
                      <button className="px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">
                        Adjust
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why This Helps */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-lime-50 dark:bg-lime-950/30 border border-lime-200 dark:border-lime-900">
                <CheckCircle size={20} className="text-lime-700 dark:text-lime-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">
                    Why this helps
                  </h3>
                  <p className="text-sm text-stone-700 dark:text-stone-300">
                    {why}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-stone-500 dark:text-stone-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">
                You're in control
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                Turn any of these nudges on or off in settings. You can also enable Crisis Day Mode to silence all notifications for 24 hours when you need a break.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
