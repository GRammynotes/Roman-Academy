import { db, pool } from "./src/index";
import {
  usersTable, studentsTable, batchesTable, testsTable, testChaptersTable,
  studentTestResultsTable, rankHistoryTable, chaptersTable, studentChaptersTable,
  whatsappDraftsTable, scheduledTestsTable,
} from "./src/schema";
import { eq, and } from "drizzle-orm";
import * as bcryptjs from "bcryptjs";
import { randomUUID } from "crypto";

const TEACHER_ID = "f77cf0ed-8ac3-4e83-8f5c-603b56e52b34";
const KUNAL_ID   = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const KUNAL_STUDENT_ID = "b2c3d4e5-f6a7-8901-bcde-f12345678901";

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

async function ensureBatch(name: string, classLevel: "ELEVEN" | "TWELVE", stream: "SCIENCE_PCM" | "COMMERCE_ADDON" | "NEET_ADDON", startDate: Date) {
  const existing = await db.select().from(batchesTable).where(eq(batchesTable.name, name)).limit(1);
  if (existing.length > 0) { console.log(`  ✓ Batch exists: ${name}`); return existing[0].id; }
  const id = randomUUID();
  await db.insert(batchesTable).values({ id, name, classLevel, stream, startDate });
  console.log(`  ✓ Batch created: ${name}`);
  return id;
}

