# Auto-Resize Textarea

Text inputs that grow with content, up to a max height. Used for chat inputs.

## Pattern

Use a ref and adjust `style.height` based on `scrollHeight`.

```tsx
const textareaRef = useRef<HTMLTextAreaElement>(null);

const LINE_HEIGHT = 24;
const MAX_HEIGHT = LINE_HEIGHT * 4; // 4 lines max

const adjustHeight = useCallback(() => {
  const textarea = textareaRef.current;
  if (!textarea) return;

  textarea.style.height = 'auto';
  textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT)}px`;
}, []);

useEffect(() => {
  adjustHeight();
}, [value, adjustHeight]);
```

## Key Points

- Reset to `'auto'` first, then set to `scrollHeight`
- Cap at `MAX_HEIGHT` to prevent infinite growth
- Trigger on value change via `useEffect`

## Examples

- `src/components/meal-helper/ChatInput.tsx`
- `src/components/weekly-planning/PlanningChatInput.tsx`
