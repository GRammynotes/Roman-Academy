import { NextResponse } from "next/server";
import { getAiProviderStatus } from "@/lib/ai-provider";

export async function GET() {
  return NextResponse.json({ providers: getAiProviderStatus() });
}
