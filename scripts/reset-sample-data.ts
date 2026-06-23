/**
 * Reset Sample Data Script
 *
 * This script clears all sample/test data from the database:
 *   - Test results, scores, WhatsApp drafts, rank history
 *   - Scheduled tests, test records, test chapters
 *   - Student chapter assignments (progress tracking)
 *
 * It KEEPS: user accounts, student profiles, batches, chapter definitions
 *
 * Usage:
 *   pnpm --filter @workspace/db tsx ../../scripts/reset-sample-data.ts
 *   OR from repo root:
 *   cd lib/db && npx tsx ../../scripts/reset-sample-data.ts
 */

import { db, pool } from "../lib/db/src/index";
import {
  studentTestResultsTable,
  whatsappDraftsTable,
  rankHistoryTable,
  scheduledTestsTable,
  testChaptersTable,
  testsTable,
  studentChaptersTable,
  usersTable,
} from "../lib/db/src/schema";
import { ne } from "drizzle-orm";

async function resetSampleData() {
  console.log("\n🧹 Roman Academy — Reset Sample Data\n");
  console.log("This will delete all test results, scores, WhatsApp messages,");
  console.log("rank history, scheduled tests, and chapter progress.\n");
  console.log("User accounts, student profiles, and batches will be KEPT.\n");

  try {
    console.log("Deleting WhatsApp drafts...");
    const drafts = await db.delete(whatsappDraftsTable).returning({ id: whatsappDraftsTable.id });
    console.log(`  ✓ Deleted ${drafts.length} WhatsApp drafts`);

    console.log("Deleting test results...");
    const results = await db.delete(studentTestResultsTable).returning({ id: studentTestResultsTable.id });
    console.log(`  ✓ Deleted ${results.length} test results`);

    console.log("Deleting rank history...");
    const ranks = await db.delete(rankHistoryTable).returning({ id: rankHistoryTable.id });
    console.log(`  ✓ Deleted ${ranks.length} rank history entries`);

    console.log("Deleting scheduled tests...");
    const scheduled = await db.delete(scheduledTestsTable).returning({ id: scheduledTestsTable.id });
    console.log(`  ✓ Deleted ${scheduled.length} scheduled tests`);

    console.log("Deleting test chapter links...");
    const testChapters = await db.delete(testChaptersTable).returning({ id: testChaptersTable.id });
    console.log(`  ✓ Deleted ${testChapters.length} test chapter links`);

    console.log("Deleting tests...");
    const tests = await db.delete(testsTable).returning({ id: testsTable.id });
    console.log(`  ✓ Deleted ${tests.length} tests`);

    console.log("Resetting student chapter progress...");
    const studentChapters = await db.delete(studentChaptersTable).returning({ id: studentChaptersTable.id });
    console.log(`  ✓ Reset ${studentChapters.length} student chapter assignments`);

    console.log("\nResetting firstLogin flag for all students...");
    const updated = await db
      .update(usersTable)
      .set({ firstLogin: true })
      .where(ne(usersTable.username, "super_admin"))
      .returning({ username: usersTable.username });
    console.log(`  ✓ Reset firstLogin for ${updated.length} accounts`);

    console.log("\n✅ Database reset complete!");
    console.log("\nWhat was kept:");
    console.log("  • User accounts (teacher + all students)");
    console.log("  • Student profiles and contact info");
    console.log("  • Batch definitions (11th/12th Science 2026)");
    console.log("  • Chapter definitions\n");
    console.log("What was cleared:");
    console.log("  • All test results and scores");
    console.log("  • All WhatsApp message drafts");
    console.log("  • All rank history");
    console.log("  • All scheduled tests");
    console.log("  • All student chapter progress");
    console.log("  • firstLogin reset → students must change password on next login\n");
    console.log("The system is now ready for real use. 🎉\n");
  } catch (err) {
    console.error("❌ Error during reset:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetSampleData();
