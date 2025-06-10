import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

export const getMoods = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const moods = await ctx.db
      .query("mood_logs")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .order("desc")
      .collect();

    return moods;
  },
});

export const createMood = mutation({
  args: {
    userId: v.id("users"),
    mood: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const moodId = await ctx.db.insert("mood_logs", {
      user_id: args.userId,
      mood: args.mood,
      note: args.note,
      created_at: Date.now(),
    });

    return await ctx.db.get(moodId);
  },
});

export const getWeeklyInsights = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    let moods = await ctx.db
      .query("mood_logs")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .filter((q) => q.gte(q.field("created_at"), oneWeekAgo))
      .collect();

    // Debug: log all moods and their timestamps
    console.log(
      "Weekly moods for user",
      args.userId,
      moods.map((m) => ({ mood: m.mood, created_at: m.created_at }))
    );

    // If no moods in the last week, return all moods for debugging
    let allMoods = [];
    if (moods.length === 0) {
      allMoods = await ctx.db
        .query("mood_logs")
        .withIndex("by_user", (q) => q.eq("user_id", args.userId))
        .order("desc")
        .collect();
      console.log(
        "All moods for user",
        args.userId,
        allMoods.map((m) => ({ mood: m.mood, created_at: m.created_at }))
      );
    }

    // Calculate mood distribution
    const moodDistribution = {};
    let mostCommonMood = null;
    let maxCount = 0;

    moods.forEach((mood) => {
      moodDistribution[mood.mood] = (moodDistribution[mood.mood] || 0) + 1;
      if (moodDistribution[mood.mood] > maxCount) {
        maxCount = moodDistribution[mood.mood];
        mostCommonMood = mood.mood;
      }
    });

    return {
      mostCommonMood,
      daysLogged: moods.length,
      moodDistribution,
      allMoods, // for debugging
    };
  },
});

// Add deleteMood mutation
export const deleteMood = mutation({
  args: {
    id: v.id("mood_logs"),
  },
  handler: async (ctx, args) => {
    const mood = await ctx.db.get(args.id);
    if (!mood) {
      throw new ConvexError("Mood not found");
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
