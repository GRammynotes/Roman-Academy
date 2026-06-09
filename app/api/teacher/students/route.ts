import { NextResponse } from "next/server";
import { getTeacherStudents } from "@/lib/academy";
import { assertRole } from "@/lib/auth";

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
