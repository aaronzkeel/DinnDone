"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Send } from "lucide-react";
import type { ChatInputProps } from "@/types/meal-helper";

// Line height in pixels (matches text-sm = 1.25rem line-height)
const LINE_HEIGHT = 20;
const MAX_LINES = 6;
const MAX_HEIGHT = LINE_HEIGHT * MAX_LINES;

export function ChatInput({ onSendMessage, onVoiceInput, disabled }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";
    // Set to scrollHeight but cap at max
    const newHeight = Math.min(textarea.scrollHeight, MAX_HEIGHT);
    textarea.style.height = `${newHeight}px`;
  }, []);

  // Adjust height when message changes
  useEffect(() => {
    adjustHeight();
  }, [inputValue, adjustHeight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage?.(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter without shift submits, Enter with shift adds newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      className="fixed left-0 right-0 z-40 px-4 py-3"
      style={{
        backgroundColor: "var(--color-bg)",
        bottom: "var(--bottom-nav-total)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <form onSubmit={handleSubmit} className="flex items-end gap-2 max-w-2xl mx-auto">
        {/* Voice input button */}
        <button
          type="button"
          onClick={onVoiceInput}
          disabled={disabled}
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "var(--color-border)",
            color: "var(--color-muted)",
          }}
          aria-label="Voice input"
        >
          <Mic size={18} />
        </button>

        {/* Text input - growing textarea */}
        <div
          className="flex-1 flex items-end rounded-2xl px-4 py-2"
          style={{
            backgroundColor: "var(--color-border)",
          }}
        >
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Zylo anything..."
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent outline-none text-sm resize-none"
            style={{
              color: "var(--color-text)",
              lineHeight: `${LINE_HEIGHT}px`,
              maxHeight: `${MAX_HEIGHT}px`,
            }}
            aria-label="Ask Zylo anything..."
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!inputValue.trim() || disabled}
          className="flex-shrink-0 w-10 h-10 rounded-full text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--color-primary)" }}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
