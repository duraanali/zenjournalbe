import { NextResponse } from "next/server";
import { ConvexClient } from "convex/browser";
import jwt from "jsonwebtoken";
import { v } from "convex/values";

const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL);
const JWT_SECRET = "zenjournal-secure-jwt-secret-key-2024";

console.log("Journals API route file loaded");

// Helper function to verify JWT
const verifyToken = (token) => {
  try {
    console.log("Verifying token...");
    console.log("JWT_SECRET in journals route:", JWT_SECRET);
    console.log("Token to verify:", token);

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token verified successfully. Decoded payload:", decoded);
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    return null;
  }
};

// GET /api/journals
export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    console.log("Auth header:", authHeader);

    const token = authHeader?.split(" ")[1];
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

    const journals = await convex.query("journals:getJournals", {
      userId,
    });

    return NextResponse.json(journals);
  } catch (error) {
    console.error("Get journals error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/journals
export async function POST(request) {
  console.log("POST /api/journals called");
  try {
    const authHeader = request.headers.get("authorization");
    console.log("Auth header:", authHeader);

    const token = authHeader?.split(" ")[1];
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

    const { text, mood, tags } = await request.json();

    if (!text || !mood) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Pass userId as string
    const userId = decoded.userId;

    const journal = await convex.mutation("journals:createJournal", {
      userId,
      text,
      mood,
      tags: tags || [],
    });

    return NextResponse.json(journal, { status: 201 });
  } catch (error) {
    console.error("Create journal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
