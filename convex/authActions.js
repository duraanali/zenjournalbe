import { action } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";
import { ConvexError } from "convex/values";

export const registerUser = action({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Starting registration for:", args.email);

      // Check if user exists
      const existingUser = await ctx.runQuery("auth:getUserByEmail", {
        email: args.email,
      });

      if (existingUser) {
        console.log("User already exists:", args.email);
        throw new ConvexError("User already exists");
      }

      console.log("Hashing password...");
      const hashedPassword = await bcrypt.hash(args.password, 10);
      console.log("Password hashed successfully");

      const result = await ctx.runMutation("auth:register", {
        name: args.name,
        email: args.email,
        password: hashedPassword,
      });

      console.log("User registered successfully:", result);
      return result;
    } catch (error) {
      console.error("Registration error details:", {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name,
      });
      throw new ConvexError(error.message || "Registration failed");
    }
  },
});

export const loginUser = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Starting login process for:", args.email);

      // Get user from database
      const user = await ctx.runQuery("auth:getUserByEmail", {
        email: args.email,
      });

      console.log("User found:", user ? "yes" : "no");
      if (!user) {
        throw new ConvexError("User not found");
      }

      console.log("Comparing passwords...");
      // Compare passwords
      const validPassword = await bcrypt.compare(args.password, user.password);
      console.log("Password valid:", validPassword);

      if (!validPassword) {
        throw new ConvexError("Invalid password");
      }

      // Return user data without password
      const response = {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      };

      console.log("Login successful for user:", user.email);
      return response;
    } catch (error) {
      console.error("Login error details:", {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name,
      });
      throw new ConvexError(error.message || "Authentication failed");
    }
  },
});
