import { NextResponse } from "next/server";
import { getStudentProgress } from "@/lib/academy";
import { assertRole } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    assertRole(request, ["student"]);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = new URL(request.url);
  const studentId = url.searchParams.get("studentId") ?? undefined;
  const progress = await getStudentProgress(studentId);

  if (!progress) {
    return NextResponse.json({ error: "Student progress not available." }, { status: 404 });
  }

  return NextResponse.json(progress);
}
