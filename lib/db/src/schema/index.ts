import { pgTable, text, boolean, timestamp, integer, real, pgEnum, index, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roleEnum = pgEnum("role", ["TEACHER", "STUDENT"]);
export const classLevelEnum = pgEnum("class_level", ["ELEVEN", "TWELVE"]);
export const streamEnum = pgEnum("stream", ["SCIENCE_PCM", "COMMERCE_ADDON", "NEET_ADDON"]);
export const testTypeEnum = pgEnum("test_type", ["WEEKLY_CHAPTER", "MONTHLY", "QUARTERLY", "FULL_LENGTH_MOCK", "REVISION_TEST", "CET_MOCK"]);
export const chapterStatusEnum = pgEnum("chapter_status", ["PLANNED", "ONGOING", "COMPLETED", "CATCH_UP", "REVISION"]);
export const draftStatusEnum = pgEnum("draft_status", ["DRAFT", "TEACHER_REVIEW", "APPROVED", "SENT", "FAILED"]);
export const academicYearStatusEnum = pgEnum("academic_year_status", ["ACTIVE", "COMPLETED", "UPCOMING"]);
export const batchStatusEnum = pgEnum("batch_status", ["ACTIVE", "COMPLETED", "UPCOMING"]);
export const chapterProgressStatusEnum = pgEnum("chapter_progress_status", ["PENDING", "ONGOING", "COMPLETED"]);
export const leaderboardTypeEnum = pgEnum("leaderboard_type", ["WEEKLY", "MONTHLY", "QUARTERLY", "OVERALL"]);
export const testResultStatusEnum = pgEnum("test_result_status", ["PRESENT", "ABSENT"]);

// ── Academic Years ──────────────────────────────────────────────────────────
export const academicYearsTable = pgTable("academic_years", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull().unique(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  status: academicYearStatusEnum("status").notNull().default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Batches ─────────────────────────────────────────────────────────────────
export const batchesTable = pgTable("batches", {
  id: text("id").primaryKey().notNull(),
  academicYearId: text("academic_year_id").references(() => academicYearsTable.id),
  name: text("name").notNull().unique(),
  classLevel: classLevelEnum("class_level").notNull(),
  stream: streamEnum("stream").notNull(),
  status: batchStatusEnum("batch_status").notNull().default("ACTIVE"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  nextChapterId: text("next_chapter_id"),
  nextChapterName: text("next_chapter_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Users ───────────────────────────────────────────────────────────────────
export const usersTable = pgTable("users", {
  id: text("id").primaryKey().notNull(),
  role: roleEnum("role").notNull(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstLogin: boolean("first_login").default(true),
  isDemo: boolean("is_demo").default(false),
  pushToken: text("push_token"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Students ────────────────────────────────────────────────────────────────
export const studentsTable = pgTable("students", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id").notNull().references(() => usersTable.id),
  fullName: text("full_name").notNull(),
  classLevel: classLevelEnum("class_level").notNull(),
  stream: streamEnum("stream").notNull(),
  batchType: text("batch_type").notNull(),
  batchId: text("batch_id").references(() => batchesTable.id),
  joinedDate: timestamp("joined_date").notNull(),
  whatsappContact: text("whatsapp_contact"),
  parentContact: text("parent_contact"),
  catchUpMode: boolean("catch_up_mode").default(false),
  archived: boolean("archived").default(false),
  promoted: boolean("promoted").default(false),
  graduationYear: integer("graduation_year"),
  notes: text("notes"),
}, (t) => [
  index("idx_students_archived_batch").on(t.archived, t.batchType),
]);

// ── Subjects ─────────────────────────────────────────────────────────────────
export const subjectsTable = pgTable("subjects", {
  id: text("id").primaryKey().notNull(),
  batchId: text("batch_id").notNull().references(() => batchesTable.id),
  teacherId: text("teacher_id").references(() => usersTable.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("idx_subjects_batch").on(t.batchId),
]);

// ── Chapters ─────────────────────────────────────────────────────────────────
export const chaptersTable = pgTable("chapters", {
  id: text("id").primaryKey().notNull(),
  subjectId: text("subject_id").references(() => subjectsTable.id),
  chapterName: text("chapter_name").notNull(),
  subject: text("subject").notNull(),
  classLevel: classLevelEnum("class_level").notNull(),
  stream: streamEnum("stream").notNull(),
  priority: text("priority").notNull().default("High"),
  orderIndex: integer("order_index").notNull().default(0),
}, (t) => [
  index("idx_chapters_subject_class").on(t.subject, t.classLevel),
]);

// ── Chapter Progress (Batch-level teaching progress) ─────────────────────────
export const chapterProgressTable = pgTable("chapter_progress", {
  id: text("id").primaryKey().notNull(),
  chapterId: text("chapter_id").notNull().references(() => chaptersTable.id),
  batchId: text("batch_id").notNull().references(() => batchesTable.id),
  teacherId: text("teacher_id").references(() => usersTable.id),
  status: chapterProgressStatusEnum("status").notNull().default("PENDING"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [
  index("idx_chapter_progress_batch").on(t.batchId, t.status),
  index("idx_chapter_progress_chapter_batch").on(t.chapterId, t.batchId),
]);

// ── Tests ────────────────────────────────────────────────────────────────────
export const testsTable = pgTable("tests", {
  id: text("id").primaryKey().notNull(),
  batchId: text("batch_id").references(() => batchesTable.id),
  subjectId: text("subject_id").references(() => subjectsTable.id),
  testName: text("test_name").notNull(),
  testType: testTypeEnum("test_type").notNull(),
  classLevel: classLevelEnum("class_level").notNull(),
  stream: streamEnum("stream").notNull(),
  date: timestamp("date").notNull(),
  totalMarks: integer("total_marks").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [
  index("idx_tests_batch_date").on(t.batchId, t.date),
]);

// ── Test Chapters ────────────────────────────────────────────────────────────
export const testChaptersTable = pgTable("test_chapters", {
  id: text("id").primaryKey().notNull(),
  testId: text("test_id").notNull().references(() => testsTable.id),
  chapterId: text("chapter_id").references(() => chaptersTable.id),
  chapterName: text("chapter_name").notNull(),
  subject: text("subject"),
});

// ── Student Test Results ──────────────────────────────────────────────────────
export const studentTestResultsTable = pgTable("student_test_results", {
  id: text("id").primaryKey().notNull(),
  studentId: text("student_id").notNull().references(() => studentsTable.id),
  testId: text("test_id").notNull().references(() => testsTable.id),
  totalScored: integer("total_scored").notNull().default(0),
  percentage: real("percentage").notNull().default(0),
  rank: integer("rank"),
  status: testResultStatusEnum("test_result_status").notNull().default("PRESENT"),
  teacherNote: text("teacher_note"),
  aiSummary: text("ai_summary"),
  whatsappStatus: draftStatusEnum("whatsapp_status").default("DRAFT"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("idx_str_student_test").on(t.studentId, t.testId),
]);

// ── Leaderboard Cache ─────────────────────────────────────────────────────────
export const leaderboardCacheTable = pgTable("leaderboard_cache", {
  id: text("id").primaryKey().notNull(),
  studentId: text("student_id").notNull().references(() => studentsTable.id),
  batchId: text("batch_id").notNull().references(() => batchesTable.id),
  leaderboardType: leaderboardTypeEnum("leaderboard_type").notNull(),
  score: real("score").notNull().default(0),
  rank: integer("rank").notNull(),
  generatedAt: timestamp("generated_at").defaultNow(),
}, (t) => [
  index("idx_leaderboard_cache_batch_type").on(t.batchId, t.leaderboardType),
  index("idx_leaderboard_cache_student").on(t.studentId),
]);

// ── Rank History ──────────────────────────────────────────────────────────────
export const rankHistoryTable = pgTable("rank_history", {
  id: text("id").primaryKey().notNull(),
  studentId: text("student_id").notNull().references(() => studentsTable.id),
  testId: text("test_id").references(() => testsTable.id),
  scope: text("scope").notNull(),
  rank: integer("rank").notNull(),
  average: real("average").notNull(),
  lastTest: real("last_test"),
  rankMovement: integer("rank_movement"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("idx_rank_history_student_scope").on(t.studentId, t.scope),
]);

// ── Student Chapters (per-student progress view) ──────────────────────────────
export const studentChaptersTable = pgTable("student_chapters", {
  id: text("id").primaryKey().notNull(),
  studentId: text("student_id").notNull().references(() => studentsTable.id),
  chapterId: text("chapter_id").references(() => chaptersTable.id),
  chapterName: text("chapter_name"),
  status: chapterStatusEnum("status").notNull().default("PLANNED"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Scheduled Tests ───────────────────────────────────────────────────────────
export const scheduledTestsTable = pgTable("scheduled_tests", {
  id: text("id").primaryKey().notNull(),
  batchId: text("batch_id").notNull().references(() => batchesTable.id),
  testName: text("test_name").notNull(),
  testType: testTypeEnum("test_type").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── WhatsApp Drafts ───────────────────────────────────────────────────────────
export const whatsappDraftsTable = pgTable("whatsapp_drafts", {
  id: text("id").primaryKey().notNull(),
  studentId: text("student_id").notNull().references(() => studentsTable.id),
  testResultId: text("test_result_id").references(() => studentTestResultsTable.id),
  cadence: text("cadence").notNull(),
  status: draftStatusEnum("status").notNull().default("DRAFT"),
  draft: text("draft").notNull(),
  batchType: text("batch_type"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── AI Settings ───────────────────────────────────────────────────────────────
export const aiSettingsTable = pgTable("ai_settings", {
  id: text("id").primaryKey().notNull(),
  primaryProvider: text("primary_provider").notNull().default("openai"),
  fallbackProvider: text("fallback_provider").notNull().default("gemini"),
  whatsappNumber: text("whatsapp_number"),
  resultUploaded: boolean("result_uploaded").default(true),
  chapterCompleted: boolean("chapter_completed").default(true),
  quarterlyReminder: boolean("quarterly_reminder").default(true),
  walkthrough: boolean("walkthrough").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Zod Schemas ───────────────────────────────────────────────────────────────
export const insertStudentSchema = createInsertSchema(studentsTable);
export const insertTestResultSchema = createInsertSchema(studentTestResultsTable);

// ── Types ─────────────────────────────────────────────────────────────────────
export type AcademicYear = typeof academicYearsTable.$inferSelect;
export type Subject = typeof subjectsTable.$inferSelect;
export type ChapterProgress = typeof chapterProgressTable.$inferSelect;
export type LeaderboardCache = typeof leaderboardCacheTable.$inferSelect;
export type User = typeof usersTable.$inferSelect;
export type Student = typeof studentsTable.$inferSelect;
export type Test = typeof testsTable.$inferSelect;
export type StudentTestResult = typeof studentTestResultsTable.$inferSelect;
export type RankHistory = typeof rankHistoryTable.$inferSelect;
export type Batch = typeof batchesTable.$inferSelect;
export type WhatsAppDraft = typeof whatsappDraftsTable.$inferSelect;
