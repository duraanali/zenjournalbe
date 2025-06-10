import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    created_at: v.number(),
  }).index("by_email", ["email"]),

  journal_entries: defineTable({
    user_id: v.id("users"),
    mood: v.string(),
    text: v.string(),
    tags: v.optional(v.array(v.string())),
    created_at: v.number(),
    updated_at: v.optional(v.number()),
  }).index("by_user", ["user_id"]),

  mood_logs: defineTable({
    user_id: v.id("users"),
    mood: v.string(),
    note: v.optional(v.string()),
    created_at: v.number(),
  }).index("by_user", ["user_id"]),
});
