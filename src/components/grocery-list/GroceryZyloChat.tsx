'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Send, Loader2 } from 'lucide-react'
import { useVoiceInput } from '@/hooks/useVoiceInput'

interface GroceryStore {
  id: string
  name: string
}

interface ChatMessage {
  role: 'user' | 'zylo'
  content: string
  timestamp: string
}

interface GroceryAction {
  type: 'add' | 'move' | 'check' | 'uncheck' | 'remove' | 'createStore'
  itemName: string
  quantity?: string
  storeId?: string
  storeName?: string
  isOrganic?: boolean
}

interface StoreSelectionRequest {
  items: string[]
  availableStores: string[]
}

interface GroceryZyloChatProps {
  stores: GroceryStore[]
  messages: ChatMessage[]
  onSendMessage: (message: string) => Promise<{
    success: boolean
    zyloResponse?: string
    actions?: GroceryAction[]
    needsStoreSelection?: StoreSelectionRequest
    error?: string
  }>
  onExecuteActions: (actions: GroceryAction[]) => Promise<void>
  onAddMessage: (role: 'user' | 'zylo', content: string) => void
  onStoreSelect: (storeId: string, items: string[]) => Promise<void>
  isLoading?: boolean
}

// Line height in pixels (matches text-sm = 1.25rem line-height)
const LINE_HEIGHT = 20
const MAX_LINES = 6
const MAX_HEIGHT = LINE_HEIGHT * MAX_LINES

