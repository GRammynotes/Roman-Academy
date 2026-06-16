import { z } from "zod";

export const structuredUpdateSchema = z.object({
  studentName: z.string(),
  testName: z.string().default("Latest test"),
  percentage: z.number().min(0).max(100).optional(),
  weakChapters: z.array(z.string()).default([]),
  improvementNote: z.string().optional(),
  createWhatsappDraft: z.boolean().default(false),
  createAlert: z.boolean().default(true)
});

export type StructuredUpdate = z.infer<typeof structuredUpdateSchema>;

export function parseAdminCommand(command: string): StructuredUpdate {
  const percentageMatch = command.match(/(\d{1,3})\s*%/);
  const weakMatch = command.match(/weak in ([^,]+(?:,\s*[^,]+)*)/i);
  const studentMatch = command.match(/update\s+([a-z ]+?)\s+with/i);
  const testMatch = command.match(/in\s+([^,]+?test\s*\d*|[^,]+?test)/i);

  return structuredUpdateSchema.parse({
    studentName: studentMatch?.[1]?.trim() || "Selected student",
    testName: testMatch?.[1]?.trim() || "Latest test",
    percentage: percentageMatch ? Number(percentageMatch[1]) : undefined,
    weakChapters: weakMatch ? weakMatch[1].split(/and|,/i).map((item) => item.trim()).filter(Boolean) : [],
    improvementNote: command,
    createWhatsappDraft: /whatsapp|summary/i.test(command),
    createAlert: true
  });
}
