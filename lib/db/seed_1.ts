import { db, pool } from "./src/index";
import {
  usersTable, studentsTable, batchesTable, testsTable, testChaptersTable,
  studentTestResultsTable, rankHistoryTable, chaptersTable, studentChaptersTable,
  whatsappDraftsTable, scheduledTestsTable,
} from "./src/schema";
import { eq, and, inArray } from "drizzle-orm";
import * as bcryptjs from "bcryptjs";
import { randomUUID } from "crypto";

const TEACHER_ID = "f77cf0ed-8ac3-4e83-8f5c-603b56e52b34";
const KUNAL_USERNAME = "kunal.datkhile.2026";

function daysAgo(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function daysFromNow(n: number) { const d = new Date(); d.setDate(d.getDate() + n); return d; }

function skillOf(idx: number, base: number[]): number { return base[idx % base.length]; }

function calcScore(totalMarks: number, skill: number, testIdx: number, studentIdx: number): number {
  const jitter = ((studentIdx * 7 + testIdx * 13) % 15) - 7;
  const raw = totalMarks * skill + jitter;
  return Math.round(Math.min(totalMarks, Math.max(Math.round(totalMarks * 0.35), raw)));
}

function aiNote(pct: number): string {
  if (pct >= 85) return "Outstanding! Excellent command over the subject. Maintain consistency and push for 90%+.";
  if (pct >= 75) return "Very good performance. Minor errors cost marks — review and aim higher next time.";
  if (pct >= 65) return "Good effort. Concept clarity is improving. Work on problem-solving speed and accuracy.";
  if (pct >= 55) return "Needs improvement. Gaps in fundamentals identified. Schedule a revision session with Roman sir.";
  return "Below target. Immediate action needed. Daily practice and concept revision is strongly recommended.";
}

function teacherNote(pct: number): string {
  if (pct >= 75) return "Keep it up! Very consistent performance.";
  if (pct >= 65) return "Good work. Focus more on application problems.";
  return "Please revise the covered chapters and attempt more practice sets.";
}

function wasDraft(studentId: string, studentName: string, testResultId: string, testName: string, pct: number, batchType: string): any {
  return {
    id: randomUUID(),
    studentId,
    testResultId,
    cadence: "result_uploaded",
    status: "DRAFT" as const,
    batchType,
    draft: `🙏 Dear Parent,\n\n${studentName} scored *${pct}%* in *${testName}*.\n\n📝 ${teacherNote(pct)}\n\n🤖 ${aiNote(pct)}\n\nFor any queries, please reach out to Roman Academy.\n\n— Roman Sir`,
  };
}

async function wipeStudentData() {
  console.log("\n🗑️  Wiping old student data...");

  const allStudents = await db.select({ id: studentsTable.id }).from(studentsTable);
  const studentIds = allStudents.map(s => s.id);

  if (studentIds.length > 0) {
    const allResults = await db.select({ id: studentTestResultsTable.id }).from(studentTestResultsTable)
      .where(inArray(studentTestResultsTable.studentId, studentIds));
    const resultIds = allResults.map(r => r.id);

    if (resultIds.length > 0) {
      await db.delete(whatsappDraftsTable).where(inArray(whatsappDraftsTable.testResultId, resultIds));
    }
    await db.delete(whatsappDraftsTable).where(inArray(whatsappDraftsTable.studentId, studentIds));
    await db.delete(studentTestResultsTable).where(inArray(studentTestResultsTable.studentId, studentIds));
    await db.delete(rankHistoryTable).where(inArray(rankHistoryTable.studentId, studentIds));
    await db.delete(studentChaptersTable).where(inArray(studentChaptersTable.studentId, studentIds));
    await db.delete(studentsTable).where(inArray(studentsTable.id, studentIds));
  }

  const allTestIds = await db.select({ id: testsTable.id }).from(testsTable);
  const testIds = allTestIds.map(t => t.id);
  if (testIds.length > 0) {
    await db.delete(testChaptersTable).where(inArray(testChaptersTable.testId, testIds));
  }
  await db.delete(testsTable);

  const allBatchIds = await db.select({ id: batchesTable.id }).from(batchesTable);
  const batchIds = allBatchIds.map(b => b.id);
  if (batchIds.length > 0) {
    await db.delete(scheduledTestsTable).where(inArray(scheduledTestsTable.batchId, batchIds));
  }
  await db.delete(batchesTable);
  await db.delete(chaptersTable);

  const nonTeacherUsers = await db.select({ id: usersTable.id }).from(usersTable)
    .where(eq(usersTable.role, "STUDENT"));
  if (nonTeacherUsers.length > 0) {
    await db.delete(usersTable).where(inArray(usersTable.id, nonTeacherUsers.map(u => u.id)));
  }

  console.log("  ✓ All old student data cleared");
}

async function ensureBatch(name: string, classLevel: "ELEVEN" | "TWELVE", stream: "SCIENCE_PCM" | "COMMERCE_ADDON" | "NEET_ADDON", startDate: Date) {
  const existing = await db.select().from(batchesTable).where(eq(batchesTable.name, name)).limit(1);
  if (existing.length > 0) { console.log(`  ✓ Batch exists: ${name}`); return existing[0].id; }
  const id = randomUUID();
  await db.insert(batchesTable).values({ id, name, classLevel, stream, startDate });
  console.log(`  ✓ Batch created: ${name}`);
  return id;
}

async function createStudent(
  fullName: string, phone: string, parentPhone: string,
  classLevel: "ELEVEN" | "TWELVE", stream: "SCIENCE_PCM", batchType: string, batchId: string,
  joinedDate: Date, isDemo = false
): Promise<{ userId: string; studentId: string; username: string }> {
  const year = "2026";
  const username = fullName.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "") + "." + year;

  const hash = await bcryptjs.hash("student@123", 10);
  const userId = randomUUID();
  const studentId = randomUUID();
  await db.insert(usersTable).values({ id: userId, username, passwordHash: hash, role: "STUDENT", isDemo });
  await db.insert(studentsTable).values({
    id: studentId, userId, fullName, classLevel, stream, batchType, batchId, joinedDate,
    whatsappContact: phone, parentContact: parentPhone,
  });
  return { userId, studentId, username };
}

