import { prisma } from "./prisma";
import { batchClassStream, batchLabels, normalizeBatchType } from "./batch";
import type { Prisma, DraftStatus, TestType, ChapterStatus, ClassLevel, Stream } from "@prisma/client";

export type StudentScore = {
  name: string;
  score: number;
};

export type TeacherUploadParseResult = {
  testName: string;
  testType: TestType;
  studentScores: StudentScore[];
  completedChapters: string[];
  weakChapters: string[];
};

const chapterRoadmaps: Record<"ELEVEN" | "TWELVE", Record<Stream, Array<{ chapterName: string; subject: string; priority: string }>>> = {
  ELEVEN: {
    SCIENCE_PCM: [
      { chapterName: "Kinematics", subject: "Physics", priority: "High" },
      { chapterName: "Laws of Motion", subject: "Physics", priority: "High" },
      { chapterName: "Work Energy Power", subject: "Physics", priority: "CET" },
      { chapterName: "Organic Chemistry Basics", subject: "Chemistry", priority: "High" },
      { chapterName: "Atomic Structure", subject: "Chemistry", priority: "High" },
      { chapterName: "Chemical Bonding", subject: "Chemistry", priority: "CET" },
      { chapterName: "Sets and Functions", subject: "Mathematics", priority: "High" },
      { chapterName: "Trigonometry", subject: "Mathematics", priority: "High" },
      { chapterName: "Limits", subject: "Mathematics", priority: "CET" }
    ],
    COMMERCE_ADDON: [
      { chapterName: "Introduction to Economics", subject: "Economics", priority: "High" },
      { chapterName: "Accounting Basics", subject: "Commerce", priority: "High" },
      { chapterName: "Business Studies", subject: "Commerce", priority: "CET" }
    ],
    NEET_ADDON: [
      { chapterName: "Biology Foundation", subject: "Biology", priority: "High" },
      { chapterName: "Chemistry Basics", subject: "Chemistry", priority: "High" },
      { chapterName: "Physics Review", subject: "Physics", priority: "CET" }
    ]
  },
  TWELVE: {
    SCIENCE_PCM: [
      { chapterName: "Rotational Dynamics", subject: "Physics", priority: "High" },
      { chapterName: "Thermodynamics", subject: "Physics", priority: "High" },
      { chapterName: "Oscillations", subject: "Physics", priority: "CET" },
      { chapterName: "Electrostatics", subject: "Physics", priority: "High" },
      { chapterName: "Current Electricity", subject: "Physics", priority: "CET" },
      { chapterName: "Matrices", subject: "Mathematics", priority: "CET" },
      { chapterName: "Trigonometric Functions", subject: "Mathematics", priority: "Board" },
      { chapterName: "Differentiation", subject: "Mathematics", priority: "High" },
      { chapterName: "AOD", subject: "Mathematics", priority: "High" },
      { chapterName: "Integration", subject: "Mathematics", priority: "High" },
      { chapterName: "Solid State", subject: "Chemistry", priority: "CET" },
      { chapterName: "Solutions", subject: "Chemistry", priority: "CET" },
      { chapterName: "Coordination Compounds", subject: "Chemistry", priority: "High" }
    ],
    COMMERCE_ADDON: [
      { chapterName: "Business Law", subject: "Commerce", priority: "High" },
      { chapterName: "Accounting Standards", subject: "Commerce", priority: "Board" },
      { chapterName: "Economics Revision", subject: "Economics", priority: "CET" }
    ],
    NEET_ADDON: [
      { chapterName: "Electrostatics", subject: "Physics", priority: "High" },
      { chapterName: "Organic Chemistry", subject: "Chemistry", priority: "High" },
      { chapterName: "Calculus", subject: "Mathematics", priority: "CET" }
    ]
  }
};

const testTypeKeywords: Array<{ pattern: RegExp; type: TestType }> = [
  { pattern: /quarterly/i, type: "QUARTERLY" },
  { pattern: /monthly/i, type: "MONTHLY" },
  { pattern: /weekly/i, type: "WEEKLY_CHAPTER" },
  { pattern: /revision/i, type: "REVISION_TEST" },
  { pattern: /mock/i, type: "FULL_LENGTH_MOCK" }
];

function normalizeChapterName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function detectTestType(text: string): TestType {
  const match = testTypeKeywords.find((item) => item.pattern.test(text));
  return match ? match.type : "WEEKLY_CHAPTER";
}

function parseSections(text: string) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const studentLines: string[] = [];
  const completedLines: string[] = [];
  const weakLines: string[] = [];
  let currentSection: "students" | "completed" | "weak" = "students";

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.startsWith("completed:")) {
      currentSection = "completed";
      const rest = line.slice(line.indexOf(":") + 1).trim();
      if (rest) completedLines.push(rest);
      continue;
    }
    if (lower.startsWith("weak:")) {
      currentSection = "weak";
      const rest = line.slice(line.indexOf(":") + 1).trim();
      if (rest) weakLines.push(rest);
      continue;
    }

    if (currentSection === "students") {
      studentLines.push(line);
      continue;
    }
    if (currentSection === "completed") {
      completedLines.push(line);
      continue;
    }
    if (currentSection === "weak") {
      weakLines.push(line);
    }
  }

  return { studentLines, completedLines, weakLines };
}

function parseStudentScores(lines: string[]) {
  const scores = lines
    .map((line) => {
      const match = line.match(/^(.+?)\s+(\d{1,3})$/);
      if (!match) return null;
      const name = match[1].trim();
      const score = Number(match[2]);
      if (!name || Number.isNaN(score)) return null;
      return { name, score: Math.min(Math.max(score, 0), 100) };
    })
    .filter((entry): entry is StudentScore => Boolean(entry));
  return scores;
}

