  import { NextResponse } from "next/server";
  import { assertRole } from "@/lib/auth";
  import { getAiProviderStatus } from "@/lib/ai-provider";
  import { getAppSettings, saveAppSettings } from "@/lib/academy";

  export async function GET(request: Request) {
    assertRole(request, ["teacher"]);
    const [settings, providers] = await Promise.all([getAppSettings(), getAiProviderStatus()]);
    return NextResponse.json({ settings, providers });
  }

  export async function POST(request: Request) {
    assertRole(request, ["teacher"]);
    const data = await request.json();
    const sanitized = {
      primaryProvider: String(data.primaryProvider ?? "openai"),
      fallbackProvider: String(data.fallbackProvider ?? "grok"),
      whatsappNumber: String(data.whatsappNumber ?? "9172765002"),
      notificationPreferences: data.notificationPreferences ?? {
        resultUploaded: true,
        chapterCompleted: true,
        quarterlyReminder: true,
        walkthrough: true
      }
    };

    const settings = await saveAppSettings(sanitized);
    const providers = getAiProviderStatus();

    return NextResponse.json({ settings, providers });
  }
