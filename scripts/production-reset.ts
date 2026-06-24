/**
 * PRODUCTION RESET SCRIPT
 * 
 * PURPOSE: Clean academic year start.
 *
 * PRESERVES:
 *   - Teacher accounts (roman_sir, super_admin)
 *   - Student profiles and user accounts
 *   - Batch structure
 *   - Chapter definitions
 *   - Subjects
 *   - Academic year record
 *   - AI settings
 *
 * RESETS:
 *   - All test results (student_test_results)
 *   - All tests (tests + test_chapters)
 *   - All rank history (rank_history)
 *   - All leaderboard cache (leaderboard_cache)
 *   - All chapter progress → PENDING
 *   - All student chapter statuses → PLANNED
 *   - All WhatsApp drafts
 *   - All scheduled tests
 *   - firstLogin = true for all students
 *
 * RUN: pnpm exec tsx scripts/production-reset.ts
 */

import { db, pool } from "../lib/db/src/index";
import {
  usersTable,
  studentsTable,
  studentTestResultsTable,
  testsTable,
  testChaptersTable,
  rankHistoryTable,
  whatsappDraftsTable,
  scheduledTestsTable,
  studentChaptersTable,
  chapterProgressTable,
  leaderboardCacheTable,
} from "../lib/db/src/schema";
import { eq, inArray, sql } from "drizzle-orm";

async function productionReset() {
  console.log("\n⚠️  ROMAN ACADEMY PRODUCTION RESET");
  console.log("=====================================");
  console.log("This will clear all test data, scores, and rankings.");
  console.log("Teacher accounts, students, and chapter definitions are preserved.\n");

  // ── Step 1: Clear WhatsApp drafts ─────────────────────────────────────────
  console.log("🗑️  Clearing WhatsApp drafts...");
  const draftsDeleted = await db.delete(whatsappDraftsTable).returning({ id: whatsappDraftsTable.id });
  console.log(`   ✓ ${draftsDeleted.length} drafts deleted`);

  // ── Step 2: Clear student test results ───────────────────────────────────
  console.log("🗑️  Clearing student test results...");
  const resultsDeleted = await db.delete(studentTestResultsTable).returning({ id: studentTestResultsTable.id });
  console.log(`   ✓ ${resultsDeleted.length} results deleted`);

  // ── Step 3: Clear test chapters ───────────────────────────────────────────
  console.log("🗑️  Clearing test chapter mappings...");
  const testChaptersDeleted = await db.delete(testChaptersTable).returning({ id: testChaptersTable.id });
  console.log(`   ✓ ${testChaptersDeleted.length} test-chapter links deleted`);

  // ── Step 4: Clear tests ───────────────────────────────────────────────────
  console.log("🗑️  Clearing tests...");
  const testsDeleted = await db.delete(testsTable).returning({ id: testsTable.id });
  console.log(`   ✓ ${testsDeleted.length} tests deleted`);

  // ── Step 5: Clear rank history ────────────────────────────────────────────
  console.log("🗑️  Clearing rank history...");
  const ranksDeleted = await db.delete(rankHistoryTable).returning({ id: rankHistoryTable.id });
  console.log(`   ✓ ${ranksDeleted.length} rank records deleted`);

  // ── Step 6: Clear leaderboard cache ──────────────────────────────────────
  console.log("🗑️  Clearing leaderboard cache...");
  try {
    const cacheDeleted = await db.delete(leaderboardCacheTable).returning({ id: leaderboardCacheTable.id });
    console.log(`   ✓ ${cacheDeleted.length} leaderboard cache entries deleted`);
  } catch {
    console.log("   ℹ️  leaderboard_cache table not yet created (will be after migration)");
  }

  // ── Step 7: Clear scheduled tests ────────────────────────────────────────
  console.log("🗑️  Clearing scheduled tests...");
  const scheduledDeleted = await db.delete(scheduledTestsTable).returning({ id: scheduledTestsTable.id });
  console.log(`   ✓ ${scheduledDeleted.length} scheduled tests deleted`);

  // ── Step 8: Reset student chapter statuses → PLANNED ─────────────────────
  console.log("🔄  Resetting all student chapter statuses to PLANNED...");
  const chaptersReset = await db.update(studentChaptersTable)
    .set({ status: "PLANNED", updatedAt: new Date() })
    .returning({ id: studentChaptersTable.id });
  console.log(`   ✓ ${chaptersReset.length} student chapter records reset`);

  // ── Step 9: Reset chapter progress → PENDING ─────────────────────────────
  console.log("🔄  Resetting all chapter progress to PENDING...");
  try {
    const progressReset = await db.update(chapterProgressTable)
      .set({ status: "PENDING", startedAt: null, completedAt: null, updatedAt: new Date() })
      .returning({ id: chapterProgressTable.id });
    console.log(`   ✓ ${progressReset.length} chapter progress records reset`);
  } catch {
    console.log("   ℹ️  chapter_progress table not yet created (will be after migration)");
  }

  // ── Step 10: Set firstLogin = true for all students ───────────────────────
  console.log("🔄  Setting firstLogin = true for all student accounts...");
  const allStudents = await db.select({ userId: studentsTable.userId }).from(studentsTable)
    .where(eq(studentsTable.archived, false));
  const studentUserIds = allStudents.map(s => s.userId);

  if (studentUserIds.length > 0) {
    const usersUpdated = await db.update(usersTable)
      .set({ firstLogin: true })
      .where(inArray(usersTable.id, studentUserIds))
      .returning({ id: usersTable.id });
    console.log(`   ✓ ${usersUpdated.length} student accounts set to firstLogin = true`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const teacherCount = await db.select({ count: sql<number>`count(*)` })
    .from(usersTable).where(eq(usersTable.role, "TEACHER"));
  const studentCount = await db.select({ count: sql<number>`count(*)` })
    .from(studentsTable).where(eq(studentsTable.archived, false));

  console.log("\n✅ PRODUCTION RESET COMPLETE");
  console.log("============================");
  console.log(`   Teachers preserved: ${teacherCount[0].count}`);
  console.log(`   Students preserved: ${studentCount[0].count}`);
  console.log("   All test data: CLEARED");
  console.log("   All rankings: CLEARED");
  console.log("   All chapter progress: RESET to PENDING");
  console.log("   All student chapters: RESET to PLANNED");
  console.log("   All students: firstLogin = true (password reset required)");
  console.log("\n📌 Next: Run 'pnpm exec tsx lib/db/seed.ts' to populate fresh data.\n");

  await pool.end();
}

productionReset().catch((e) => {
  console.error("❌ Reset failed:", e);
  process.exit(1);
});
