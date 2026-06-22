#!/usr/bin/env npx tsx
/**
 * Roman Academy — Pre-Launch Reset Script
 * Usage: npx tsx scripts/prelaunch-reset.ts
 *
 * Resets all demo/test data before going live:
 *  - Deletes all test results, rank history, WhatsApp drafts
 *  - Resets all student firstLogin flags to true (forces password change on next login)
 *  - Keeps all student accounts, batches, chapters, teacher account, SUPER_ADMIN
 *  - Optionally removes demo students (pass --no-demo to keep them)
 */
import * as readline from "readline";
import * as dotenv from "dotenv";
dotenv.config();

import { db, pool } from "@workspace/db/src/index";
import {
  usersTable, studentsTable, studentTestResultsTable, rankHistoryTable,
  whatsappDraftsTable, testsTable, testChaptersTable, studentChaptersTable,
  scheduledTestsTable,
} from "@workspace/db/src/schema";
import { eq, ne } from "drizzle-orm";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string) => new Promise<string>(res => rl.question(q, res));

async function main() {
  console.log("\n🔔  Roman Academy — Pre-Launch Reset\n");
  console.log("   This will:");
  console.log("   ✦ Delete ALL test results, rank history, WhatsApp drafts");
  console.log("   ✦ Reset all student passwords to firstLogin = true");
  console.log("   ✦ Keep all accounts, batches, chapters, teacher & SUPER_ADMIN\n");

  const answer = await ask('   Type "PRELAUNCH" to confirm: ');
  if (answer.trim() !== "PRELAUNCH") {
    console.log("\n❌  Reset cancelled.");
    rl.close(); await pool.end(); return;
  }

  const keepDemo = (await ask("\n   Keep demo students? (y/n): ")).toLowerCase() === "y";
  rl.close();

  console.log("\n🔄  Resetting...");

  // 1. Delete test results
  await db.delete(studentTestResultsTable);
  console.log("  ✓ Test results cleared");

  // 2. Delete rank history
  await db.delete(rankHistoryTable);
  console.log("  ✓ Rank history cleared");

  // 3. Delete WhatsApp drafts
  await db.delete(whatsappDraftsTable);
  console.log("  ✓ WhatsApp drafts cleared");

  // 4. Delete tests + chapters
  await db.delete(testChaptersTable);
  await db.delete(testsTable);
  console.log("  ✓ Tests cleared");

  // 5. Clear scheduled tests
  await db.delete(scheduledTestsTable);
  console.log("  ✓ Scheduled tests cleared");

  // 6. Reset student chapter progress
  await db.delete(studentChaptersTable);
  console.log("  ✓ Student chapter progress cleared");

  // 7. Reset firstLogin for ALL student users
  await db.update(usersTable)
    .set({ firstLogin: true })
    .where(eq(usersTable.role, "STUDENT"));
  console.log("  ✓ All student firstLogin flags reset to true");

  // 8. Handle demo students
  if (!keepDemo) {
    const demoStudents = await db.select().from(studentsTable).where(eq(studentsTable.isDemo, true));
    for (const s of demoStudents) {
      await db.delete(studentsTable).where(eq(studentsTable.id, s.id));
      await db.delete(usersTable).where(eq(usersTable.id, s.userId));
    }
    console.log(`  ✓ Removed ${demoStudents.length} demo student(s)`);
  } else {
    console.log("  ✓ Demo students kept");
  }

  await pool.end();
  console.log("\n✅  Pre-launch reset complete!");
  console.log("   - All students will be prompted to change their password on first login.");
  console.log("   - Teacher login: roman_sir (password unchanged)");
  console.log("   - SUPER_ADMIN login: super_admin (password unchanged)\n");
}

main().catch(e => { console.error(e); process.exit(1); });
