"use client";

import { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { QuickActionButtons, type QuickAction } from "./QuickActionButtons";
import { PlanningChatInput } from "./PlanningChatInput";

export type PlanningMessageRole = "user" | "zylo";

export interface PlanningMessage {
  id: string;
  role: PlanningMessageRole;
  content: string;
  timestamp: string;
}

export interface PlanningChatProps {
  /** Chat messages to display */
  messages: PlanningMessage[];
  /** Quick action buttons to show below the last Zylo message */
  quickActions?: QuickAction[];
  /** Called when a quick action is tapped */
  onQuickAction?: (actionId: string) => void;
  /** Called when user sends a text message */
  onSendMessage: (content: string) => void;
  /** Whether Zylo is currently typing/thinking */
  isLoading?: boolean;
  /** Placeholder for the input field */
  inputPlaceholder?: string;
  /** Whether to show the input field */
  showInput?: boolean;
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString();
}

function ChatMessageBubble({ message }: { message: PlanningMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`max-w-[85%] ${isUser ? "order-2" : "order-1"}`}>
        {/* Zylo message */}
        {!isUser && (
          <div className="flex items-end gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "var(--color-primary)", opacity: 0.2 }}
            >
              <span
                style={{ color: "var(--color-primary)" }}
                className="text-sm font-bold"
              >
                Z
              </span>
            </div>
            <div className="flex flex-col">
              <div
                className="rounded-2xl rounded-bl-md px-4 py-3 shadow-sm"
                style={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <p
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: "var(--color-text)" }}
                >
                  {message.content}
                </p>
              </div>
              <span
                className="text-xs mt-1 ml-1"
                style={{ color: "var(--color-muted)" }}
              >
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        )}

        {/* User message */}
        {isUser && (
          <div className="flex flex-col items-end">
            <div
              className="rounded-2xl rounded-br-md px-4 py-3"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
            <span
              className="text-xs mt-1 mr-1"
              style={{ color: "var(--color-muted)" }}
            >
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="flex items-end gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "var(--color-primary)", opacity: 0.2 }}
        >
          <span
            style={{ color: "var(--color-primary)" }}
            className="text-sm font-bold"
          >
            Z
          </span>
        </div>
        <div
          className="rounded-2xl rounded-bl-md px-4 py-3 shadow-sm flex items-center gap-2"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <Loader2
            size={16}
            className="animate-spin"
            style={{ color: "var(--color-primary)" }}
          />
          <span className="text-sm" style={{ color: "var(--color-muted)" }}>
            Zylo is thinking...
          </span>
        </div>
      </div>
    </div>
  );
}

export function PlanningChat({
  messages,
  quickActions = [],
  onQuickAction,
  onSendMessage,
  isLoading = false,
  inputPlaceholder = "Type a message...",
  showInput = true,
}: PlanningChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions (shown below messages, above input) */}
      {quickActions.length > 0 && !isLoading && (
        <QuickActionButtons
          actions={quickActions}
          onAction={onQuickAction ?? (() => {})}
          disabled={isLoading}
        />
      )}

      {/* Input area */}
      {showInput && (
        <PlanningChatInput
          onSendMessage={onSendMessage}
          placeholder={inputPlaceholder}
          disabled={isLoading}
        />
      )}
    </div>
  );
}
