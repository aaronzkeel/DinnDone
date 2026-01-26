# Date Handling

Store dates as ISO strings (`YYYY-MM-DD`). **Avoid `toISOString()`** — it converts to UTC and causes day-shift bugs.

## The Bug

A user in EST sees Monday. `toISOString()` converts to UTC, which might be Tuesday. The meal shows on the wrong day.

## Correct Pattern

Format dates manually in local timezone:

```ts
// BAD - causes timezone bugs
const dateStr = date.toISOString().split("T")[0];

// GOOD - stays in user's local timezone
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, "0");
const day = String(date.getDate()).padStart(2, "0");
const dateStr = `${year}-${month}-${day}`;
```

## Parsing Dates

When parsing date strings, add a time to avoid timezone shift:

```ts
// BAD - can shift to previous day
const date = new Date("2025-01-15");

// GOOD - noon prevents day shift
const date = new Date("2025-01-15T12:00:00");
```