export function GroceryZyloChat({
  stores,
  messages,
  onSendMessage,
  onExecuteActions,
  onAddMessage,
  onStoreSelect,
  isLoading = false,
}: GroceryZyloChatProps) {
  const [inputValue, setInputValue] = useState('')
  const [pendingStoreSelection, setPendingStoreSelection] = useState<StoreSelectionRequest | null>(null)
  const [pendingItems, setPendingItems] = useState<string[]>([])
  const [isSending, setIsSending] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Voice input
  const voiceInput = useVoiceInput({
    onResult: (transcript) => {
      setInputValue(transcript)
      // Auto-submit voice input
      handleSubmit(transcript)
    },
  })

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    const newHeight = Math.min(textarea.scrollHeight, MAX_HEIGHT)
    textarea.style.height = `${newHeight}px`
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [inputValue, adjustHeight])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  const handleSubmit = async (overrideMessage?: string) => {
    const messageToSend = typeof overrideMessage === 'string' ? overrideMessage : inputValue.trim()
    if (!messageToSend || isSending) return

    setInputValue('')
    setIsSending(true)

    // Add user message
    onAddMessage('user', messageToSend)

    try {
      const result = await onSendMessage(messageToSend)

      if (result.success) {
        // Add Zylo's response
        if (result.zyloResponse) {
          onAddMessage('zylo', result.zyloResponse)
        }

        // Execute any actions
        if (result.actions && result.actions.length > 0) {
          await onExecuteActions(result.actions)
        }

        // Handle store selection if needed
        if (result.needsStoreSelection) {
          setPendingStoreSelection(result.needsStoreSelection)
          setPendingItems(result.needsStoreSelection.items)
        }
      } else if (result.error) {
        onAddMessage('zylo', `Sorry, something went wrong: ${result.error}`)
      }
    } catch {
      onAddMessage('zylo', "Sorry, I couldn't process that. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const handleStoreSelect = async (storeId: string) => {
    if (!pendingItems.length) return

    setIsSending(true)
    setPendingStoreSelection(null)

    const store = stores.find((s) => s.id === storeId)
    const storeName = store?.name || 'store'

    try {
      await onStoreSelect(storeId, pendingItems)
      onAddMessage('zylo', `Added ${pendingItems.join(', ')} to ${storeName}`)
    } catch {
      onAddMessage('zylo', "Sorry, couldn't add those items. Please try again.")
    } finally {
      setPendingItems([])
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleVoiceToggle = () => {
    if (voiceInput.isListening) {
      voiceInput.stopListening()
    } else {
      voiceInput.startListening()
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }

  return (
    <>
      {/* Messages area - scrolls above fixed input */}
      {messages.length > 0 && (
        <div
          className="border-t"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg)',
          }}
        >
          <div className="max-w-2xl mx-auto px-4 py-3 max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {messages.slice(-10).map((msg, index) => (
                <div
                  key={`${msg.timestamp}-${index}`}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Zylo avatar */}
                  {msg.role === 'zylo' && (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-2"
                      style={{ backgroundColor: 'var(--color-primary)', opacity: 0.2 }}
                    >
                      <span style={{ color: 'var(--color-primary)' }} className="text-sm font-bold">
                        Z
                      </span>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      msg.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'
                    }`}
                    style={{
                      backgroundColor: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-card)',
                      color: msg.role === 'user' ? 'white' : 'var(--color-text)',
                      border: msg.role === 'zylo' ? '1px solid var(--color-border)' : 'none',
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isSending && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-primary)', opacity: 0.2 }}
                  >
                    <span style={{ color: 'var(--color-primary)' }} className="text-sm font-bold">
                      Z
                    </span>
                  </div>
                  <div
                    className="rounded-2xl rounded-bl-md px-4 py-3"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <div className="flex gap-1">
                      <span
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: 'var(--color-muted)', animationDelay: '0ms' }}
                      />
                      <span
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: 'var(--color-muted)', animationDelay: '150ms' }}
                      />
                      <span
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: 'var(--color-muted)', animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* Store Selection Buttons */}
      {pendingStoreSelection && (
        <div
          className="border-t px-4 py-3"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-card)',
          }}
        >
          <div className="max-w-2xl mx-auto">
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              Where should I add {pendingItems.join(', ')}?
            </p>
            <div className="flex flex-wrap gap-2">
              {stores.map((store) => (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => handleStoreSelect(store.id)}
                  disabled={isSending}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {store.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setPendingStoreSelection(null)
                  setPendingItems([])
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors hover:opacity-80"
                style={{ color: 'var(--color-muted)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Input Area - matches home page ChatInput pattern */}
      <div
        className="fixed left-0 right-0 z-40 px-4 py-3"
        style={{
          backgroundColor: 'var(--color-bg)',
          bottom: 'var(--bottom-nav-total)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <form onSubmit={handleFormSubmit} className="flex items-end gap-2 max-w-2xl mx-auto">
          {/* Voice Button */}
          <button
            type="button"
            onClick={handleVoiceToggle}
            disabled={!voiceInput.isSupported || isSending || isLoading}
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
              voiceInput.isListening ? 'animate-pulse' : ''
            }`}
            style={{
              backgroundColor: voiceInput.isListening ? 'var(--color-danger)' : 'var(--color-border)',
              color: voiceInput.isListening ? 'white' : 'var(--color-muted)',
            }}
            aria-label={voiceInput.isListening ? 'Stop listening' : 'Start voice input'}
          >
            {voiceInput.isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Text Input */}
          <div
            className="flex-1 flex items-end rounded-2xl px-4 py-2"
            style={{ backgroundColor: 'var(--color-border)' }}
          >
            <textarea
              ref={textareaRef}
              value={voiceInput.isListening ? voiceInput.transcript || '' : inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={voiceInput.isListening ? 'Listening...' : 'Ask Zylo to add items...'}
              disabled={isSending || isLoading || voiceInput.isListening}
              rows={1}
              className="flex-1 bg-transparent outline-none text-sm resize-none"
              style={{
                color: 'var(--color-text)',
                lineHeight: `${LINE_HEIGHT}px`,
                maxHeight: `${MAX_HEIGHT}px`,
              }}
              aria-label="Ask Zylo to add items"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputValue.trim() || isSending || isLoading}
            className="flex-shrink-0 w-10 h-10 rounded-full text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--color-primary)' }}
            aria-label="Send message"
          >
            {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>

        {/* Voice error */}
        {voiceInput.error && (
          <p className="text-xs mt-2 max-w-2xl mx-auto" style={{ color: 'var(--color-danger)' }}>
            {voiceInput.error}
          </p>
        )}
      </div>
    </>
  )
}
