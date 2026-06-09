import { NextResponse } from "next/server";
import { analyzeWithFallback } from "@/lib/ai-provider";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await analyzeWithFallback({
    studentName: String(body.studentName || "Student"),
    testName: String(body.testName || "Latest Test"),
    percentage: Number(body.percentage || 0),
    weakChapters: Array.isArray(body.weakChapters) ? body.weakChapters.map(String) : [],
    teacherNote: body.teacherNote ? String(body.teacherNote) : undefined
  });

  return NextResponse.json(result);
}
