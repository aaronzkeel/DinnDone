import { mutation } from "./_generated/server";

/**
 * Admin mutation to reset all data except household members.
 * Use this for fresh start scenarios or testing.
 *
 * Preserves: householdMembers
 * Wipes: stores, weekPlans, plannedMeals, groceryItems, pantryItems, notifications, recipes
 *        notificationPreferences, pushSubscriptions
 */
export const resetAllData = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all records from each table we want to wipe
    const stores = await ctx.db.query("stores").collect();
    const weekPlans = await ctx.db.query("weekPlans").collect();
    const plannedMeals = await ctx.db.query("plannedMeals").collect();
    const groceryItems = await ctx.db.query("groceryItems").collect();
    const pantryItems = await ctx.db.query("pantryItems").collect();
    const notifications = await ctx.db.query("notifications").collect();
    const recipes = await ctx.db.query("recipes").collect();
    const notificationPreferences = await ctx.db.query("notificationPreferences").collect();
    const pushSubscriptions = await ctx.db.query("pushSubscriptions").collect();

    // Delete all records from each table
    for (const store of stores) {
      await ctx.db.delete(store._id);
    }
    for (const weekPlan of weekPlans) {
      await ctx.db.delete(weekPlan._id);
    }
    for (const meal of plannedMeals) {
      await ctx.db.delete(meal._id);
    }
    for (const item of groceryItems) {
      await ctx.db.delete(item._id);
    }
    for (const item of pantryItems) {
      await ctx.db.delete(item._id);
    }
    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }
    for (const recipe of recipes) {
      await ctx.db.delete(recipe._id);
    }
    for (const pref of notificationPreferences) {
      await ctx.db.delete(pref._id);
    }
    for (const sub of pushSubscriptions) {
      await ctx.db.delete(sub._id);
    }

    // Return counts for confirmation
    return {
      deleted: {
        stores: stores.length,
        weekPlans: weekPlans.length,
        plannedMeals: plannedMeals.length,
        groceryItems: groceryItems.length,
        pantryItems: pantryItems.length,
        notifications: notifications.length,
        recipes: recipes.length,
        notificationPreferences: notificationPreferences.length,
        pushSubscriptions: pushSubscriptions.length,
      },
      preserved: {
        householdMembers: "kept",
      },
    };
  },
});
