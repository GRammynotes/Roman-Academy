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

router.post("/auth/login", async (req: any, res) => {
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

    req.session.userId = user.id;
    req.session.role = role;
    req.session.username = user.username;

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

router.post("/auth/logout", (req: any, res) => {
  req.session.destroy((err: any) => {
    if (err) {
      logger.error({ err }, "Session destroy error");
    }
    res.clearCookie("ra_session");
    return res.json({ success: true });
  });
});

router.get("/auth/me", (req: any, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  return res.json({
    userId: req.session.userId,
    role: req.session.role,
    username: req.session.username,
  });
});

router.get("/auth/teacher-access", async (req: any, res) => {
  try {
    const expected = process.env.TEACHER_MAGIC_TOKEN;
    if (!expected) {
      logger.warn("TEACHER_MAGIC_TOKEN env var is not set — teacher-access route is disabled");
      return res.status(503).json({ error: "Teacher access link is not configured. Contact the administrator." });
    }
    const { token } = req.query;
    if (!token || token !== expected) {
      return res.status(403).json({ error: "Invalid or missing access token" });
    }
    const users = await db.select().from(usersTable)
      .where(eq(usersTable.username, "roman_sir")).limit(1);
    const user = users[0];
    if (!user) return res.status(404).json({ error: "Teacher account not found" });

    req.session.userId = user.id;
    req.session.role = "teacher";
    req.session.username = user.username;
    return res.json({ success: true, role: "teacher" });
  } catch (err) {
    logger.error({ err }, "Teacher access error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/change-password", async (req: any, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const users = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
    const user = users[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.isDemo) {
      return res.status(403).json({ error: "Demo account — password changes are disabled." });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are required" });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    const match = await bcryptjs.compare(String(currentPassword), user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const newHash = await bcryptjs.hash(String(newPassword), 10);
    await db.update(usersTable)
      .set({ passwordHash: newHash, firstLogin: false, updatedAt: new Date() })
      .where(eq(usersTable.id, user.id));

    return res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Change password error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
