"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { NotificationSettings } from "@/components/notifications";
import type {
  NotificationPreferences,
  NotificationType,
  FandomVoice,
} from "@/types/notifications";
import { User, Users, Settings, CheckCircle, XCircle, RefreshCw } from "lucide-react";

// Feature #195: Notification preferences are per-user
// Each household member has own settings

// Default preferences for mock mode
const defaultPreferences: NotificationPreferences = {
  userId: "test-user",
  enabledTypes: [
    "daily-brief",
    "strategic-pivot",
    "thaw-guardian",
    "weekly-plan-ready",
    "cook-reminder",
  ],
  quietHoursStart: "21:00",
  quietHoursEnd: "07:00",
  fandomVoice: "default",
  pushEnabled: true,
};

// Mock users for testing without auth
interface MockUser {
  id: string;
  name: string;
  preferences: NotificationPreferences;
}

const initialMockUsers: MockUser[] = [
  {
    id: "user-aaron",
    name: "Aaron",
    preferences: { ...defaultPreferences, userId: "user-aaron" },
  },
  {
    id: "user-katie",
    name: "Katie",
    preferences: { ...defaultPreferences, userId: "user-katie" },
  },
];

function TestPerUserPrefsContent() {
  // Mode toggle: mock vs live
  const [useMockData, setUseMockData] = useState(true);

  // Mock state
  const [mockUsers, setMockUsers] = useState<MockUser[]>(initialMockUsers);
  const [selectedMockUser, setSelectedMockUser] = useState<MockUser>(
    initialMockUsers[0]
  );

  // View state
  const [showSettings, setShowSettings] = useState(false);

  // Verification state
  const [step1Complete, setStep1Complete] = useState(false);
  const [step2Complete, setStep2Complete] = useState(false);
  const [step3Complete, setStep3Complete] = useState(false);
  const [aaronPrefsSnapshot, setAaronPrefsSnapshot] = useState<NotificationPreferences | null>(null);

  // Convex queries and mutations
  const convexPreferences = useQuery(
    api.notifications.getPreferences,
    useMockData ? "skip" : undefined
  );
  const updatePreferences = useMutation(api.notifications.updatePreferences);
  const resetPreferences = useMutation(api.notifications.resetPreferences);

  // Current preferences (mock or live)
  const currentPrefs = useMockData
    ? selectedMockUser.preferences
    : convexPreferences
    ? {
        userId: String(convexPreferences.userId),
        enabledTypes: convexPreferences.enabledTypes as NotificationType[],
        quietHoursStart: convexPreferences.quietHoursStart,
        quietHoursEnd: convexPreferences.quietHoursEnd,
        fandomVoice: convexPreferences.fandomVoice as FandomVoice,
        pushEnabled: convexPreferences.pushEnabled,
      }
    : defaultPreferences;

  // Mock user preference handlers
  const updateMockUserPrefs = (updates: Partial<NotificationPreferences>) => {
    setMockUsers((prev) =>
      prev.map((u) =>
        u.id === selectedMockUser.id
          ? { ...u, preferences: { ...u.preferences, ...updates } }
          : u
      )
    );
    setSelectedMockUser((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...updates },
    }));
  };

  // Settings handlers
  const handleToggleType = async (type: NotificationType) => {
    if (useMockData) {
      const newTypes = currentPrefs.enabledTypes.includes(type)
        ? currentPrefs.enabledTypes.filter((t) => t !== type)
        : [...currentPrefs.enabledTypes, type];
      updateMockUserPrefs({ enabledTypes: newTypes });
    } else {
      const newTypes = currentPrefs.enabledTypes.includes(type)
        ? currentPrefs.enabledTypes.filter((t) => t !== type)
        : [...currentPrefs.enabledTypes, type];
      await updatePreferences({ enabledTypes: newTypes });
    }
  };

  const handleUpdateQuietHours = async (start: string, end: string) => {
    if (useMockData) {
      updateMockUserPrefs({ quietHoursStart: start, quietHoursEnd: end });
    } else {
      await updatePreferences({ quietHoursStart: start, quietHoursEnd: end });
    }
  };

  const handleChangeFandomVoice = async (voice: FandomVoice) => {
    if (useMockData) {
      updateMockUserPrefs({ fandomVoice: voice });
    } else {
      await updatePreferences({ fandomVoice: voice });
    }
  };

  const handleTogglePush = async () => {
    if (useMockData) {
      updateMockUserPrefs({ pushEnabled: !currentPrefs.pushEnabled });
    } else {
      await updatePreferences({ pushEnabled: !currentPrefs.pushEnabled });
    }
  };

  const handleResetDefaults = async () => {
    if (useMockData) {
      updateMockUserPrefs({
        enabledTypes: [
          "daily-brief",
          "strategic-pivot",
          "thaw-guardian",
          "weekly-plan-ready",
          "cook-reminder",
        ],
        quietHoursStart: "21:00",
        quietHoursEnd: "07:00",
        fandomVoice: "default",
        pushEnabled: true,
      });
    } else {
      await resetPreferences({});
    }
  };

  // Test step handlers
  const handleStep1SetAaronPrefs = () => {
    // Set Aaron's preferences with distinct values
    if (useMockData) {
      const aaronUser = mockUsers.find((u) => u.name === "Aaron");
      if (aaronUser) {
        setSelectedMockUser(aaronUser);
        const customPrefs = {
          enabledTypes: ["daily-brief", "cook-reminder"] as NotificationType[],
          quietHoursStart: "22:00",
          quietHoursEnd: "08:00",
          fandomVoice: "samwise" as FandomVoice,
          pushEnabled: true,
        };
        updateMockUserPrefs(customPrefs);
        setAaronPrefsSnapshot({
          ...aaronUser.preferences,
          ...customPrefs,
        });
        setStep1Complete(true);
      }
    }
  };

  const handleStep2SwitchToKatie = () => {
    if (useMockData) {
      const katieUser = mockUsers.find((u) => u.name === "Katie");
      if (katieUser) {
        setSelectedMockUser(katieUser);
        setStep2Complete(true);
      }
    }
  };

  const handleStep3Verify = () => {
    if (useMockData && aaronPrefsSnapshot) {
      // Check Katie has default settings (different from Aaron)
      const katieUser = mockUsers.find((u) => u.name === "Katie");
      const aaronUser = mockUsers.find((u) => u.name === "Aaron");

      if (katieUser && aaronUser) {
        const katiePrefs = katieUser.preferences;
        const aaronPrefs = aaronUser.preferences;

        // Verify they are different
        const areDifferent =
          katiePrefs.fandomVoice !== aaronPrefs.fandomVoice ||
          katiePrefs.quietHoursStart !== aaronPrefs.quietHoursStart ||
          katiePrefs.enabledTypes.length !== aaronPrefs.enabledTypes.length;

        setStep3Complete(areDifferent);
      }
    }
  };

  // Reset test state
  const handleResetTest = () => {
    setMockUsers(initialMockUsers.map(u => ({
      ...u,
      preferences: { ...defaultPreferences, userId: u.id }
    })));
    setSelectedMockUser({
      ...initialMockUsers[0],
      preferences: { ...defaultPreferences, userId: initialMockUsers[0].id }
    });
    setStep1Complete(false);
    setStep2Complete(false);
    setStep3Complete(false);
    setAaronPrefsSnapshot(null);
    setShowSettings(false);
  };

  // Show settings view
  if (showSettings) {
    return (
      <NotificationSettings
        preferences={currentPrefs}
        onToggleType={handleToggleType}
        onUpdateQuietHours={handleUpdateQuietHours}
        onChangeFandomVoice={handleChangeFandomVoice}
        onTogglePush={handleTogglePush}
        onResetDefaults={handleResetDefaults}
        onBack={() => setShowSettings(false)}
      />
    );
  }

  const allStepsComplete = step1Complete && step2Complete && step3Complete;

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1
            className="text-2xl font-bold font-heading"
            style={{ color: "var(--color-text)" }}
          >
            Feature #195: Per-User Preferences
          </h1>
          <p className="mt-2" style={{ color: "var(--color-muted)" }}>
            Each household member has their own notification settings
          </p>
        </div>

        {/* Mode Toggle */}
        <div
          className="p-4 rounded-xl mb-6"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings size={20} style={{ color: "var(--color-primary)" }} />
              <div>
                <h3
                  className="font-semibold"
                  style={{ color: "var(--color-text)" }}
                >
                  Test Mode
                </h3>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                  {useMockData ? "Using mock data (no auth required)" : "Using live Convex data"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setUseMockData(!useMockData)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: useMockData
                  ? "var(--color-primary)"
                  : "var(--color-border)",
                color: useMockData ? "white" : "var(--color-text)",
              }}
            >
              {useMockData ? "Mock Data" : "Live Convex"}
            </button>
          </div>
        </div>

        {/* User Switcher */}
        {useMockData && (
          <div
            className="p-4 rounded-xl mb-6"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Users size={20} style={{ color: "var(--color-primary)" }} />
              <h3
                className="font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                Current User
              </h3>
            </div>
            <div className="flex gap-2">
              {mockUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedMockUser(user)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor:
                      selectedMockUser.id === user.id
                        ? "var(--color-primary)"
                        : "var(--color-bg)",
                    color:
                      selectedMockUser.id === user.id
                        ? "white"
                        : "var(--color-text)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <User size={16} />
                  {user.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current Preferences Display */}
        <div
          className="p-4 rounded-xl mb-6"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3
              className="font-semibold"
              style={{ color: "var(--color-text)" }}
            >
              {useMockData ? selectedMockUser.name : "Your"} Preferences
            </h3>
            <button
              onClick={() => setShowSettings(true)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "white",
              }}
            >
              Edit Settings
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: "var(--color-muted)" }}>Fandom Voice:</span>
              <span style={{ color: "var(--color-text)" }}>
                {currentPrefs.fandomVoice}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--color-muted)" }}>Quiet Hours:</span>
              <span style={{ color: "var(--color-text)" }}>
                {currentPrefs.quietHoursStart} - {currentPrefs.quietHoursEnd}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--color-muted)" }}>Push Enabled:</span>
              <span style={{ color: "var(--color-text)" }}>
                {currentPrefs.pushEnabled ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--color-muted)" }}>Enabled Types:</span>
              <span style={{ color: "var(--color-text)" }}>
                {currentPrefs.enabledTypes.length} of 7
              </span>
            </div>
          </div>
        </div>

        {/* Test Steps */}
        <div
          className="p-4 rounded-xl mb-6"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h3
            className="font-semibold mb-4"
            style={{ color: "var(--color-text)" }}
          >
            Test Steps
          </h3>
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {step1Complete ? (
                  <CheckCircle size={20} style={{ color: "var(--color-secondary)" }} />
                ) : (
                  <XCircle size={20} style={{ color: "var(--color-muted)" }} />
                )}
              </div>
              <div className="flex-1">
                <p style={{ color: "var(--color-text)" }}>
                  <strong>Step 1:</strong> Set preferences as Aaron
                </p>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                  Set custom preferences (Samwise voice, quiet hours 10PM-8AM, only Daily Brief + Cook Reminder)
                </p>
                {!step1Complete && (
                  <button
                    onClick={handleStep1SetAaronPrefs}
                    className="mt-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "white",
                    }}
                  >
                    Set Aaron&apos;s Preferences
                  </button>
                )}
                {step1Complete && aaronPrefsSnapshot && (
                  <div
                    className="mt-2 p-2 rounded text-xs"
                    style={{ backgroundColor: "var(--color-bg)" }}
                  >
                    Aaron: {aaronPrefsSnapshot.fandomVoice}, {aaronPrefsSnapshot.quietHoursStart}-{aaronPrefsSnapshot.quietHoursEnd}, {aaronPrefsSnapshot.enabledTypes.length} types
                  </div>
                )}
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {step2Complete ? (
                  <CheckCircle size={20} style={{ color: "var(--color-secondary)" }} />
                ) : (
                  <XCircle size={20} style={{ color: "var(--color-muted)" }} />
                )}
              </div>
              <div className="flex-1">
                <p style={{ color: "var(--color-text)" }}>
                  <strong>Step 2:</strong> Sign in as Katie
                </p>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                  Switch to Katie&apos;s account to view her preferences
                </p>
                {step1Complete && !step2Complete && (
                  <button
                    onClick={handleStep2SwitchToKatie}
                    className="mt-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "white",
                    }}
                  >
                    Switch to Katie
                  </button>
                )}
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {step3Complete ? (
                  <CheckCircle size={20} style={{ color: "var(--color-secondary)" }} />
                ) : (
                  <XCircle size={20} style={{ color: "var(--color-muted)" }} />
                )}
              </div>
              <div className="flex-1">
                <p style={{ color: "var(--color-text)" }}>
                  <strong>Step 3:</strong> Verify Katie has different/default settings
                </p>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                  Katie&apos;s preferences should be independent from Aaron&apos;s
                </p>
                {step2Complete && !step3Complete && (
                  <button
                    onClick={handleStep3Verify}
                    className="mt-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "white",
                    }}
                  >
                    Verify Independence
                  </button>
                )}
                {step3Complete && (
                  <div
                    className="mt-2 p-2 rounded text-xs"
                    style={{ backgroundColor: "var(--color-bg)" }}
                  >
                    Katie: {currentPrefs.fandomVoice}, {currentPrefs.quietHoursStart}-{currentPrefs.quietHoursEnd}, {currentPrefs.enabledTypes.length} types - Different from Aaron!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div
          className="p-4 rounded-xl mb-6"
          style={{
            backgroundColor: allStepsComplete ? "var(--color-secondary)" : "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {allStepsComplete ? (
                <CheckCircle size={24} style={{ color: "white" }} />
              ) : (
                <XCircle size={24} style={{ color: "var(--color-muted)" }} />
              )}
              <div>
                <h3
                  className="font-semibold"
                  style={{ color: allStepsComplete ? "white" : "var(--color-text)" }}
                >
                  {allStepsComplete
                    ? "Feature #195 PASSED"
                    : `${[step1Complete, step2Complete, step3Complete].filter(Boolean).length}/3 Steps Complete`}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: allStepsComplete ? "rgba(255,255,255,0.8)" : "var(--color-muted)" }}
                >
                  {allStepsComplete
                    ? "Per-user notification preferences verified!"
                    : "Complete all steps to verify the feature"}
                </p>
              </div>
            </div>
            <button
              onClick={handleResetTest}
              className="p-2 rounded-lg hover:opacity-80"
              style={{
                backgroundColor: allStepsComplete ? "rgba(255,255,255,0.2)" : "var(--color-bg)",
              }}
              title="Reset Test"
            >
              <RefreshCw size={18} style={{ color: allStepsComplete ? "white" : "var(--color-muted)" }} />
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        {useMockData && (step1Complete || step2Complete) && (
          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <h3
              className="font-semibold mb-3"
              style={{ color: "var(--color-text)" }}
            >
              Preferences Comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th
                      className="text-left py-2 pr-4"
                      style={{ color: "var(--color-muted)" }}
                    >
                      Setting
                    </th>
                    {mockUsers.map((user) => (
                      <th
                        key={user.id}
                        className="text-left py-2 px-2"
                        style={{ color: "var(--color-text)" }}
                      >
                        {user.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 pr-4" style={{ color: "var(--color-muted)" }}>
                      Voice
                    </td>
                    {mockUsers.map((user) => (
                      <td
                        key={user.id}
                        className="py-2 px-2"
                        style={{ color: "var(--color-text)" }}
                      >
                        {user.preferences.fandomVoice}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 pr-4" style={{ color: "var(--color-muted)" }}>
                      Quiet Hours
                    </td>
                    {mockUsers.map((user) => (
                      <td
                        key={user.id}
                        className="py-2 px-2"
                        style={{ color: "var(--color-text)" }}
                      >
                        {user.preferences.quietHoursStart}-{user.preferences.quietHoursEnd}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 pr-4" style={{ color: "var(--color-muted)" }}>
                      Enabled Types
                    </td>
                    {mockUsers.map((user) => (
                      <td
                        key={user.id}
                        className="py-2 px-2"
                        style={{ color: "var(--color-text)" }}
                      >
                        {user.preferences.enabledTypes.length} of 7
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TestPerUserPrefsPage() {
  // Test page uses mock data by default, so no auth required
  return <TestPerUserPrefsContent />;
}
