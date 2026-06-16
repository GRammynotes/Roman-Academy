import { Router } from "express";
import { db } from "@workspace/db";
import {
  studentsTable,
  usersTable,
  studentTestResultsTable,
  rankHistoryTable,
  studentChaptersTable,
} from "@workspace/db";
import { eq, and, ilike, desc, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

function requireRole(allowedRoles: string[]) {
  return (req: any, res: any, next: any) => {
    const role = req.session?.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    req.userRole = role;
    next();
  };
}

router.get("/admin/students", requireRole(["teacher", "admin"]), async (req: any, res) => {
  try {
    const { stream, classLevel, batch } = req.query;

    const filters: any[] = [eq(studentsTable.archived, false)];
    if (stream) filters.push(eq(studentsTable.stream, stream as any));
    if (classLevel) filters.push(eq(studentsTable.classLevel, classLevel as any));
    if (batch && batch !== "all") filters.push(eq(studentsTable.batchType, batch as string));

    const students = await db.select({
      id: studentsTable.id,
      fullName: studentsTable.fullName,
      classLevel: studentsTable.classLevel,
      stream: studentsTable.stream,
      batchType: studentsTable.batchType,
      whatsappContact: studentsTable.whatsappContact,
      joinedDate: studentsTable.joinedDate,
      username: usersTable.username,
    }).from(studentsTable)
      .leftJoin(usersTable, eq(studentsTable.userId, usersTable.id))
      .where(and(...filters));

    const enriched = await Promise.all(students.map(async (s) => {
      const results = await db.select({ percentage: studentTestResultsTable.percentage })
        .from(studentTestResultsTable)
        .where(eq(studentTestResultsTable.studentId, s.id));

      const ranks = await db.select({ rank: rankHistoryTable.rank })
        .from(rankHistoryTable)
        .where(eq(rankHistoryTable.studentId, s.id))
        .orderBy(desc(rankHistoryTable.createdAt))
        .limit(1);

      return {
        ...s,
        testResults: results,
        ranks,
        attendance: [],
        syllabus: [],
        user: { username: s.username || "" },
      };
    }));

    return res.json(enriched);
  } catch (err) {
    logger.error({ err }, "Admin students error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/students/search", requireRole(["teacher", "admin"]), async (req: any, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json([]);

    const students = await db.select({
      id: studentsTable.id,
      fullName: studentsTable.fullName,
      batchType: studentsTable.batchType,
      classLevel: studentsTable.classLevel,
    }).from(studentsTable)
      .where(and(
        ilike(studentsTable.fullName, `%${q}%`),
        eq(studentsTable.archived, false)
      ))
      .limit(10);

    return res.json(students);
  } catch (err) {
    logger.error({ err }, "Admin student search error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
