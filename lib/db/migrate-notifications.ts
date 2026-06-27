import { db, pool } from "./src/index";
import { sql } from "drizzle-orm";

async function run() {
  console.log("Creating notifications table...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY NOT NULL,
      student_id TEXT NOT NULL REFERENCES students(id),
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      type TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_notifications_student_read ON notifications(student_id, is_read)
  `);
  console.log("✓ notifications table ready");

  console.log("Normalizing chapter subjects...");
  const result = await db.execute(sql`
    UPDATE chapters SET subject = 'Mathematics' WHERE subject = 'Maths'
  `);
  console.log(`✓ Normalized ${result.rowCount ?? 0} chapters`);

  await pool.end();
  console.log("Done");
}

run().catch(e => { console.error(e); process.exit(1); });
