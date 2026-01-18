Database and Offline Strategy Architecture
Primary Database Selection: Convex
The project will use Convex as the primary backend-as-a-service (BaaS). This decision is driven by the requirement for sub-50ms latency for real-time interactions—specifically to ensure the "wow factor" during live line-running cues and scene transitions. The development workflow will leverage the Convex MCP for autonomous coding agents to ensure high-velocity building and end-to-end TypeScript safety.

Version 1.0 Milestone: The initial launch will be strictly Online Only. Offline capabilities are reserved for future iterations (Version 2.0+).

Simple Offline Options for Future Implementation
When the project expands to include offline support (e.g., grocery store navigation for meal planning or rehearsing in low-connectivity areas), the following simple strategies should be prioritized over complex CRDT implementations like Automerge.

1. TanStack Query Persistence
This is the recommended path for seamless background caching. It works by "dehydrating" the current state of the app and saving it to a local storage engine.

Pros: It provides a seamless user experience where data is "just there" even without a connection. It integrates natively with the data-fetching patterns used in modern web apps. It handles cache invalidation and refetching automatically once the connection is restored.

Cons: There is a slight initial setup overhead to configure the persister. It requires careful management of "stale" data to ensure the user isn't looking at very old lists.

2. localForage
A simple asynchronous storage library that improves upon the standard browser LocalStorage by using IndexedDB under the hood.

Pros: It is extremely simple for AI agents to implement using a "Set/Get" pattern. It can store much larger amounts of data (up to the device's disk limit) compared to LocalStorage. It is perfect for "locking" a specific dataset, such as a grocery list, for offline viewing.

Cons: It requires manual logic to determine when to save and when to load data. It does not have built-in "sync" logic; the developer must manually handle pushing changes back to Convex when the device reconnects.

3. Browser LocalStorage
The most basic key-value storage available in all browsers.

Pros: It requires zero dependencies and has zero configuration. It is the fastest possible way to save small bits of text or user preferences.

Cons: It is limited to approximately 5MB of data. It is synchronous, which can theoretically cause UI "jank" if used for very large datasets. It cannot store complex data types without manual JSON stringifying.

Integration Guidelines for AI Agent
When building features, prioritize the Convex TypeScript-first approach. Ensure all mutations and queries are defined within the convex/ directory. For Version 1.0, any offline-related errors should be handled via standard "Retry" or "Offline" UI components without attempting local data persistence.