# Grocery List

## Overview

A shared, real-time grocery list organized by **the store you typically buy each item at** (Meijer, Costco, Aldi, Trader Joe's). Supports text and voice input, with organic guardrails that flag items needing organic versions. Checked items move to the bottom and can be unchecked to "repurchase."

## User Flows

- Add item via text input or voice
- Check off item → slides to bottom of list
- Uncheck item from bottom → moves back to active list
- View list → items grouped by store
- Organic items display a badge (leaf icon)
- Manage stores → add, rename, or remove
- View item sources → see which meals an item is for

## Design Decisions

- **Store-first organization:** Items grouped by where you buy them, not category
- **Drag-and-drop:** Primary method for assigning items to stores
- **Checked items persist:** Stay visible 24 hours before disappearing
- **Organic badges:** Visual indicator for Dirty Dozen items

## Data Used

**Entities:** GroceryItem, Store

**From global model:** HouseholdMember (for real-time sync attribution)

## Components Provided

- `GroceryList` — Main list view with store filtering and grouping
- `GroceryListItem` — Individual item with checkbox, edit, delete

## Callback Props

| Callback | Description |
|----------|-------------|
| `onAddItem` | Add new item to a specific store |
| `onToggleCheck` | Mark item as checked/unchecked |
| `onEditItem` | Update item name, quantity, or store |
| `onDeleteItem` | Remove item from list |
| `onReorderItems` | Reorder items within a store |
| `onMoveToStore` | Move item to different store |