async function ensureStudent(
  id: string | null,
  fullName: string, phone: string, parentPhone: string,
  classLevel: "ELEVEN" | "TWELVE", stream: "SCIENCE_PCM", batchType: string, batchId: string, joinedDate: Date,
  isDemo = false
): Promise<{ userId: string; studentId: string; username: string }> {
  const year = "2026";
  const username = fullName.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "") + "." + year;

  const existingUser = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (existingUser.length > 0) {
    const existingStudent = await db.select().from(studentsTable).where(eq(studentsTable.userId, existingUser[0].id)).limit(1);
    if (existingStudent.length > 0) {
      return { userId: existingUser[0].id, studentId: existingStudent[0].id, username };
    }
    const studentId = id || randomUUID();
    await db.insert(studentsTable).values({
      id: studentId, userId: existingUser[0].id, fullName, classLevel, stream, batchType, batchId, joinedDate, whatsappContact: phone, parentContact: parentPhone,
    });
    return { userId: existingUser[0].id, studentId, username };
  }

  const hash = await bcryptjs.hash("student@123", 10);
  const userId = id === KUNAL_STUDENT_ID ? KUNAL_ID : randomUUID();
  const studentId = id || randomUUID();
  await db.insert(usersTable).values({ id: userId, username, passwordHash: hash, role: "STUDENT", isDemo });
  await db.insert(studentsTable).values({
    id: studentId, userId, fullName, classLevel, stream, batchType, batchId, joinedDate, whatsappContact: phone, parentContact: parentPhone,
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
  console.log("\n🌱 Seeding Roman Academy database (REAL students)...\n");

  // ── Teacher ──────────────────────────────────────────────────────────────
  console.log("👤 Teacher");
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

  // ── 12th Students (12 real + 1 demo Kunal) ───────────────────────────────
  console.log("\n🎓 12th Science 2026 (real students)");
  const twelfth = [
    { name: "Kunal Datkhile",      phone: "919900000001", parent: "919900000101", demo: true,  sid: KUNAL_STUDENT_ID },
    { name: "Rujula Khamkar",      phone: "919900000002", parent: "919900000102", demo: false, sid: null },
    { name: "Shraddha Kamble",     phone: "919900000003", parent: "919900000103", demo: false, sid: null },
    { name: "Tanashree Gaikwad",   phone: "919900000004", parent: "919900000104", demo: false, sid: null },
    { name: "Prachi Kamble",       phone: "919900000005", parent: "919900000105", demo: false, sid: null },
    { name: "Sayali Gupta",        phone: "919900000006", parent: "919900000106", demo: false, sid: null },
    { name: "Harshala Rajiwade",   phone: "919900000007", parent: "919900000107", demo: false, sid: null },
    { name: "Aditya Dhurve",       phone: "919900000008", parent: "919900000108", demo: false, sid: null },
    { name: "Suraj Mote",          phone: "919900000009", parent: "919900000109", demo: false, sid: null },
    { name: "Manasvi Nehe",        phone: "919900000010", parent: "919900000110", demo: false, sid: null },
    { name: "Ankit Pal",           phone: "919900000011", parent: "919900000111", demo: false, sid: null },
    { name: "Sonal Shingare",      phone: "919900000012", parent: "919900000112", demo: false, sid: null },
    { name: "Ritik Mishra",        phone: "919900000013", parent: "919900000113", demo: false, sid: null },
  ];
  const skills12 = [0.73, 0.86, 0.79, 0.68, 0.84, 0.77, 0.91, 0.65, 0.88, 0.72, 0.80, 0.85, 0.69];

  const twelfth_students: Array<{ userId: string; studentId: string; username: string; name: string; skill: number }> = [];
  for (let i = 0; i < twelfth.length; i++) {
    const s = await ensureStudent(twelfth[i].sid, twelfth[i].name, twelfth[i].phone, twelfth[i].parent, "TWELVE", "SCIENCE_PCM", "12th Science 2026", batch12Id, daysAgo(200 + i), twelfth[i].demo);
    twelfth_students.push({ ...s, name: twelfth[i].name, skill: skillOf(i, skills12) });
  }
  console.log(`  ✓ ${twelfth_students.length} students ready`);

  // ── 11th Students (6 real) ───────────────────────────────────────────────
  console.log("\n🎓 11th Science 2026 (real students)");
  const eleventh = [
    { name: "Manasvi Mankar",      phone: "919900000014", parent: "919900000114" },
    { name: "Vedika Talekar",      phone: "919900000015", parent: "919900000115" },
    { name: "Samruddhi Ghodekar",  phone: "919900000016", parent: "919900000116" },
    { name: "Shravani Shinde",     phone: "919900000017", parent: "919900000117" },
    { name: "Harshad Kadam",       phone: "919900000018", parent: "919900000118" },
    { name: "Nisa Bankar",         phone: "919900000019", parent: "919900000119" },
  ];
  const skills11 = [0.82, 0.71, 0.88, 0.65, 0.77, 0.91];

  const eleventh_students: Array<{ userId: string; studentId: string; username: string; name: string; skill: number }> = [];
  for (let i = 0; i < eleventh.length; i++) {
    const s = await ensureStudent(null, eleventh[i].name, eleventh[i].phone, eleventh[i].parent, "ELEVEN", "SCIENCE_PCM", "11th Science 2026", batch11Id, daysAgo(60 + i));
    eleventh_students.push({ ...s, name: eleventh[i].name, skill: skillOf(i, skills11) });
  }
  console.log(`  ✓ ${eleventh_students.length} students ready`);

  // ── Chapters ─────────────────────────────────────────────────────────────
  console.log("\n📖 Chapters");
  const chapters11 = await ensureChapters([
    { name: "Physical World & Units",          subject: "Physics",   classLevel: "ELEVEN", stream: "SCIENCE_PCM", order: 1 },
    { name: "Laws of Motion",                  subject: "Physics",   classLevel: "ELEVEN", stream: "SCIENCE_PCM", order: 2 },
    { name: "Work Energy & Power",             subject: "Physics",   classLevel: "ELEVEN", stream: "SCIENCE_PCM", order: 3 },
    { name: "Thermal Properties of Matter",    subject: "Physics",   classLevel: "ELEVEN", stream: "SCIENCE_PCM", order: 4 },
    { name: "Some Basic Concepts of Chemistry",subject: "Chemistry", classLevel: "ELEVEN", stream: "SCIENCE_PCM", order: 5 },
    { name: "Structure of Atom",               subject: "Chemistry", classLevel: "ELEVEN", stream: "SCIENCE_PCM", order: 6 },
    { name: "Chemical Bonding",                subject: "Chemistry", classLevel: "ELEVEN", stream: "SCIENCE_PCM", order: 7 },
    { name: "Sets",                            subject: "Maths",     classLevel: "ELEVEN", stream: "SCIENCE_PCM", order: 8 },
    { name: "Relations and Functions",         subject: "Maths",     classLevel: "ELEVEN", stream: "SCIENCE_PCM", order: 9 },
    { name: "Trigonometric Functions",         subject: "Maths",     classLevel: "ELEVEN", stream: "SCIENCE_PCM", order: 10 },
  ]);

  const chapters12 = await ensureChapters([
    { name: "Electrostatics",                  subject: "Physics",   classLevel: "TWELVE", stream: "SCIENCE_PCM", order: 1 },
    { name: "Current Electricity",             subject: "Physics",   classLevel: "TWELVE", stream: "SCIENCE_PCM", order: 2 },
    { name: "Magnetic Effects of Current",     subject: "Physics",   classLevel: "TWELVE", stream: "SCIENCE_PCM", order: 3 },
    { name: "Electromagnetic Induction",       subject: "Physics",   classLevel: "TWELVE", stream: "SCIENCE_PCM", order: 4 },
    { name: "Solid State",                     subject: "Chemistry", classLevel: "TWELVE", stream: "SCIENCE_PCM", order: 5 },
    { name: "Solutions",                       subject: "Chemistry", classLevel: "TWELVE", stream: "SCIENCE_PCM", order: 6 },
    { name: "Electrochemistry",                subject: "Chemistry", classLevel: "TWELVE", stream: "SCIENCE_PCM", order: 7 },
    { name: "Chemical Kinetics",               subject: "Chemistry", classLevel: "TWELVE", stream: "SCIENCE_PCM", order: 8 },
    { name: "Relations & Functions (12th)",    subject: "Maths",     classLevel: "TWELVE", stream: "SCIENCE_PCM", order: 9 },
    { name: "Matrices",                        subject: "Maths",     classLevel: "TWELVE", stream: "SCIENCE_PCM", order: 10 },
    { name: "Determinants",                    subject: "Maths",     classLevel: "TWELVE", stream: "SCIENCE_PCM", order: 11 },
  ]);
  console.log("  ✓ Chapters ready");

  // ── Student Chapters ─────────────────────────────────────────────────────
  const ch11Names = Object.keys(chapters11);
  const ch12Names = Object.keys(chapters12);

  async function assignChapters(studentId: string, chapterIds: Record<string, string>, names: string[]) {
    const existing = await db.select({ chapterId: studentChaptersTable.chapterId }).from(studentChaptersTable).where(eq(studentChaptersTable.studentId, studentId));
    const existingIds = new Set(existing.map(e => e.chapterId));
    for (let i = 0; i < names.length; i++) {
      const chapterId = chapterIds[names[i]];
      if (!chapterId || existingIds.has(chapterId)) continue;
      const status = i < names.length * 0.4 ? "COMPLETED" : i < names.length * 0.6 ? "ONGOING" : "PLANNED";
      await db.insert(studentChaptersTable).values({ id: randomUUID(), studentId, chapterId, chapterName: names[i], status: status as any });
    }
  }

  for (const s of eleventh_students) await assignChapters(s.studentId, chapters11, ch11Names);
  for (const s of twelfth_students) await assignChapters(s.studentId, chapters12, ch12Names);
  console.log("  ✓ Student chapters assigned");

  // ── Tests ─────────────────────────────────────────────────────────────────
  console.log("\n📝 Tests");
  const test11_1 = await ensureTest("Weekly Test 1 - Laws of Motion",    "WEEKLY_CHAPTER", "ELEVEN", "SCIENCE_PCM", daysAgo(35), 100);
  const test11_2 = await ensureTest("Weekly Test 2 - Work Energy Power", "WEEKLY_CHAPTER", "ELEVEN", "SCIENCE_PCM", daysAgo(21), 100);
  const test11_3 = await ensureTest("Monthly Test - November",           "MONTHLY",         "ELEVEN", "SCIENCE_PCM", daysAgo(7),  200);

  const test12_1 = await ensureTest("Weekly Test 1 - Electrostatics",    "WEEKLY_CHAPTER", "TWELVE", "SCIENCE_PCM", daysAgo(35), 100);
  const test12_2 = await ensureTest("Weekly Test 2 - Current Electricity","WEEKLY_CHAPTER", "TWELVE", "SCIENCE_PCM", daysAgo(21), 100);
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
    const existing = await db.select().from(studentTestResultsTable).where(and(eq(studentTestResultsTable.studentId, studentId), eq(studentTestResultsTable.testId, testId))).limit(1);
    if (existing.length > 0) return null;

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

  // 11th results
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
      const draftExists = await db.select().from(whatsappDraftsTable).where(eq(whatsappDraftsTable.testResultId, latest.resultId)).limit(1);
      if (draftExists.length === 0) {
        await db.insert(whatsappDraftsTable).values(wasDraft(s.studentId, s.name, latest.resultId, latest.testName, latest.pct, "11th Science 2026"));
      }
    }
  }
  console.log("  ✓ 11th results done");

  // 12th results
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
      const draftExists = await db.select().from(whatsappDraftsTable).where(eq(whatsappDraftsTable.testResultId, latest.resultId)).limit(1);
      if (draftExists.length === 0) {
        await db.insert(whatsappDraftsTable).values(wasDraft(s.studentId, s.name, latest.resultId, latest.testName, latest.pct, "12th Science 2026"));
      }
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
      const existing = await db.select().from(rankHistoryTable)
        .where(and(eq(rankHistoryTable.studentId, r.studentId), eq(rankHistoryTable.scope, scope))).limit(1);
      if (existing.length > 0) continue;
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
  console.log("\n✅ Seeding complete! 19 real students (18 + 1 demo)\n");
  console.log("Credentials:");
  console.log("  Teacher      : roman_sir / Roman@123");
  console.log("  Demo student : kunal.datkhile.2026 / student@123  (read-only)");
  console.log("  All students : <name>.<name>.2026 / student@123");
}

seed().catch((e) => { console.error(e); process.exit(1); });
