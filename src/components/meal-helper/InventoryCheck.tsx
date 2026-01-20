"use client";

import { useState } from "react";
import { ArrowLeft, Mic, Send } from "lucide-react";

export interface InventoryCheckProps {
  onBack?: () => void;
  onSubmit?: (notes: string) => void;
  onVoiceInput?: () => void;
}

export function InventoryCheck({ onBack, onSubmit, onVoiceInput }: InventoryCheckProps) {
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (notes.trim()) {
      onSubmit?.(notes);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-120px)]"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="px-4 pt-4 pb-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity"
          style={{ color: "var(--color-muted)" }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="px-4">
        <h1
          className="text-xl font-bold font-heading"
          style={{ color: "var(--color-text)" }}
        >
          Check what we&apos;ve got
        </h1>
        <p className="mt-2" style={{ color: "var(--color-muted)" }}>
          Quick brain dump. Fridge, freezer, pantry — whatever you&apos;ve got on hand.
        </p>

        <div
          className="mt-4 rounded-2xl p-4"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <label
            className="text-sm font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            What&apos;s on hand?
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            placeholder="Example: chicken thighs, ground turkey, sad spinach, tortillas, rice, soy sauce, garlic, frozen peas…"
            className="mt-2 w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2"
            style={{
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
          />

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onVoiceInput}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors hover:opacity-80"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
              }}
            >
              <Mic size={16} />
              Use voice
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!notes.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-white font-semibold text-sm transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <Send size={16} />
              Ask Zylo
            </button>
          </div>
        </div>

        <p className="mt-4 text-sm" style={{ color: "var(--color-muted)" }}>
          Zylo will suggest meals based on what you have.
        </p>
      </div>
    </div>
  );
}
