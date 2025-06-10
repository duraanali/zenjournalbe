import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Initialize Convex client
const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL);

// Auth functions
export const register = async (name, email, password) => {
  try {
    const result = await convex.mutation(api.auth.register, {
      name,
      email,
      password,
    });
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const login = async (email, password) => {
  try {
    const result = await convex.mutation(api.auth.login, {
      email,
      password,
    });
    // Store token in localStorage
    localStorage.setItem("token", result.token);
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Journal functions
export const getJournals = async (userId) => {
  try {
    return await convex.query(api.journals.getJournals, { userId });
  } catch (error) {
    throw new Error(error.message);
  }
};

export const createJournal = async (userId, text, mood, tags) => {
  try {
    return await convex.mutation(api.journals.createJournal, {
      userId,
      text,
      mood,
      tags,
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateJournal = async (id, updates) => {
  try {
    return await convex.mutation(api.journals.updateJournal, {
      id,
      ...updates,
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteJournal = async (id) => {
  try {
    return await convex.mutation(api.journals.deleteJournal, { id });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Mood functions
export const getMoods = async (userId) => {
  try {
    return await convex.query(api.moods.getMoods, { userId });
  } catch (error) {
    throw new Error(error.message);
  }
};

export const createMood = async (userId, mood, note) => {
  try {
    return await convex.mutation(api.moods.createMood, {
      userId,
      mood,
      note,
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getWeeklyInsights = async (userId) => {
  try {
    return await convex.query(api.moods.getWeeklyInsights, { userId });
  } catch (error) {
    throw new Error(error.message);
  }
};
