# Notifications

## Overview

The Notifications section is the Gentle Nudge system — purposeful, actionable notifications that respect your mental load. Every notification has a clear "why" and a 1-click action. The tab shows notification history and settings, including the Crisis Day Mute toggle.

## Notification Types

| Type | Timing | Description |
|------|--------|-------------|
| Daily Brief | 7:00 AM | Tonight's meal, who's cooking, shopping status |
| Strategic Pivot | 4:00 PM | Check if plans changed, store stop needed |
| Thaw Guardian | 7:30 PM | Reminder to thaw tomorrow's protein |
| Weekly Plan Ready | Sunday PM | Zylo drafted next week's plan |
| Inventory SOS | On demand | Crowdsource pantry check |
| Leftover Check-In | Next day noon | Proactive leftover reminder |
| Cook Reminder | 7:30 PM / 7:00 AM | Heads-up for assigned cook |

## User Flows

### Respond to Notification
- From lock screen or in-app: tap action button
- Actions update status and may trigger follow-up

### Crisis Day Mute
- Toggle at top of Notifications tab
- Silences ALL notifications for 24 hours
- Auto-disables after 24 hours

### Configure Preferences
- Toggle each notification type on/off
- Set quiet hours
- Choose Fandom Voice for playful flavor

## Design Decisions

- **No ghost pings:** Every notification has purpose and action
- **1-click resolution:** Handle most nudges without opening full app
- **Varied icon colors:** Quick visual distinction between types
- **Fandom Voice:** Optional playful quotes (Samwise, Nacho Libre, etc.)

## Data Used

**Entities:** Notification, NotificationPreferences, CrisisDayMute

**From global model:** HouseholdMember for per-user preferences

## Components Provided

- `NotificationsList` — Main list view with history
- `NotificationCard` — Individual notification with actions
- `CrisisMuteBanner` — Mute toggle with countdown
- `NotificationSettings` — Preferences toggles
- `NotificationPreview` — Preview wrapper

## Callback Props

| Callback | Description |
|----------|-------------|
| `onNotificationAction` | Handle action button tap |
| `onDismissNotification` | Dismiss notification |
| `onToggleCrisisDayMute` | Enable/disable 24-hour mute |
| `onToggleNotificationType` | Enable/disable specific type |
| `onSelectFandomVoice` | Choose notification voice |
