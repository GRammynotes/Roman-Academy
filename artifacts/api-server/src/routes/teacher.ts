import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  studentsTable,
  testsTable,
  studentTestResultsTable,
  rankHistoryTable,
  batchesTable,
  studentChaptersTable,
  scheduledTestsTable,
  whatsappDraftsTable,
  aiSettingsTable,
  testChaptersTable,
} from "@workspace/db";
import { eq, and, desc, sql, ilike } from "drizzle-orm";
import * as bcryptjs from "bcryptjs";
import crypto from "crypto";
import { logger } from "../lib/logger";

const router = Router();

function requireRole(allowedRoles: string[]) {
  return (req: any, res: any, next: any) => {
    const role = req.session?.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    req.userRole = role;
    req.userId = req.session.userId;
    next();
  };
}

function usernameFromName(name: string, batchYear: string) {
  const normalized = name.toLowerCase().trim().replace(/\s+/g, ".").replace(/[^a-z.]/g, "");
  return `${normalized}.${batchYear}`;
}

function batchYearFromLabel(batchType: string) {
  const match = batchType.match(/(20\d{2})/);
  return match ? match[1] : "2026";
}

function formatBatchType(classLevel: string, stream: string): string {
  const cl = classLevel === "ELEVEN" || classLevel === "11" ? "11th" : "12th";
  const streamLabel = stream === "COMMERCE_ADDON" ? "Commerce" : stream === "NEET_ADDON" ? "NEET" : "Science";
  return `${cl} ${streamLabel} 2026`;
}

function parseClassLevel(input: string): "ELEVEN" | "TWELVE" {
  if (input === "ELEVEN" || input === "11") return "ELEVEN";
  return "TWELVE";
}

function parseStream(input: string): "SCIENCE_PCM" | "COMMERCE_ADDON" | "NEET_ADDON" {
  if (input === "COMMERCE_ADDON" || input.toLowerCase().includes("commerce")) return "COMMERCE_ADDON";
  if (input === "NEET_ADDON" || input.toLowerCase().includes("neet")) return "NEET_ADDON";
  return "SCIENCE_PCM";
}

