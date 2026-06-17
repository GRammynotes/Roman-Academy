import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  studentsTable,
  studentTestResultsTable,
  testsTable,
  testChaptersTable,
  studentChaptersTable,
  rankHistoryTable,
  chaptersTable,
} from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

function requireStudent(req: any, res: any, next: any) {
  const role = req.session?.role;
  if (role !== "student") {
    return res.status(403).json({ error: "Unauthorized" });
  }
  req.userId = req.session.userId;
  req.isDemo = req.session.isDemo ?? false;
  next();
}

router.get("/student/profile", requireStudent, async (req: any, res) => {
  try {
    const students = await db.select({
      id: studentsTable.id,
      fullName: studentsTable.fullName,
      whatsappContact: studentsTable.whatsappContact,
      classLevel: studentsTable.classLevel,
      stream: studentsTable.stream,
      batchType: studentsTable.batchType,
      joinedDate: studentsTable.joinedDate,
    }).from(studentsTable).where(eq(studentsTable.userId, req.userId)).limit(1);
    const student = students[0];
    if (!student) return res.status(404).json({ error: "Student not found" });

    const userRows = await db.select({ isDemo: usersTable.isDemo })
      .from(usersTable).where(eq(usersTable.id, req.userId)).limit(1);
    const isDemo = userRows[0]?.isDemo ?? false;

    const ranks = await db.select().from(rankHistoryTable)
      .where(eq(rankHistoryTable.studentId, student.id))
      .orderBy(desc(rankHistoryTable.createdAt))
      .limit(1);

    const chapters = await db.select({
      id: studentChaptersTable.id,
      status: studentChaptersTable.status,
      chapterName: studentChaptersTable.chapterName,
    }).from(studentChaptersTable).where(eq(studentChaptersTable.studentId, student.id));

    const ongoingChapter = chapters.find(c => c.status === "ONGOING")?.chapterName || "N/A";
    const completedChapters = chapters.filter(c => c.status === "COMPLETED").map(c => c.chapterName || "");
    const mainProgress = chapters.length > 0 ? Math.round((completedChapters.length / chapters.length) * 100) : 0;

    return res.json({
      id: student.id,
      fullName: student.fullName,
      whatsappContact: student.whatsappContact,
      classLevel: student.classLevel,
      stream: student.stream,
      batchType: student.batchType,
      joinedDate: student.joinedDate,
      isDemo,
      rank: ranks[0]?.rank || null,
      average: ranks[0]?.average || null,
      attendance: 90,
      cetReadiness: 72,
      currentChapter: ongoingChapter,
      nextTest: "Check schedule",
      mainProgress,
      completedChapters,
      weakChapters: [],
    });
  } catch (err) {
    logger.error({ err }, "Student profile error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/student/profile", requireStudent, async (req: any, res) => {
  try {
    if (req.isDemo) {
      return res.status(403).json({ error: "Demo account — changes not allowed" });
    }

    const students = await db.select().from(studentsTable).where(eq(studentsTable.userId, req.userId)).limit(1);
    const student = students[0];
    if (!student) return res.status(404).json({ error: "Student not found" });

    const { fullName, whatsappContact } = req.body;
    await db.update(studentsTable)
      .set({ fullName: fullName || student.fullName, whatsappContact: whatsappContact || student.whatsappContact })
      .where(eq(studentsTable.id, student.id));

    return res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Update student profile error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/student/tests", requireStudent, async (req: any, res) => {
  try {
    const students = await db.select().from(studentsTable).where(eq(studentsTable.userId, req.userId)).limit(1);
    const student = students[0];
    if (!student) return res.status(404).json({ error: "Student not found" });

    const results = await db.select({
      id: studentTestResultsTable.id,
      testId: studentTestResultsTable.testId,
      testName: testsTable.testName,
      testType: testsTable.testType,
      date: testsTable.date,
      percentage: studentTestResultsTable.percentage,
      rank: studentTestResultsTable.rank,
      teacherNote: studentTestResultsTable.teacherNote,
      aiSummary: studentTestResultsTable.aiSummary,
    }).from(studentTestResultsTable)
      .innerJoin(testsTable, eq(studentTestResultsTable.testId, testsTable.id))
      .where(eq(studentTestResultsTable.studentId, student.id))
      .orderBy(desc(testsTable.date));

    const enriched = await Promise.all(results.map(async (r) => {
      const chapters = await db.select().from(testChaptersTable).where(eq(testChaptersTable.testId, r.testId));
      return {
        ...r,
        date: r.date ? new Date(r.date).toLocaleDateString("en-IN") : "N/A",
        rank: r.rank || "N/A",
        chapters: chapters.map(c => c.chapterName),
        teacherNote: r.teacherNote || "Good effort!",
        aiNote: r.aiSummary || "Keep practicing consistently.",
      };
    }));

    return res.json(enriched);
  } catch (err) {
    logger.error({ err }, "Student tests error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/student/progress", requireStudent, async (req: any, res) => {
  try {
    const students = await db.select().from(studentsTable).where(eq(studentsTable.userId, req.userId)).limit(1);
    const student = students[0];
    if (!student) return res.status(404).json({ error: "Student not found" });

    const results = await db.select({
      testName: testsTable.testName,
      testType: testsTable.testType,
      percentage: studentTestResultsTable.percentage,
      date: testsTable.date,
    }).from(studentTestResultsTable)
      .innerJoin(testsTable, eq(studentTestResultsTable.testId, testsTable.id))
      .where(eq(studentTestResultsTable.studentId, student.id))
      .orderBy(testsTable.date)
      .limit(10);

    const progressTrend = results.map((r, i) => ({
      name: `Test ${i + 1}`,
      score: Math.round(r.percentage),
      batch: 70,
    }));

    return res.json({
      subjects: {},
      progressTrend,
      syllabusCompletion: 60,
      completedChapters: [],
      totalChapters: 0,
    });
  } catch (err) {
    logger.error({ err }, "Student progress error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