function parseChapterList(lines: string[]) {
  return lines
    .flatMap((line) => line.split(/[;,]/))
    .map((item) => normalizeChapterName(item))
    .filter(Boolean);
}

function findChapterDefinition(chapterName: string, classLevel: ClassLevel, stream: Stream) {
  const roadmap = chapterRoadmaps[classLevel]?.[stream] ?? [];
  return roadmap.find((chapter) => chapter.chapterName.toLowerCase() === chapterName.toLowerCase());
}

function getRoadmap(classLevel: ClassLevel, stream: Stream) {
  return chapterRoadmaps[classLevel]?.[stream] ?? [];
}

function getNextChapter(chapterName: string, classLevel: ClassLevel, stream: Stream) {
  const roadmap = getRoadmap(classLevel, stream);
  const index = roadmap.findIndex((chapter) => chapter.chapterName.toLowerCase() === chapterName.toLowerCase());
  if (index === -1 || index === roadmap.length - 1) return null;
  return roadmap[index + 1];
}

async function ensureChapter(
  chapterName: string,
  subject: string,
  classLevel: ClassLevel,
  stream: Stream,
  tx: Prisma.TransactionClient
) {
  const normalizedName = normalizeChapterName(chapterName);
  const chapter = await tx.chapter.upsert({
    where: {
      chapterName_subject_classLevel_stream: {
        chapterName: normalizedName,
        subject,
        classLevel,
        stream
      }
    },
    create: {
      chapterName: normalizedName,
      subject,
      classLevel,
      stream,
      cetRelevance: "High",
      boardImportance: "High"
    },
    update: {}
  });
  return chapter;
}

function buildTeacherNote(weakChapters: string[], completedChapters: string[]) {
  const parts: string[] = [];
  if (weakChapters.length) parts.push(`Weak: ${weakChapters.join(", ")}`);
  if (completedChapters.length) parts.push(`Completed: ${completedChapters.join(", ")}`);
  return parts.join(" | ");
}

export function buildWelcomeWhatsAppBody(studentName: string, batchType: string) {
  return `Roman Academy\n\nHello ${studentName}, welcome to ${batchType}. Your profile is ready and your mentor will share your first chapter plan soon. This draft is ready for teacher review.`;
}

function parseTeacherUploadText(text: string): TeacherUploadParseResult {
  const normalized = text.trim();
  const lines = normalized.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const testNameLine = lines[0] || "Weekly Test";
  const payloadText = lines.slice(1).join("\n");
  const { studentLines, completedLines, weakLines } = parseSections(payloadText);
  const studentScores = parseStudentScores(studentLines.length ? studentLines : lines.slice(1));

  return {
    testName: testNameLine,
    testType: detectTestType(text),
    studentScores,
    completedChapters: parseChapterList(completedLines),
    weakChapters: parseChapterList(weakLines)
  };
}

function buildWhatsAppBody(
  studentName: string,
  testName: string,
  percentage: number,
  weakChapters: string[],
  completedChapters: string[],
  nextChapter: string | null,
  batchType: string
) {
  const weakText = weakChapters.length ? `Focus on ${weakChapters.join(", ")}.` : "Keep reviewing the current topics.";
  const completedText = completedChapters.length ? `Completed: ${completedChapters.slice(-2).join(", ")}.` : "";
  const nextText = nextChapter ? `Next chapter: ${nextChapter}.` : "";
  return `Roman Academy\n\n${studentName} from ${batchType} scored ${percentage}% in ${testName}. ${completedText} ${weakText} ${nextText}`.trim();
}

function buildQuarterlyReminderBody(studentName: string, testName: string, batchType: string) {
  return `Roman Academy Quarterly Reminder\n\n${studentName} from ${batchType}, please revisit ${testName} insights and stay on track with upcoming chapters. This draft is ready for teacher review.`;
}

function buildNotification(title: string, body: string, type: string, studentId: string) {
  return { studentId, title, body, type, isPopup: false };
}

function parseWeakChaptersFromNote(note: string | null | undefined) {
  if (!note) return [];
  const weakMatch = note.match(/weak:\s*([^|]+)/i);
  if (!weakMatch) return [];
  return weakMatch[1].split(/[,;]/).map((item) => normalizeChapterName(item)).filter(Boolean);
}

export async function ensureBatch(
  name: string,
  classLevel: ClassLevel,
  stream: Stream,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
  startDate: Date = new Date("2026-04-01T00:00:00.000Z")
) {
  return tx.batch.upsert({
    where: { name },
    update: { classLevel, stream, updatedAt: new Date() },
    create: { name, classLevel, stream, startDate }
  });
}

export async function getTeacherBatches() {
  const batches = await prisma.batch.findMany({
    include: {
      students: { select: { id: true } },
      scheduledTests: { select: { id: true } }
    },
    orderBy: { name: "asc" }
  });

  return batches.map((batch) => ({
    id: batch.id,
    name: batch.name,
    classLevel: batch.classLevel,
    stream: batch.stream,
    startDate: batch.startDate.toISOString().split("T")[0],
    totalStudents: batch.students.length,
    scheduledTests: batch.scheduledTests.length
  }));
}

