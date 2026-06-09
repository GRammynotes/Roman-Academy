export type WhatsAppDraft = {
  to: string;
  body: string;
  studentId: string;
};

export interface WhatsAppProvider {
  name: string;
  send(draft: WhatsAppDraft): Promise<{ id: string; status: "sent" | "queued" }>;
}

class ApiWhatsAppProvider implements WhatsAppProvider {
  name = "api";

  async send(draft: WhatsAppDraft) {
    return { id: `wa_${draft.studentId}_${Date.now()}`, status: "queued" as const };
  }
}

class ManualWhatsAppProvider implements WhatsAppProvider {
  name = "manual";

  async send(draft: WhatsAppDraft) {
    return { id: `manual_${draft.studentId}_${Date.now()}`, status: "queued" as const };
  }
}

export async function sendWhatsAppWithFallback(draft: WhatsAppDraft) {
  const providers: WhatsAppProvider[] = [new ApiWhatsAppProvider(), new ManualWhatsAppProvider()];
  for (const provider of providers) {
    try {
      return { provider: provider.name, result: await provider.send(draft) };
    } catch {
      continue;
    }
  }
  throw new Error("All WhatsApp providers failed");
}
