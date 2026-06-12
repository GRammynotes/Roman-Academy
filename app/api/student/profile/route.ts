import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRoleFromRequest, getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const role = getRoleFromRequest(request);
    if (role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        user: {
          select: { username: true }
        },
        batch: {
          select: { name: true }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: student.id,
      fullName: student.fullName,
      whatsappContact: student.whatsappContact,
      classLevel: student.classLevel,
      stream: student.stream,
      batchType: student.batchType,
      batch: student.batch?.name,
      joinedDate: student.joinedDate
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const role = getRoleFromRequest(request);
    if (role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const body = await request.json();
    const { fullName, whatsappContact } = body;

    // Validate inputs
    if (!fullName || !whatsappContact) {
      return NextResponse.json(
        { error: "Name and phone number are required" },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(whatsappContact.replace(/\D/g, ""))) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { userId }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const updated = await prisma.student.update({
      where: { id: student.id },
      data: {
        fullName: fullName.trim(),
        whatsappContact: whatsappContact.replace(/\D/g, "")
      },
      include: {
        batch: { select: { name: true } }
      }
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      data: {
        fullName: updated.fullName,
        whatsappContact: updated.whatsappContact
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