async function ensureTest(testName: string, testType: any, classLevel: any, stream: any, date: Date, totalMarks: number) {
  const existing = await db.select().from(testsTable)
    .where(and(eq(testsTable.testName, testName), eq(testsTable.classLevel, classLevel))).limit(1);
  if (existing.length > 0) { console.log(`  ✓ Test exists: ${testName}`); return existing[0].id; }
  const id = randomUUID();
  await db.insert(testsTable).values({ id, testName, testType, classLevel, stream, date, totalMarks });
  console.log(`  ✓ Test created: ${testName}`);
  return id;
}

async function ensureChapters(chapters: Array<{ name: string; subject: string; classLevel: any; stream: any; order: number }>) {
  const ids: Record<string, string> = {};
  for (const ch of chapters) {
    const existing = await db.select().from(chaptersTable)
      .where(and(eq(chaptersTable.chapterName, ch.name), eq(chaptersTable.classLevel, ch.classLevel))).limit(1);
    if (existing.length > 0) { ids[ch.name] = existing[0].id; continue; }
    const id = randomUUID();
    await db.insert(chaptersTable).values({ id, chapterName: ch.name, subject: ch.subject, classLevel: ch.classLevel, stream: ch.stream, priority: "High", orderIndex: ch.order });
    ids[ch.name] = id;
  }
  return ids;
}

