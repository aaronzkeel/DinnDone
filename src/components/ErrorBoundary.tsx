"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error);
    console.error("Component stack:", errorInfo.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            backgroundColor: "var(--color-bg)",
          }}
        >
          <div
            style={{
              maxWidth: "400px",
              width: "100%",
              padding: "2rem",
              borderRadius: "12px",
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "var(--color-text)",
                marginBottom: "0.75rem",
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1rem",
                color: "var(--color-muted)",
                marginBottom: "1.5rem",
                lineHeight: 1.5,
              }}
            >
              We hit an unexpected error. Please try again, and if the problem
              persists, refresh the page.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1rem",
                fontWeight: 500,
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "var(--color-secondary)",
                color: "#ffffff",
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
