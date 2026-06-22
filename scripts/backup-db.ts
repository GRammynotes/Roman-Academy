#!/usr/bin/env npx tsx
/**
 * Roman Academy — Database Backup Script
 * Usage: npx tsx scripts/backup-db.ts [output-dir]
 * Creates a timestamped SQL dump of the production database.
 */
import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import * as dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL env var is not set.");
  process.exit(1);
}

const outputDir = process.argv[2] || "./backups";
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

const now = new Date();
const stamp = now.toISOString().replace(/[:T]/g, "-").split(".")[0];
const filename = join(outputDir, `roman-academy-${stamp}.sql`);

console.log(`📦  Backing up database to: ${filename}`);

try {
  execSync(`pg_dump "${DATABASE_URL}" -f "${filename}" --no-password --verbose`, { stdio: "inherit" });
  console.log(`\n✅  Backup complete: ${filename}`);
} catch (err) {
  console.error("\n❌  pg_dump failed:", err);
  process.exit(1);
}
