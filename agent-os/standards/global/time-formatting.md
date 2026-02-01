# Time Formatting

Convert timestamps to relative time strings ("5m ago", "Just now").

## Pattern

```tsx
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}
```

## Usage

```tsx
<span className="text-sm text-[var(--color-text-secondary)]">
  {formatRelativeTime(message.timestamp)}
</span>
```

## Key Points

- Input is Unix timestamp in milliseconds
- Falls back to formatted date after 7 days
- Keep in a shared utility file: `src/utils/time.ts`

## Examples

- `src/components/meal-helper/ChatMessage.tsx` (lines 5-18)
- `src/components/notifications/NotificationCard.tsx` (lines 46-61)

## TODO

Extract duplicate implementations into `src/utils/time.ts`.
