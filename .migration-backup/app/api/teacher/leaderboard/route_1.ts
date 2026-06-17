import { NextResponse } from "next/server";
import { getTeacherLeaderboard } from "@/lib/academy";
import { assertRole } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    assertRole(request, ["teacher", "student"]);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = new URL(request.url);
  const scope = (url.searchParams.get("scope") as "weekly" | "monthly" | "quarterly" | "overall") ?? "weekly";
  const batch = url.searchParams.get("batch") ?? undefined;
  const leaderboard = await getTeacherLeaderboard(scope, batch);
  return NextResponse.json(leaderboard);
}
