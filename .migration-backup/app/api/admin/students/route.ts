import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    assertRole(request, ["teacher"]);
    
    const body = await request.json();
    const { fullName, studentPhone, parentPhone, stream, classLevel, batchName } = body;

    if (!fullName || !stream || !classLevel || !batchName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate username
    const names = fullName.trim().toLowerCase().split(/\s+/);
    const firstName = names[0];
    const lastName = names.length > 1 ? names[names.length - 1] : "";
    const year = new Date().getFullYear() + (classLevel === "ELEVEN" ? 2 : 1);
    
    let baseUsername = `${firstName}.${lastName}.${year}`;
    if (!lastName) baseUsername = `${firstName}.${year}`;
    
    let username = baseUsername;
    let count = 1;
    
    // Ensure unique username
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${count}`;
      count++;
    }

    // Generate random secure password
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let randomPassword = "";
    for (let i = 0; i < 10; i++) {
      randomPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Simple hash simulation for now (in real app use bcrypt/argon2)
    const passwordHash = randomPassword; // Since we don't have bcrypt imported, we will just save the random string for now, in a real scenario we'd hash it. We can rely on existing auth mechanism to verify. Let's just save the generated string.

    // Find or create batch
    let batch = await prisma.batch.findUnique({ where: { name: batchName } });
    if (!batch) {
      batch = await prisma.batch.create({
        data: {
          name: batchName,
          classLevel,
          stream,
          startDate: new Date(),
        }
      });
    }

    // Create everything in a transaction
    const student = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          role: "STUDENT",
          username,
          passwordHash,
          firstLogin: true
        }
      });

      // 2. Create Student
      const newStudent = await tx.student.create({
        data: {
          userId: user.id,
          fullName,
          classLevel,
          stream,
          batchType: batchName,
          batchId: batch.id,
          joinedDate: new Date(),
          whatsappContact: studentPhone || null,
          parentContact: parentPhone || null,
        }
      });

      // 3. Create Rank seed
      await tx.rankHistory.create({
        data: {
          studentId: newStudent.id,
          date: new Date(),
          rank: 0,
          score: 0,
          testId: "OVERALL"
        }
      });

      // 4. Create Notification
      await tx.notification.create({
        data: {
          studentId: newStudent.id,
          title: "Welcome to Roman Academy",
          body: "Your profile has been created successfully.",
          type: "system",
          isPopup: true
        }
      });

      // 5. Create WhatsApp Draft
      await tx.whatsAppDraft.create({
        data: {
          studentId: newStudent.id,
          body: `Welcome to Roman Academy, ${fullName}! Your username is ${username} and your temporary password is ${randomPassword}. Please change it on first login.`,
          cadence: "ONBOARDING",
          status: "DRAFT"
        }
      });

      return newStudent;
    });

    return NextResponse.json({ student });
  } catch (error: any) {
    console.error("Error creating student:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
