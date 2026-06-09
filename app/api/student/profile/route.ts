import { NextResponse } from "next/server";
import { getStudentProfile } from "@/lib/academy";
import { assertRole } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    assertRole(request, ["student"]);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = new URL(request.url);
  const studentId = url.searchParams.get("studentId") ?? undefined;
  const profile = await getStudentProfile(studentId);

  if (!profile) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  return NextResponse.json(profile);
}
