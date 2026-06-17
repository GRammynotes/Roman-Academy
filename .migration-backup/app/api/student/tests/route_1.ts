import { NextResponse } from "next/server";
import { getStudentTests } from "@/lib/academy";
import { assertRole } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    assertRole(request, ["student"]);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = new URL(request.url);
  const studentId = url.searchParams.get("studentId") ?? undefined;
  const tests = await getStudentTests(studentId);
  return NextResponse.json(tests);
}
