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
  chaptersTable,
  academicYearsTable,
  subjectsTable,
  chapterProgressTable,
  leaderboardCacheTable,
} from "@workspace/db";
import { eq, and, desc, sql, ilike, asc } from "drizzle-orm";
import * as bcryptjs from "bcryptjs";
import crypto from "crypto";
import { logger } from "../lib/logger";
import { sendPushNotification } from "./push";
import { uploadMarksLimiter, whatsappSendLimiter, studentMutationLimiter } from "../lib/rate-limits";

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

function aiNote(pct: number): string {
  if (pct >= 85) return "Outstanding! Excellent command over the subject. Maintain consistency and push for 90%+.";
  if (pct >= 75) return "Very good performance. Minor errors cost marks — review and aim higher next time.";
  if (pct >= 65) return "Good effort. Concept clarity is improving. Work on problem-solving speed and accuracy.";
  if (pct >= 55) return "Needs improvement. Gaps in fundamentals identified. Schedule a revision session with Roman sir.";
  return "Below target. Immediate action needed. Daily practice and concept revision is strongly recommended.";
}

function teacherNote(pct: number): string {
  if (pct >= 75) return "Keep it up! Very consistent performance.";
  if (pct >= 65) return "Good work. Focus more on application problems.";
  return "Please revise the covered chapters and attempt more practice sets.";
}

// ── Dashboard ─────────────────────────────────────────────────────────────

