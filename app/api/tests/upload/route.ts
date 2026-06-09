import { NextResponse } from "next/server";
import { uploadTestResults } from "@/lib/academy";
import { assertRole } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    assertRole(request, ["teacher"]);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const text = typeof body?.text === "string" ? body.text.trim() : "";

  if (!text) {
    return NextResponse.json({ error: "Upload text is required." }, { status: 400 });
  }

  try {
    const result = await uploadTestResults(text);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
