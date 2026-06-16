import { NextResponse } from "next/server";
import { assertRole } from "@/lib/auth";
import { sendWhatsAppDraft } from "@/lib/academy";

export async function POST(request: Request) {
  assertRole(request, ["teacher"]);
  const body = await request.json();
  if (!body?.id || typeof body.body !== "string") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    const draft = await sendWhatsAppDraft(body.id, body.body);
    return NextResponse.json(draft);
  } catch (error) {
    return NextResponse.json({ error: "Unable to send draft." }, { status: 500 });
  }
}
