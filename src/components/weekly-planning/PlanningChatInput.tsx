"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";

export interface PlanningChatInputProps {
  /** Called when user sends a message */
  onSendMessage: (content: string) => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
}

// Line height in pixels (matches text-sm = 1.25rem line-height)
const LINE_HEIGHT = 20;
const MAX_LINES = 6;
const MAX_HEIGHT = LINE_HEIGHT * MAX_LINES;

export function PlanningChatInput({
  onSendMessage,
  placeholder = "Type a message...",
  disabled = false,
}: PlanningChatInputProps) {
  const [message, setMessage] = useState("");
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

  // Auto-focus when enabled
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  // Adjust height when message changes
  useEffect(() => {
    adjustHeight();
  }, [message, adjustHeight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSendMessage(trimmed);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter without shift submits, Enter with shift adds newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-4 pt-3 pb-6"
      style={{ borderTop: "1px solid var(--color-border)" }}
    >
      <div
        className="flex items-end gap-2 rounded-xl px-3 py-2"
        style={{
          backgroundColor: "var(--color-bg)",
          border: "1px solid var(--color-border)",
        }}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent outline-none text-sm resize-none"
          style={{
            color: "var(--color-text)",
            lineHeight: `${LINE_HEIGHT}px`,
            maxHeight: `${MAX_HEIGHT}px`,
          }}
          aria-label="Message input"
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="p-2 rounded-lg transition-all hover:opacity-80 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          style={{ backgroundColor: "var(--color-primary)" }}
          aria-label="Send message"
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
    </form>
  );
}