export async function uploadTestResults(text: string) {
  const parsed = parseTeacherUploadText(text);
  const studentIds: string[] = [];

  if (!parsed.studentScores.length) {
    throw new Error("No student scores were found in the upload text.");
  }

  const studentNames = parsed.studentScores.map((item) => item.name);
  const students = await prisma.student.findMany({
    where: {
      fullName: { in: studentNames }
    },
    include: {
      batch: true,
      syllabus: { include: { chapter: true } }
    }
  });

  const missing = studentNames.filter((name) => !students.some((student) => student.fullName === name));
  if (missing.length) {
    throw new Error(`Student names not found: ${missing.join(", ")}`);
  }

  const classLevels = new Set(students.map((student) => student.classLevel));
  const streams = new Set(students.map((student) => student.stream));
  const batchNames = new Set(students.map((student) => student.batch?.name ?? student.batchType));
  if (classLevels.size > 1 || streams.size > 1 || batchNames.size > 1) {
    throw new Error("Uploaded students must belong to the same class level, stream, and batch.");
  }

  const classLevel = students[0].classLevel as ClassLevel;
  const stream = students[0].stream as Stream;
  const batchName = Array.from(batchNames)[0] ?? students[0].batchType;
  const testDate = new Date();

  return prisma.$transaction(async (tx) => {
    const batch = await ensureBatch(batchName, classLevel, stream, tx);
    const chapterRecords = await Promise.all(
      parsed.completedChapters.map(async (chapterName) => {
        const definition = findChapterDefinition(chapterName, classLevel, stream) ?? {
          chapterName,
          subject: "Physics",
          priority: "High"
        };
        return ensureChapter(chapterName, definition.subject, classLevel, stream, tx);
      })
    );

    const test = await tx.test.create({
      data: {
        testName: parsed.testName,
        testType: parsed.testType,
        classLevel,
        stream,
        date: testDate,
        totalMarks: 100,
        chapters: {
          create: chapterRecords.map((chapter) => ({
            chapter: {
              connect: { id: chapter.id }
            }
          }))
        }
      }
    });

    await tx.scheduledTest.upsert({
      where: {
        batchId_testName_testType: {
          batchId: batch.id,
          testName: parsed.testName,
          testType: parsed.testType
        }
      },
      update: { scheduledDate: testDate },
      create: {
        batchId: batch.id,
        testName: parsed.testName,
        testType: parsed.testType,
        scheduledDate: testDate
      }
    });

    const results = await Promise.all(
      parsed.studentScores.map(async ({ name, score }) => {
        const student = students.find((item) => item.fullName === name)!;
        const result = await tx.studentTestResult.create({
          data: {
            studentId: student.id,
            testId: test.id,
            totalScored: score,
            percentage: score,
            teacherNote: buildTeacherNote(parsed.weakChapters, parsed.completedChapters),
            whatsappStatus: "TEACHER_REVIEW",
            subjectMarks: {
              create: [{ subject: "Total", scored: score, maxMarks: 100 }]
            }
          }
        });

        studentIds.push(student.id);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextDay = new Date(today);
        nextDay.setDate(nextDay.getDate() + 1);

        const todayAttendance = await tx.attendance.findFirst({
          where: {
            studentId: student.id,
            date: {
              gte: today,
              lt: nextDay
            }
          }
        });

        if (!todayAttendance) {
          await tx.attendance.create({
            data: {
              studentId: student.id,
              date: testDate,
              streamLabel: batchName,
              attended: true,
              isAlternateStream: false
            }
          });
        }

        await tx.notification.createMany({
          data: [
            {
              studentId: student.id,
              title: "Result uploaded",
              body: `${parsed.testName} results were uploaded for ${student.fullName}.`,
              type: "result_uploaded",
              isPopup: false
            }
          ]
        });

        if (parsed.completedChapters.length) {
          await tx.notification.create({
            data: {
              studentId: student.id,
              title: "Chapter completed",
              body: `${parsed.completedChapters.join(", ")} marked completed for ${student.fullName}.`,
              type: "chapter_completed",
              isPopup: false
            }
          });
        }

        if (parsed.testType === "QUARTERLY") {
          await tx.notification.create({
            data: {
              studentId: student.id,
              title: "Quarterly reminder",
              body: `Quarterly reminders have been queued for ${student.fullName}.`,
              type: "quarterly_reminder",
              isPopup: false
            }
          });
        }

        const resultDrafts = [
          {
            studentId: student.id,
            body: buildWhatsAppBody(student.fullName, parsed.testName, score, [], [], null, batchName),
            cadence: "Result Declared",
            status: "TEACHER_REVIEW" as DraftStatus
          }
        ];

        const studentCompletedChapters = student.syllabus
          .filter((entry) => entry.status === "COMPLETED")
          .map((entry) => entry.chapter.chapterName);
        const studentNextChapter = student.syllabus.find((entry) => entry.status === "ONGOING")?.chapter.chapterName
          || student.syllabus.find((entry) => entry.status === "PLANNED")?.chapter.chapterName
          || null;

        if (parsed.testType === "QUARTERLY") {
          resultDrafts.push({
            studentId: student.id,
            body: buildQuarterlyReminderBody(student.fullName, parsed.testName, batchName),
            cadence: "Quarterly Reminder",
            status: "TEACHER_REVIEW" as DraftStatus
          });
        }

        resultDrafts[0].body = buildWhatsAppBody(
          student.fullName,
          parsed.testName,
          score,
          parsed.weakChapters,
          studentCompletedChapters,
          studentNextChapter,
          batchName
        );

        await tx.whatsAppDraft.createMany({ data: resultDrafts });

        return result;
      })
    );

    for (const chapterName of parsed.completedChapters) {
      const chapterDefinition = findChapterDefinition(chapterName, classLevel, stream);
      const chapter = await ensureChapter(
        chapterName,
        chapterDefinition?.subject ?? "Physics",
        classLevel,
        stream,
        tx
      );

      for (const student of students) {
        await tx.studentChapter.upsert({
          where: {
            studentId_chapterId_isAlternateStream: {
              studentId: student.id,
              chapterId: chapter.id,
              isAlternateStream: false
            }
          },
          create: {
            studentId: student.id,
            chapterId: chapter.id,
            status: "COMPLETED"
          },
          update: {
            status: "COMPLETED"
          }
        });
      }

      const nextChapterDefinition = getNextChapter(chapterName, classLevel, stream);
      if (nextChapterDefinition) {
        const nextChapter = await ensureChapter(
          nextChapterDefinition.chapterName,
          nextChapterDefinition.subject,
          classLevel,
          stream,
          tx
        );

        for (const student of students) {
          const existing = await tx.studentChapter.findUnique({
            where: {
              studentId_chapterId_isAlternateStream: {
                studentId: student.id,
                chapterId: nextChapter.id,
                isAlternateStream: false
              }
            }
          });

          if (!existing) {
            await tx.studentChapter.create({
              data: {
                studentId: student.id,
                chapterId: nextChapter.id,
                status: "ONGOING"
              }
            });
          } else if (existing.status !== "COMPLETED") {
            await tx.studentChapter.update({
              where: { id: existing.id },
              data: { status: "ONGOING" }
            });
          }
        }
      }
    }

    await createRankHistoryForBatch(tx, classLevel, stream, testDate);

    return {
      testId: test.id,
      studentIds,
      upload: {
        testName: parsed.testName,
        type: parsed.testType,
        completedChapters: parsed.completedChapters,
        weakChapters: parsed.weakChapters,
        students: students.map((student) => student.fullName)
      }
    };
  });
}

