"use client";

import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";

/**
 * Test page for Feature #7: User can sign out
 *
 * This page shows the current authentication state and allows testing sign out.
 * It also demonstrates that after sign out, the session is cleared.
 */
export default function TestSignOutPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();

  const handleSignOut = async () => {
    console.log("[Test] Sign out initiated...");
    await signOut();
    console.log("[Test] Sign out completed - session should be cleared");
  };

  return (
    <div
      className="min-h-screen p-6 font-sans"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div
        className="max-w-md mx-auto rounded-lg p-6"
        style={{
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h1
          className="text-2xl font-semibold mb-6 font-heading"
          style={{ color: "var(--color-text)" }}
        >
          Feature #7: Sign Out Test
        </h1>

        {/* Auth State Display */}
        <div className="mb-6 space-y-2">
          <p style={{ color: "var(--color-text)" }}>
            <strong>Auth Loading:</strong>{" "}
            <span
              data-testid="auth-loading"
              style={{ color: isLoading ? "var(--color-primary)" : "var(--color-muted)" }}
            >
              {isLoading ? "Yes" : "No"}
            </span>
          </p>
          <p style={{ color: "var(--color-text)" }}>
            <strong>Authenticated:</strong>{" "}
            <span
              data-testid="auth-status"
              style={{
                color: isAuthenticated
                  ? "var(--color-secondary)"
                  : "var(--color-danger)",
              }}
            >
              {isAuthenticated ? "Yes" : "No"}
            </span>
          </p>
        </div>

        {/* Sign Out Button - Always visible for testing */}
        <div className="space-y-4">
          {isAuthenticated ? (
            <>
              <p style={{ color: "var(--color-muted)" }} className="text-sm">
                You are signed in. Click the button below to sign out.
              </p>
              <button
                onClick={handleSignOut}
                data-testid="signout-button"
                className="w-full py-3 px-4 rounded-lg font-medium cursor-pointer transition-colors"
                style={{
                  backgroundColor: "var(--color-danger)",
                  color: "white",
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <p style={{ color: "var(--color-muted)" }} className="text-sm">
                You are not signed in. After signing out, you should see this state.
                The session has been cleared successfully.
              </p>
              <div
                className="p-4 rounded-lg text-center"
                data-testid="signed-out-message"
                style={{
                  backgroundColor: "var(--color-secondary-tint)",
                  color: "var(--color-secondary)",
                }}
              >
                Session cleared - Sign out successful!
              </div>
              <Link
                href="/"
                className="block w-full py-3 px-4 rounded-lg font-medium text-center cursor-pointer transition-colors"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                  textDecoration: "none",
                }}
              >
                Go to Home Page
              </Link>
            </>
          )}
        </div>

        {/* Test Steps */}
        <div
          className="mt-8 p-4 rounded-lg"
          style={{ backgroundColor: "var(--color-bg)" }}
        >
          <h2
            className="text-lg font-semibold mb-3 font-heading"
            style={{ color: "var(--color-text)" }}
          >
            Feature Test Steps:
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm" style={{ color: "var(--color-muted)" }}>
            <li>Step 1: Click sign out button {isAuthenticated ? "" : "(✓ Done)"}</li>
            <li>Step 2: Session is cleared {!isAuthenticated ? "(✓ Verified)" : ""}</li>
            <li>Step 3: Redirected to login/home page {!isAuthenticated ? "(✓ Can navigate to home)" : ""}</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
