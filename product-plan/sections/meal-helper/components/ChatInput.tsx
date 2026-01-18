import { useState } from 'react'
import { Mic, Send } from 'lucide-react'

interface ChatInputProps {
  onSendMessage?: (content: string) => void
  onVoiceInput?: () => void
  disabled?: boolean
}

export function ChatInput({ onSendMessage, onVoiceInput, disabled }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !disabled) {
      onSendMessage?.(inputValue.trim())
      setInputValue('')
    }
  }

  return (
    <div className="bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 px-4 py-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        {/* Voice input button */}
        <button
          type="button"
          onClick={onVoiceInput}
          disabled={disabled}
          className="
            flex-shrink-0 w-11 h-11 rounded-full
            bg-stone-100 dark:bg-stone-700
            text-stone-500 dark:text-stone-400
            flex items-center justify-center
            hover:bg-stone-200 dark:hover:bg-stone-600
            active:scale-95
            transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          aria-label="Voice input"
        >
          <Mic size={20} />
        </button>

        {/* Text input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Zylo anything..."
            disabled={disabled}
            className="
              w-full px-4 py-2.5 rounded-full
              bg-stone-100 dark:bg-stone-700
              border-0
              text-stone-800 dark:text-stone-100
              placeholder:text-stone-400 dark:placeholder:text-stone-500
              focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500
              transition-shadow duration-150
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!inputValue.trim() || disabled}
          className="
            flex-shrink-0 w-11 h-11 rounded-full
            bg-yellow-500 dark:bg-yellow-600
            text-white
            flex items-center justify-center
            hover:bg-yellow-600 dark:hover:bg-yellow-500
            active:scale-95
            transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
