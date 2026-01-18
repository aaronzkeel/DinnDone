import type { ChatMessage as ChatMessageType, HouseholdMember } from '../types'

interface ChatMessageProps {
  message: ChatMessageType
  currentUser?: HouseholdMember
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  // Format timestamp to relative time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    return date.toLocaleDateString()
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar for Zylo */}
        {!isUser && (
          <div className="flex items-end gap-2">
            <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center flex-shrink-0">
              <span className="text-yellow-600 dark:text-yellow-400 text-sm font-bold">Z</span>
            </div>
            <div className="flex flex-col">
              <div className="bg-white dark:bg-stone-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-stone-200 dark:border-stone-700">
                <p className="text-stone-800 dark:text-stone-100 text-sm leading-relaxed">
                  {message.content}
                </p>
              </div>
              <span className="text-xs text-stone-400 dark:text-stone-500 mt-1 ml-1">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        )}

        {/* User message */}
        {isUser && (
          <div className="flex flex-col items-end">
            <div className="bg-yellow-500 dark:bg-yellow-600 rounded-2xl rounded-br-md px-4 py-3">
              <p className="text-white text-sm leading-relaxed">
                {message.content}
              </p>
            </div>
            <span className="text-xs text-stone-400 dark:text-stone-500 mt-1 mr-1">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
