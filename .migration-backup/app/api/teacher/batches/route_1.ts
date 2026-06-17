import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/auth";
import { ensureBatch, getTeacherBatches } from "@/lib/academy";
import { parseClassLevel, parseStream } from "@/lib/batch";

export async function GET(request: Request) {
  assertRole(request, ["teacher"]);
  const batches = await getTeacherBatches();
  return NextResponse.json(batches);
}

export async function POST(request: Request) {
  assertRole(request, ["teacher"]);
  const body = await request.json();
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "Batch name is required." }, { status: 400 });
  const classLevel = parseClassLevel(String(body.classLevel || "12")) ?? "TWELVE";
  const stream = parseStream(String(body.stream || "Science"));
  const startDate = body.startDate ? new Date(String(body.startDate)) : new Date("2026-04-01T00:00:00.000Z");
  const batch = await ensureBatch(name, classLevel, stream, prisma, startDate);
  return NextResponse.json({ batch });
}
