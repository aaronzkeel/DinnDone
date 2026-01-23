import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Check if an item with the same name already exists (case-insensitive)
export const findDuplicate = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const normalizedName = args.name.toLowerCase().trim();
    const items = await ctx.db.query("groceryItems").collect();

    // Find active (unchecked) items with matching name
    const duplicate = items.find(
      (item) => item.name.toLowerCase().trim() === normalizedName && !item.isChecked
    );

    if (duplicate) {
      return {
        exists: true,
        item: {
          id: duplicate._id,
          name: duplicate.name,
          quantity: duplicate.quantity,
          storeId: duplicate.storeId,
        },
      };
    }

    return { exists: false, item: null };
  },
});

// Merge quantity with existing item (for duplicate handling)
export const mergeQuantity = mutation({
  args: {
    id: v.id("groceryItems"),
    additionalQuantity: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");

    // Simple merge: append the additional quantity info
    const currentQty = item.quantity || "";
    const newQty = args.additionalQuantity || "";

    // If both have quantities, combine them
    let mergedQuantity = currentQty;
    if (newQty && newQty !== "1") {
      if (currentQty && currentQty !== "1") {
        mergedQuantity = `${currentQty} + ${newQty}`;
      } else {
        mergedQuantity = newQty;
      }
    }

    await ctx.db.patch(args.id, { quantity: mergedQuantity });
    return await ctx.db.get(args.id);
  },
});

// List all grocery items, ordered by sortOrder within each store
export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("groceryItems").collect();
    // Sort items by sortOrder (nulls go to end)
    return items.sort((a, b) => {
      const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  },
});

// List all grocery items with linked meal details (name, date)
export const listWithMealDetails = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("groceryItems").collect();

    // Gather all unique meal IDs from all items
    const allMealIds = new Set<string>();
    for (const item of items) {
      if (item.linkedMealIds) {
        for (const mealId of item.linkedMealIds) {
          allMealIds.add(mealId);
        }
      }
    }

    // Fetch all linked meals in one batch
    const mealMap = new Map<
      string,
      { name: string; date: string }
    >();
    for (const mealId of allMealIds) {
      const meal = await ctx.db.get(mealId as unknown as import("./_generated/dataModel").Id<"plannedMeals">);
      if (meal) {
        mealMap.set(mealId, { name: meal.name, date: meal.date });
      }
    }

    // Enhance items with meal details
    const enhancedItems = items.map((item) => {
      const mealSources = (item.linkedMealIds || [])
        .map((mealId) => {
          const mealInfo = mealMap.get(mealId);
          if (mealInfo) {
            return {
              mealId,
              mealName: mealInfo.name,
              date: mealInfo.date,
            };
          }
          return null;
        })
        .filter((source): source is NonNullable<typeof source> => source !== null);

      return {
        ...item,
        mealSources,
      };
    });

    // Sort items by sortOrder (nulls go to end)
    return enhancedItems.sort((a, b) => {
      const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  },
});

// List grocery items by store
export const listByStore = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("groceryItems")
      .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
      .collect();
  },
});

// List grocery items by week plan
export const listByWeekPlan = query({
  args: { weekPlanId: v.id("weekPlans") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("groceryItems")
      .withIndex("by_week_plan", (q) => q.eq("weekPlanId", args.weekPlanId))
      .collect();
  },
});

