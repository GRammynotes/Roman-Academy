import { pgTable, text, boolean, timestamp, integer, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roleEnum = pgEnum("role", ["TEACHER", "STUDENT"]);
export const classLevelEnum = pgEnum("class_level", ["ELEVEN", "TWELVE"]);
export const streamEnum = pgEnum("stream", ["SCIENCE_PCM", "COMMERCE_ADDON", "NEET_ADDON"]);
export const testTypeEnum = pgEnum("test_type", ["WEEKLY_CHAPTER", "MONTHLY", "QUARTERLY", "FULL_LENGTH_MOCK", "REVISION_TEST"]);
export const chapterStatusEnum = pgEnum("chapter_status", ["PLANNED", "ONGOING", "COMPLETED", "CATCH_UP", "REVISION"]);
export const draftStatusEnum = pgEnum("draft_status", ["DRAFT", "TEACHER_REVIEW", "APPROVED", "SENT", "FAILED"]);

export const usersTable = pgTable("users", {
  id: text("id").primaryKey().notNull(),
  role: roleEnum("role").notNull(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstLogin: boolean("first_login").default(true),
  pushToken: text("push_token"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const batchesTable = pgTable("batches", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull().unique(),
  classLevel: classLevelEnum("class_level").notNull(),
  stream: streamEnum("stream").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
  notes: text("notes"),
});

export const testsTable = pgTable("tests", {
  id: text("id").primaryKey().notNull(),
  testName: text("test_name").notNull(),
  testType: testTypeEnum("test_type").notNull(),
  classLevel: classLevelEnum("class_level").notNull(),
  stream: streamEnum("stream").notNull(),
  date: timestamp("date").notNull(),
  totalMarks: integer("total_marks").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const testChaptersTable = pgTable("test_chapters", {
  id: text("id").primaryKey().notNull(),
  testId: text("test_id").notNull().references(() => testsTable.id),
  chapterName: text("chapter_name").notNull(),
  subject: text("subject"),
});

export const studentTestResultsTable = pgTable("student_test_results", {
  id: text("id").primaryKey().notNull(),
  studentId: text("student_id").notNull().references(() => studentsTable.id),
  testId: text("test_id").notNull().references(() => testsTable.id),
  totalScored: integer("total_scored").notNull(),
  percentage: real("percentage").notNull(),
  rank: integer("rank"),
  teacherNote: text("teacher_note"),
  aiSummary: text("ai_summary"),
  whatsappStatus: draftStatusEnum("whatsapp_status").default("DRAFT"),
  createdAt: timestamp("created_at").defaultNow(),
});

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
});

export const chaptersTable = pgTable("chapters", {
  id: text("id").primaryKey().notNull(),
  chapterName: text("chapter_name").notNull(),
  subject: text("subject").notNull(),
  classLevel: classLevelEnum("class_level").notNull(),
  stream: streamEnum("stream").notNull(),
  priority: text("priority").notNull().default("High"),
  orderIndex: integer("order_index").notNull().default(0),
});

export const studentChaptersTable = pgTable("student_chapters", {
  id: text("id").primaryKey().notNull(),
  studentId: text("student_id").notNull().references(() => studentsTable.id),
  chapterId: text("chapter_id").references(() => chaptersTable.id),
  chapterName: text("chapter_name"),
  status: chapterStatusEnum("status").notNull().default("PLANNED"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const scheduledTestsTable = pgTable("scheduled_tests", {
  id: text("id").primaryKey().notNull(),
  batchId: text("batch_id").notNull().references(() => batchesTable.id),
  testName: text("test_name").notNull(),
  testType: testTypeEnum("test_type").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

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

export const insertStudentSchema = createInsertSchema(studentsTable);
export const insertTestResultSchema = createInsertSchema(studentTestResultsTable);

export type User = typeof usersTable.$inferSelect;
export type Student = typeof studentsTable.$inferSelect;
export type Test = typeof testsTable.$inferSelect;
export type StudentTestResult = typeof studentTestResultsTable.$inferSelect;
export type RankHistory = typeof rankHistoryTable.$inferSelect;
export type Batch = typeof batchesTable.$inferSelect;
export type WhatsAppDraft = typeof whatsappDraftsTable.$inferSelect;
