# Application Shell

## Overview

DinnDone uses a mobile-first shell with a minimal header and bottom tab bar navigation. The design prioritizes low-stimulation, thumb-friendly interaction for exhausted caregivers using the app on their phones.

## Navigation Structure

| Tab | Route | Icon |
|-----|-------|------|
| Grocery List | `/grocery-list` | list |
| Meal Helper | `/meal-helper` | message-circle (Default/Home) |
| Weekly Planning | `/weekly-planning` | calendar |
| Notifications | `/notifications` | bell |

## Layout Pattern

- **Header:** Minimal top bar with app name/logo (left) and user avatar (right)
- **Content:** Full-height scrollable area between header and tab bar
- **Tab Bar:** Fixed bottom navigation with 4 tabs

## Responsive Behavior

- **Mobile (< 640px):** Full-width layout, tabs with icon + label stacked vertically
- **Tablet (640px - 1024px):** Centered content with max-width, tabs remain at bottom
- **Desktop (> 1024px):** Centered content (max-width 768px), bottom tabs preserved for PWA consistency

## Components Provided

- `AppShell` — Main layout wrapper with header, content area, and tab bar
- `MainNav` — Bottom tab bar navigation
- `UserMenu` — User avatar dropdown with settings and logout

## Callback Props

| Callback | Description |
|----------|-------------|
| `onNavigate` | Called when user taps a navigation tab |
| `onOpenSettings` | Called when user taps Settings in menu |
| `onLogout` | Called when user taps Logout |

## Design Notes

- **Color palette:** Amber (primary), lime (secondary), stone (neutral)
- **Typography:** Plus Jakarta Sans for all text
- **Low-stimulation:** Subtle borders, generous whitespace, warm backgrounds
- **Active states:** Amber accent for active tab and interactive elements
- **Dark mode:** Full support with `dark:` variants
