import { NextResponse } from "next/server";
import { ConvexClient } from "convex/browser";
import jwt from "jsonwebtoken";

const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL);
const JWT_SECRET = "zenjournal-secure-jwt-secret-key-2024";

// Helper function to verify JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// GET /api/moods
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

    // Pass userId as string
    const userId = decoded.userId;

    const moods = await convex.query("moods:getMoods", {
      userId,
    });

    return NextResponse.json(moods);
  } catch (error) {
    console.error("Get moods error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/moods
export async function POST(request) {
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

    const { mood, note } = await request.json();

    if (!mood) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Pass userId as string
    const userId = decoded.userId;

    const moodLog = await convex.mutation("moods:createMood", {
      userId,
      mood,
      note,
    });

    return NextResponse.json(moodLog, { status: 201 });
  } catch (error) {
    console.error("Create mood error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/moods?id=<moodId>
export async function DELETE(request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing mood id" }, { status: 400 });
    }

    // Fetch the mood log to check ownership
    const moodLog = await convex.query("moods:getMood", { id });
    if (!moodLog) {
      return NextResponse.json({ error: "Mood not found" }, { status: 404 });
    }
    if (String(moodLog.user_id) !== String(decoded.userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await convex.mutation("moods:deleteMood", { id });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete mood error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
