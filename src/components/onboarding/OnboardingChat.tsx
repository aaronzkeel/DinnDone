'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface OnboardingChatProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  isLoading: boolean
  disabled?: boolean
}

export function OnboardingChat({
  messages,
  onSendMessage,
  isLoading,
  disabled = false,
}: OnboardingChatProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    const newHeight = Math.min(textarea.scrollHeight, 120) // Max 6 lines
    textarea.style.height = `${newHeight}px`
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [inputValue, adjustHeight])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isLoading && !disabled) {
      onSendMessage(inputValue.trim())
      setInputValue('')
      // Re-focus input after sending
      setTimeout(() => textareaRef.current?.focus(), 0)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area - add padding for input bar */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ paddingBottom: '80px' }} // Space for input area
      >
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}
              >
                {/* Zylo message */}
                {message.role === 'assistant' && (
                  <div className="flex items-end gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'var(--color-primary)', opacity: 0.2 }}
                    >
                      <span
                        style={{ color: 'var(--color-primary)' }}
                        className="text-sm font-bold"
                      >
                        Z
                      </span>
                    </div>
                    <div
                      className="rounded-2xl rounded-bl-md px-4 py-3 shadow-sm"
                      style={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <p
                        className="text-sm leading-relaxed whitespace-pre-wrap"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {message.content}
                      </p>
                    </div>
                  </div>
                )}

                {/* User message */}
                {message.role === 'user' && (
                  <div
                    className="rounded-2xl rounded-br-md px-4 py-3"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-primary)', opacity: 0.2 }}
                >
                  <span
                    style={{ color: 'var(--color-primary)' }}
                    className="text-sm font-bold"
                  >
                    Z
                  </span>
                </div>
                <div
                  className="rounded-2xl rounded-bl-md px-4 py-3 shadow-sm"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Loader2
                      size={16}
                      className="animate-spin"
                      style={{ color: 'var(--color-muted)' }}
                    />
                    <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
                      Zylo is typing...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area - fixed above bottom nav */}
      <div
        className="fixed left-0 right-0 px-4 py-3 border-t z-40"
        style={{
          backgroundColor: 'var(--color-bg)',
          borderColor: 'var(--color-border)',
          bottom: 'var(--bottom-nav-total)',
        }}
      >
        <form onSubmit={handleSubmit} className="flex items-end gap-2 max-w-2xl mx-auto">
          <div
            className="flex-1 flex items-end rounded-2xl px-4 py-2"
            style={{ backgroundColor: 'var(--color-border)' }}
          >
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell Zylo about your family..."
              disabled={isLoading || disabled}
              rows={1}
              className="flex-1 bg-transparent outline-none text-sm resize-none"
              style={{
                color: 'var(--color-text)',
                lineHeight: '20px',
                maxHeight: '120px',
              }}
              aria-label="Chat message"
            />
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || disabled}
            className="flex-shrink-0 w-10 h-10 rounded-full text-white flex items-center justify-center transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--color-primary)' }}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
