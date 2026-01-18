"use client";

import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { DarkModeToggle } from "./DarkModeToggle";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="flex items-center justify-between px-4 py-3"
      style={{
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: "var(--color-bg)"
      }}
    >
      {/* App name in Lora font */}
      <span
        className="font-heading text-lg font-semibold"
        style={{ color: "var(--color-text)" }}
      >
        Dinner Bell
      </span>

      {/* Right side: dark mode toggle + user menu */}
      <div className="flex items-center gap-2">
        <DarkModeToggle />

        {/* User avatar/menu when authenticated */}
        {!isLoading && isAuthenticated && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center w-9 h-9 rounded-full cursor-pointer transition-all"
              style={{
                backgroundColor: "var(--color-secondary)",
                color: "white"
              }}
              aria-label="User menu"
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              {/* User icon */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-40 rounded-lg shadow-lg py-1 z-50"
                style={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)"
                }}
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    void signOut();
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-sans transition-colors"
                  style={{ color: "var(--color-danger)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-danger-tint)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
