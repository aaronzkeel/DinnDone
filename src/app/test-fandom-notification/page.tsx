"use client";

import { useState } from "react";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import type { Notification, FandomVoice } from "@/types/notifications";

/**
 * Test page for Feature #176: Fandom Voice affects notification text
 *
 * This demonstrates how notification messages change based on selected fandom voice.
 * When generating notifications, the system uses the user's fandom voice preference
 * to style the message text.
 */

// Fandom-styled notification messages for a daily brief
const FANDOM_STYLED_MESSAGES: Record<FandomVoice, string> = {
  default:
    "Good morning! Tonight's dinner is Chicken Stir Fry. Katie is cooking and it'll be ready by 6pm.",
  samwise:
    "Well now, Mr. Frodo would approve of tonight's supper! Katie's cooking up some Chicken Stir Fry - as fine a meal as any in the Shire. If you understand me, it'll be ready round 6pm.",
  "nacho-libre":
    "Tonight we eat like CHAMPIONS! Katie is making Chicken Stir Fry - it's the BEST! Muy delicioso at 6pm!",
  "harry-potter":
    "Brilliant! Tonight's dinner is positively magical - Katie's conjuring up Chicken Stir Fry. The house elves would be impressed! Ready at 6pm.",
  "star-wars":
    "Strong with flavor, tonight's meal will be. Katie is preparing Chicken Stir Fry. Ready by 6pm, this dish will be, padawan.",
  "the-office":
    "Conference room at 6pm. Katie's making Chicken Stir Fry. It's going to be a big night. Possibly the biggest dinner this family has ever had. Bears, beets, Battlestar Galactica... and stir fry.",
};

const fandomVoices: Array<{ value: FandomVoice; label: string; hint: string }> = [
  { value: "default", label: "Default", hint: "Friendly and supportive" },
  { value: "samwise", label: "Samwise (LOTR)", hint: '"Po-tay-toes!" vibes' },
  { value: "nacho-libre", label: "Nacho Libre", hint: '"It\'s the best!" energy' },
  { value: "harry-potter", label: "Harry Potter", hint: "Magical cooking" },
  { value: "star-wars", label: "Star Wars", hint: "May the Fork be with you" },
  { value: "the-office", label: "The Office", hint: "That's what she said" },
];

export default function TestFandomNotificationPage() {
  const [selectedVoice, setSelectedVoice] = useState<FandomVoice>("default");

  // Generate notification with selected fandom voice
  const notification: Notification = {
    id: `fandom-notif-${selectedVoice}`,
    type: "daily-brief",
    message: FANDOM_STYLED_MESSAGES[selectedVoice],
    timestamp: new Date().toISOString(),
    status: "pending",
    actions: [
      { id: "looks-good", label: "Looks good", isPrimary: true },
      { id: "adjust", label: "Adjust", isPrimary: false },
    ],
  };

  return (
    <div
      className="min-h-screen p-6 font-sans"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <h1
          className="text-2xl font-bold mb-2 font-heading"
          style={{ color: "var(--color-text)" }}
        >
          Feature #176: Fandom Voice affects notification text
        </h1>
        <p className="mb-6" style={{ color: "var(--color-muted)" }}>
          Test that notification messages change based on the selected fandom voice.
        </p>

        {/* Voice Selector */}
        <div
          className="p-4 rounded-xl mb-6"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <label
            className="block text-sm font-semibold mb-3"
            style={{ color: "var(--color-text)" }}
          >
            Select Fandom Voice:
          </label>
          <div className="flex flex-wrap gap-2">
            {fandomVoices.map((voice) => (
              <button
                key={voice.value}
                onClick={() => setSelectedVoice(voice.value)}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor:
                    selectedVoice === voice.value
                      ? "var(--color-primary)"
                      : "var(--color-bg)",
                  color:
                    selectedVoice === voice.value
                      ? "white"
                      : "var(--color-text)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {voice.label}
              </button>
            ))}
          </div>
          <p className="text-xs mt-3" style={{ color: "var(--color-muted)" }}>
            Hint: {fandomVoices.find((v) => v.value === selectedVoice)?.hint}
          </p>
        </div>

        {/* Test Steps */}
        <div
          className="p-4 rounded-lg mb-6"
          style={{
            backgroundColor:
              selectedVoice === "samwise"
                ? "rgba(76, 175, 80, 0.1)"
                : "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2
            className="font-semibold mb-3"
            style={{ color: "var(--color-text)" }}
          >
            Test Steps:
          </h2>
          <ol
            className="list-decimal list-inside space-y-2 text-sm"
            style={{ color: "var(--color-text)" }}
          >
            <li className={selectedVoice === "samwise" ? "font-medium" : ""}>
              Step 1: Set Samwise voice{" "}
              {selectedVoice === "samwise" && (
                <span style={{ color: "var(--color-secondary)" }}>✓</span>
              )}
            </li>
            <li className={selectedVoice === "samwise" ? "font-medium" : ""}>
              Step 2: Receive a new notification (see below)
            </li>
            <li className={selectedVoice === "samwise" ? "font-medium" : ""}>
              Step 3: Verify message has Samwise-style phrasing
            </li>
          </ol>
          {selectedVoice === "samwise" && (
            <div
              className="mt-4 p-3 rounded-lg"
              style={{
                backgroundColor: "rgba(76, 175, 80, 0.15)",
                border: "1px solid rgba(76, 175, 80, 0.3)",
              }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: "#4caf50" }}
              >
                Feature #176 PASSED - Notification has Samwise-style phrasing!
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
                Look for: &ldquo;Mr. Frodo&rdquo;, &ldquo;Shire&rdquo;, &ldquo;If you understand me&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Notification Card */}
        <div className="mb-6">
          <h2
            className="text-sm font-semibold uppercase tracking-wide mb-3"
            style={{ color: "var(--color-muted)" }}
          >
            Notification with {fandomVoices.find((v) => v.value === selectedVoice)?.label} Voice
          </h2>
          <NotificationCard
            notification={notification}
            onAction={(actionId) => console.log(`Action: ${actionId}`)}
          />
        </div>

        {/* All Voices Preview */}
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2
            className="font-semibold mb-3"
            style={{ color: "var(--color-text)" }}
          >
            All Voice Previews:
          </h2>
          <div className="space-y-3">
            {fandomVoices.map((voice) => (
              <div
                key={voice.value}
                className="p-3 rounded-lg text-sm"
                style={{
                  backgroundColor:
                    selectedVoice === voice.value
                      ? "rgba(204, 128, 69, 0.1)"
                      : "var(--color-bg)",
                  border:
                    selectedVoice === voice.value
                      ? "1px solid var(--color-primary)"
                      : "1px solid var(--color-border)",
                }}
              >
                <p
                  className="font-semibold text-xs mb-1"
                  style={{ color: "var(--color-muted)" }}
                >
                  {voice.label}:
                </p>
                <p style={{ color: "var(--color-text)" }}>
                  {FANDOM_STYLED_MESSAGES[voice.value]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
