# Test Instructions: Notifications

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup.

## Overview

The Notifications section is the Gentle Nudge system. Key functionality includes viewing notification history, responding with 1-click actions, Crisis Day Mute, and configuring preferences.

---

## User Flow Tests

### Flow 1: Respond to Notification

**Scenario:** User confirms a Daily Brief notification

**Setup:**
- Notification exists with type "daily-brief"
- Status is "pending"
- Actions: "Looks good" (primary), "Adjust" (secondary)

**Steps:**
1. User opens Notifications tab
2. User sees notification card with "Tonight: Sheet Pan Salmon..."
3. User taps "Looks good" button

**Expected Results:**
- [ ] Notification status changes to "done"
- [ ] Checkmark appears with "Looks good" as resolved action
- [ ] Action buttons disappear
- [ ] Card styling changes to indicate resolved

---

### Flow 2: Enable Crisis Day Mute

**Scenario:** User needs to silence all notifications

**Setup:**
- Crisis Day Mute is currently off
- Banner shows toggle in "off" state

**Steps:**
1. User taps Crisis Day Mute toggle
2. User sees confirmation or toggle activates

**Expected Results:**
- [ ] Toggle shows "on" state
- [ ] Banner displays: "Crisis Day Mute active — notifications paused until [time]"
- [ ] Countdown timer visible (24 hours)
- [ ] Notification list may appear dimmed

---

### Flow 3: Disable Crisis Day Mute Early

**Scenario:** User wants to resume notifications before 24 hours

**Setup:**
- Crisis Day Mute is active
- 12 hours remaining

**Steps:**
1. User taps active Crisis Day Mute toggle
2. User confirms disable (if confirmation required)

**Expected Results:**
- [ ] Toggle shows "off" state
- [ ] Banner returns to normal
- [ ] Notifications resume immediately

---

### Flow 4: Configure Notification Preferences

**Scenario:** User disables Leftover Check-In notifications

**Setup:**
- Settings view is open
- All notification types are enabled

**Steps:**
1. User finds "Leftover Check-In" toggle
2. User taps to disable

**Expected Results:**
- [ ] Toggle shows disabled state
- [ ] Preference is saved
- [ ] Future leftover notifications won't be sent

---

### Flow 5: Choose Fandom Voice

**Scenario:** User selects Samwise voice

**Setup:**
- Settings view is open
- Current voice is "Default"

**Steps:**
1. User finds Fandom Voice selector
2. User selects "Samwise"

**Expected Results:**
- [ ] Samwise option shows selected
- [ ] Preference is saved
- [ ] Future notifications use Samwise-flavored text

---

## Empty State Tests

### No Notifications Yet

**Scenario:** User opens Notifications with no history

**Setup:**
- Notifications array is empty (`[]`)

**Expected Results:**
- [ ] Message: "No notifications yet" or "All caught up!"
- [ ] Crisis Day Mute toggle still visible and functional
- [ ] Settings icon still accessible
- [ ] No blank screen — helpful guidance displayed

### All Notifications Resolved

**Scenario:** All notifications are marked done

**Setup:**
- 5 notifications exist, all with status "done"

**Expected Results:**
- [ ] All cards show resolved styling
- [ ] Optional: "All caught up!" message at top
- [ ] No pending action buttons visible

---

## Component Interaction Tests

### NotificationCard

**Renders correctly:**
- [ ] Shows type icon (sun for daily-brief, snowflake for thaw-guardian)
- [ ] Shows message text
- [ ] Shows relative timestamp ("2h ago", "Yesterday")
- [ ] Shows action buttons if status is "pending"
- [ ] Shows checkmark and resolved action if status is "done"

**User interactions:**
- [ ] Tapping primary action calls `onNotificationAction` with action id
- [ ] Tapping secondary action calls `onNotificationAction`

### CrisisMuteBanner

**Renders correctly (inactive):**
- [ ] Shows "Crisis Day Mute" label
- [ ] Toggle in "off" position
- [ ] No countdown visible

**Renders correctly (active):**
- [ ] Toggle in "on" position
- [ ] Shows countdown: "Paused until 8:00 PM tomorrow"
- [ ] Visual indicator (dimmed or highlighted)

**User interactions:**
- [ ] Tapping toggle calls `onToggleCrisisDayMute`

### NotificationSettings

**Renders correctly:**
- [ ] Toggle for each notification type
- [ ] Quiet hours picker
- [ ] Fandom Voice selector
- [ ] Current selections reflected

**User interactions:**
- [ ] Toggling type calls `onToggleNotificationType`
- [ ] Selecting voice calls `onSelectFandomVoice`

---

## Notification Type Tests

Test each notification type renders correctly:

- [ ] **Daily Brief:** Sun icon, yellow background
- [ ] **Strategic Pivot:** Clock icon, blue background
- [ ] **Thaw Guardian:** Snowflake icon, cyan background
- [ ] **Weekly Plan Ready:** Calendar icon, purple background
- [ ] **Inventory SOS:** Alert icon, orange background
- [ ] **Leftover Check:** Utensils icon, lime background
- [ ] **Cook Reminder:** Chef hat icon, amber background

---

## Edge Cases

- [ ] Handles notification with very long message (truncation or wrapping)
- [ ] Works with 1 notification and 50+ notifications
- [ ] Crisis Day Mute countdown handles timezone correctly
- [ ] Quiet hours respect user's local timezone
- [ ] Fandom Voice affects new notifications, not existing ones

---

## Accessibility Checks

- [ ] Action buttons are keyboard accessible
- [ ] Toggle switches have proper aria-pressed state
- [ ] Screen reader announces notification content
- [ ] Focus management when notification is resolved
- [ ] Color is not the only indicator of notification type (icons also used)

---

## Sample Test Data

```typescript
const mockNotifications = [
  {
    id: 'notif-1',
    type: 'daily-brief',
    message: "Tonight: Sheet Pan Salmon (Aaron cooking). All ingredients on hand!",
    timestamp: '2024-01-15T07:00:00Z',
    status: 'pending',
    actions: [
      { id: 'confirm', label: 'Looks good', isPrimary: true },
      { id: 'adjust', label: 'Adjust', isPrimary: false },
    ],
  },
  {
    id: 'notif-2',
    type: 'thaw-guardian',
    message: "Friendly reminder: move chicken to fridge tonight.",
    timestamp: '2024-01-14T19:30:00Z',
    status: 'done',
    actions: [],
    resolvedAt: '2024-01-14T19:35:00Z',
    resolvedAction: 'Done',
  },
]

const mockEmptyNotifications = []

const mockPreferences = {
  userId: 'hm-001',
  enabledTypes: ['daily-brief', 'thaw-guardian', 'cook-reminder'],
  quietHoursStart: '21:00',
  quietHoursEnd: '07:00',
  fandomVoice: 'default',
  pushEnabled: true,
}

const mockCrisisMute = {
  isActive: false,
}

const mockCrisisMuteActive = {
  isActive: true,
  expiresAt: '2024-01-16T19:30:00Z',
}
```
