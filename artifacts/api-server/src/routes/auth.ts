import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, studentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import * as bcryptjs from "bcryptjs";
import { logger } from "../lib/logger";

const router = Router();

const loginAttempts = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;

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
  if (attempt.count >= RATE_LIMIT_ATTEMPTS) return false;
  attempt.count++;
  return true;
}

router.post("/auth/login", async (req, res) => {
  try {
    const clientIp = (req.headers["x-forwarded-for"] as string) || req.ip || "unknown";
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ error: "Too many login attempts. Please try again later." });
    }

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const sanitizedUsername = String(username).trim().toLowerCase().slice(0, 100);
    const sanitizedPassword = String(password).slice(0, 128);

    if (sanitizedUsername.length < 3 || sanitizedPassword.length < 4) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const users = await db.select().from(usersTable).where(eq(usersTable.username, sanitizedUsername)).limit(1);
    const user = users[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const passwordMatch = await bcryptjs.compare(sanitizedPassword, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    loginAttempts.delete(clientIp);

    const role = user.role.toLowerCase();

    let studentId: string | undefined;
    if (role === "student") {
      const students = await db.select().from(studentsTable).where(eq(studentsTable.userId, user.id)).limit(1);
      studentId = students[0]?.id;
    }

    res.setHeader("Set-Cookie", [
      `ra_role=${role}; Path=/; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`,
      `ra_user_id=${user.id}; Path=/; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`,
    ]);

    return res.json({
      success: true,
      role,
      userId: user.id,
      username: user.username,
      ...(studentId && { studentId }),
    });
  } catch (err) {
    logger.error({ err }, "Login error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", (req, res) => {
  res.setHeader("Set-Cookie", [
    "ra_role=; Path=/; Max-Age=0",
    "ra_user_id=; Path=/; Max-Age=0",
  ]);
  return res.json({ success: true });
});

export default router;
