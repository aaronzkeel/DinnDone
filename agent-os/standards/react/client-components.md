# Client Components

Add `"use client"` at the top of components that use browser features.

```tsx
"use client";

import { useState } from "react";

export function MyButton() {
  const [clicked, setClicked] = useState(false);
  return <button onClick={() => setClicked(true)}>Click me</button>;
}
```

## When to Add

Add `"use client"` when the component uses:
- `useState`, `useEffect`, `useRef`
- `onClick`, `onChange`, or any event handlers
- Browser APIs (`window`, `document`, `localStorage`)

## When NOT to Add

Skip it for components that only:
- Display static content
- Receive data via props and render it
- Don't respond to user interaction