async function createRankHistoryForBatch(tx: Prisma.TransactionClient, classLevel: ClassLevel, stream: Stream, date: Date) {
  const students = await tx.student.findMany({
    where: { classLevel, stream },
    include: { testResults: { include: { test: true } } }
  });

  const latestByScope = {
    WEEKLY_CHAPTER: new Map<string, number>(),
    MONTHLY: new Map<string, number>(),
    QUARTERLY: new Map<string, number>()
  };

  const weightedTotals = new Map<string, { sum: number; weight: number }>();

  for (const student of students) {
    const scopeResults = student.testResults
      .filter((result) => ["WEEKLY_CHAPTER", "MONTHLY", "QUARTERLY"].includes(result.test.testType))
      .sort((a, b) => b.test.date.getTime() - a.test.date.getTime());

    const latestByType = new Map<TestType, number>();
    for (const result of scopeResults) {
      if (!latestByType.has(result.test.testType)) {
        latestByType.set(result.test.testType, result.percentage);
      }
    }

    if (latestByType.has("WEEKLY_CHAPTER")) {
      latestByScope.WEEKLY_CHAPTER.set(student.id, latestByType.get("WEEKLY_CHAPTER")!);
    }
    if (latestByType.has("MONTHLY")) {
      latestByScope.MONTHLY.set(student.id, latestByType.get("MONTHLY")!);
    }
    if (latestByType.has("QUARTERLY")) {
      latestByScope.QUARTERLY.set(student.id, latestByType.get("QUARTERLY")!);
    }

    const scoring = { WEEKLY_CHAPTER: 0.2, MONTHLY: 0.3, QUARTERLY: 0.5 };
    let totalScore = 0;
    let totalWeight = 0;
    for (const [type, weight] of Object.entries(scoring) as Array<[TestType, number]>) {
      const value = latestByType.get(type);
      if (typeof value === "number") {
        totalScore += value * weight;
        totalWeight += weight;
      }
    }
    if (totalWeight > 0) {
      weightedTotals.set(student.id, { sum: totalScore, weight: totalWeight });
    }
  }

  await Promise.all([
    createRankHistoryEntries(tx, "WEEKLY_CHAPTER", latestByScope.WEEKLY_CHAPTER, date),
    createRankHistoryEntries(tx, "MONTHLY", latestByScope.MONTHLY, date),
    createRankHistoryEntries(tx, "QUARTERLY", latestByScope.QUARTERLY, date),
    createOverallRankHistoryEntries(tx, weightedTotals, date)
  ]);
}

async function createRankHistoryEntries(tx: Prisma.TransactionClient, testType: TestType, scores: Map<string, number>, date: Date) {
  const sorted = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
  let currentRank = 0;
  let lastScore: number | null = null;

  for (const [index, [studentId, score]] of sorted.entries()) {
    if (score !== lastScore) {
      currentRank = index + 1;
      lastScore = score;
    }
    await tx.rankHistory.create({
      data: {
        studentId,
        date,
        rank: currentRank,
        score,
        testId: testType
      }
    });
  }
}

async function createOverallRankHistoryEntries(tx: Prisma.TransactionClient, weightedTotals: Map<string, { sum: number; weight: number }>, date: Date) {
  const scored = Array.from(weightedTotals.entries()).map(([studentId, item]) => ({
    studentId,
    score: Math.round((item.sum / item.weight) * 100) / 100
  }));
  scored.sort((a, b) => b.score - a.score);
  let currentRank = 0;
  let lastScore: number | null = null;
  for (const [index, item] of scored.entries()) {
    if (item.score !== lastScore) {
      currentRank = index + 1;
      lastScore = item.score;
    }
    await tx.rankHistory.create({
      data: {
        studentId: item.studentId,
        date,
        rank: currentRank,
        score: item.score,
        testId: "OVERALL"
      }
    });
  }
}

function calculateReadiness(completedCount: number, totalChapters: number) {
  if (!totalChapters) return 0;
  return Math.round((completedCount / totalChapters) * 100);
}

function getLatestRankMovement(ranks: Array<{ rank: number | null }>) {
  if (ranks.length < 2) return null;
  const [current, previous] = ranks;
  if (current.rank === null || previous.rank === null) return null;
  return previous.rank - current.rank;
}

