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

// GET /api/moods/[id]
export async function GET(request, { params }) {
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

    // Fetch all moods for the user and find the one with the given id
    const userId = decoded.userId;
    const moods = await convex.query("moods:getMoods", { userId });
    const moodLog = moods.find((m) => String(m._id) === String(params.id));
    if (!moodLog) {
      return NextResponse.json({ error: "Mood not found" }, { status: 404 });
    }
    if (String(moodLog.user_id) !== String(decoded.userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(moodLog);
  } catch (error) {
    console.error("Get mood error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/moods/[id]
export async function DELETE(request, { params }) {
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

    // Fetch all moods for the user and find the one with the given id
    const userId = decoded.userId;
    const moods = await convex.query("moods:getMoods", { userId });
    const moodLog = moods.find((m) => String(m._id) === String(params.id));
    if (!moodLog) {
      return NextResponse.json({ error: "Mood not found" }, { status: 404 });
    }
    if (String(moodLog.user_id) !== String(decoded.userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await convex.mutation("moods:deleteMood", { id: params.id });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete mood error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
