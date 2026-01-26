# Page Structure

Main app pages follow a consistent pattern.

## Protected Pages

Wrap with `RequireAuth` to require login:

```tsx
import { RequireAuth } from "@/components/RequireAuth";

export default function WeeklyPlanningPage() {
  return (
    <RequireAuth>
      <div style={{ backgroundColor: "var(--color-bg)" }}>
        {/* page content */}
      </div>
    </RequireAuth>
  );
}
```

## Common Page Container

```tsx
<div
  className="flex min-h-[calc(100vh-120px)] flex-col font-sans"
  style={{ backgroundColor: "var(--color-bg)" }}
>
  {/* page content */}
</div>
```

- `min-h-[calc(100vh-120px)]` — accounts for header + nav
- `var(--color-bg)` — consistent background color
- `font-sans` — ensures body font is applied

## Loading States

Show a centered spinner while data loads:

```tsx
if (isLoading) {
  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center">
      <div className="animate-pulse" style={{ color: "var(--color-muted)" }}>
        Loading...
      </div>
    </div>
  );
}
```
