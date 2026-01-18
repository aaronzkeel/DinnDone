"use client";

import { useState } from "react";
import { EmergencyExit } from "@/components/meal-helper";

export default function TestEmergencyExitPage() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showScreen, setShowScreen] = useState(true);

  const handleChooseOption = (optionId: string) => {
    setSelectedOption(optionId);
    setShowScreen(false);
  };

  const handleBack = () => {
    setShowScreen(false);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setShowScreen(true);
  };

  if (!showScreen) {
    return (
      <div
        className="min-h-screen p-6"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <h1
          className="text-xl font-bold mb-4 font-heading"
          style={{ color: "var(--color-text)" }}
        >
          Test: Emergency Exit (Feature #71)
        </h1>

        <div
          className="p-4 rounded-lg mb-4"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          {selectedOption ? (
            <>
              <p className="font-semibold" style={{ color: "var(--color-text)" }}>
                Option Selected: <span style={{ color: "var(--color-primary)" }}>{selectedOption}</span>
              </p>
              <p className="text-sm mt-2" style={{ color: "var(--color-muted)" }}>
                The EmergencyExit screen closed after selection.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold" style={{ color: "var(--color-text)" }}>
                Back Button Pressed
              </p>
              <p className="text-sm mt-2" style={{ color: "var(--color-muted)" }}>
                The EmergencyExit screen closed without selection.
              </p>
            </>
          )}
        </div>

        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg text-white font-medium"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          Show Emergency Exit Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        className="p-4 border-b"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
      >
        <h1
          className="font-heading font-bold text-lg"
          style={{ color: "var(--color-text)" }}
        >
          Test: Emergency Exit (Feature #71)
        </h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Verify EmergencyExit screen opens when &quot;I&apos;m wiped&quot; is tapped
        </p>
      </div>
      <EmergencyExit onBack={handleBack} onChooseOption={handleChooseOption} />
    </div>
  );
}
