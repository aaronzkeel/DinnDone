"use client";

import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

export default function TestOpenRouter() {
  const testConnection = useAction(api.ai.testConnection);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    model?: string;
    responsePreview?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await testConnection();
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "var(--color-bg)" }}>
      <div
        className="max-w-2xl mx-auto rounded-lg p-8"
        style={{
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h1
          className="text-2xl font-semibold font-heading mb-6"
          style={{ color: "var(--color-text)" }}
        >
          OpenRouter API Test
        </h1>

        <p className="mb-6" style={{ color: "var(--color-muted)" }}>
          This page tests the connection to OpenRouter using the configured API key
          and verifies that Gemini 3 Flash responds correctly.
        </p>

        <button
          onClick={handleTest}
          disabled={loading}
          className="px-6 py-3 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: loading ? "var(--color-muted)" : "var(--color-secondary)",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Testing..." : "Test OpenRouter Connection"}
        </button>

        {error && (
          <div
            className="mt-6 p-4 rounded-lg"
            style={{
              backgroundColor: "rgba(185, 74, 52, 0.1)",
              border: "1px solid var(--color-danger)",
            }}
          >
            <p className="font-medium" style={{ color: "var(--color-danger)" }}>
              Error
            </p>
            <p style={{ color: "var(--color-text)" }}>{error}</p>
          </div>
        )}

        {result && (
          <div
            className="mt-6 p-4 rounded-lg"
            style={{
              backgroundColor: result.success
                ? "rgba(79, 110, 68, 0.1)"
                : "rgba(185, 74, 52, 0.1)",
              border: `1px solid ${result.success ? "var(--color-secondary)" : "var(--color-danger)"}`,
            }}
          >
            <p
              className="font-medium mb-2"
              style={{
                color: result.success ? "var(--color-secondary)" : "var(--color-danger)",
              }}
            >
              {result.success ? "Success!" : "Failed"}
            </p>
            <p className="mb-2" style={{ color: "var(--color-text)" }}>
              <strong>Message:</strong> {result.message}
            </p>
            {result.model && (
              <p className="mb-2" style={{ color: "var(--color-text)" }}>
                <strong>Model:</strong> {result.model}
              </p>
            )}
            {result.responsePreview && (
              <div>
                <p className="font-medium mb-1" style={{ color: "var(--color-text)" }}>
                  AI Response:
                </p>
                <p
                  className="p-3 rounded"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    color: "var(--color-text)",
                  }}
                >
                  {result.responsePreview}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
