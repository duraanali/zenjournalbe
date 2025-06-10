import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import bcrypt from "bcryptjs";

export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new ConvexError("User already exists");
    }

    // Create user (password is already hashed)
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: args.password,
      created_at: Date.now(),
    });

    return { userId };
  },
});

export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return user;
  },
});

export const getUserById = query({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) {
      throw new ConvexError("User not found");
    }
    return user;
  },
});

export const login = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new ConvexError("Invalid credentials");
    }

    // Return user with consistent ID format
    return {
      user: {
        id: user._id.toString(), // Convert ID to string
        name: user.name,
        email: user.email,
        password: user.password,
      },
    };
  },
});

export const verifyToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const decoded = jwt.verify(args.token, JWT_SECRET);
      const user = await ctx.db.get(decoded.userId);

      if (!user) {
        throw new ConvexError("User not found");
      }

      return {
        userId: user._id,
        name: user.name,
        email: user.email,
      };
    } catch (error) {
      throw new ConvexError("Invalid token");
    }
  },
});
