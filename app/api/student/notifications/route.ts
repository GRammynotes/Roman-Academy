import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentProfile } from "@/lib/academy";

export async function GET() {
  try {
    const student = await getStudentProfile();
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const notifications = await prisma.notification.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const student = await getStudentProfile();
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const { id } = body;

    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { readAt: new Date() }
      });
    } else {
      await prisma.notification.updateMany({
        where: { studentId: student.id, readAt: null },
        data: { readAt: new Date() }
      });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
