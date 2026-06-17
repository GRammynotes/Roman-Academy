import type { ClassLevel, Stream } from "@prisma/client";

export const batchLabels = {
  ELEVEN_SCIENCE: "11th Batch 2026",
  TWELVE_SCIENCE: "12th Batch 2026",
  ELEVEN_COMMERCE: "11th Commerce Batch 2026",
  TWELVE_COMMERCE: "12th Commerce Batch 2026",
  ELEVEN_NEET: "11th NEET Add-on Batch 2026",
  TWELVE_NEET: "12th NEET Add-on Batch 2026"
} as const;

export type BatchLabel = (typeof batchLabels)[keyof typeof batchLabels];

const batchDefinitions: Array<{ label: BatchLabel; classLevel: ClassLevel; stream: Stream }> = [
  { label: batchLabels.ELEVEN_SCIENCE, classLevel: "ELEVEN", stream: "SCIENCE_PCM" },
  { label: batchLabels.TWELVE_SCIENCE, classLevel: "TWELVE", stream: "SCIENCE_PCM" },
  { label: batchLabels.ELEVEN_COMMERCE, classLevel: "ELEVEN", stream: "COMMERCE_ADDON" },
  { label: batchLabels.TWELVE_COMMERCE, classLevel: "TWELVE", stream: "COMMERCE_ADDON" },
  { label: batchLabels.ELEVEN_NEET, classLevel: "ELEVEN", stream: "NEET_ADDON" },
  { label: batchLabels.TWELVE_NEET, classLevel: "TWELVE", stream: "NEET_ADDON" }
];

export function formatBatchType(classLevel: ClassLevel, stream: Stream): BatchLabel {
  const match = batchDefinitions.find((item) => item.classLevel === classLevel && item.stream === stream);
  return match ? match.label : `${classLevel === "ELEVEN" ? "11th" : "12th"} Batch 2026` as BatchLabel;
}

export function normalizeBatchType(value: string | null | undefined): BatchLabel | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  const match = batchDefinitions.find((item) => item.label.toLowerCase() === normalized);
  if (match) return match.label;

  if (normalized.includes("11th") || normalized.includes("11")) {
    if (normalized.includes("commerce")) return batchLabels.ELEVEN_COMMERCE;
    if (normalized.includes("neet")) return batchLabels.ELEVEN_NEET;
    return batchLabels.ELEVEN_SCIENCE;
  }
  if (normalized.includes("12th") || normalized.includes("12")) {
    if (normalized.includes("commerce")) return batchLabels.TWELVE_COMMERCE;
    if (normalized.includes("neet")) return batchLabels.TWELVE_NEET;
    return batchLabels.TWELVE_SCIENCE;
  }

  return undefined;
}

export function parseClassLevel(value: string | null | undefined): ClassLevel | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized.startsWith("11")) return "ELEVEN";
  if (normalized.startsWith("12")) return "TWELVE";
  if (normalized.includes("eleven")) return "ELEVEN";
  if (normalized.includes("twelve")) return "TWELVE";
  return undefined;
}

export function parseStream(value: string | null | undefined): Stream {
  if (!value) return "SCIENCE_PCM";
  const normalized = value.trim().toLowerCase();
  if (normalized.includes("commerce")) return "COMMERCE_ADDON";
  if (normalized.includes("neet")) return "NEET_ADDON";
  return "SCIENCE_PCM";
}

export function batchDefinitionFor(batchType: string | undefined) {
  const normalized = normalizeBatchType(batchType);
  return batchDefinitions.find((item) => item.label === normalized);
}

export function batchClassStream(batchType: string | undefined): { classLevel: ClassLevel; stream: Stream } | undefined {
  return batchDefinitionFor(batchType) ?? undefined;
}

export function isCommerceBatch(batchType: string | undefined) {
  const def = batchDefinitionFor(batchType);
  return def?.stream === "COMMERCE_ADDON";
}
