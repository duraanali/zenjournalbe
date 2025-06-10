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

// GET /api/journals/[id]
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

    const journal = await convex.query("journals:getJournal", {
      id: params.id,
    });

    if (!journal) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    // Compare as string
    if (String(journal.user_id) !== String(decoded.userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(journal);
  } catch (error) {
    console.error("Get journal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/journals/[id]
export async function PUT(request, { params }) {
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

    const journal = await convex.query("journals:getJournal", {
      id: params.id,
    });

    if (!journal) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    // Compare as string
    if (String(journal.user_id) !== String(decoded.userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updates = await request.json();
    const updatedJournal = await convex.mutation("journals:updateJournal", {
      id: params.id,
      ...updates,
      updated_at: Date.now(),
    });

    return NextResponse.json(updatedJournal);
  } catch (error) {
    console.error("Update journal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/journals/[id]
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

    const journal = await convex.query("journals:getJournal", {
      id: params.id,
    });

    if (!journal) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    // Compare as string
    if (String(journal.user_id) !== String(decoded.userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await convex.mutation("journals:deleteJournal", {
      id: params.id,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete journal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
