import { NextResponse } from "next/server";
import { getTeacherStudents } from "@/lib/academy";
import { assertRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as bcryptjs from "bcryptjs";

export async function GET(request: Request) {
  try {
    assertRole(request, ["teacher"]);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = new URL(request.url);
  const batch = url.searchParams.get("batch") ?? undefined;
  const students = await getTeacherStudents(batch);
  return NextResponse.json(students);
}

export async function POST(request: Request) {
  try {
    assertRole(request, ["teacher"]);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { fullName, username, studentPhone, batchId, classLevel, stream, batchType } = body;

    if (!fullName || !username || !studentPhone || !batchId || !classLevel || !stream || !batchType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    const passwordHash = await bcryptjs.hash("student@123", 10);

    const user = await prisma.user.create({
      data: {
        role: "STUDENT",
        username,
        passwordHash,
        firstLogin: true,
      },
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        fullName,
        classLevel,
        stream,
        batchType,
        batchId,
        joinedDate: new Date(),
        whatsappContact: studentPhone.replace(/\D/g, ""),
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
