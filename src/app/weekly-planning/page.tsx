export default function WeeklyPlanningPage() {
  return (
    <div
      className="flex min-h-[calc(100vh-120px)] flex-col font-sans"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4">
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
            Weekly Planning
          </h1>
          <p style={{ color: "var(--color-muted)" }}>
            Plan your meals for the week ahead.
          </p>
          <p className="mt-4 text-sm" style={{ color: "var(--color-muted)" }}>
            Coming soon...
          </p>
        </div>
      </main>
    </div>
  );
}
