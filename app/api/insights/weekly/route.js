import { NextResponse } from "next/server";
import { ConvexClient } from "convex/browser";
import jwt from "jsonwebtoken";

const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) throw new Error("Convex URL is not set!");
const convex = new ConvexClient(convexUrl);
const JWT_SECRET = "zenjournal-secure-jwt-secret-key-2024";

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

    // Use moods:getWeeklyInsights query
    const insights = await convex.query("moods:getWeeklyInsights", {
      userId: decoded.userId,
    });

    // Return only the insights object as the top-level response
    return NextResponse.json(insights);
  } catch (error) {
    console.error("Get insights error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
