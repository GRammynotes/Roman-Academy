import { db, pool } from "./src/index";
import {
  usersTable, studentsTable, batchesTable, testsTable, testChaptersTable,
  studentTestResultsTable, rankHistoryTable, chaptersTable, studentChaptersTable,
  whatsappDraftsTable, scheduledTestsTable, academicYearsTable, subjectsTable,
  chapterProgressTable,
} from "./src/schema";
import { eq, and, inArray } from "drizzle-orm";
import * as bcryptjs from "bcryptjs";
import { randomUUID } from "crypto";

const TEACHER_ID = "f77cf0ed-8ac3-4e83-8f5c-603b56e52b34";

function daysAgo(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function daysFromNow(n: number) { const d = new Date(); d.setDate(d.getDate() + n); return d; }

// ── Syllabus (exact, from requirements) ─────────────────────────────────────

const SYLLABUS_11TH: Array<{ name: string; subject: string; order: number }> = [
  // Mathematics
  { name: "Trigonometry II",                    subject: "Mathematics", order: 1 },
  { name: "Straight Lines",                     subject: "Mathematics", order: 2 },
  { name: "Circles",                            subject: "Mathematics", order: 3 },
  { name: "Conic Sections",                     subject: "Mathematics", order: 4 },
  { name: "Complex Numbers",                    subject: "Mathematics", order: 5 },
  { name: "Permutations and Combinations",      subject: "Mathematics", order: 6 },
  { name: "Functions",                          subject: "Mathematics", order: 7 },
  { name: "Limits",                             subject: "Mathematics", order: 8 },
  { name: "Continuity",                         subject: "Mathematics", order: 9 },
  { name: "Probability",                        subject: "Mathematics", order: 10 },
  // Physics
  { name: "Vectors",                            subject: "Physics", order: 1 },
  { name: "Error Analysis",                     subject: "Physics", order: 2 },
  { name: "Motion in a Plane",                  subject: "Physics", order: 3 },
  { name: "Laws of Motion",                     subject: "Physics", order: 4 },
  { name: "Gravitation",                        subject: "Physics", order: 5 },
  { name: "Thermal Properties of Matter",       subject: "Physics", order: 6 },
  { name: "Sound",                              subject: "Physics", order: 7 },
  { name: "Optics",                             subject: "Physics", order: 8 },
  { name: "Electrostatics",                     subject: "Physics", order: 9 },
  { name: "Semiconductors",                     subject: "Physics", order: 10 },
  // Chemistry
  { name: "Some Basic Concepts of Chemistry",   subject: "Chemistry", order: 1 },
  { name: "Structure of Atom",                  subject: "Chemistry", order: 2 },
  { name: "Chemical Bonding",                   subject: "Chemistry", order: 3 },
  { name: "Redox Reactions",                    subject: "Chemistry", order: 4 },
  { name: "Elements of Groups 1 and 2",         subject: "Chemistry", order: 5 },
  { name: "States of Matter",                   subject: "Chemistry", order: 6 },
  { name: "Adsorption and Colloids",            subject: "Chemistry", order: 7 },
  { name: "Hydrocarbons",                       subject: "Chemistry", order: 8 },
  { name: "Basic Principles of Organic Chemistry", subject: "Chemistry", order: 9 },
  { name: "Chemistry in Everyday Life",         subject: "Chemistry", order: 10 },
];

const SYLLABUS_12TH: Array<{ name: string; subject: string; order: number }> = [
  // Mathematics
  { name: "Mathematical Logic",                 subject: "Mathematics", order: 1 },
  { name: "Matrices",                           subject: "Mathematics", order: 2 },
  { name: "Trigonometric Functions",            subject: "Mathematics", order: 3 },
  { name: "Pair of Straight Lines",             subject: "Mathematics", order: 4 },
  { name: "Vectors",                            subject: "Mathematics", order: 5 },
  { name: "Three Dimensional Geometry",         subject: "Mathematics", order: 6 },
  { name: "Line and Plane",                     subject: "Mathematics", order: 7 },
  { name: "Linear Programming",                 subject: "Mathematics", order: 8 },
  { name: "Differentiation",                    subject: "Mathematics", order: 9 },
  { name: "Applications of Derivatives",        subject: "Mathematics", order: 10 },
  { name: "Indefinite Integration",             subject: "Mathematics", order: 11 },
  { name: "Definite Integration",               subject: "Mathematics", order: 12 },
  { name: "Application of Definite Integration",subject: "Mathematics", order: 13 },
  { name: "Differential Equations",             subject: "Mathematics", order: 14 },
  { name: "Probability Distribution",           subject: "Mathematics", order: 15 },
  { name: "Binomial Distribution",              subject: "Mathematics", order: 16 },
  // Physics
  { name: "Rotational Dynamics",                subject: "Physics", order: 1 },
  { name: "Mechanical Properties of Fluids",    subject: "Physics", order: 2 },
  { name: "Kinetic Theory of Gases and Radiation", subject: "Physics", order: 3 },
  { name: "Thermodynamics",                     subject: "Physics", order: 4 },
  { name: "Oscillations",                       subject: "Physics", order: 5 },
  { name: "Superposition of Waves",             subject: "Physics", order: 6 },
  { name: "Wave Optics",                        subject: "Physics", order: 7 },
  { name: "Electrostatics",                     subject: "Physics", order: 8 },
  { name: "Current Electricity",                subject: "Physics", order: 9 },
  { name: "Magnetic Fields due to Electric Current", subject: "Physics", order: 10 },
  { name: "Magnetic Materials",                 subject: "Physics", order: 11 },
  { name: "Electromagnetic Induction",          subject: "Physics", order: 12 },
  { name: "AC Circuits",                        subject: "Physics", order: 13 },
  { name: "Dual Nature of Radiation and Matter",subject: "Physics", order: 14 },
  { name: "Atoms Molecules and Nuclei",         subject: "Physics", order: 15 },
  { name: "Semiconductor Devices",              subject: "Physics", order: 16 },
  // Chemistry
  { name: "Solid State",                        subject: "Chemistry", order: 1 },
  { name: "Solutions",                          subject: "Chemistry", order: 2 },
  { name: "Ionic Equilibria",                   subject: "Chemistry", order: 3 },
  { name: "Chemical Thermodynamics",            subject: "Chemistry", order: 4 },
  { name: "Electrochemistry",                   subject: "Chemistry", order: 5 },
  { name: "Chemical Kinetics",                  subject: "Chemistry", order: 6 },
  { name: "Elements of Groups 16 17 and 18",    subject: "Chemistry", order: 7 },
  { name: "Transition and Inner Transition Elements", subject: "Chemistry", order: 8 },
  { name: "Coordination Compounds",             subject: "Chemistry", order: 9 },
  { name: "Halogen Derivatives",                subject: "Chemistry", order: 10 },
  { name: "Alcohols Phenols and Ethers",        subject: "Chemistry", order: 11 },
  { name: "Aldehydes Ketones and Carboxylic Acids", subject: "Chemistry", order: 12 },
  { name: "Amines",                             subject: "Chemistry", order: 13 },
  { name: "Biomolecules",                       subject: "Chemistry", order: 14 },
  { name: "Introduction to Polymer Chemistry", subject: "Chemistry", order: 15 },
  { name: "Green Chemistry and Nanochemistry",  subject: "Chemistry", order: 16 },
];

// ── Real Students ────────────────────────────────────────────────────────────

const STUDENTS_11TH = [
  { name: "Manasvi Mankar",     phone: "919004972063", parent: "" },
  { name: "Vedika Talekar",     phone: "919326496626", parent: "" },
  { name: "Samruddhi Ghodekar", phone: "919167577818", parent: "" },
  { name: "Shravani Shinde",    phone: "919004736613", parent: "" },
  { name: "Harshad Kadam",      phone: "919702051592", parent: "" },
  { name: "Nisa Bankar",        phone: "917039779068", parent: "" },
];

const STUDENTS_12TH = [
  { name: "Rujula Khamkar",     phone: "919324390639", parent: "" },
  { name: "Shraddha Kamble",    phone: "919326109449", parent: "" },
  { name: "Tanashree Gaikwad",  phone: "918080284547", parent: "" },
  { name: "Prachi Kamble",      phone: "919152692490", parent: "" },
  { name: "Sayali Gupta",       phone: "919136452648", parent: "" },
  { name: "Harshala Rajiwade",  phone: "919594165193", parent: "" },
  { name: "Aditya Dhurve",      phone: "917738198065", parent: "" },
  { name: "Suraj Mote",         phone: "918850526185", parent: "" },
  { name: "Manasvi Nehe",       phone: "918850993632", parent: "" },
  { name: "Ankit Pal",          phone: "919136743040", parent: "" },
  { name: "Sonal Shingare",     phone: "919321225243", parent: "" },
  { name: "Ritik Mishra",       phone: "919919633795", parent: "" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

async function ensureAcademicYear(name: string, startDate: string, endDate: string) {
  const existing = await db.select().from(academicYearsTable).where(eq(academicYearsTable.name, name)).limit(1);
  if (existing.length > 0) { console.log(`  ✓ Academic year exists: ${name}`); return existing[0].id; }
  const id = randomUUID();
  await db.insert(academicYearsTable).values({ id, name, startDate, endDate, status: "ACTIVE" });
  console.log(`  ✓ Academic year created: ${name}`);
  return id;
}

async function ensureBatch(name: string, classLevel: "ELEVEN" | "TWELVE", stream: "SCIENCE_PCM", startDate: Date, academicYearId: string) {
  const existing = await db.select().from(batchesTable).where(eq(batchesTable.name, name)).limit(1);
  if (existing.length > 0) {
    if (!existing[0].academicYearId) {
      await db.update(batchesTable).set({ academicYearId }).where(eq(batchesTable.id, existing[0].id));
    }
    console.log(`  ✓ Batch exists: ${name}`);
    return existing[0].id;
  }
  const id = randomUUID();
  await db.insert(batchesTable).values({ id, name, classLevel, stream, startDate, academicYearId, status: "ACTIVE" });
  console.log(`  ✓ Batch created: ${name}`);
  return id;
}

async function ensureSubject(batchId: string, subjectName: string, teacherId: string): Promise<string> {
  const existing = await db.select().from(subjectsTable)
    .where(and(eq(subjectsTable.batchId, batchId), eq(subjectsTable.name, subjectName))).limit(1);
  if (existing.length > 0) { return existing[0].id; }
  const id = randomUUID();
  await db.insert(subjectsTable).values({ id, batchId, teacherId, name: subjectName });
  return id;
}

async function ensureStudent(
  fullName: string, phone: string, parentPhone: string,
  classLevel: "ELEVEN" | "TWELVE", stream: "SCIENCE_PCM", batchType: string, batchId: string, joinedDate: Date,
): Promise<{ userId: string; studentId: string; username: string }> {
  const year = "2026";
  const username = fullName.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "") + "." + year;

  const existingUser = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (existingUser.length > 0) {
    const existingStudent = await db.select().from(studentsTable).where(eq(studentsTable.userId, existingUser[0].id)).limit(1);
    if (existingStudent.length > 0) {
      // Update phone if it's still a placeholder
      if (phone && existingStudent[0].whatsappContact !== phone) {
        await db.update(studentsTable).set({ whatsappContact: phone }).where(eq(studentsTable.id, existingStudent[0].id));
      }
      return { userId: existingUser[0].id, studentId: existingStudent[0].id, username };
    }
    const studentId = randomUUID();
    await db.insert(studentsTable).values({
      id: studentId, userId: existingUser[0].id, fullName, classLevel, stream, batchType, batchId, joinedDate,
      whatsappContact: phone, parentContact: parentPhone,
    });
    return { userId: existingUser[0].id, studentId, username };
  }

  const hash = await bcryptjs.hash("student@123", 10);
  const userId = randomUUID();
  const studentId = randomUUID();
  await db.insert(usersTable).values({ id: userId, username, passwordHash: hash, role: "STUDENT", firstLogin: true, isDemo: false });
  await db.insert(studentsTable).values({
    id: studentId, userId, fullName, classLevel, stream, batchType, batchId, joinedDate,
    whatsappContact: phone, parentContact: parentPhone,
  });
  return { userId, studentId, username };
}

async function ensureChapters(
  syllabus: typeof SYLLABUS_11TH,
  classLevel: "ELEVEN" | "TWELVE",
  stream: "SCIENCE_PCM",
  subjectMap: Record<string, string>,
): Promise<Record<string, string>> {
  const ids: Record<string, string> = {};
  for (const ch of syllabus) {
    const existing = await db.select().from(chaptersTable)
      .where(and(
        eq(chaptersTable.chapterName, ch.name),
        eq(chaptersTable.classLevel, classLevel),
        eq(chaptersTable.subject, ch.subject),
      )).limit(1);
    if (existing.length > 0) {
      ids[ch.name] = existing[0].id;
      continue;
    }
    const id = randomUUID();
    await db.insert(chaptersTable).values({
      id,
      chapterName: ch.name,
      subject: ch.subject,
      classLevel,
      stream,
      priority: "High",
      orderIndex: ch.order,
      subjectId: subjectMap[ch.subject] ?? null,
    });
    ids[ch.name] = id;
  }
  return ids;
}

async function initChapterProgress(
  chapterIds: Record<string, string>,
  batchId: string,
  teacherId: string,
) {
  for (const [, chapterId] of Object.entries(chapterIds)) {
    const existing = await db.select().from(chapterProgressTable)
      .where(and(eq(chapterProgressTable.chapterId, chapterId), eq(chapterProgressTable.batchId, batchId))).limit(1);
    if (existing.length > 0) continue;
    await db.insert(chapterProgressTable).values({
      id: randomUUID(),
      chapterId,
      batchId,
      teacherId,
      status: "PENDING",
    });
  }
}

async function assignChaptersBatch(
  students: Array<{ studentId: string }>,
  chapterIds: Record<string, string>,
) {
  if (students.length === 0) return;
  const studentIds = students.map(s => s.studentId);

  const existing = await db.select({
    studentId: studentChaptersTable.studentId,
    chapterId: studentChaptersTable.chapterId,
  }).from(studentChaptersTable)
    .where(inArray(studentChaptersTable.studentId, studentIds));

  const existingSet = new Set(existing.map(e => `${e.studentId}:${e.chapterId}`));

  const toInsert: Array<{
    id: string; studentId: string; chapterId: string; chapterName: string; status: "PLANNED";
  }> = [];

  for (const { studentId } of students) {
    for (const [name, chapterId] of Object.entries(chapterIds)) {
      if (existingSet.has(`${studentId}:${chapterId}`)) continue;
      toInsert.push({ id: randomUUID(), studentId, chapterId, chapterName: name, status: "PLANNED" });
    }
  }

  if (toInsert.length === 0) return;

  const CHUNK = 200;
  for (let i = 0; i < toInsert.length; i += CHUNK) {
    await db.insert(studentChaptersTable).values(toInsert.slice(i, i + CHUNK));
  }
}

// ── Main Seed ─────────────────────────────────────────────────────────────────

async function seed() {
  console.log("\n🌱 Seeding Roman Academy database...\n");

  // ── Teacher ───────────────────────────────────────────────────────────────
  console.log("👤 Teacher");
  const existingTeacher = await db.select().from(usersTable).where(eq(usersTable.id, TEACHER_ID)).limit(1);
  if (existingTeacher.length === 0) {
    const hash = await bcryptjs.hash("Roman@123", 10);
    await db.insert(usersTable).values({ id: TEACHER_ID, username: "roman_sir", passwordHash: hash, role: "TEACHER", firstLogin: false });
    console.log("  ✓ Teacher created: roman_sir / Roman@123");
  } else {
    console.log("  ✓ Teacher already exists: roman_sir");
  }

  // ── Academic Year ─────────────────────────────────────────────────────────
  console.log("\n📅 Academic Year");
  const academicYearId = await ensureAcademicYear("2026-27", "2025-06-01", "2026-03-31");

  // ── Batches ───────────────────────────────────────────────────────────────
  console.log("\n📚 Batches");
  const batch11Id = await ensureBatch("11th Science 2026", "ELEVEN", "SCIENCE_PCM", new Date("2025-06-01"), academicYearId);
  const batch12Id = await ensureBatch("12th Science 2026", "TWELVE", "SCIENCE_PCM", new Date("2025-06-01"), academicYearId);

  // ── Subjects ──────────────────────────────────────────────────────────────
  console.log("\n📘 Subjects");
  const subjectMap11: Record<string, string> = {
    Mathematics: await ensureSubject(batch11Id, "Mathematics", TEACHER_ID),
    Physics:     await ensureSubject(batch11Id, "Physics", TEACHER_ID),
    Chemistry:   await ensureSubject(batch11Id, "Chemistry", TEACHER_ID),
  };
  const subjectMap12: Record<string, string> = {
    Mathematics: await ensureSubject(batch12Id, "Mathematics", TEACHER_ID),
    Physics:     await ensureSubject(batch12Id, "Physics", TEACHER_ID),
    Chemistry:   await ensureSubject(batch12Id, "Chemistry", TEACHER_ID),
  };
  console.log("  ✓ 3 subjects per batch ready");

  // ── Chapters ──────────────────────────────────────────────────────────────
  console.log("\n📖 Chapters (official syllabus)");
  const chapterIds11 = await ensureChapters(SYLLABUS_11TH, "ELEVEN", "SCIENCE_PCM", subjectMap11);
  const chapterIds12 = await ensureChapters(SYLLABUS_12TH, "TWELVE", "SCIENCE_PCM", subjectMap12);
  console.log(`  ✓ ${Object.keys(chapterIds11).length} chapters for 11th`);
  console.log(`  ✓ ${Object.keys(chapterIds12).length} chapters for 12th`);

  // ── Chapter Progress (batch-level teaching tracker) ───────────────────────
  console.log("\n📋 Chapter Progress (teaching tracker)");
  await initChapterProgress(chapterIds11, batch11Id, TEACHER_ID);
  await initChapterProgress(chapterIds12, batch12Id, TEACHER_ID);
  console.log("  ✓ Chapter progress initialized (all PENDING)");

  // ── 11th Students ─────────────────────────────────────────────────────────
  console.log("\n🎓 11th Science 2026 Students");
  const students11: Array<{ userId: string; studentId: string; username: string; name: string }> = [];
  for (let i = 0; i < STUDENTS_11TH.length; i++) {
    const s = STUDENTS_11TH[i];
    const result = await ensureStudent(s.name, s.phone, s.parent, "ELEVEN", "SCIENCE_PCM", "11th Science 2026", batch11Id, new Date("2025-06-01"));
    students11.push({ ...result, name: s.name });
    console.log(`  ✓ ${s.name} (${result.username})`);
  }

  // ── 12th Students ─────────────────────────────────────────────────────────
  console.log("\n🎓 12th Science 2026 Students");
  const students12: Array<{ userId: string; studentId: string; username: string; name: string }> = [];
  for (let i = 0; i < STUDENTS_12TH.length; i++) {
    const s = STUDENTS_12TH[i];
    const result = await ensureStudent(s.name, s.phone, s.parent, "TWELVE", "SCIENCE_PCM", "12th Science 2026", batch12Id, new Date("2025-06-01"));
    students12.push({ ...result, name: s.name });
    console.log(`  ✓ ${s.name} (${result.username})`);
  }

  // ── Student Chapters ──────────────────────────────────────────────────────
  console.log("\n📚 Assigning chapters to students");
  await assignChaptersBatch(students11, chapterIds11);
  await assignChaptersBatch(students12, chapterIds12);
  console.log("  ✓ All students have chapters assigned (PLANNED)");

  // ── Scheduled Tests ───────────────────────────────────────────────────────
  console.log("\n📅 Scheduled Tests");
  async function scheduleTest(batchId: string, testName: string, testType: any, scheduledDate: Date) {
    const existing = await db.select().from(scheduledTestsTable)
      .where(and(eq(scheduledTestsTable.batchId, batchId), eq(scheduledTestsTable.testName, testName))).limit(1);
    if (existing.length > 0) return;
    await db.insert(scheduledTestsTable).values({ id: randomUUID(), batchId, testName, testType, scheduledDate });
  }
  await scheduleTest(batch11Id, "Weekly Test 1 - Vectors",           "WEEKLY_CHAPTER", daysFromNow(7));
  await scheduleTest(batch11Id, "Weekly Test 1 - Some Basic Concepts","WEEKLY_CHAPTER", daysFromNow(7));
  await scheduleTest(batch11Id, "Weekly Test 1 - Trigonometry II",    "WEEKLY_CHAPTER", daysFromNow(7));
  await scheduleTest(batch12Id, "Weekly Test 1 - Rotational Dynamics","WEEKLY_CHAPTER", daysFromNow(7));
  await scheduleTest(batch12Id, "Weekly Test 1 - Solid State",        "WEEKLY_CHAPTER", daysFromNow(7));
  await scheduleTest(batch12Id, "Weekly Test 1 - Mathematical Logic", "WEEKLY_CHAPTER", daysFromNow(7));
  console.log("  ✓ Upcoming scheduled tests added");

  console.log("\n✅ Seeding complete!\n");
  console.log("👨‍🏫 Teacher:    roman_sir / Roman@123");
  console.log("🔐 Super Admin: super_admin / RomanAdmin@2026!");
  console.log(`📚 11th Batch: ${students11.length} students`);
  console.log(`📚 12th Batch: ${students12.length} students`);
  console.log("\n📌 Student default password: student@123 (firstLogin=true, will be forced to change)");

  await pool.end();
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