export async function getStudentProfile(studentId?: string) {
  const student =
    studentId && studentId.length
      ? await prisma.student.findUnique({
          where: { id: studentId },
          include: {
            ranks: { orderBy: { date: "desc" }, take: 2 },
            attendance: true,
            syllabus: { include: { chapter: true } },
            testResults: {
              include: { test: true },
              orderBy: { createdAt: "desc" },
              take: 10
            }
          }
        })
      : await prisma.student.findFirst({
          orderBy: { joinedDate: "asc" },
          include: {
            ranks: { orderBy: { date: "desc" }, take: 2 },
            attendance: true,
            syllabus: { include: { chapter: true } },
            testResults: {
              include: { test: true },
              orderBy: { createdAt: "desc" },
              take: 10
            }
          }
        });

  if (!student) return null;

  const allResults = await prisma.studentTestResult.findMany({
    where: { studentId: student.id },
    include: { test: true },
    orderBy: { createdAt: "desc" }
  });

  const average = allResults.length
    ? Math.round(allResults.reduce((sum, item) => sum + item.percentage, 0) / allResults.length)
    : 0;

  const attendanceRate = student.attendance.length
    ? Math.round((student.attendance.filter((item) => item.attended).length / student.attendance.length) * 100)
    : 0;

  const completedChapters = student.syllabus
    .filter((entry) => entry.status === "COMPLETED")
    .map((entry) => entry.chapter.chapterName);

  const totalChapterCount = getRoadmap(student.classLevel, student.stream).length;
  const completedCount = completedChapters.length;
  const readiness = calculateReadiness(completedCount, totalChapterCount);

  const ongoingChapter = student.syllabus.find((entry) => entry.status === "ONGOING")?.chapter.chapterName;
  const plannedChapter = student.syllabus.find((entry) => entry.status === "PLANNED")?.chapter.chapterName;

  const nextChapter = ongoingChapter || plannedChapter || null;

  const latestTest = student.testResults[0];
  const progressTrend = allResults.slice(0, 7).map((result) => ({
    name: result.test.testName,
    score: result.percentage,
    batch: result.percentage
  }));

  const weakChapters = parseWeakChaptersFromNote(latestTest?.teacherNote);

  // Fetch the next upcoming scheduled test
  const nextScheduledTest = await prisma.scheduledTest.findFirst({
    where: {
      batchId: student.batchId ?? undefined,
      scheduledDate: { gte: new Date() }
    },
    orderBy: { scheduledDate: "asc" }
  });

  const nextTestText = nextScheduledTest
    ? `${nextScheduledTest.testName} (${nextScheduledTest.scheduledDate.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })})`
    : "None scheduled";

  return {
    id: student.id,
    fullName: student.fullName,
    batchType: student.batchType,
    classLevel: student.classLevel,
    stream: student.stream,
    rank: student.ranks[0]?.rank ?? null,
    rankMovement: getLatestRankMovement(student.ranks as any),
    average,
    attendance: attendanceRate,
    cetReadiness: readiness,
    mainProgress: readiness,
    currentChapter: ongoingChapter ?? null,
    nextTest: nextTestText,
    aiNote: latestTest?.aiSummary || latestTest?.teacherNote || "No AI analysis available yet.",
    weakChapters,
    completedChapters,
    nextChapter,
    progressTrend
  };
}

export async function getStudentProgress(studentId?: string) {
  const profile = await getStudentProfile(studentId);
  if (!profile) return null;
  const latestResult = await prisma.studentTestResult.findFirst({
    where: { studentId: profile.id },
    include: { subjectMarks: true },
    orderBy: { createdAt: "desc" }
  });

  const subjectMarks: Record<string, { scored: number; maxMarks: number }> = {};
  if (latestResult) {
    for (const mark of latestResult.subjectMarks) {
      subjectMarks[mark.subject] = { scored: mark.scored, maxMarks: mark.maxMarks };
    }
  }

  return {
    ...profile,
    subjects: subjectMarks
  };
}

export async function getStudentTests(studentId?: string) {
  const targetStudent =
    studentId && studentId.length
      ? await prisma.student.findUnique({ where: { id: studentId } })
      : await prisma.student.findFirst({ orderBy: { joinedDate: "asc" } });

  if (!targetStudent) return [];

  const results = await prisma.studentTestResult.findMany({
    where: { studentId: targetStudent.id },
    include: {
      test: { include: { chapters: { include: { chapter: true } } } },
      subjectMarks: true
    },
    orderBy: { createdAt: "desc" }
  });

  return results.map((result) => ({
    id: result.id,
    testName: result.test.testName,
    testType: result.test.testType,
    date: result.test.date.toISOString(),
    percentage: result.percentage,
    rank: result.rank,
    teacherNote: result.teacherNote,
    aiNote: result.aiSummary,
    chapters: result.test.chapters.map((entry) => entry.chapter.chapterName),
    subjectMarks: result.subjectMarks.reduce<Record<string, { scored: number; maxMarks: number }>>((acc, mark) => {
      acc[mark.subject] = { scored: mark.scored, maxMarks: mark.maxMarks };
      return acc;
    }, {})
  }));
}

