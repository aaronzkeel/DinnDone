"use client";

export interface QuickAction {
  id: string;
  label: string;
  variant?: "primary" | "secondary" | "outline";
}

export interface QuickActionButtonsProps {
  /** Actions to display as buttons */
  actions: QuickAction[];
  /** Called when an action is tapped */
  onAction: (actionId: string) => void;
  /** Whether the buttons are disabled */
  disabled?: boolean;
}

export function QuickActionButtons({
  actions,
  onAction,
  disabled = false,
}: QuickActionButtonsProps) {
  if (actions.length === 0) return null;

  const getButtonStyles = (variant: QuickAction["variant"] = "outline") => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: "var(--color-secondary)",
          color: "white",
          border: "none",
        };
      case "secondary":
        return {
          backgroundColor: "var(--color-primary)",
          color: "white",
          border: "none",
        };
      case "outline":
      default:
        return {
          backgroundColor: "transparent",
          color: "var(--color-text)",
          border: "1px solid var(--color-border)",
        };
    }
  };

  return (
    <div className="flex flex-wrap gap-2 px-4 pt-3 pb-6">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          disabled={disabled}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={getButtonStyles(action.variant)}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
