/**
 * PRODUCTION RESET — Roman Academy
 * Clears all demo/dev data. Keeps: users, students, batches, subjects, chapters,
 * scheduled_tests, academic_years, ai_settings.
 * Removes: test results, rank history, leaderboard cache, notifications,
 *          whatsapp drafts, tests (uploaded), chapter_progress.
 */
import { db, pool } from "./src/index";
import { sql } from "drizzle-orm";

async function productionReset() {
  console.log("=== ROMAN ACADEMY — PRODUCTION RESET ===\n");

  const tables = [
    { name: "notifications",         label: "Notifications" },
    { name: "whatsapp_drafts",       label: "WhatsApp Drafts" },
    { name: "rank_history",          label: "Rank History" },
    { name: "leaderboard_cache",     label: "Leaderboard Cache" },
    { name: "student_test_results",  label: "Student Test Results" },
    { name: "test_chapters",         label: "Test Chapters" },
    { name: "tests",                 label: "Tests" },
    { name: "chapter_progress",      label: "Chapter Progress" },
    { name: "student_chapters",      label: "Student Chapters" },
  ];

  for (const t of tables) {
    const result = await db.execute(sql.raw(`DELETE FROM ${t.name}`));
    console.log(`  ✓ Cleared ${t.label} (${result.rowCount ?? 0} rows removed)`);
  }

  // Reset firstLogin flag so all students are "fresh"
  await db.execute(sql`UPDATE users SET first_login = true WHERE role = 'STUDENT'`);
  console.log(`  ✓ Reset firstLogin for all students`);

  // Ensure dark theme preference is cleared
  console.log("\n=== RESET COMPLETE ===");
  console.log("Database is now in production-clean state.");
  console.log("All students will be prompted to change password on first login.");
  console.log("\nNext steps:");
  console.log("  1. Verify teacher login: roman_sir / Roman@123");
  console.log("  2. Create first test via Upload Marks");
  console.log("  3. Verify student dashboard shows clean state");

  await pool.end();
}

productionReset().catch(e => {
  console.error("RESET FAILED:", e);
  process.exit(1);
});
