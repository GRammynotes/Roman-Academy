import { NextResponse } from "next/server";
import { assertRole } from "@/lib/auth";
import { getAiProviderStatus } from "@/lib/ai-provider";

export async function GET(request: Request) {
  assertRole(request, ["teacher"]);
  const providers = getAiProviderStatus();
  return NextResponse.json({ providers });
}
