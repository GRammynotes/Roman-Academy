#!/usr/bin/env npx tsx
/**
 * Roman Academy — Database Restore Script
 * Usage: npx tsx scripts/restore-db.ts <backup-file.sql>
 * ⚠️  WARNING: This will DROP and recreate all tables. Use only in emergencies.
 */
import { execSync } from "child_process";
import { existsSync } from "fs";
import * as readline from "readline";
import * as dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL env var is not set.");
  process.exit(1);
}

const backupFile = process.argv[2];
if (!backupFile) {
  console.error("❌  Usage: npx tsx scripts/restore-db.ts <backup-file.sql>");
  process.exit(1);
}

if (!existsSync(backupFile)) {
  console.error(`❌  Backup file not found: ${backupFile}`);
  process.exit(1);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question(
  `\n⚠️  WARNING: This will OVERWRITE the current database with ${backupFile}.\n` +
  `   All current data will be permanently lost!\n\n` +
  `   Type "RESTORE" to confirm: `,
  (answer) => {
    rl.close();
    if (answer.trim() !== "RESTORE") {
      console.log("❌  Restore cancelled.");
      process.exit(0);
    }

    console.log(`\n🔄  Restoring database from: ${backupFile}`);
    try {
      execSync(`psql "${DATABASE_URL}" -f "${backupFile}" --no-password`, { stdio: "inherit" });
      console.log("\n✅  Database restored successfully!");
      console.log("   ⚠️  Reminder: Run the seed script if demo data is needed.");
    } catch (err) {
      console.error("\n❌  psql restore failed:", err);
      process.exit(1);
    }
  }
);
