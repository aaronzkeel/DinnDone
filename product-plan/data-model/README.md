# Data Model

## Core Entities

### HouseholdMember
A person in the household with their dietary preferences and role (cook, eater, or both). The Zink household has 5 members: Aaron, Katie, Lizzie, Ethan, and Elijah.

**Fields:** id, name, isAdmin, avatarUrl, dietaryPreferences

### WeekPlan
A 7-day meal plan covering a specific week. Has a status (draft, approved, in-progress, completed) and can be planned multiple weeks ahead.

**Fields:** id, weekStart, status, meals

### Meal (PlannedMeal)
A planned meal on a specific date within a WeekPlan. Includes effort tier, prep/cook time, cleanup rating, assigned cook, and which household members are eating.

**Fields:** id, date, dayOfWeek, name, effortTier, prepTime, cookTime, cleanupRating, cook, eaters, ingredients, steps

### Recipe
A reusable meal template with ingredients, instructions, and flex-meal compatibility (vegetarian base with optional protein add-on). Includes realistic time estimates and effort tier.

**Fields:** id, name, effortTier, prepTime, cookTime, cleanupRating, ingredients, steps, isFlexMeal

### GroceryItem
An item on the shared shopping list. Includes category (Produce, Dairy, etc.), quantity, organic flag, and checked status.

**Fields:** id, name, quantity, store, category, isOrganic, isChecked, linkedMeals

### Store
A shopping location where items are typically purchased.

**Fields:** id, name, color

### PantryItem
Something currently in the house — fridge, freezer, or pantry. Used for inventory-first conversations and pantry audits before finalizing grocery lists.

**Fields:** id, name, location, quantity

### Notification
Individual nudges sent to users with actions and status tracking.

**Fields:** id, type, message, timestamp, status, actions, resolvedAt, resolvedAction

### NotificationPreferences
Per-user settings for which notifications to receive.

**Fields:** userId, enabledTypes, quietHoursStart, quietHoursEnd, fandomVoice, pushEnabled

## Relationships

- WeekPlan has many Meals
- Meal belongs to a WeekPlan
- Meal may reference a Recipe (or be a custom one-off)
- Meal has an assigned cook (HouseholdMember)
- Meal has many eaters (HouseholdMembers eating that night)
- Recipe lists many GroceryItems as ingredients
- WeekPlan generates GroceryItems for the shopping list
- HouseholdMember has NotificationPreferences
- GroceryItem belongs to a Store

## Admin vs Regular Users

| Capability | Admin (Aaron, Katie) | Regular (Kids) |
|------------|---------------------|----------------|
| View weekly plan | Yes | Yes |
| Swap meals | Yes | Yes |
| Reassign cook | Yes | No |
| Toggle who's eating | Yes | Own only |
| Approve plan | Yes | No |
| Send Inventory SOS | Yes | No |
| Configure notifications | Yes | Yes |
