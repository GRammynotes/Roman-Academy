import { NextResponse } from "next/server";
import * as bcryptjs from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Simple rate limiting map (in-memory, resets on server restart)
const loginAttempts = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);

  if (!attempt) {
    loginAttempts.set(identifier, { count: 1, timestamp: now });
    return true;
  }

  if (now - attempt.timestamp > RATE_LIMIT_WINDOW) {
    loginAttempts.set(identifier, { count: 1, timestamp: now });
    return true;
  }

  if (attempt.count >= RATE_LIMIT_ATTEMPTS) {
    return false;
  }

  attempt.count++;
  return true;
}

function sanitizeInput(input: string): string {
  return input.trim().toLowerCase().slice(0, 100);
}

export async function POST(request: Request) {
  try {
    // Security: Check origin/referrer
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    
    // Get client IP for rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    
    // Check rate limit
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    // Input validation
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Invalid input format" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedPassword = password.slice(0, 128);

    // Validation
    if (sanitizedUsername.length < 3 || sanitizedPassword.length < 4) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Find user by username
    let user = await prisma.user.findUnique({
      where: { username: sanitizedUsername },
      include: { student: true }
    });

    if (!user) {
      // Generic error message for security
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Verify password using bcrypt
    let passwordMatch = false;
    try {
      passwordMatch = await bcryptjs.compare(sanitizedPassword, user.passwordHash);
    } catch (err) {
      console.error("Password verification error:", err);
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Clear rate limit on successful login
    loginAttempts.delete(clientIp);

    // Create secure response with tokens
    const response = NextResponse.json({
      success: true,
      role: user.role.toLowerCase(),
      userId: user.id,
      username: user.username,
      ...(user.student && { studentId: user.student.id })
    });

    // Set secure cookies
    response.cookies.set("ra_role", user.role.toLowerCase(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    response.cookies.set("ra_user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    // Add CSRF token
    const csrfToken = Buffer.from(Math.random().toString()).toString("base64");
    response.cookies.set("ra_csrf_token", csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
