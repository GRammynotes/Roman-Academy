import { db, pool } from "./src/index";
import { usersTable, studentsTable, batchesTable } from "./src/schema";
import { eq } from "drizzle-orm";
import * as bcryptjs from "bcryptjs";
import { randomUUID } from "crypto";

async function seed() {
  console.log("Seeding database...");

  const existingTeacher = await db.select().from(usersTable).where(eq(usersTable.username, "roman_sir")).limit(1);
  if (existingTeacher.length === 0) {
    const hash = await bcryptjs.hash("Roman@123", 10);
    await db.insert(usersTable).values({ id: randomUUID(), username: "roman_sir", passwordHash: hash, role: "TEACHER" });
    console.log("✓ Teacher created: roman_sir / Roman@123");
  } else {
    console.log("✓ Teacher already exists: roman_sir");
  }

  const existingBatch = await db.select().from(batchesTable).where(eq(batchesTable.name, "12th Science 2026")).limit(1);
  let batchId: string;
  if (existingBatch.length === 0) {
    const newBatchId = randomUUID();
    await db.insert(batchesTable).values({
      id: newBatchId,
      name: "12th Science 2026",
      classLevel: "TWELVE",
      stream: "SCIENCE_PCM",
      startDate: new Date("2025-06-01"),
    });
    batchId = newBatchId;
    console.log("✓ Batch created: 12th Science 2026");
  } else {
    batchId = existingBatch[0].id;
    console.log("✓ Batch exists: 12th Science 2026");
  }

  const existingDemo = await db.select().from(usersTable).where(eq(usersTable.username, "kunal.datkhile.11.2026")).limit(1);
  if (existingDemo.length === 0) {
    const hash = await bcryptjs.hash("student@123", 10);
    const userId = randomUUID();
    await db.insert(usersTable).values({ id: userId, username: "kunal.datkhile.11.2026", passwordHash: hash, role: "STUDENT" });
    await db.insert(studentsTable).values({
      id: randomUUID(),
      userId,
      batchId,
      fullName: "Kunal Datkhile",
      classLevel: "TWELVE",
      stream: "SCIENCE_PCM",
      batchType: "12th Science 2026",
      joinedDate: new Date(),
      whatsappContact: "919172765002",
    });
    console.log("✓ Demo student created: kunal.datkhile.11.2026 / student@123");
  } else {
    console.log("✓ Demo student already exists: kunal.datkhile.11.2026");
  }

  await pool.end();
  console.log("Seeding complete.");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
