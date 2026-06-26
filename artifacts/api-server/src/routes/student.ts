import { Router } from "express";
import { db } from "@workspace/db";
import {
  studentsTable,
  usersTable,
  studentTestResultsTable,
  testsTable,
  testChaptersTable,
  studentChaptersTable,
  rankHistoryTable,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

function requireStudent(req: any, res: any, next: any) {
  const role = req.session?.role;
  if (role !== "student") {
    return res.status(403).json({ error: "Unauthorized" });
  }
  req.userId = req.session.userId;
  next();
}

async function getStudentRow(userId: string) {
  const rows = await db.select({
    id: studentsTable.id,
    fullName: studentsTable.fullName,
    classLevel: studentsTable.classLevel,
    stream: studentsTable.stream,
    batchType: studentsTable.batchType,
    whatsappContact: studentsTable.whatsappContact,
    joinedDate: studentsTable.joinedDate,
    isDemo: usersTable.isDemo,
  }).from(studentsTable)
    .innerJoin(usersTable, eq(studentsTable.userId, usersTable.id))
    .where(eq(studentsTable.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

router.get("/student/profile", requireStudent, async (req: any, res) => {
  try {
    const row = await getStudentRow(req.userId);
    if (!row) return res.status(404).json({ error: "Student not found" });
    const student = row;

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
      rank: ranks[0]?.rank || null,
      average: ranks[0]?.average || null,
      attendance: 90,
      cetReadiness: 72,
      currentChapter: ongoingChapter,
      nextTest: "Check schedule",
      mainProgress,
      completedChapters,
      weakChapters: [],
      isDemo: student.isDemo ?? false,
    });
  } catch (err) {
    logger.error({ err }, "Student profile error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/student/profile", requireStudent, async (req: any, res) => {
  try {
    const row = await getStudentRow(req.userId);
    if (!row) return res.status(404).json({ error: "Student not found" });

    if (row.isDemo) {
      return res.status(403).json({ error: "Demo account — profile editing is disabled." });
    }

    const { fullName, whatsappContact } = req.body;
    await db.update(studentsTable)
      .set({ fullName: fullName || row.fullName, whatsappContact: whatsappContact || row.whatsappContact })
      .where(eq(studentsTable.id, row.id));

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

    const chapters = await db.select({
      status: studentChaptersTable.status,
      chapterName: studentChaptersTable.chapterName,
    }).from(studentChaptersTable)
      .where(eq(studentChaptersTable.studentId, student.id));

    const totalChapters = chapters.length;
    const completedList = chapters.filter(c => c.status === "COMPLETED");
    const syllabusCompletion = totalChapters > 0
      ? Math.round((completedList.length / totalChapters) * 100)
      : 0;

    const avgScore = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
      : null;

    return res.json({
      subjects: {},
      progressTrend,
      syllabusCompletion,
      completedChapters: completedList.map(c => c.chapterName || ""),
      totalChapters,
      avgScore,
    });
  } catch (err) {
    logger.error({ err }, "Student progress error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
