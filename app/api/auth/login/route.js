import { NextResponse } from "next/server";
import { ConvexClient } from "convex/browser";
import jwt from "jsonwebtoken";

const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL);
const JWT_SECRET = "zenjournal-secure-jwt-secret-key-2024";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    console.log("Login attempt for:", email);

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Call the login action
    const result = await convex.action("authActions:loginUser", {
      email,
      password,
    });

    console.log("Login result:", {
      hasUser: !!result?.user,
    });

    if (!result || !result.user) {
      console.error("Invalid login response:", result);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    // Log the JWT secret
    console.log("JWT_SECRET in login route:", JWT_SECRET);
    // Generate JWT token
    console.log("Generating JWT token with payload:", {
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
    });

    const token = jwt.sign(
      {
        userId: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
        algorithm: "HS256",
      }
    );

    console.log("Generated token:", token);

    // Create response with user data and token
    const response = NextResponse.json({
      user: result.user,
      token,
    });

    // Set the cookie with the JWT token
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    console.log("Login successful, cookie set");
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 401 }
    );
  }
}