// Add a new grocery item
export const add = mutation({
  args: {
    name: v.string(),
    quantity: v.optional(v.string()),
    storeId: v.optional(v.id("stores")), // undefined = unassigned
    category: v.string(),
    isOrganic: v.boolean(),
    linkedMealIds: v.optional(v.array(v.id("plannedMeals"))),
    weekPlanId: v.optional(v.id("weekPlans")),
  },
  handler: async (ctx, args) => {
    let maxOrder = 0;

    // Get existing items to determine sortOrder
    if (args.storeId) {
      const storeItems = await ctx.db
        .query("groceryItems")
        .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
        .collect();

      maxOrder = storeItems.reduce((max, item) => {
        const order = item.sortOrder ?? 0;
        return order > max ? order : max;
      }, 0);
    } else {
      // For unassigned items, get all items with no store
      const unassignedItems = await ctx.db
        .query("groceryItems")
        .filter((q) => q.eq(q.field("storeId"), undefined))
        .collect();

      maxOrder = unassignedItems.reduce((max, item) => {
        const order = item.sortOrder ?? 0;
        return order > max ? order : max;
      }, 0);
    }

    return await ctx.db.insert("groceryItems", {
      ...args,
      isChecked: false,
      sortOrder: maxOrder + 1000,
    });
  },
});

// Toggle checked status
export const toggleChecked = mutation({
  args: { id: v.id("groceryItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");

    await ctx.db.patch(args.id, { isChecked: !item.isChecked });
    return { isChecked: !item.isChecked };
  },
});

// Update a grocery item
export const update = mutation({
  args: {
    id: v.id("groceryItems"),
    name: v.optional(v.string()),
    quantity: v.optional(v.string()),
    storeId: v.optional(v.id("stores")),
    category: v.optional(v.string()),
    isOrganic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(filteredUpdates).length > 0) {
      await ctx.db.patch(id, filteredUpdates);
    }
    return await ctx.db.get(id);
  },
});

