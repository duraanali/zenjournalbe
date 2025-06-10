import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

console.log("Journals Convex file loaded");

export const getJournals = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const journals = await ctx.db
      .query("journal_entries")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .order("desc")
      .collect();

    return journals;
  },
});

export const getJournal = query({
  args: {
    id: v.id("journal_entries"),
  },
  handler: async (ctx, args) => {
    const journal = await ctx.db.get(args.id);
    if (!journal) {
      throw new ConvexError("Journal entry not found");
    }
    return journal;
  },
});

export const createJournal = mutation({
  args: {
    userId: v.id("users"),
    text: v.string(),
    mood: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const journalId = await ctx.db.insert("journal_entries", {
      user_id: args.userId,
      text: args.text,
      mood: args.mood,
      tags: args.tags || [],
      created_at: Date.now(),
    });

    return await ctx.db.get(journalId);
  },
});

export const updateJournal = mutation({
  args: {
    id: v.id("journal_entries"),
    text: v.optional(v.string()),
    mood: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const journal = await ctx.db.get(args.id);
    if (!journal) {
      throw new ConvexError("Journal entry not found");
    }

    await ctx.db.patch(args.id, {
      text: args.text ?? journal.text,
      mood: args.mood ?? journal.mood,
      tags: args.tags ?? journal.tags,
      updated_at: Date.now(),
    });

    return await ctx.db.get(args.id);
  },
});

export const deleteJournal = mutation({
  args: {
    id: v.id("journal_entries"),
  },
  handler: async (ctx, args) => {
    const journal = await ctx.db.get(args.id);
    if (!journal) {
      throw new ConvexError("Journal entry not found");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});