router.get("/teacher/dashboard", requireRole(["teacher", "admin"]), async (req: any, res) => {
  try {
    const batchFilter = req.query.batch as string | undefined;

    let studentsQuery = db.select({
      id: studentsTable.id,
      batchType: studentsTable.batchType,
    }).from(studentsTable).where(eq(studentsTable.archived, false));

    const allStudents = await studentsQuery;
    const filtered = batchFilter ? allStudents.filter(s => s.batchType === batchFilter) : allStudents;
    const studentIds = filtered.map(s => s.id);

    let avgScore = 0;
    let lowPerformers = 0;
    let testsCreated = 0;

    if (studentIds.length > 0) {
      const results = await db.select({
        studentId: studentTestResultsTable.studentId,
        percentage: studentTestResultsTable.percentage,
      }).from(studentTestResultsTable)
        .where(sql`${studentTestResultsTable.studentId} = ANY(ARRAY[${sql.join(studentIds.map(id => sql`${id}`), sql`, `)}]::text[])`);

      if (results.length > 0) {
        const grouped: Record<string, number[]> = {};
        for (const r of results) {
          if (!grouped[r.studentId]) grouped[r.studentId] = [];
          grouped[r.studentId].push(r.percentage);
        }
        const avgs = Object.values(grouped).map(scores => scores.reduce((a, b) => a + b, 0) / scores.length);
        avgScore = Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length);
        lowPerformers = avgs.filter(a => a < 65).length;
      }

      const testCount = await db.select({ count: sql<number>`count(distinct ${studentTestResultsTable.testId})` })
        .from(studentTestResultsTable)
        .where(sql`${studentTestResultsTable.studentId} = ANY(ARRAY[${sql.join(studentIds.map(id => sql`${id}`), sql`, `)}]::text[])`);
      testsCreated = testCount[0]?.count ?? 0;
    }

    const recentActivity = await db.select({
      fullName: studentsTable.fullName,
      percentage: studentTestResultsTable.percentage,
      createdAt: studentTestResultsTable.createdAt,
    }).from(studentTestResultsTable)
      .innerJoin(studentsTable, eq(studentTestResultsTable.studentId, studentsTable.id))
      .orderBy(desc(studentTestResultsTable.createdAt))
      .limit(5);

    const allPercentages = studentIds.length > 0
      ? (await db.select({ percentage: studentTestResultsTable.percentage })
          .from(studentTestResultsTable)
          .where(sql`${studentTestResultsTable.studentId} = ANY(ARRAY[${sql.join(studentIds.map(id => sql`${id}`), sql`, `)}]::text[])`))
          .map(r => r.percentage)
      : [];

    const scoreDistribution = [
      { band: "90-100%", count: allPercentages.filter(p => p >= 90).length },
      { band: "75-89%",  count: allPercentages.filter(p => p >= 75 && p < 90).length },
      { band: "60-74%",  count: allPercentages.filter(p => p >= 60 && p < 75).length },
      { band: "<60%",    count: allPercentages.filter(p => p < 60).length },
    ];

    return res.json({
      totalStudents: filtered.length,
      avgScore,
      testsCreated,
      lowPerformers,
      scoreDistribution,
      recentActivity: recentActivity.map(r => ({
        name: r.fullName,
        action: "Completed Test",
        score: `${r.percentage}%`,
      })),
    });
  } catch (err) {
    logger.error({ err }, "Teacher dashboard error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/teacher/students", requireRole(["teacher", "admin"]), async (req: any, res) => {
  try {
    const batchFilter = req.query.batch as string | undefined;

    const students = await db.select({
      id: studentsTable.id,
      fullName: studentsTable.fullName,
      classLevel: studentsTable.classLevel,
      stream: studentsTable.stream,
      batchType: studentsTable.batchType,
      whatsappContact: studentsTable.whatsappContact,
      archived: studentsTable.archived,
      notes: studentsTable.notes,
      joinedDate: studentsTable.joinedDate,
      username: usersTable.username,
    }).from(studentsTable)
      .leftJoin(usersTable, eq(studentsTable.userId, usersTable.id))
      .where(
        and(
          eq(studentsTable.archived, false),
          ...(batchFilter ? [eq(studentsTable.batchType, batchFilter)] : [])
        )
      );

    return res.json(students);
  } catch (err) {
    logger.error({ err }, "Get students error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/students", requireRole(["teacher", "admin"]), async (req: any, res) => {
  try {
    const body = req.body;
    const fullName = String(body.fullName || "").trim();
    if (!fullName) return res.status(400).json({ error: "Full Name is required" });

    const classLevel = parseClassLevel(String(body.classLevel || "12"));
    const stream = parseStream(String(body.stream || "Science"));
    const batchType = formatBatchType(classLevel, stream);
    const batchYear = batchYearFromLabel(batchType);
    const username = String(body.username || usernameFromName(fullName, batchYear)).trim();
    const password = String(body.password || crypto.randomBytes(6).toString("base64url"));
    const whatsappContact = body.studentPhone ? String(body.studentPhone) : null;
    const parentContact = body.parentPhone ? String(body.parentPhone) : null;
    const notes = body.notes ? String(body.notes) : null;

    const existing = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const passwordHash = await bcryptjs.hash(password, 10);
    const userId = crypto.randomUUID();
    const studentId = crypto.randomUUID();

    await db.insert(usersTable).values({
      id: userId,
      role: "STUDENT",
      username,
      passwordHash,
      firstLogin: true,
    });

    await db.insert(studentsTable).values({
      id: studentId,
      userId,
      fullName,
      classLevel,
      stream,
      batchType,
      joinedDate: new Date(),
      whatsappContact,
      parentContact,
      notes,
    });

    return res.json({ id: studentId, username, password, batchType });
  } catch (err) {
    logger.error({ err }, "Create student error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/teacher/leaderboard", requireRole(["teacher", "student", "admin"]), async (req: any, res) => {
  try {
    const scope = String(req.query.scope || "weekly");
    const batchFilter = req.query.batch as string | undefined;

    const ranks = await db.select({
      id: studentsTable.id,
      fullName: studentsTable.fullName,
      batchType: studentsTable.batchType,
      rank: rankHistoryTable.rank,
      average: rankHistoryTable.average,
      lastTest: rankHistoryTable.lastTest,
      rankMovement: rankHistoryTable.rankMovement,
    }).from(rankHistoryTable)
      .innerJoin(studentsTable, eq(rankHistoryTable.studentId, studentsTable.id))
      .where(
        and(
          eq(rankHistoryTable.scope, scope),
          eq(studentsTable.archived, false),
          ...(batchFilter ? [eq(studentsTable.batchType, batchFilter)] : [])
        )
      )
      .orderBy(rankHistoryTable.rank)
      .limit(50);

    return res.json(ranks);
  } catch (err) {
    logger.error({ err }, "Leaderboard error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/teacher/schedule", requireRole(["teacher", "admin"]), async (req: any, res) => {
  try {
    const batchFilter = req.query.batch as string | undefined;

    const batches = await db.select().from(batchesTable)
      .where(batchFilter ? eq(batchesTable.name, batchFilter) : sql`1=1`);
    const batchIds = batches.map(b => b.id);

    if (batchIds.length === 0) return res.json([]);

    const scheduled = await db.select({
      id: scheduledTestsTable.id,
      testName: scheduledTestsTable.testName,
      testType: scheduledTestsTable.testType,
      scheduledDate: scheduledTestsTable.scheduledDate,
      batchName: batchesTable.name,
      classLevel: batchesTable.classLevel,
      stream: batchesTable.stream,
    }).from(scheduledTestsTable)
      .innerJoin(batchesTable, eq(scheduledTestsTable.batchId, batchesTable.id))
      .where(sql`${scheduledTestsTable.batchId} = ANY(${batchIds})`)
      .orderBy(scheduledTestsTable.scheduledDate);

    return res.json(scheduled.map(s => ({
      ...s,
      date: s.scheduledDate,
      status: new Date(s.scheduledDate) > new Date() ? "upcoming" : "completed",
      chapters: [],
    })));
  } catch (err) {
    logger.error({ err }, "Schedule error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/teacher/schedule", requireRole(["teacher", "admin"]), async (req: any, res) => {
  try {
    const { batchName, testName, testType, scheduledDate } = req.body;
    if (!batchName || !testName || !testType || !scheduledDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let batches = await db.select().from(batchesTable).where(eq(batchesTable.name, batchName)).limit(1);
    let batch = batches[0];

    if (!batch) {
      const id = crypto.randomUUID();
      await db.insert(batchesTable).values({
        id,
        name: batchName,
        classLevel: "TWELVE",
        stream: "SCIENCE_PCM",
        startDate: new Date(),
      });
      batches = await db.select().from(batchesTable).where(eq(batchesTable.id, id)).limit(1);
      batch = batches[0];
    }

    const id = crypto.randomUUID();
    await db.insert(scheduledTestsTable).values({
      id,
      batchId: batch.id,
      testName,
      testType,
      scheduledDate: new Date(scheduledDate),
    });

    return res.json({ success: true, id });
  } catch (err) {
    logger.error({ err }, "Create schedule error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/teacher/settings", requireRole(["teacher", "admin"]), async (req: any, res) => {
  try {
    const settings = await db.select().from(aiSettingsTable).limit(1);
    const s = settings[0] || {
      primaryProvider: "openai",
      fallbackProvider: "gemini",
      whatsappNumber: "",
      resultUploaded: true,
      chapterCompleted: true,
      quarterlyReminder: true,
      walkthrough: false,
    };

    return res.json({
      providers: [
        { name: "openai", label: "OpenAI GPT-4o", configured: false, maskedKey: "Not configured", model: "gpt-4o" },
        { name: "gemini", label: "Google Gemini", configured: false, maskedKey: "Not configured", model: "gemini-1.5-flash" },
      ],
      settings: {
        primaryProvider: s.primaryProvider,
        fallbackProvider: s.fallbackProvider,
        whatsappNumber: s.whatsappNumber || "",
        notificationPreferences: {
          resultUploaded: s.resultUploaded ?? true,
          chapterCompleted: s.chapterCompleted ?? true,
          quarterlyReminder: s.quarterlyReminder ?? true,
          walkthrough: s.walkthrough ?? false,
        },
      },
    });
  } catch (err) {
    logger.error({ err }, "Get settings error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/teacher/settings", requireRole(["teacher", "admin"]), async (req: any, res) => {
  try {
    const { primaryProvider, fallbackProvider, whatsappNumber, notificationPreferences } = req.body;

    const existing = await db.select().from(aiSettingsTable).limit(1);
    const values = {
      id: existing[0]?.id || crypto.randomUUID(),
      primaryProvider: primaryProvider || "openai",
      fallbackProvider: fallbackProvider || "gemini",
      whatsappNumber: whatsappNumber || null,
      resultUploaded: notificationPreferences?.resultUploaded ?? true,
      chapterCompleted: notificationPreferences?.chapterCompleted ?? true,
      quarterlyReminder: notificationPreferences?.quarterlyReminder ?? true,
      walkthrough: notificationPreferences?.walkthrough ?? false,
      updatedAt: new Date(),
    };

    if (existing.length > 0) {
      await db.update(aiSettingsTable).set(values).where(eq(aiSettingsTable.id, existing[0].id));
    } else {
      await db.insert(aiSettingsTable).values(values);
    }

    return res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Save settings error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/teacher/whatsapp", requireRole(["teacher", "admin"]), async (req: any, res) => {
  try {
    const drafts = await db.select({
      id: whatsappDraftsTable.id,
      student: studentsTable.fullName,
      cadence: whatsappDraftsTable.cadence,
      status: whatsappDraftsTable.status,
      draft: whatsappDraftsTable.draft,
      batchType: whatsappDraftsTable.batchType,
      createdAt: whatsappDraftsTable.createdAt,
    }).from(whatsappDraftsTable)
      .innerJoin(studentsTable, eq(whatsappDraftsTable.studentId, studentsTable.id))
      .where(eq(whatsappDraftsTable.status, "DRAFT"))
      .orderBy(desc(whatsappDraftsTable.createdAt))
      .limit(20);

    return res.json(drafts);
  } catch (err) {
    logger.error({ err }, "WhatsApp drafts error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/teacher/whatsapp/send", requireRole(["teacher", "admin"]), async (req: any, res) => {
  try {
    const { id, body: draftBody } = req.body;
    if (!id) return res.status(400).json({ error: "Missing id" });

    await db.update(whatsappDraftsTable)
      .set({ status: "SENT", draft: draftBody, updatedAt: new Date() })
      .where(eq(whatsappDraftsTable.id, id));

    return res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Send WhatsApp error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/teacher/syllabus", requireRole(["teacher", "admin"]), async (req: any, res) => {
  try {
    const batchFilter = req.query.batch as string | undefined;
    const students = await db.select({
      id: studentsTable.id,
      batchType: studentsTable.batchType,
    }).from(studentsTable).where(
      and(
        eq(studentsTable.archived, false),
        ...(batchFilter ? [eq(studentsTable.batchType, batchFilter)] : [])
      )
    );

    return res.json({ students: students.length, chapters: [] });
  } catch (err) {
    logger.error({ err }, "Syllabus error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/teacher/upload-marks", requireRole(["teacher", "admin"]), async (req: any, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    const lines = text.trim().split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
    if (lines.length < 2) return res.status(400).json({ error: "Invalid format" });

    const testName = lines[0];
    const results: Array<{ name: string; score: number }> = [];

    for (const line of lines.slice(1)) {
      const match = line.match(/^(.+?)\s+(\d+(?:\.\d+)?)$/);
      if (match) {
        results.push({ name: match[1].trim(), score: parseFloat(match[2]) });
      }
    }

    const maxMarks = results.length > 0 ? Math.max(...results.map(r => r.score)) : 100;

    const testId = crypto.randomUUID();
    await db.insert(testsTable).values({
      id: testId,
      testName,
      testType: "WEEKLY_CHAPTER",
      classLevel: "TWELVE",
      stream: "SCIENCE_PCM",
      date: new Date(),
      totalMarks: maxMarks,
    });

    const processed: Array<{ name: string; score: number; percentage: number }> = [];
    for (const result of results) {
      const students = await db.select().from(studentsTable)
        .where(ilike(studentsTable.fullName, `%${result.name}%`))
        .limit(1);
      const student = students[0];
      if (student) {
        const percentage = Math.round((result.score / maxMarks) * 100);
        await db.insert(studentTestResultsTable).values({
          id: crypto.randomUUID(),
          studentId: student.id,
          testId,
          totalScored: result.score,
          percentage,
        });
        processed.push({ name: result.name, score: result.score, percentage });
      }
    }

    return res.json({ success: true, testName, processed, skipped: results.length - processed.length });
  } catch (err) {
    logger.error({ err }, "Upload marks error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/teacher/batches", requireRole(["teacher", "admin"]), async (req: any, res) => {
  try {
    const batches = await db.select().from(batchesTable).orderBy(batchesTable.name);
    return res.json(batches);
  } catch (err) {
    logger.error({ err }, "Batches error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
