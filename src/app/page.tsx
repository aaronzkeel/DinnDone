import { SignInButton } from "@/components/SignInButton";

export default function Home() {
  return (
    <div
      className="flex min-h-[calc(100vh-120px)] flex-col font-sans"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Main content */}
      <main className="flex flex-1 items-center justify-center px-4">
        <div
          className="w-full max-w-md rounded-lg p-8 text-center"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h1
            className="text-3xl font-semibold tracking-tight font-heading mb-4"
            style={{ color: "var(--color-text)" }}
          >
            Welcome to Dinner Bell
          </h1>
          <p className="text-lg mb-8" style={{ color: "var(--color-muted)" }}>
            Your AI-powered meal planning companion
          </p>
          <SignInButton />
        </div>
      </main>
    </div>
  );
}
