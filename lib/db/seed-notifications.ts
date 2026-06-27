import { db, pool } from "./src/index";
import { studentsTable, notificationsTable } from "./src/schema";
import crypto from "crypto";

async function run() {
  const students = await db.select({ id: studentsTable.id, name: studentsTable.fullName })
    .from(studentsTable).limit(10);
  console.log(`Seeding notifications for ${students.length} students...`);

  const samples = [
    { title: "Chapter Started: Electric Charges", body: 'Your teacher has started "Electric Charges" (Physics). Follow along!', type: "chapter_start" },
    { title: "Chapter Completed: Relations and Functions", body: 'Your class has completed "Relations and Functions" (Mathematics). Review it!', type: "chapter_complete" },
    { title: "Test Result Uploaded", body: "Your marks for the Unit Test 1 have been recorded. Check your score!", type: "test_result" },
  ];

  for (const student of students) {
    for (const s of samples) {
      await db.insert(notificationsTable).values({
        id: crypto.randomUUID(),
        studentId: student.id,
        title: s.title,
        body: s.body,
        type: s.type,
        isRead: false,
      });
    }
    console.log(`  ✓ ${student.name}`);
  }

  console.log("Done");
  await pool.end();
}

run().catch(e => { console.error(e); process.exit(1); });
