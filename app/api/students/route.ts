import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/auth";
import { formatBatchType, parseClassLevel, parseStream } from "@/lib/batch";
import { ensureBatch, buildWelcomeWhatsAppBody } from "@/lib/academy";

function usernameFromName(name: string, batchYear: string) {
  const normalized = name.toLowerCase().trim().replace(/\s+/g, ".").replace(/[^a-z.]/g, "");
  return `${normalized}.${batchYear}`;
}

function generatePassword() {
  return crypto.randomBytes(6).toString("base64url");
}

function batchYearFromLabel(batchType: string) {
  const match = batchType.match(/(20\d{2})/);
  return match ? match[1] : "2026";
}

export async function POST(request: Request) {
  try {
    assertRole(request, ["teacher"]);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const action = String(body.action || "create");
  const studentId = body.studentId ? String(body.studentId) : undefined;
  const fullName = String(body.fullName || "").trim();
  if (!fullName) return NextResponse.json({ error: "Full Name is required" }, { status: 400 });

  const classLevel = parseClassLevel(String(body.classLevel || "12")) ?? "TWELVE";
  const stream = parseStream(String(body.stream || "Science"));
  const batchType = formatBatchType(classLevel, stream);
  const batchYear = batchYearFromLabel(batchType);
  const username = String(body.username || usernameFromName(fullName, batchYear) || `student.${Date.now()}`).trim();
  const password = String(body.password || generatePassword());
  const joinedDate = body.joinedDate ? new Date(String(body.joinedDate)) : new Date();
  const catchUpMode = Boolean(body.catchUpMode ?? false);
  const whatsappContact = body.studentPhone ? String(body.studentPhone) : null;
  const parentContact = body.parentPhone ? String(body.parentPhone) : null;
  const notes = body.notes ? String(body.notes) : null;

  if (action === "archive") {
    if (!studentId) return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    await prisma.student.update({ where: { id: studentId }, data: { archived: true } });
    return NextResponse.json({ success: true });
  }

  if (action === "resetPassword") {
    if (!studentId) return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    const student = await prisma.student.findUnique({ where: { id: studentId }, include: { user: true } });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
    await prisma.user.update({ where: { id: student.userId }, data: { passwordHash: password } });
    return NextResponse.json({ studentId, password });
  }

  const batch = await ensureBatch(batchType, classLevel, stream);

  if (studentId) {
    const existing = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true }
    });
    if (!existing) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    await prisma.user.update({
      where: { id: existing.userId },
      data: {
        username
      }
    });

    const student = await prisma.student.update({
      where: { id: studentId },
      data: {
        fullName,
        whatsappContact,
        parentContact,
        batchType,
        batchId: batch.id,
        stream,
        classLevel,
        joinedDate,
        catchUpMode,
        notes
      }
    });

    await prisma.notification.create({
      data: {
        studentId,
        title: "Student updated",
        body: `${student.fullName}'s profile has been updated.`,
        type: "student_updated",
        isPopup: false
      }
    });

    return NextResponse.json({ student });
  }

  const user = await prisma.user.upsert({
    where: { username },
    update: {},
    create: {
      username,
      role: "STUDENT",
      passwordHash: password
    }
  });

  const student = await prisma.student.upsert({
    where: { userId: user.id },
    update: {
      fullName,
      whatsappContact,
      parentContact,
      batchType,
      batchId: batch.id,
      stream,
      classLevel,
      joinedDate,
      catchUpMode,
      notes
    },
    create: {
      userId: user.id,
      fullName,
      whatsappContact,
      parentContact,
      batchType,
      batchId: batch.id,
      stream,
      classLevel,
      joinedDate,
      catchUpMode,
      notes
    }
  });

  await prisma.rankHistory.create({
    data: {
      studentId: student.id,
      date: new Date(),
      rank: 0,
      score: 0
    }
  });

  await prisma.attendance.create({
    data: {
      studentId: student.id,
      date: new Date(),
      streamLabel: batchType,
      attended: false,
      isAlternateStream: false
    }
  });

  const chapter = await prisma.chapter.upsert({
    where: {
      chapterName_subject_classLevel_stream: {
        chapterName: "Rotational Dynamics",
        subject: "Physics",
        classLevel,
        stream
      }
    },
    update: {},
    create: {
      chapterName: "Rotational Dynamics",
      subject: "Physics",
      classLevel,
      stream,
      cetRelevance: "High",
      boardImportance: "High"
    }
  });

  await prisma.studentChapter.upsert({
    where: {
      studentId_chapterId_isAlternateStream: {
        studentId: student.id,
        chapterId: chapter.id,
        isAlternateStream: false
      }
    },
    update: {},
    create: {
      studentId: student.id,
      chapterId: chapter.id,
      status: catchUpMode ? "CATCH_UP" : "PLANNED"
    }
  });

  await prisma.notification.create({
    data: {
      studentId: student.id,
      title: "Student enrolled",
      body: `${student.fullName} has been added to ${batchType}. Welcome draft is ready for review.`,
      type: "student_enrolled",
      isPopup: false
    }
  });

  await prisma.whatsAppDraft.create({
    data: {
      studentId: student.id,
      body: buildWelcomeWhatsAppBody(student.fullName, batchType),
      cadence: "Welcome Message",
      status: "TEACHER_REVIEW"
    }
  });

  return NextResponse.json({ student, username, password, batchType });
}
