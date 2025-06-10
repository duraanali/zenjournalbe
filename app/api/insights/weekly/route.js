import { NextResponse } from "next/server";
import { ConvexClient } from "convex/browser";
import jwt from "jsonwebtoken";

const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL);
const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to verify JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// GET /api/insights/weekly
export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const moods = await convex.query("moods:getByUserAndDate", {
      userId: decoded.userId,
      startDate: oneWeekAgo,
    });

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

    return NextResponse.json({
      mostCommonMood,
      daysLogged: moods.length,
      moodDistribution,
    });
  } catch (error) {
    console.error("Get insights error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
