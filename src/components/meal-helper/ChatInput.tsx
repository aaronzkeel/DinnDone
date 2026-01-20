"use client";

import { useState } from "react";
import { Mic, Send } from "lucide-react";
import type { ChatInputProps } from "@/types/meal-helper";

export function ChatInput({ onSendMessage, onVoiceInput, disabled }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage?.(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div
      className="fixed left-0 right-0 z-40 px-4 py-3"
      style={{
        backgroundColor: "var(--color-bg)",
        bottom: "calc(80px + env(safe-area-inset-bottom))",
      }}
    >
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-[1440px] mx-auto">
        {/* Voice input button */}
        <button
          type="button"
          onClick={onVoiceInput}
          disabled={disabled}
          className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center hover:opacity-80 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "var(--color-border)",
            color: "var(--color-muted)",
          }}
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
            aria-label="Ask Zylo anything..."
            className="w-full px-4 py-2.5 rounded-full border-0 focus:outline-none focus:ring-2 transition-shadow duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!inputValue.trim() || disabled}
          className="flex-shrink-0 w-11 h-11 rounded-full text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--color-primary)" }}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
