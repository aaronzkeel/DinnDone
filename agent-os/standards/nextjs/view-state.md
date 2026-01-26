# View State Pattern

Complex feature pages manage multiple views internally rather than separate routes.

## Example: Meal Helper (Home page)

```tsx
type ViewState = "home" | "details" | "swap" | "emergency" | "ingredients-check";

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewState>("home");

  // Navigation handlers
  const handleViewMeal = () => setCurrentView("details");
  const handleBack = () => setCurrentView("home");

  // Render based on view
  if (currentView === "details" && tonightMeal) {
    return <MealOptionDetails meal={tonightMeal} onBack={handleBack} />;
  }

  if (currentView === "swap") {
    return <WeekSwapList onBack={handleBack} />;
  }

  return <MealHelperHome /* ... */ />;
}
```

## When to Use

- Multi-step flows that share state (e.g., selected meal, checked ingredients)
- Views that need instant transitions without loading states
- Features where back button should return to previous view, not browser history

## When NOT to Use

- Pages that should be bookmarkable (use real routes)
- Pages that don't share state (use separate routes)