// Delete a grocery item
export const remove = mutation({
  args: { id: v.id("groceryItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Remove grocery items by name (case-insensitive, for pantry feature)
// Returns count of items removed
export const removeByName = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const normalizedName = args.name.toLowerCase().trim();
    const items = await ctx.db.query("groceryItems").collect();

    // Find unchecked items with matching name
    const matchingItems = items.filter(
      (item) => item.name.toLowerCase().trim() === normalizedName && !item.isChecked
    );

    for (const item of matchingItems) {
      await ctx.db.delete(item._id);
    }

    return { removedCount: matchingItems.length };
  },
});

// Delete all checked items
export const clearChecked = mutation({
  args: {},
  handler: async (ctx) => {
    const checkedItems = await ctx.db
      .query("groceryItems")
      .withIndex("by_checked", (q) => q.eq("isChecked", true))
      .collect();

    for (const item of checkedItems) {
      await ctx.db.delete(item._id);
    }

    return { deletedCount: checkedItems.length };
  },
});

// Reorder an item within a store (or move to a different store)
// storeId: specific store ID to move to, null = move to unassigned, undefined = keep current
// beforeId: the item this should appear before (null = move to end of store)
export const reorder = mutation({
  args: {
    id: v.id("groceryItems"),
    storeId: v.optional(v.union(v.id("stores"), v.null())),
    beforeId: v.optional(v.union(v.id("groceryItems"), v.null())),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");

    // Determine the target store:
    // - If storeId is provided (including null), use it
    // - If storeId is undefined, keep current store
    const targetStoreId =
      args.storeId === undefined ? item.storeId : args.storeId ?? undefined;

    // Get all items in the target store, sorted by sortOrder
    let storeItems;
    if (targetStoreId) {
      storeItems = await ctx.db
        .query("groceryItems")
        .withIndex("by_store", (q) => q.eq("storeId", targetStoreId))
        .collect();
    } else {
      // Get unassigned items
      storeItems = await ctx.db
        .query("groceryItems")
        .filter((q) => q.eq(q.field("storeId"), undefined))
        .collect();
    }

    // Sort by sortOrder (nulls at end)
    storeItems.sort((a, b) => {
      const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });

    // Remove the item being moved from the list (if it's already in this store)
    const filteredItems = storeItems.filter((i) => i._id !== args.id);

    // Calculate new sortOrder
    let newSortOrder: number;

    if (args.beforeId === null || args.beforeId === undefined) {
      // Move to end of list
      const lastItem = filteredItems[filteredItems.length - 1];
      newSortOrder = lastItem ? (lastItem.sortOrder ?? 0) + 1000 : 1000;
    } else {
      // Insert before the specified item
      const beforeIndex = filteredItems.findIndex((i) => i._id === args.beforeId);
      if (beforeIndex === -1) {
        // beforeId not found, append to end
        const lastItem = filteredItems[filteredItems.length - 1];
        newSortOrder = lastItem ? (lastItem.sortOrder ?? 0) + 1000 : 1000;
      } else if (beforeIndex === 0) {
        // Insert at beginning
        const firstItem = filteredItems[0];
        newSortOrder = (firstItem?.sortOrder ?? 1000) / 2;
      } else {
        // Insert between two items
        const prevItem = filteredItems[beforeIndex - 1];
        const nextItem = filteredItems[beforeIndex];
        const prevOrder = prevItem?.sortOrder ?? 0;
        const nextOrder = nextItem?.sortOrder ?? prevOrder + 2000;
        newSortOrder = (prevOrder + nextOrder) / 2;
      }
    }

    // Update the item with new store and sortOrder
    await ctx.db.patch(args.id, {
      storeId: targetStoreId,
      sortOrder: newSortOrder,
    });

    return await ctx.db.get(args.id);
  },
});

// Link meals to a grocery item
export const linkMeals = mutation({
  args: {
    id: v.id("groceryItems"),
    mealIds: v.array(v.id("plannedMeals")),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");

    // Get existing linked meals and add new ones (avoid duplicates)
    const existingMealIds = item.linkedMealIds || [];
    const newMealIds = [...new Set([...existingMealIds, ...args.mealIds])];

    await ctx.db.patch(args.id, { linkedMealIds: newMealIds });
    return await ctx.db.get(args.id);
  },
});

// Seed test items with linked meals for Feature #38 testing
export const seedLinkedMealItems = mutation({
  args: {},
  handler: async (ctx) => {
    // Get the first store
    const stores = await ctx.db.query("stores").collect();
    if (stores.length === 0) {
      throw new Error("No stores found. Please seed stores first.");
    }
    const storeId = stores[0]._id;

    // Get planned meals
    const meals = await ctx.db.query("plannedMeals").collect();
    if (meals.length === 0) {
      throw new Error("No planned meals found. Please create some meals first.");
    }

    // Create test items linked to meals
    const testItems = [
      {
        name: "Chicken Breast (linked)",
        quantity: "2 lbs",
        category: "Meat",
        isOrganic: false,
        linkedMealIds: [meals[0]._id, meals.length > 1 ? meals[1]._id : meals[0]._id],
      },
      {
        name: "Broccoli (linked)",
        quantity: "2 heads",
        category: "Produce",
        isOrganic: true,
        linkedMealIds: [meals[0]._id],
      },
      {
        name: "Soy Sauce (linked)",
        quantity: "1 bottle",
        category: "Pantry",
        isOrganic: false,
        linkedMealIds: meals.length > 2 ? [meals[0]._id, meals[1]._id, meals[2]._id] : [meals[0]._id],
      },
    ];

    // Get max sortOrder
    const existingItems = await ctx.db
      .query("groceryItems")
      .withIndex("by_store", (q) => q.eq("storeId", storeId))
      .collect();
    const maxOrder = existingItems.reduce((max, item) => {
      const order = item.sortOrder ?? 0;
      return order > max ? order : max;
    }, 0);

    const createdIds = [];
    for (let i = 0; i < testItems.length; i++) {
      const item = testItems[i];
      const id = await ctx.db.insert("groceryItems", {
        ...item,
        storeId,
        isChecked: false,
        sortOrder: maxOrder + (i + 1) * 1000,
      });
      createdIds.push(id);
    }

    return { created: createdIds.length, ids: createdIds };
  },
});