async function seed() {
  console.log("\n🌱 Seeding Roman Academy database...\n");

  await wipeStudentData();

  // ── Teacher ──────────────────────────────────────────────────────────────
  console.log("\n👤 Teacher");
  const existingTeacher = await db.select().from(usersTable).where(eq(usersTable.id, TEACHER_ID)).limit(1);
  if (existingTeacher.length === 0) {
    const hash = await bcryptjs.hash("Roman@123", 10);
    await db.insert(usersTable).values({ id: TEACHER_ID, username: "roman_sir", passwordHash: hash, role: "TEACHER" });
    console.log("  ✓ Teacher created: roman_sir / Roman@123");
  } else {
    console.log("  ✓ Teacher already exists: roman_sir");
  }

  // ── Batches ──────────────────────────────────────────────────────────────
  console.log("\n📚 Batches");
  const batch11Id = await ensureBatch("11th Science 2026", "ELEVEN", "SCIENCE_PCM", new Date("2025-06-01"));
  const batch12Id = await ensureBatch("12th Science 2026", "TWELVE", "SCIENCE_PCM", new Date("2024-06-01"));

  // ── 11th Students (6) ────────────────────────────────────────────────────
  console.log("\n🎓 11th Science students (6)");
  const eleventh = [
    { name: "Aarav Sharma",    phone: "919876543210", parent: "919876543110" },
    { name: "Priya Patel",     phone: "919876543211", parent: "919876543111" },
    { name: "Rohit Desai",     phone: "919876543212", parent: "919876543112" },
    { name: "Sneha Kulkarni",  phone: "919876543213", parent: "919876543113" },
    { name: "Yash Joshi",      phone: "919876543214", parent: "919876543114" },
    { name: "Anjali Nair",     phone: "919876543215", parent: "919876543115" },
  ];
  const skills11 = [0.82, 0.71, 0.88, 0.65, 0.77, 0.91];

  const eleventh_students: Array<{ userId: string; studentId: string; username: string; name: string; skill: number }> = [];
  for (let i = 0; i < eleventh.length; i++) {
    const s = await createStudent(eleventh[i].name, eleventh[i].phone, eleventh[i].parent, "ELEVEN", "SCIENCE_PCM", "11th Science 2026", batch11Id, daysAgo(60 + i));
    eleventh_students.push({ ...s, name: eleventh[i].name, skill: skillOf(i, skills11) });
  }
  console.log(`  ✓ ${eleventh_students.length} students created`);

  // ── 12th Students (12) ───────────────────────────────────────────────────
  console.log("\n🎓 12th Science students (12)");
  const twelfth = [
    { name: "Kunal Datkhile",  phone: "919172765002", parent: "919172765001", isDemo: true },
    { name: "Sonal Pawar",     phone: "919876543301", parent: "919876543401", isDemo: false },
    { name: "Prachi Kulkarni", phone: "919876543302", parent: "919876543402", isDemo: false },
    { name: "Aditya Shinde",   phone: "919876543303", parent: "919876543403", isDemo: false },
    { name: "Ritik Sawant",    phone: "919876543304", parent: "919876543404", isDemo: false },
    { name: "Neha Joshi",      phone: "919876543305", parent: "919876543405", isDemo: false },
    { name: "Rajan Patil",     phone: "919876543306", parent: "919876543406", isDemo: false },
    { name: "Swati Desai",     phone: "919876543307", parent: "919876543407", isDemo: false },
    { name: "Amol Bhosale",    phone: "919876543308", parent: "919876543408", isDemo: false },
    { name: "Pooja Sharma",    phone: "919876543309", parent: "919876543409", isDemo: false },
    { name: "Karthik Nair",    phone: "919876543310", parent: "919876543410", isDemo: false },
    { name: "Rishab Mehta",    phone: "919876543311", parent: "919876543411", isDemo: false },
  ];
  const skills12 = [0.73, 0.86, 0.92, 0.68, 0.77, 0.84, 0.65, 0.89, 0.71, 0.80, 0.94, 0.63];

  const twelfth_students: Array<{ userId: string; studentId: string; username: string; name: string; skill: number }> = [];
  for (let i = 0; i < twelfth.length; i++) {
    const s = await createStudent(twelfth[i].name, twelfth[i].phone, twelfth[i].parent, "TWELVE", "SCIENCE_PCM", "12th Science 2026", batch12Id, daysAgo(200 + i), twelfth[i].isDemo);
    twelfth_students.push({ ...s, name: twelfth[i].name, skill: skillOf(i, skills12) });
  }
  console.log(`  ✓ ${twelfth_students.length} students created`);

  // ── Chapters ─────────────────────────────────────────────────────────────
  console.log("\n📖 Chapters");
  const chapters11 = await ensureChapters([
    { name: "Physical World & Units",           subject: "Physics",   classLevel: "ELEVEN", stream: "SCIENCE_PCM", order: 1 },
    { name: "Laws of Motion",                   subject: "Physics",   classLevel: "ELEVEN", stream: "SCIENCE_PCM", order: 2 },
    { name: "Work Energy & Power",              subject: "Physics",   classLevel: "ELEVEN", stream: "SCIENCE_PCM", order: 3 },
    { name: "Thermal Properties of Matter",     subject: "Physics",   classLevel: "ELEVEN", stream: "SCIENCE_PCM", order: 4 },
    { name: "Some Basic Concepts of Chemistry", subject: "Chemistry", classLevel: "ELEVEN", stream: "SCIENCE_PCM", order: 5 },
    { name: "Structure of Atom",                subject: "Chemistry", classLevel: "ELEVEN", stream: "SCIENCE_PCM", order: 6 },
    { name: "Chemical Bonding",                 subject: "Chemistry", classLevel: "ELEVEN", stream: "SCIENCE_PCM", order: 7 },
    { name: "Sets",                             subject: "Maths",     classLevel: "ELEVEN", stream: "SCIENCE_PCM", order: 8 },
    { name: "Relations and Functions",          subject: "Maths",     classLevel: "ELEVEN", stream: "SCIENCE_PCM", order: 9 },
    { name: "Trigonometric Functions",          subject: "Maths",     classLevel: "ELEVEN", stream: "SCIENCE_PCM", order: 10 },
  ]);

  const chapters12 = await ensureChapters([
    { name: "Electrostatics",                   subject: "Physics",   classLevel: "TWELVE", stream: "SCIENCE_PCM", order: 1 },
    { name: "Current Electricity",              subject: "Physics",   classLevel: "TWELVE", stream: "SCIENCE_PCM", order: 2 },
    { name: "Magnetic Effects of Current",      subject: "Physics",   classLevel: "TWELVE", stream: "SCIENCE_PCM", order: 3 },
    { name: "Electromagnetic Induction",        subject: "Physics",   classLevel: "TWELVE", stream: "SCIENCE_PCM", order: 4 },
    { name: "Solid State",                      subject: "Chemistry", classLevel: "TWELVE", stream: "SCIENCE_PCM", order: 5 },
    { name: "Solutions",                        subject: "Chemistry", classLevel: "TWELVE", stream: "SCIENCE_PCM", order: 6 },
    { name: "Electrochemistry",                 subject: "Chemistry", classLevel: "TWELVE", stream: "SCIENCE_PCM", order: 7 },
    { name: "Chemical Kinetics",                subject: "Chemistry", classLevel: "TWELVE", stream: "SCIENCE_PCM", order: 8 },
    { name: "Relations & Functions (12th)",     subject: "Maths",     classLevel: "TWELVE", stream: "SCIENCE_PCM", order: 9 },
    { name: "Matrices",                         subject: "Maths",     classLevel: "TWELVE", stream: "SCIENCE_PCM", order: 10 },
    { name: "Determinants",                     subject: "Maths",     classLevel: "TWELVE", stream: "SCIENCE_PCM", order: 11 },
  ]);
  console.log("  ✓ Chapters ready");

  // ── Student Chapters ─────────────────────────────────────────────────────
  const ch11Names = Object.keys(chapters11);
  const ch12Names = Object.keys(chapters12);

  async function assignChapters(studentId: string, chapterIds: Record<string, string>, names: string[]) {
    for (let i = 0; i < names.length; i++) {
      const chapterId = chapterIds[names[i]];
      if (!chapterId) continue;
      const status = i < names.length * 0.4 ? "COMPLETED" : i < names.length * 0.6 ? "ONGOING" : "PLANNED";
      await db.insert(studentChaptersTable).values({ id: randomUUID(), studentId, chapterId, chapterName: names[i], status: status as any });
    }
  }

  for (const s of eleventh_students) await assignChapters(s.studentId, chapters11, ch11Names);
  for (const s of twelfth_students) await assignChapters(s.studentId, chapters12, ch12Names);
  console.log("  ✓ Student chapters assigned");

  // ── Tests ─────────────────────────────────────────────────────────────────
  console.log("\n📝 Tests");
  const test11_1 = await ensureTest("Weekly Test 1 - Laws of Motion",     "WEEKLY_CHAPTER", "ELEVEN", "SCIENCE_PCM", daysAgo(35), 100);
  const test11_2 = await ensureTest("Weekly Test 2 - Work Energy Power",  "WEEKLY_CHAPTER", "ELEVEN", "SCIENCE_PCM", daysAgo(21), 100);
  const test11_3 = await ensureTest("Monthly Test - November",            "MONTHLY",         "ELEVEN", "SCIENCE_PCM", daysAgo(7),  200);

  const test12_1 = await ensureTest("Weekly Test 1 - Electrostatics",     "WEEKLY_CHAPTER", "TWELVE", "SCIENCE_PCM", daysAgo(35), 100);
  const test12_2 = await ensureTest("Weekly Test 2 - Current Electricity", "WEEKLY_CHAPTER","TWELVE", "SCIENCE_PCM", daysAgo(21), 100);
  const test12_3 = await ensureTest("Monthly Test - November",            "MONTHLY",         "TWELVE", "SCIENCE_PCM", daysAgo(7),  200);

  async function addTestChapters(testId: string, chapters: Array<{ name: string; subject: string }>) {
    for (const ch of chapters) {
      const existing = await db.select().from(testChaptersTable).where(and(eq(testChaptersTable.testId, testId), eq(testChaptersTable.chapterName, ch.name))).limit(1);
      if (existing.length === 0) {
        await db.insert(testChaptersTable).values({ id: randomUUID(), testId, chapterName: ch.name, subject: ch.subject });
      }
    }
  }
  await addTestChapters(test11_1, [{ name: "Laws of Motion", subject: "Physics" }, { name: "Scalars & Vectors", subject: "Physics" }]);
  await addTestChapters(test11_2, [{ name: "Work Energy & Power", subject: "Physics" }, { name: "Friction", subject: "Physics" }]);
  await addTestChapters(test11_3, [{ name: "Laws of Motion", subject: "Physics" }, { name: "Some Basic Concepts of Chemistry", subject: "Chemistry" }, { name: "Sets", subject: "Maths" }]);
  await addTestChapters(test12_1, [{ name: "Electrostatics", subject: "Physics" }, { name: "Electric Potential", subject: "Physics" }]);
  await addTestChapters(test12_2, [{ name: "Current Electricity", subject: "Physics" }, { name: "Ohm's Law", subject: "Physics" }]);
  await addTestChapters(test12_3, [{ name: "Electrostatics", subject: "Physics" }, { name: "Solid State", subject: "Chemistry" }, { name: "Relations & Functions (12th)", subject: "Maths" }]);
  console.log("  ✓ Test chapters added");

  // ── Test Results ──────────────────────────────────────────────────────────
  console.log("\n📊 Test results");

  async function insertResult(studentId: string, testId: string, totalMarks: number, skill: number, testIdx: number, studentIdx: number, name: string, batchType: string): Promise<{ resultId: string; pct: number; testName: string } | null> {
    const scored = calcScore(totalMarks, skill, testIdx, studentIdx);
    const pct = Math.round((scored / totalMarks) * 100);
    const note = teacherNote(pct);
    const ai = aiNote(pct);

    const test = await db.select({ testName: testsTable.testName }).from(testsTable).where(eq(testsTable.id, testId)).limit(1);
    const testNameStr = test[0]?.testName ?? "Test";

    const resultId = randomUUID();
    await db.insert(studentTestResultsTable).values({
      id: resultId, studentId, testId, totalScored: scored, percentage: pct,
      teacherNote: note, aiSummary: ai, whatsappStatus: "DRAFT",
    });
    return { resultId, pct, testName: testNameStr };
  }

  const results11: Array<{ studentId: string; name: string; skill: number; scores: number[]; lastTestPct: number; batchType: string }> = [];
  for (let i = 0; i < eleventh_students.length; i++) {
    const s = eleventh_students[i];
    const r1 = await insertResult(s.studentId, test11_1, 100, s.skill, 0, i, s.name, "11th Science 2026");
    const r2 = await insertResult(s.studentId, test11_2, 100, s.skill, 1, i, s.name, "11th Science 2026");
    const r3 = await insertResult(s.studentId, test11_3, 200, s.skill, 2, i, s.name, "11th Science 2026");
    const scores = [r1?.pct ?? 0, r2?.pct ?? 0, r3?.pct ?? 0].filter(Boolean);
    results11.push({ studentId: s.studentId, name: s.name, skill: s.skill, scores, lastTestPct: r3?.pct ?? r2?.pct ?? r1?.pct ?? 0, batchType: "11th Science 2026" });

    if (r3 || r2) {
      const latest = r3 ?? r2!;
      await db.insert(whatsappDraftsTable).values(wasDraft(s.studentId, s.name, latest.resultId, latest.testName, latest.pct, "11th Science 2026"));
    }
  }
  console.log("  ✓ 11th results done");

  const results12: Array<{ studentId: string; name: string; skill: number; scores: number[]; lastTestPct: number; batchType: string }> = [];
  for (let i = 0; i < twelfth_students.length; i++) {
    const s = twelfth_students[i];
    const r1 = await insertResult(s.studentId, test12_1, 100, s.skill, 0, i, s.name, "12th Science 2026");
    const r2 = await insertResult(s.studentId, test12_2, 100, s.skill, 1, i, s.name, "12th Science 2026");
    const r3 = await insertResult(s.studentId, test12_3, 200, s.skill, 2, i, s.name, "12th Science 2026");
    const scores = [r1?.pct ?? 0, r2?.pct ?? 0, r3?.pct ?? 0].filter(Boolean);
    results12.push({ studentId: s.studentId, name: s.name, skill: s.skill, scores, lastTestPct: r3?.pct ?? r2?.pct ?? r1?.pct ?? 0, batchType: "12th Science 2026" });

    if (r3 || r2) {
      const latest = r3 ?? r2!;
      await db.insert(whatsappDraftsTable).values(wasDraft(s.studentId, s.name, latest.resultId, latest.testName, latest.pct, "12th Science 2026"));
    }
  }
  console.log("  ✓ 12th results done");

  // ── Rank History ─────────────────────────────────────────────────────────
  console.log("\n🏆 Rank history");

  async function computeAndStoreRanks(results: typeof results11, scope: string) {
    const withAvg = results.map(r => ({ ...r, avg: r.scores.length > 0 ? r.scores.reduce((a, b) => a + b, 0) / r.scores.length : 0 }));
    withAvg.sort((a, b) => b.avg - a.avg);
    for (let rank = 1; rank <= withAvg.length; rank++) {
      const r = withAvg[rank - 1];
      await db.insert(rankHistoryTable).values({
        id: randomUUID(), studentId: r.studentId, scope,
        rank, average: Math.round(r.avg * 10) / 10, lastTest: r.lastTestPct, rankMovement: null,
      });
    }
  }

  await computeAndStoreRanks(results11, "overall");
  await computeAndStoreRanks(results11, "monthly");
  await computeAndStoreRanks(results11, "weekly");
  await computeAndStoreRanks(results12, "overall");
  await computeAndStoreRanks(results12, "monthly");
  await computeAndStoreRanks(results12, "weekly");
  console.log("  ✓ Rank history computed");

  // ── Scheduled Tests ───────────────────────────────────────────────────────
  console.log("\n📅 Scheduled tests");
  async function scheduleTest(batchId: string, testName: string, testType: any, scheduledDate: Date) {
    const existing = await db.select().from(scheduledTestsTable)
      .where(and(eq(scheduledTestsTable.batchId, batchId), eq(scheduledTestsTable.testName, testName))).limit(1);
    if (existing.length > 0) return;
    await db.insert(scheduledTestsTable).values({ id: randomUUID(), batchId, testName, testType, scheduledDate });
  }
  await scheduleTest(batch11Id, "Weekly Test 3 - Thermal Properties", "WEEKLY_CHAPTER", daysFromNow(5));
  await scheduleTest(batch11Id, "Weekly Test 4 - Chemical Bonding",   "WEEKLY_CHAPTER", daysFromNow(12));
  await scheduleTest(batch11Id, "Monthly Test - December",            "MONTHLY",         daysFromNow(20));
  await scheduleTest(batch12Id, "Weekly Test 3 - Magnetic Effects",   "WEEKLY_CHAPTER", daysFromNow(4));
  await scheduleTest(batch12Id, "Weekly Test 4 - Electrochemistry",   "WEEKLY_CHAPTER", daysFromNow(11));
  await scheduleTest(batch12Id, "Monthly Test - December",            "MONTHLY",         daysFromNow(18));
  console.log("  ✓ Scheduled tests added");

  await pool.end();
  console.log("\n✅ Seeding complete!\n");
  console.log("Demo credentials:");
  console.log("  Teacher : roman_sir / Roman@123");
  console.log("  Student : kunal.datkhile.2026 / student@123  [DEMO - read-only]");
  console.log("  (All students have password: student@123)");
  console.log("\nStudent counts:");
  console.log("  11th Science 2026: 6 students");
  console.log("  12th Science 2026: 12 students (Kunal Datkhile is demo)");
}

seed().catch((e) => { console.error(e); process.exit(1); });