router.get("/teacher/dashboard", requireRole(["teacher"]), async (req: any, res) => {
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

// ── Students ──────────────────────────────────────────────────────────────

router.get("/teacher/students", requireRole(["teacher"]), async (req: any, res) => {
  try {
    const batchFilter = req.query.batch as string | undefined;
    const q = req.query.q as string | undefined;

    const filters: any[] = [eq(studentsTable.archived, false)];
    if (batchFilter) filters.push(eq(studentsTable.batchType, batchFilter));
    if (q?.trim()) {
      const term = `%${q.trim()}%`;
      filters.push(
        sql`(${ilike(studentsTable.fullName, term)} OR ${ilike(studentsTable.whatsappContact, term)} OR ${ilike(usersTable.username, term)})`
      );
    }

    const students = await db.select({
      id: studentsTable.id,
      fullName: studentsTable.fullName,
      classLevel: studentsTable.classLevel,
      stream: studentsTable.stream,
      batchType: studentsTable.batchType,
      whatsappContact: studentsTable.whatsappContact,
      parentContact: studentsTable.parentContact,
      archived: studentsTable.archived,
      notes: studentsTable.notes,
      joinedDate: studentsTable.joinedDate,
      username: usersTable.username,
      isDemo: usersTable.isDemo,
    }).from(studentsTable)
      .leftJoin(usersTable, eq(studentsTable.userId, usersTable.id))
      .where(and(...filters));

    return res.json(students);
  } catch (err) {
    logger.error({ err }, "Get students error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/teacher/students/:id/analytics", requireRole(["teacher"]), async (req: any, res) => {
  try {
    const { id } = req.params;
    const student = await db.select({
      id: studentsTable.id,
      fullName: studentsTable.fullName,
      batchType: studentsTable.batchType,
      classLevel: studentsTable.classLevel,
      stream: studentsTable.stream,
      whatsappContact: studentsTable.whatsappContact,
      parentContact: studentsTable.parentContact,
      joinedDate: studentsTable.joinedDate,
      notes: studentsTable.notes,
      username: usersTable.username,
      isDemo: usersTable.isDemo,
    }).from(studentsTable)
      .leftJoin(usersTable, eq(studentsTable.userId, usersTable.id))
      .where(eq(studentsTable.id, id))
      .limit(1);

    if (!student[0]) return res.status(404).json({ error: "Student not found" });

    const results = await db.select({
      id: studentTestResultsTable.id,
      testId: studentTestResultsTable.testId,
      testName: testsTable.testName,
      testType: testsTable.testType,
      date: testsTable.date,
      totalMarks: testsTable.totalMarks,
      totalScored: studentTestResultsTable.totalScored,
      percentage: studentTestResultsTable.percentage,
      rank: studentTestResultsTable.rank,
      teacherNote: studentTestResultsTable.teacherNote,
    }).from(studentTestResultsTable)
      .innerJoin(testsTable, eq(studentTestResultsTable.testId, testsTable.id))
      .where(eq(studentTestResultsTable.studentId, id))
      .orderBy(asc(testsTable.date));

    const rankData = await db.select().from(rankHistoryTable)
      .where(and(eq(rankHistoryTable.studentId, id), eq(rankHistoryTable.scope, "overall")))
      .orderBy(desc(rankHistoryTable.createdAt))
      .limit(1);

    const chapters = await db.select({
      chapterName: studentChaptersTable.chapterName,
      status: studentChaptersTable.status,
    }).from(studentChaptersTable).where(eq(studentChaptersTable.studentId, id));

    const avg = results.length > 0
      ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
      : 0;

    const completedChapters = chapters.filter(c => c.status === "COMPLETED").length;
    const totalChapters = chapters.length;

    return res.json({
      student: student[0],
      rank: rankData[0]?.rank ?? null,
      average: avg,
      lastTestPct: results[results.length - 1]?.percentage ?? null,
      completedChapters,
      totalChapters,
      syllabusProgress: totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0,
      results: results.map(r => ({
        ...r,
        date: r.date ? new Date(r.date).toLocaleDateString("en-IN") : "N/A",
      })),
      chapters,
    });
  } catch (err) {
    logger.error({ err }, "Student analytics error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/students", requireRole(["teacher"]), studentMutationLimiter, async (req: any, res) => {
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

router.patch("/students/:id", requireRole(["teacher"]), studentMutationLimiter, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { fullName, whatsappContact, parentContact, notes, newPassword } = req.body;

    await db.update(studentsTable)
      .set({
        ...(fullName ? { fullName } : {}),
        ...(whatsappContact !== undefined ? { whatsappContact } : {}),
        ...(parentContact !== undefined ? { parentContact } : {}),
        ...(notes !== undefined ? { notes } : {}),
      })
      .where(eq(studentsTable.id, id));

    if (newPassword && String(newPassword).length >= 6) {
      const newHash = await bcryptjs.hash(String(newPassword), 10);
      const student = await db.select({ userId: studentsTable.userId })
        .from(studentsTable).where(eq(studentsTable.id, id)).limit(1);
      if (student[0]?.userId) {
        await db.update(usersTable)
          .set({ passwordHash: newHash, firstLogin: true, updatedAt: new Date() })
          .where(eq(usersTable.id, student[0].userId));
      }
    }

    return res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Update student error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/students/:id", requireRole(["teacher"]), studentMutationLimiter, async (req: any, res) => {
  try {
    const { id } = req.params;
    await db.update(studentsTable).set({ archived: true }).where(eq(studentsTable.id, id));
    return res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Archive student error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── Promote Batch ─────────────────────────────────────────────────────────

router.post("/teacher/promote-batch", requireRole(["teacher"]), async (req: any, res) => {
  try {
    const { batchType } = req.body;
    if (!batchType) return res.status(400).json({ error: "batchType is required" });

    const year = new Date().getFullYear();
    const students = await db.select({ id: studentsTable.id })
      .from(studentsTable)
      .where(and(eq(studentsTable.batchType, batchType), eq(studentsTable.archived, false)));

    if (students.length === 0) return res.status(404).json({ error: "No students found in this batch" });

    for (const s of students) {
      await db.update(studentsTable)
        .set({ promoted: true, graduationYear: year })
        .where(eq(studentsTable.id, s.id));
    }

    return res.json({ success: true, promoted: students.length });
  } catch (err) {
    logger.error({ err }, "Promote batch error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── Leaderboard ───────────────────────────────────────────────────────────

router.get("/teacher/leaderboard", requireRole(["teacher", "student"]), async (req: any, res) => {
  try {
    const scope = String(req.query.scope || "weekly");
    const batchFilter = req.query.batch as string | undefined;

    // Get all rows for this scope/batch, then deduplicate keeping the latest per student
    const rows = await db.select({
      id: studentsTable.id,
      fullName: studentsTable.fullName,
      batchType: studentsTable.batchType,
      rank: rankHistoryTable.rank,
      average: rankHistoryTable.average,
      lastTest: rankHistoryTable.lastTest,
      rankMovement: rankHistoryTable.rankMovement,
      createdAt: rankHistoryTable.createdAt,
    }).from(rankHistoryTable)
      .innerJoin(studentsTable, eq(rankHistoryTable.studentId, studentsTable.id))
      .where(
        and(
          eq(rankHistoryTable.scope, scope),
          eq(studentsTable.archived, false),
          ...(batchFilter ? [eq(studentsTable.batchType, batchFilter)] : [])
        )
      )
      .orderBy(desc(rankHistoryTable.createdAt))
      .limit(500);

    // Deduplicate: keep only the most recent entry per student
    const seen = new Set<string>();
    const unique = rows.filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });

    // Sort by rank ascending
    unique.sort((a, b) => a.rank - b.rank);

    return res.json(unique.map(({ createdAt: _c, ...r }) => r));
  } catch (err) {
    logger.error({ err }, "Leaderboard error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── Schedule ──────────────────────────────────────────────────────────────

router.get("/teacher/schedule", requireRole(["teacher"]), async (req: any, res) => {
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
      .where(sql`${scheduledTestsTable.batchId} = ANY(ARRAY[${sql.join(batchIds.map(id => sql`${id}`), sql`, `)}]::text[])`)
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

router.post("/teacher/schedule", requireRole(["teacher"]), async (req: any, res) => {
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

// ── Settings ──────────────────────────────────────────────────────────────

router.get("/teacher/settings", requireRole(["teacher"]), async (req: any, res) => {
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

router.post("/teacher/settings", requireRole(["teacher"]), async (req: any, res) => {
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

// ── WhatsApp ──────────────────────────────────────────────────────────────

router.get("/teacher/whatsapp", requireRole(["teacher"]), async (req: any, res) => {
  try {
    const drafts = await db.select({
      id: whatsappDraftsTable.id,
      student: studentsTable.fullName,
      whatsappContact: studentsTable.whatsappContact,
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

router.post("/teacher/whatsapp/send", requireRole(["teacher"]), whatsappSendLimiter, async (req: any, res) => {
  try {
    const { id, body: draftBody } = req.body;
    if (!id) return res.status(400).json({ error: "Missing id" });

    const draft = await db.select({
      id: whatsappDraftsTable.id,
      studentId: whatsappDraftsTable.studentId,
      draft: whatsappDraftsTable.draft,
      whatsappContact: studentsTable.whatsappContact,
    }).from(whatsappDraftsTable)
      .innerJoin(studentsTable, eq(whatsappDraftsTable.studentId, studentsTable.id))
      .where(eq(whatsappDraftsTable.id, id))
      .limit(1);

    if (!draft[0]) return res.status(404).json({ error: "Draft not found" });

    await db.update(whatsappDraftsTable)
      .set({ status: "SENT", draft: draftBody || draft[0].draft, updatedAt: new Date() })
      .where(eq(whatsappDraftsTable.id, id));

    const phone = draft[0].whatsappContact?.replace(/\D/g, "");
    const message = encodeURIComponent(draftBody || draft[0].draft);
    const waLink = phone ? `https://wa.me/${phone}?text=${message}` : null;

    return res.json({ success: true, waLink });
  } catch (err) {
    logger.error({ err }, "Send WhatsApp error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── Syllabus ──────────────────────────────────────────────────────────────

router.get("/teacher/syllabus", requireRole(["teacher"]), async (req: any, res) => {
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

// ── Upload Marks (REWORKED) ───────────────────────────────────────────────

router.post("/teacher/upload-marks", requireRole(["teacher"]), uploadMarksLimiter, async (req: any, res) => {
  try {
    const { text, testType, totalMarks: totalMarksInput, chapters: chaptersInput, batchType: batchFilter } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });
    if (!testType) return res.status(400).json({ error: "Test type is required" });
    if (!totalMarksInput || isNaN(Number(totalMarksInput))) return res.status(400).json({ error: "Total marks is required" });

    const totalMarks = Number(totalMarksInput);
    const lines = text.trim().split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
    if (lines.length < 1) return res.status(400).json({ error: "At least one student result required" });

    const parsedResults: Array<{ name: string; score: number }> = [];
    for (const line of lines) {
      const match = line.match(/^(.+?)\s+(\d+(?:\.\d+)?)$/);
      if (match) {
        parsedResults.push({ name: match[1].trim(), score: parseFloat(match[2]) });
      }
    }

    if (parsedResults.length === 0) return res.status(400).json({ error: "No valid entries found. Use format: Name Score (e.g. Sonal 72)" });

    // Auto-generate test name from type + date
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const typeLabel: Record<string, string> = {
      WEEKLY_CHAPTER: "Weekly Chapter Test",
      MONTHLY: "Monthly Test",
      QUARTERLY: "Quarterly Test",
      FULL_LENGTH_MOCK: "Full Length Mock",
      REVISION_TEST: "Revision Test",
      CET_MOCK: "CET Mock Test",
    };
    const testName = `${typeLabel[testType] || testType} — ${dateStr}`;

    // Detect classLevel and batchId from batch
    let classLevel: "ELEVEN" | "TWELVE" = "TWELVE";
    let stream: "SCIENCE_PCM" = "SCIENCE_PCM";
    let resolvedBatchId: string | null = null;
    if (batchFilter) {
      const batch = await db.select().from(batchesTable).where(eq(batchesTable.name, batchFilter)).limit(1);
      if (batch[0]) {
        classLevel = batch[0].classLevel;
        resolvedBatchId = batch[0].id;
      }
    }

    const testId = crypto.randomUUID();
    await db.insert(testsTable).values({
      id: testId,
      testName,
      testType: testType as any,
      classLevel,
      stream,
      date: now,
      totalMarks,
      ...(resolvedBatchId ? { batchId: resolvedBatchId } : {}),
    });

    // Link chapters to test + mark them COMPLETED in student records
    const chapterList: string[] = Array.isArray(chaptersInput) ? chaptersInput : [];
    for (const chName of chapterList) {
      await db.insert(testChaptersTable).values({
        id: crypto.randomUUID(),
        testId,
        chapterName: chName,
      });
    }

    // Process results and compute ranks
    const processed: Array<{ name: string; score: number; percentage: number; rank?: number; studentId?: string }> = [];
    const skippedNames: string[] = [];

    for (const result of parsedResults) {
      const students = await db.select().from(studentsTable)
        .where(and(
          ilike(studentsTable.fullName, `%${result.name}%`),
          eq(studentsTable.archived, false),
          ...(batchFilter ? [eq(studentsTable.batchType, batchFilter)] : [])
        ))
        .limit(1);
      const student = students[0];
      if (student) {
        if (result.score > totalMarks * 1.05) {
          skippedNames.push(`${result.name} (score ${result.score} exceeds totalMarks ${totalMarks})`);
        } else {
          const percentage = Math.round((result.score / totalMarks) * 100 * 10) / 10;
          processed.push({ name: result.name, score: result.score, percentage, studentId: student.id });
        }
      } else {
        skippedNames.push(result.name);
      }
    }

    // Sort by score desc to assign ranks
    processed.sort((a, b) => b.score - a.score);
    for (let i = 0; i < processed.length; i++) {
      processed[i].rank = i + 1;
    }

    // Insert results with rank, teacher note, AI note, WhatsApp draft
    const batchAvg = processed.length > 0
      ? Math.round(processed.reduce((s, r) => s + r.percentage, 0) / processed.length * 10) / 10
      : 0;

    for (const result of processed) {
      if (!result.studentId) continue;

      const note = result.percentage >= 75 ? "Keep it up! Very consistent performance."
        : result.percentage >= 65 ? "Good work. Focus more on application problems."
        : "Please revise the covered chapters and attempt more practice sets.";
      const ai = aiNote(result.percentage);

      const resultId = crypto.randomUUID();
      await db.insert(studentTestResultsTable).values({
        id: resultId,
        studentId: result.studentId,
        testId,
        totalScored: result.score,
        percentage: result.percentage,
        rank: result.rank,
        teacherNote: note,
        aiSummary: ai,
        whatsappStatus: "DRAFT",
      });

      // Update rank history for ALL scopes so the leaderboard query finds entries
      const existingRank = await db.select().from(rankHistoryTable)
        .where(and(eq(rankHistoryTable.studentId, result.studentId), eq(rankHistoryTable.scope, "overall")))
        .orderBy(desc(rankHistoryTable.createdAt))
        .limit(1);

      const prevRank = existingRank[0]?.rank ?? null;
      const rankMovement = prevRank !== null ? prevRank - (result.rank ?? 0) : null;

      for (const scope of ["overall", "weekly", "monthly", "quarterly"]) {
        await db.insert(rankHistoryTable).values({
          id: crypto.randomUUID(),
          studentId: result.studentId,
          testId,
          scope,
          rank: result.rank ?? 0,
          average: batchAvg,
          lastTest: result.percentage,
          rankMovement,
        });
      }

      // Mark chapters COMPLETED for this student
      if (chapterList.length > 0) {
        for (const chName of chapterList) {
          await db.update(studentChaptersTable)
            .set({ status: "COMPLETED", updatedAt: new Date() })
            .where(and(
              eq(studentChaptersTable.studentId, result.studentId),
              eq(studentChaptersTable.chapterName, chName)
            ));
        }
      }

      // WhatsApp draft
      const studentRec = await db.select({ fullName: studentsTable.fullName, batchType: studentsTable.batchType })
        .from(studentsTable).where(eq(studentsTable.id, result.studentId)).limit(1);
      if (studentRec[0]) {
        const pct = Math.round(result.percentage);
        const chaptersText = chapterList.length > 0 ? `\n📖 Topics: ${chapterList.join(", ")}` : "";
        const rankText = `\n🏅 Rank: *${result.rank} / ${processed.length}*`;
        await db.insert(whatsappDraftsTable).values({
          id: crypto.randomUUID(),
          studentId: result.studentId,
          testResultId: resultId,
          cadence: "result_uploaded",
          status: "DRAFT",
          batchType: studentRec[0].batchType,
          draft: `🙏 Dear Parent,\n\n*${studentRec[0].fullName}* scored *${pct}%* in *${testName}*.${chaptersText}${rankText}\n\n📝 ${note}\n\n🤖 ${ai}\n\nFor queries, contact Roman Academy.\n\n— Roman Sir`,
        });
      }

      // Push notification
      const userRec = await db.select({ pushToken: usersTable.pushToken })
        .from(studentsTable)
        .innerJoin(usersTable, eq(studentsTable.userId, usersTable.id))
        .where(eq(studentsTable.id, result.studentId))
        .limit(1);
      if (userRec[0]?.pushToken) {
        sendPushNotification(
          userRec[0].pushToken,
          "New Test Results Available",
          `Your results for "${testName}" are ready. Rank: ${result.rank}/${processed.length}`,
          { screen: "student-tests" }
        ).catch(() => {});
      }
    }

    // Suggest next chapter for batch
    let nextChapterSuggestion: string | null = null;
    if (chapterList.length > 0 && batchFilter) {
      const batch = await db.select().from(batchesTable).where(eq(batchesTable.name, batchFilter)).limit(1);
      if (batch[0]) {
        const nextChapters = await db.select().from(chaptersTable)
          .where(and(
            eq(chaptersTable.classLevel, classLevel),
            eq(chaptersTable.stream, stream),
          ))
          .orderBy(asc(chaptersTable.orderIndex));

        const doneSet = new Set(chapterList);
        const nextCh = nextChapters.find(c => !doneSet.has(c.chapterName));
        nextChapterSuggestion = nextCh?.chapterName ?? null;

        if (nextCh) {
          await db.update(batchesTable)
            .set({ nextChapterId: nextCh.id, nextChapterName: nextCh.chapterName, updatedAt: new Date() })
            .where(eq(batchesTable.id, batch[0].id));
        }
      }
    }

    return res.json({
      success: true,
      testName,
      processed: processed.map(p => ({ name: p.name, score: p.score, percentage: p.percentage, rank: p.rank })),
      skipped: skippedNames.length,
      skippedNames,
      batchAvg,
      nextChapter: nextChapterSuggestion,
    });
  } catch (err) {
    logger.error({ err }, "Upload marks error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── WhatsApp Send All ─────────────────────────────────────────────────────

router.post("/teacher/whatsapp/send-all", requireRole(["teacher"]), async (req: any, res) => {
  try {
    const drafts = await db.select({
      id: whatsappDraftsTable.id,
      draft: whatsappDraftsTable.draft,
      whatsappContact: studentsTable.whatsappContact,
      student: studentsTable.fullName,
    }).from(whatsappDraftsTable)
      .innerJoin(studentsTable, eq(whatsappDraftsTable.studentId, studentsTable.id))
      .where(eq(whatsappDraftsTable.status, "DRAFT"));

    if (drafts.length === 0) return res.json({ success: true, sent: 0, links: [] });

    const links: Array<{ student: string; waLink: string | null }> = [];
    for (const d of drafts) {
      await db.update(whatsappDraftsTable)
        .set({ status: "SENT", updatedAt: new Date() })
        .where(eq(whatsappDraftsTable.id, d.id));
      const phone = d.whatsappContact?.replace(/\D/g, "");
      const waLink = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(d.draft)}` : null;
      links.push({ student: d.student, waLink });
    }

    return res.json({ success: true, sent: drafts.length, links });
  } catch (err) {
    logger.error({ err }, "Send all WhatsApp error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── Batches ───────────────────────────────────────────────────────────────

router.get("/teacher/batches", requireRole(["teacher"]), async (req: any, res) => {
  try {
    const batches = await db.select().from(batchesTable).orderBy(batchesTable.name);
    return res.json(batches);
  } catch (err) {
    logger.error({ err }, "Batches error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── Academic Years ─────────────────────────────────────────────────────────

router.get("/teacher/academic-years", requireRole(["teacher"]), async (req: any, res) => {
  try {
    const years = await db.select().from(academicYearsTable).orderBy(desc(academicYearsTable.startDate));
    return res.json(years);
  } catch (err) {
    logger.error({ err }, "Academic years error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── Subjects ───────────────────────────────────────────────────────────────

router.get("/teacher/subjects", requireRole(["teacher"]), async (req: any, res) => {
  try {
    const batchFilter = req.query.batch as string | undefined;

    const filters: any[] = [];
    if (batchFilter) {
      const batch = await db.select().from(batchesTable).where(eq(batchesTable.name, batchFilter)).limit(1);
      if (batch[0]) filters.push(eq(subjectsTable.batchId, batch[0].id));
    }

    const subjects = await db.select({
      id: subjectsTable.id,
      name: subjectsTable.name,
      batchId: subjectsTable.batchId,
      batchName: batchesTable.name,
    }).from(subjectsTable)
      .innerJoin(batchesTable, eq(subjectsTable.batchId, batchesTable.id))
      .where(filters.length > 0 ? and(...filters) : sql`1=1`)
      .orderBy(batchesTable.name, subjectsTable.name);

    return res.json(subjects);
  } catch (err) {
    logger.error({ err }, "Subjects error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── Chapters (with progress) ───────────────────────────────────────────────

router.get("/teacher/chapters", requireRole(["teacher"]), async (req: any, res) => {
  try {
    const batchFilter = req.query.batch as string | undefined;
    const subjectFilter = req.query.subject as string | undefined;

    let batch: { id: string; classLevel: "ELEVEN" | "TWELVE" } | undefined;
    if (batchFilter) {
      const rows = await db.select({ id: batchesTable.id, classLevel: batchesTable.classLevel })
        .from(batchesTable).where(eq(batchesTable.name, batchFilter)).limit(1);
      batch = rows[0];
    }

    const filters: any[] = [];
    if (batch) filters.push(eq(chaptersTable.classLevel, batch.classLevel));
    if (subjectFilter) filters.push(eq(chaptersTable.subject, subjectFilter));

    const chapters = await db.select().from(chaptersTable)
      .where(filters.length > 0 ? and(...filters) : sql`1=1`)
      .orderBy(chaptersTable.subject, chaptersTable.orderIndex);

    // Fetch chapter progress for this batch
    let progressMap: Record<string, { status: string; startedAt: Date | null; completedAt: Date | null }> = {};
    if (batch) {
      const progress = await db.select({
        chapterId: chapterProgressTable.chapterId,
        status: chapterProgressTable.status,
        startedAt: chapterProgressTable.startedAt,
        completedAt: chapterProgressTable.completedAt,
      }).from(chapterProgressTable).where(eq(chapterProgressTable.batchId, batch.id));
      for (const p of progress) {
        progressMap[p.chapterId] = { status: p.status, startedAt: p.startedAt, completedAt: p.completedAt };
      }
    }

    return res.json(chapters.map(ch => {
      const prog = progressMap[ch.id] ?? { status: "PENDING", startedAt: null, completedAt: null };
      return {
        id: ch.id,
        name: ch.chapterName,
        subject: ch.subject,
        orderIndex: ch.orderIndex,
        status: prog.status === "ONGOING" ? "IN_PROGRESS" : prog.status,
        startedAt: prog.startedAt,
        completedAt: prog.completedAt,
      };
    }));
  } catch (err) {
    logger.error({ err }, "Chapters error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── Chapter Progress (start / complete teaching) ───────────────────────────

router.post("/teacher/chapter-progress", requireRole(["teacher"]), async (req: any, res) => {
  try {
    const { chapterId, batchName, action } = req.body;
    if (!chapterId || !batchName || !action) {
      return res.status(400).json({ error: "Missing chapterId, batchName, or action" });
    }
    if (!["start", "complete", "reset"].includes(action)) {
      return res.status(400).json({ error: "action must be 'start', 'complete', or 'reset'" });
    }

    const batch = await db.select().from(batchesTable).where(eq(batchesTable.name, batchName)).limit(1);
    if (!batch[0]) return res.status(404).json({ error: "Batch not found" });

    const existing = await db.select().from(chapterProgressTable)
      .where(and(eq(chapterProgressTable.chapterId, chapterId), eq(chapterProgressTable.batchId, batch[0].id)))
      .limit(1);

    const now = new Date();
    const teacherId = req.userId;

    if (action === "reset") {
      if (existing[0]) {
        await db.update(chapterProgressTable)
          .set({ status: "PENDING", startedAt: null, completedAt: null, updatedAt: now })
          .where(eq(chapterProgressTable.id, existing[0].id));
      }
    } else if (existing[0]) {
      const updates: any = { updatedAt: now };
      if (action === "start") {
        updates.status = "ONGOING";
        updates.startedAt = now;
      } else {
        updates.status = "COMPLETED";
        updates.completedAt = now;
      }
      await db.update(chapterProgressTable).set(updates).where(eq(chapterProgressTable.id, existing[0].id));
    } else {
      await db.insert(chapterProgressTable).values({
        id: crypto.randomUUID(),
        chapterId,
        batchId: batch[0].id,
        teacherId,
        status: action === "start" ? "ONGOING" : "COMPLETED",
        startedAt: action === "start" ? now : null,
        completedAt: action === "complete" ? now : null,
      });
    }

    // If completing, also update all students in this batch
    if (action === "complete") {
      const chapter = await db.select().from(chaptersTable).where(eq(chaptersTable.id, chapterId)).limit(1);
      if (chapter[0]) {
        const batchStudents = await db.select({ id: studentsTable.id })
          .from(studentsTable)
          .where(and(eq(studentsTable.batchId, batch[0].id), eq(studentsTable.archived, false)));

        for (const student of batchStudents) {
          const sc = await db.select().from(studentChaptersTable)
            .where(and(eq(studentChaptersTable.studentId, student.id), eq(studentChaptersTable.chapterId, chapterId)))
            .limit(1);
          if (sc[0]) {
            await db.update(studentChaptersTable)
              .set({ status: "COMPLETED", updatedAt: now })
              .where(eq(studentChaptersTable.id, sc[0].id));
          }
        }
      }
    }

    return res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Chapter progress error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── Leaderboard Cache (regenerate) ────────────────────────────────────────

router.post("/teacher/leaderboard/regenerate", requireRole(["teacher"]), async (req: any, res) => {
  try {
    const { batchName } = req.body;
    const batch = batchName
      ? await db.select().from(batchesTable).where(eq(batchesTable.name, batchName)).limit(1)
      : await db.select().from(batchesTable);

    for (const b of batch) {
      const batchStudents = await db.select({ id: studentsTable.id })
        .from(studentsTable)
        .where(and(eq(studentsTable.batchId, b.id), eq(studentsTable.archived, false)));

      const types = ["OVERALL", "MONTHLY", "WEEKLY", "QUARTERLY"] as const;

      for (const lbType of types) {
        const scores: Array<{ studentId: string; avg: number }> = [];

        for (const student of batchStudents) {
          const results = await db.select({ percentage: studentTestResultsTable.percentage })
            .from(studentTestResultsTable)
            .innerJoin(testsTable, eq(studentTestResultsTable.testId, testsTable.id))
            .where(and(
              eq(studentTestResultsTable.studentId, student.id),
              eq(testsTable.batchId, b.id),
            ));

          if (results.length === 0) {
            scores.push({ studentId: student.id, avg: 0 });
          } else {
            const avg = results.reduce((s, r) => s + r.percentage, 0) / results.length;
            scores.push({ studentId: student.id, avg: Math.round(avg * 10) / 10 });
          }
        }

        scores.sort((a, z) => z.avg - a.avg);

        // Delete existing cache for this batch + type
        await db.delete(leaderboardCacheTable).where(
          and(eq(leaderboardCacheTable.batchId, b.id), eq(leaderboardCacheTable.leaderboardType, lbType))
        );

        // Insert fresh ranks
        for (let i = 0; i < scores.length; i++) {
          await db.insert(leaderboardCacheTable).values({
            id: crypto.randomUUID(),
            studentId: scores[i].studentId,
            batchId: b.id,
            leaderboardType: lbType,
            score: scores[i].avg,
            rank: i + 1,
          });
        }
      }
    }

    return res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Regenerate leaderboard error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