export async function getTeacherDashboard(batchType?: string) {
  const batch = normalizeBatchType(batchType) ?? batchType;
  const studentFilter = batch ? { batchType: batch } : {};

  const students = await prisma.student.findMany({
    where: studentFilter,
    include: {
      user: true,
      ranks: { orderBy: { date: "desc" }, take: 1 },
      testResults: { include: { test: true }, orderBy: { createdAt: "desc" }, take: 1 },
      syllabus: { include: { chapter: true } },
      attendance: true
    }
  });

  const studentSummaries = students.map((student) => {
    const result = student.testResults[0];
    const completedChapters = student.syllabus.filter((entry) => entry.status === "COMPLETED").length;
    const totalChapters = getRoadmap(student.classLevel, student.stream).length;
    const mainProgress = calculateReadiness(completedChapters, totalChapters);
    const average = student.testResults.length
      ? Math.round(student.testResults.reduce((sum, item) => sum + item.percentage, 0) / student.testResults.length)
      : 0;

    return {
      id: student.id,
      fullName: student.fullName,
      batchType: student.batchType,
      currentChapter: student.syllabus.find((entry) => entry.status === "ONGOING")?.chapter.chapterName ?? null,
      average,
      rank: student.ranks[0]?.rank ?? null,
      aiNote: result?.aiSummary || result?.teacherNote || "",
      mainProgress,
      attendance: student.attendance ? Math.round((student.attendance.filter((a) => a.attended).length / Math.max(student.attendance.length, 1)) * 100) : 0,
      lastTest: result?.percentage ?? null,
      rankMovement: null
    };
  });

  const validAverages = studentSummaries.filter((item) => item.average !== null).map((item) => item.average);
  const batchAverage = validAverages.length ? Math.round(validAverages.reduce((sum, value) => sum + value, 0) / validAverages.length) : 0;
  const weakStudents = studentSummaries.filter((item) => (item.average ?? 0) < 65);
  const draftFilter = batch
    ? { status: "TEACHER_REVIEW" as DraftStatus, student: { batchType: batch } }
    : { status: "TEACHER_REVIEW" as DraftStatus };
  const whatsappDraftCount = await prisma.whatsAppDraft.count({ where: draftFilter });

  const roadmapBatch = batch ? batchClassStream(batch) : undefined;
  const batchDefaults = roadmapBatch ?? { classLevel: "TWELVE", stream: "SCIENCE_PCM" };

  return {
    studentsTracked: students.length,
    batchAverage,
    weakStudentCount: weakStudents.length,
    reviewQueue: whatsappDraftCount,
    studentOverview: studentSummaries.slice(0, 12),
    priorityStudents: weakStudents.slice(0, 6),
    roadmap: getRoadmap(batchDefaults.classLevel, batchDefaults.stream).slice(0, 5).map((item) => ({ ...item }))
  };
}

export async function getTeacherStudents(batchType?: string) {
  const batch = normalizeBatchType(batchType) ?? batchType;

  const students = await prisma.student.findMany({
    where: {
      archived: false,
      ...(batch ? { batchType: batch } : {})
    },
    orderBy: { joinedDate: "asc" },
    include: {
      user: true,
      batch: true,
      ranks: { orderBy: { date: "desc" }, take: 1 },
      attendance: true,
      syllabus: { include: { chapter: true } },
      testResults: { select: { percentage: true }, orderBy: { createdAt: "desc" } }
    }
  });

  return students.map((student) => {
    const average = student.testResults.length
      ? Math.round(student.testResults.reduce((sum, item) => sum + item.percentage, 0) / student.testResults.length)
      : 0;

    const attendedCount = student.attendance.filter((item) => item.attended).length;
    const attendancePercent = student.attendance.length
      ? Math.round((attendedCount / student.attendance.length) * 100)
      : 0;

    const currentChapter =
      student.syllabus.find((entry) => entry.status === "ONGOING")?.chapter.chapterName ||
      student.syllabus.find((entry) => entry.status === "PLANNED")?.chapter.chapterName ||
      null;

    const status = student.catchUpMode
      ? "Catch-up"
      : average >= 75
        ? "On track"
        : average >= 65
          ? "Needs focus"
          : "Needs support";

    return {
      id: student.id,
      fullName: student.fullName,
      username: student.user.username,
      classLevel: student.classLevel,
      stream: student.stream,
      batchType: student.batch?.name ?? student.batchType,
      whatsappContact: student.whatsappContact ?? "",
      parentContact: student.parentContact ?? "",
      attendancePercent,
      average,
      rank: student.ranks[0]?.rank ?? null,
      currentChapter,
      status,
      archived: student.archived,
      joinedDate: student.joinedDate.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })
    };
  });
}

export async function getTeacherLeaderboard(scope: "weekly" | "monthly" | "quarterly" | "overall", batchType?: string) {
  if (scope === "overall") {
    return getLeaderboard("overall", batchType);
  }
  return getLeaderboard(scope, batchType);
}

