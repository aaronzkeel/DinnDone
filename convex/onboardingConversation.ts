import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";


// Extracted insights validator
const extractedInsightsValidator = v.object({
  householdMembers: v.optional(
    v.array(
      v.object({
        name: v.string(),
        role: v.optional(v.string()),
        age: v.optional(v.number()),
        dietaryNotes: v.optional(v.string()),
      })
    )
  ),
  dietaryRestrictions: v.optional(v.array(v.string())),
  healthConditions: v.optional(v.array(v.string())),
  foodValues: v.optional(v.array(v.string())),
  stores: v.optional(v.array(v.string())),
  cookingNotes: v.optional(v.string()),
});

/**
 * Get current onboarding conversation for user
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Get the most recent conversation (in-progress or completed)
    const conversation = await ctx.db
      .query("onboardingConversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    return conversation;
  },
});

/**
 * Get in-progress conversation (if any)
 */
export const getInProgress = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const conversation = await ctx.db
      .query("onboardingConversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "in-progress"))
      .first();

    return conversation;
  },
});

/**
 * Start a new onboarding conversation
 */
export const start = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to start onboarding conversation");
    }

    const now = new Date().toISOString();

    // Mark any existing in-progress conversations as abandoned
    const existing = await ctx.db
      .query("onboardingConversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "in-progress"))
      .collect();

    for (const conv of existing) {
      await ctx.db.patch(conv._id, { status: "abandoned" });
    }

    // Create new conversation
    const conversationId = await ctx.db.insert("onboardingConversations", {
      userId,
      status: "in-progress",
      messages: [],
      startedAt: now,
    });

    return conversationId;
  },
});

/**
 * Add a message to the conversation
 */
export const addMessage = mutation({
  args: {
    conversationId: v.id("onboardingConversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to add message");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (conversation.userId !== userId) {
      throw new Error("Not authorized to modify this conversation");
    }

    if (conversation.status !== "in-progress") {
      throw new Error("Cannot add messages to completed conversation");
    }

    const now = new Date().toISOString();
    const newMessage = {
      role: args.role,
      content: args.content,
      timestamp: now,
    };

    await ctx.db.patch(args.conversationId, {
      messages: [...conversation.messages, newMessage],
    });

    return newMessage;
  },
});

/**
 * Update conversation status (for extraction phase)
 */
export const updateStatus = mutation({
  args: {
    conversationId: v.id("onboardingConversations"),
    status: v.union(
      v.literal("in-progress"),
      v.literal("extracting"),
      v.literal("completed"),
      v.literal("abandoned")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to update conversation");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (conversation.userId !== userId) {
      throw new Error("Not authorized to modify this conversation");
    }

    const updates: Record<string, unknown> = { status: args.status };

    if (args.status === "completed") {
      updates.completedAt = new Date().toISOString();
    }

    await ctx.db.patch(args.conversationId, updates);
  },
});

/**
 * Store extracted insights from AI
 */
export const storeExtractedInsights = mutation({
  args: {
    conversationId: v.id("onboardingConversations"),
    insights: extractedInsightsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to store insights");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (conversation.userId !== userId) {
      throw new Error("Not authorized to modify this conversation");
    }

    await ctx.db.patch(args.conversationId, {
      extractedInsights: args.insights,
      status: "completed",
      completedAt: new Date().toISOString(),
    });
  },
});

/**
 * Get conversation message count (for tracking progress)
 */
export const getMessageCount = query({
  args: {
    conversationId: v.id("onboardingConversations"),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return 0;
    }

    return conversation.messages.length;
  },
});
