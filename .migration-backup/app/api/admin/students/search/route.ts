import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    assertRole(request, ["teacher"]);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = new URL(request.url);
  const batch = url.searchParams.get("batch");
  const classLevel = url.searchParams.get("classLevel");
  const stream = url.searchParams.get("stream");
  const name = url.searchParams.get("name");

  const studentWhere: any = {};

  if (batch && batch !== "all") {
    studentWhere.batchType = batch;
  }

  if (classLevel && classLevel !== "all") {
    studentWhere.classLevel = classLevel;
  }

  if (stream && stream !== "all") {
    studentWhere.stream = stream;
  }

  if (name) {
    studentWhere.fullName = { contains: name, mode: "insensitive" };
  }

  try {
    const students = await prisma.student.findMany({
      where: studentWhere,
      include: {
        user: {
          select: {
            username: true,
          }
        },
        testResults: {
          select: {
            percentage: true,
            totalScored: true,
            aiSummary: true
          },
          orderBy: { createdAt: "desc" },
          take: 5
        },
        ranks: {
          orderBy: { date: "desc" },
          take: 1
        },
        attendance: true,
        syllabus: {
          include: {
            chapter: true
          }
        }
      }
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