async function getLeaderboard(scope: "weekly" | "monthly" | "quarterly" | "overall", batchType?: string) {
  const batch = normalizeBatchType(batchType) ?? batchType;
  const scopeMap = {
    weekly: "WEEKLY_CHAPTER",
    monthly: "MONTHLY",
    quarterly: "QUARTERLY",
    overall: "OVERALL"
  } as const;

  const targetTestType = scopeMap[scope];

  const latestRankEntry = await prisma.rankHistory.findFirst({
    where: {
      testId: targetTestType,
      student: batch ? { batchType: batch } : undefined
    },
    orderBy: { date: "desc" }
  });

  if (!latestRankEntry) {
    // Fallback: if no rank histories exist yet, calculate on the fly
    const students = await prisma.student.findMany({
      where: batch ? { batchType: batch } : {},
      include: {
        testResults: { include: { test: true } }
      }
    });

    const entries = students.map((student) => {
      const grouped = student.testResults.reduce(
        (acc, result) => {
          const type = result.test.testType;
          if (type === "WEEKLY_CHAPTER") acc.weekly.push(result.percentage);
          if (type === "MONTHLY") acc.monthly.push(result.percentage);
          if (type === "QUARTERLY") acc.quarterly.push(result.percentage);
          return acc;
        },
        { weekly: [] as number[], monthly: [] as number[], quarterly: [] as number[] }
      );
      const avg = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);
      const weeklyAvg = avg(grouped.weekly);
      const monthlyAvg = avg(grouped.monthly);
      const quarterlyAvg = avg(grouped.quarterly);
      const weight = (weeklyAvg ? 0.2 : 0) + (monthlyAvg ? 0.3 : 0) + (quarterlyAvg ? 0.5 : 0);
      const total = weeklyAvg * 0.2 + monthlyAvg * 0.3 + quarterlyAvg * 0.5;
      const score = weight > 0 ? Math.round((total / weight) * 100) / 100 : 0;
      return {
        id: student.id,
        fullName: student.fullName,
        batchType: student.batchType,
        average: Math.round((weeklyAvg + monthlyAvg + quarterlyAvg) * 100) / 300,
        computedScore: score,
        lastTest: student.testResults[0]?.percentage ?? 0,
        rankMovement: null
      };
    });
    entries.sort((a, b) => b.computedScore - a.computedScore);
    return entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
  }

  const latestDate = latestRankEntry.date;

  const prevRankEntry = await prisma.rankHistory.findFirst({
    where: {
      testId: targetTestType,
      student: batch ? { batchType: batch } : undefined,
      date: { lt: latestDate }
    },
    orderBy: { date: "desc" }
  });

  const prevDate = prevRankEntry?.date;

  const currentRanks = await prisma.rankHistory.findMany({
    where: {
      testId: targetTestType,
      date: latestDate,
      student: batch ? { batchType: batch } : undefined
    },
    include: {
      student: {
        include: {
          testResults: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      }
    },
    orderBy: { rank: "asc" }
  });

  const prevRanksMap = new Map<string, number>();
  if (prevDate) {
    const prevRanks = await prisma.rankHistory.findMany({
      where: {
        testId: targetTestType,
        date: prevDate,
        student: batch ? { batchType: batch } : undefined
      }
    });
    for (const r of prevRanks) {
      prevRanksMap.set(r.studentId, r.rank);
    }
  }

  return currentRanks.map((entry) => {
    const prevRank = prevRanksMap.get(entry.studentId);
    const movement = prevRank ? prevRank - entry.rank : null;

    return {
      id: entry.student.id,
      fullName: entry.student.fullName,
      batchType: entry.student.batchType,
      average: Math.round(entry.score * 100) / 100,
      computedScore: entry.score,
      lastTest: entry.student.testResults[0]?.percentage ?? 0,
      rank: entry.rank,
      rankMovement: movement
    };
  });
}

export async function getTeacherSyllabus(batchType?: string) {
  const batch = normalizeBatchType(batchType) ?? batchType;
  const batches = batch
    ? [batch]
    : [batchLabels.TWELVE_SCIENCE, batchLabels.ELEVEN_SCIENCE, batchLabels.TWELVE_COMMERCE, batchLabels.ELEVEN_COMMERCE];

  const syllabusBatches = [] as Array<{ batch: string; chapters: Array<{ subject: string; name: string; status: string; priority: string }> }>;

  for (const batchLabel of batches) {
    const batchDef = batchClassStream(batchLabel);
    if (!batchDef) continue;
    const { classLevel, stream } = batchDef;

    const roadmap = getRoadmap(classLevel, stream);
    const chapterStatuses = await prisma.studentChapter.groupBy({
      by: ["chapterId", "status"],
      where: { chapter: { classLevel, stream } }
    });

    const chapterMap: Record<string, string> = {};
    for (const entry of chapterStatuses) {
      if (!chapterMap[entry.chapterId] || entry.status === "COMPLETED") {
        chapterMap[entry.chapterId] = entry.status;
      }
    }

    const chapters = await prisma.chapter.findMany({
      where: { classLevel, stream },
      orderBy: { chapterName: "asc" }
    });

    const chapterRows = roadmap.map((item) => {
      const chapterRecord = chapters.find((chapter) => chapter.chapterName === item.chapterName);
      const status = chapterRecord ? chapterMap[chapterRecord.id] || "PLANNED" : "PLANNED";
      return { subject: item.subject, name: item.chapterName, status, priority: item.priority };
    });

    if (chapterRows.length) {
      syllabusBatches.push({ batch: batchLabel, chapters: chapterRows });
    }
  }

  return syllabusBatches;
}

export type AppSettings = {
  primaryProvider: string;
  fallbackProvider: string;
  whatsappNumber: string;
  notificationPreferences: {
    resultUploaded: boolean;
    chapterCompleted: boolean;
    quarterlyReminder: boolean;
    walkthrough: boolean;
  };
  batchDefault: string;
  teacherPermissions: string[];
  adminPermissions: string[];
};

export async function getAppSettings(): Promise<AppSettings> {
  const settings = await prisma.appSetting.findMany({
    where: {
      key: {
        in: [
          "primaryProvider",
          "fallbackProvider",
          "whatsappNumber",
          "notificationPreferences",
          "batchDefault",
          "teacherPermissions",
          "adminPermissions"
        ]
      }
    }
  });

  const map = settings.reduce<Record<string, string>>((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  return {
    primaryProvider: map.primaryProvider ?? "openai",
    fallbackProvider: map.fallbackProvider ?? "groq",
    whatsappNumber: map.whatsappNumber ?? "9172765002",
    notificationPreferences: map.notificationPreferences
      ? JSON.parse(map.notificationPreferences)
      : { resultUploaded: true, chapterCompleted: true, quarterlyReminder: true, walkthrough: true },
    batchDefault: map.batchDefault ?? "12th Batch 2026",
    teacherPermissions: map.teacherPermissions ? JSON.parse(map.teacherPermissions) : ["uploadMarks", "viewStudents", "sendWhatsApp"],
    adminPermissions: map.adminPermissions ? JSON.parse(map.adminPermissions) : ["searchReports"]
  };
}

export async function saveAppSettings(settings: Partial<AppSettings>) {
  const entries = [
    ["primaryProvider", settings.primaryProvider ?? "openai"],
    ["fallbackProvider", settings.fallbackProvider ?? "groq"],
    ["whatsappNumber", settings.whatsappNumber ?? "9172765002"],
    ["notificationPreferences", settings.notificationPreferences ? JSON.stringify(settings.notificationPreferences) : JSON.stringify({ resultUploaded: true, chapterCompleted: true, quarterlyReminder: true, walkthrough: true })],
    ["batchDefault", settings.batchDefault ?? "12th Batch 2026"],
    ["teacherPermissions", settings.teacherPermissions ? JSON.stringify(settings.teacherPermissions) : JSON.stringify(["uploadMarks", "viewStudents", "sendWhatsApp"] )],
    ["adminPermissions", settings.adminPermissions ? JSON.stringify(settings.adminPermissions) : JSON.stringify(["searchReports"] )]
  ] as Array<[string, string]>;

  await Promise.all(
    entries.map(([key, value]) =>
      prisma.appSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value }
      })
    )
  );

  return getAppSettings();
}

