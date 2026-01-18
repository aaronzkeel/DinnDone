"use client";

import { useConvexAuth } from "convex/react";
import { usePathname } from "next/navigation";
import { SignInButton } from "./SignInButton";

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * Wraps protected content and redirects unauthenticated users to sign in.
 * After signing in, users are redirected back to the original page they tried to access.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const pathname = usePathname();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div
        className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center font-sans"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="animate-pulse" style={{ color: "var(--color-muted)" }}>
          Loading...
        </div>
      </div>
    );
  }

  // Show sign-in page for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div
        className="flex min-h-[calc(100vh-120px)] flex-col font-sans"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <main className="flex flex-1 items-center justify-center px-4">
          <div
            className="w-full max-w-md rounded-lg p-8 text-center"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <h1
              className="text-2xl font-semibold tracking-tight font-heading mb-4"
              style={{ color: "var(--color-text)" }}
            >
              Sign in to continue
            </h1>
            <p className="text-base mb-6" style={{ color: "var(--color-muted)" }}>
              You need to sign in to access this page.
            </p>
            <SignInButton />
            {/* Store the return URL for after sign-in */}
            <input type="hidden" id="auth-return-url" value={pathname} />
          </div>
        </main>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}
