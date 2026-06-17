import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRoleFromRequest } from "@/lib/auth";

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const role = getRoleFromRequest(request);
    if (role !== "teacher" && role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await props.params;
    if (!id) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { fullName, whatsappContact, classLevel, stream, batchId } = body;

    const student = await prisma.student.update({
      where: { id },
      data: {
        ...(fullName && { fullName }),
        ...(whatsappContact && { whatsappContact }),
        ...(classLevel && { classLevel }),
        ...(stream && { stream }),
        ...(batchId && { batchId }),
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const role = getRoleFromRequest(request);
    if (role !== "teacher" && role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await props.params;
    if (!id) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    // Prisma will cascade delete if configured, or we need to delete related records first.
    // Assuming simple deletion for now.
    
    // Get student's userId first
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    await prisma.student.delete({ where: { id } });
    await prisma.user.delete({ where: { id: student.userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
