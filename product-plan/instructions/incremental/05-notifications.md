# Milestone 5: Notifications

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Goal

Implement the Notifications feature — the Gentle Nudge system with purposeful, actionable notifications that respect mental load.

## Overview

The Notifications section is the Gentle Nudge system. Every notification has a clear "why" and a 1-click action. The tab shows notification history and settings, including the Crisis Day Mute toggle.

**Key Functionality:**
- View notification history (last 7 days)
- Respond to notifications with 1-click actions
- Configure which notification types to receive
- Crisis Day Mute to silence all notifications for 24 hours
- Fandom Voice for playful notification flavor
- PWA push notification support

## Notification Types

| Type | Timing | Description |
|------|--------|-------------|
| Daily Brief | 7:00 AM | Tonight's meal, who's cooking, shopping status |
| Strategic Pivot | 4:00 PM | Check if plans changed, store stop needed |
| Thaw Guardian | 7:30 PM | Reminder to thaw tomorrow's protein |
| Weekly Plan Ready | Sunday PM | Zylo drafted next week's plan |
| Inventory SOS | On demand | Crowdsource pantry check |
| Leftover Check-In | Next day noon | Proactive leftover reminder |
| Cook Reminder (Evening) | 7:30 PM | Heads-up for tomorrow's cook |
| Cook Reminder (Morning) | 7:00 AM | Morning confirmation for today's cook |

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/notifications/tests.md` for detailed test-writing instructions including:
- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `product-plan/sections/notifications/components/`:

- `NotificationsView` — Main view with history and Crisis Day Mute
- `NotificationCard` — Individual notification with actions
- `NotificationSettings` — Preferences toggles
- `CrisisDayMute` — Mute toggle with countdown
- `FandomVoiceSelector` — Voice preference picker

### Data Layer

The components expect these data shapes:

```typescript
interface Notification {
  id: string
  type: NotificationType
  message: string
  timestamp: string
  status: 'pending' | 'done' | 'dismissed'
  actions: NotificationAction[]
  resolvedAt?: string
  resolvedAction?: string
}

interface NotificationPreferences {
  userId: string
  enabledTypes: NotificationType[]
  quietHoursStart: string
  quietHoursEnd: string
  fandomVoice: FandomVoice
  pushEnabled: boolean
}
```

You'll need to:
- Notification scheduling and delivery service
- Push notification infrastructure (Web Push API, service worker)
- Per-user preference storage
- Crisis Day Mute state management
- Notification action handling

### Callbacks

Wire up these user actions:

| Callback | Description |
|----------|-------------|
| `onNotificationAction` | Handle action button tap |
| `onDismissNotification` | Dismiss notification |
| `onToggleCrisisDayMute` | Enable/disable 24-hour mute |
| `onToggleNotificationType` | Enable/disable specific type |
| `onSetQuietHours` | Configure quiet hours |
| `onSelectFandomVoice` | Choose notification voice |
| `onEnablePush` | Request push permission |

### Empty States

Implement empty state UI for when no records exist yet:

- **No notifications yet:** Show message that notifications will appear here
- **All notifications resolved:** Show "All caught up!" state
- **Push not supported:** Show fallback explanation

## Files to Reference

- `product-plan/sections/notifications/README.md` — Feature overview and design intent
- `product-plan/sections/notifications/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/notifications/components/` — React components
- `product-plan/sections/notifications/types.ts` — TypeScript interfaces
- `product-plan/sections/notifications/sample-data.json` — Test data
- `product-plan/sections/notifications/screenshot.png` — Visual reference

## Expected User Flows

### Flow 1: Respond to Notification

1. User receives push notification (or opens Notifications tab)
2. User sees notification with action buttons
3. User taps an action button (e.g., "Looks good")
4. **Outcome:** Notification marked as resolved, checkmark appears

### Flow 2: Enable Crisis Day Mute

1. User opens Notifications tab
2. User taps Crisis Day Mute toggle
3. **Outcome:** All notifications paused for 24 hours, countdown displays

### Flow 3: Configure Notification Preferences

1. User taps settings icon in Notifications tab
2. User sees toggles for each notification type
3. User disables "Leftover Check-In"
4. **Outcome:** Preference saved, no more leftover notifications

### Flow 4: Choose Fandom Voice

1. User opens notification settings
2. User selects "Samwise" from Fandom Voice options
3. **Outcome:** Future notifications use Samwise-flavored text

## PWA Push Notification Implementation

**Requirements:**
- Web Push API with service worker
- iOS Safari 16.4+ and Android Chrome support
- Permission request flow during onboarding
- Notification actions (inline buttons)
- Badge count on app icon

**Platform Notes:**
- iOS requires Add to Home Screen for push
- Android works in browser and installed PWA
- Desktop has full notification support

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Notification history displays correctly
- [ ] Action buttons work and update status
- [ ] Crisis Day Mute works for 24 hours
- [ ] Notification preferences are saved
- [ ] Fandom Voice changes notification text
- [ ] Push notifications work (iOS, Android, Desktop)
- [ ] Empty states display properly
- [ ] Matches the visual design
- [ ] Responsive on mobile
