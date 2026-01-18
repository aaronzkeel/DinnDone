"use client";

import type { ChatMessageProps } from "@/types/meal-helper";

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

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`max-w-[85%] ${isUser ? "order-2" : "order-1"}`}>
        {/* Avatar for Zylo */}
        {!isUser && (
          <div className="flex items-end gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "var(--color-primary)", opacity: 0.2 }}
            >
              <span style={{ color: "var(--color-primary)" }} className="text-sm font-bold">
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
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
                  {message.content}
                </p>
              </div>
              <span className="text-xs mt-1 ml-1" style={{ color: "var(--color-muted)" }}>
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
              <p className="text-white text-sm leading-relaxed">{message.content}</p>
            </div>
            <span className="text-xs mt-1 mr-1" style={{ color: "var(--color-muted)" }}>
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
