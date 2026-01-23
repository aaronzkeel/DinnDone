"use client";

import { useRef, useEffect, useCallback, type ReactNode } from "react";
import { X } from "lucide-react";

export interface PlanningDrawerProps {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Called when the drawer should close */
  onClose: () => void;
  /** Title shown in the drawer header */
  title?: string;
  /** Content to render inside the drawer */
  children: ReactNode;
}

export function PlanningDrawer({
  isOpen,
  onClose,
  title = "Plan with Zylo",
  children,
}: PlanningDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Get all focusable elements within the drawer
  const getFocusableElements = useCallback(() => {
    if (!drawerRef.current) return [];
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(
      drawerRef.current.querySelectorAll<HTMLElement>(focusableSelector)
    ).filter((el) => !el.hasAttribute("disabled"));
  }, []);

  // Focus trap handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab") {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [getFocusableElements, onClose]
  );

  // Set up focus trap and initial focus
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  // Use CSS variable for bottom nav height (defined in globals.css)
  const navHeight = "var(--bottom-nav-total)";

  return (
    <>
      {/* Backdrop - covers full screen including behind nav */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer container - stops at top of bottom nav, click to close */}
      <div
        className="fixed inset-x-0 top-0 z-50 flex items-end justify-center"
        style={{ bottom: navHeight }}
        onClick={onClose}
      >
        {/* Drawer panel - uses 100% of container (which stops at nav) */}
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="planning-drawer-title"
          className="relative w-full max-w-lg rounded-3xl flex flex-col animate-slide-up"
          style={{
            backgroundColor: "var(--color-card)",
            height: "75%",
            maxHeight: "75%",
            marginBottom: "8px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
        {/* Drag handle indicator */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ backgroundColor: "var(--color-border)" }}
          />
        </div>

        {/* Header */}
        <div
          className="px-4 py-2 flex items-center justify-between"
          style={{
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <h2
            id="planning-drawer-title"
            className="text-lg font-bold font-heading"
            style={{ color: "var(--color-text)" }}
          >
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1 rounded-lg hover:opacity-80 transition-colors"
            aria-label="Close drawer"
          >
            <X size={20} style={{ color: "var(--color-muted)" }} />
          </button>
        </div>

        {/* Content area with flex-grow */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
      </div>
    </>
  );
}