export async function getWhatsAppDrafts(batchType?: string) {
  const batch = normalizeBatchType(batchType) ?? batchType;
  const drafts = await prisma.whatsAppDraft.findMany({
    where: batch ? { status: "TEACHER_REVIEW", student: { batchType: batch } } : { status: "TEACHER_REVIEW" },
    include: { student: true },
    orderBy: { createdAt: "desc" }
  });

  return drafts.map((draft) => ({
    id: draft.id,
    student: draft.student.fullName,
    cadence: draft.cadence,
    status: draft.status,
    draft: draft.body,
    batchType: draft.student.batchType,
    createdAt: draft.createdAt.toISOString()
  }));
}

export async function sendWhatsAppDraft(id: string, message: string) {
  const draft = await prisma.whatsAppDraft.update({
    where: { id },
    data: {
      body: message,
      status: "SENT",
      sentAt: new Date()
    },
    include: { student: true }
  });

  await prisma.notification.create({
    data: {
      studentId: draft.studentId,
      title: "WhatsApp sent",
      body: `A WhatsApp draft for ${draft.student.fullName} was marked sent by the teacher.`,
      type: "whatsapp_sent",
      isPopup: false
    }
  });

  return {
    id: draft.id,
    student: draft.student.fullName,
    status: draft.status,
    draft: draft.body,
    sentAt: draft.sentAt?.toISOString() ?? null
  };
}

export async function getStudentNotifications(studentId?: string) {
  const student =
    studentId && studentId.length
      ? await prisma.student.findUnique({ where: { id: studentId } })
      : await prisma.student.findFirst({ orderBy: { joinedDate: "asc" } });

  if (!student) return [];

  const notifications = await prisma.notification.findMany({
    where: { studentId: student.id, readAt: null },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  return notifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    body: notification.body,
    type: notification.type,
    createdAt: notification.createdAt.toISOString(),
    isPopup: notification.isPopup
  }));
}

export async function getTeacherSchedule(batchType?: string) {
  const batchName = normalizeBatchType(batchType) ?? batchType;
  const batchDef = batchClassStream(batchName) ?? ({ classLevel: "TWELVE", stream: "SCIENCE_PCM" } as const);

  // Find batch record
  const batchRecord = batchName ? await prisma.batch.findUnique({ where: { name: batchName } }) : await prisma.batch.findFirst({
    where: { classLevel: batchDef.classLevel, stream: batchDef.stream }
  });

  if (!batchRecord) {
    return [];
  }

  // Find all scheduled tests for the batch
  const scheduledTests = await prisma.scheduledTest.findMany({
    where: { batchId: batchRecord.id },
    orderBy: { scheduledDate: "asc" }
  });

  // Find all completed tests for this class level and stream
  const completedTests = await prisma.test.findMany({
    where: { classLevel: batchRecord.classLevel, stream: batchRecord.stream },
    include: { chapters: { include: { chapter: true } } }
  });

  const now = new Date();

  return scheduledTests.map((st) => {
    // Check if there is a completed test matching name and type
    const matchingTest = completedTests.find(
      (ct) => ct.testName.toLowerCase() === st.testName.toLowerCase() && ct.testType === st.testType
    );

    const isCompleted = !!matchingTest;
    const isToday = st.scheduledDate.toDateString() === now.toDateString();
    const isFuture = st.scheduledDate.getTime() > now.getTime();

    let status = "UPCOMING";
    if (isCompleted) {
      status = "COMPLETED";
    } else if (isToday) {
      status = "IN_PROGRESS";
    }

    const testDate = matchingTest ? matchingTest.date : st.scheduledDate;

    // Resolve chapters based on matching test, or if not completed, guess from roadmap
    let chapters = matchingTest
      ? matchingTest.chapters.map((entry) => entry.chapter.chapterName)
      : [];

    if (!isCompleted) {
      // Guess chapters from the roadmap for this batch
      const roadmap = getRoadmap(batchRecord.classLevel, batchRecord.stream);
      if (st.testType === "WEEKLY_CHAPTER") {
        // Just show the next planned/ongoing chapter
        const nextChapter = roadmap.find((r) => r.subject === "Physics")?.chapterName; // Placeholder guess
        chapters = nextChapter ? [nextChapter] : [];
      } else if (st.testType === "MONTHLY") {
        // Show chapters for the current subject block
        chapters = roadmap.slice(0, 3).map((r) => r.chapterName);
      } else if (st.testType === "QUARTERLY") {
        chapters = roadmap.slice(0, 6).map((r) => r.chapterName);
      } else if (st.testType === "FULL_LENGTH_MOCK") {
        chapters = ["Complete CET Syllabus"];
      } else {
        chapters = ["Revision of Weak Chapters"];
      }
    }

    return {
      id: st.id,
      testName: st.testName,
      testType: st.testType,
      date: testDate.toISOString(),
      scheduledDate: st.scheduledDate.toISOString(),
      status,
      chapters,
      batchName: batchRecord.name,
      classLevel: batchRecord.classLevel,
      stream: batchRecord.stream
    };
  });
}
