export type AiAnalysisInput = {
  studentName: string;
  testName: string;
  percentage: number;
  weakChapters: string[];
  strongChapters?: string[];
  attendance?: number | null;
  subjectScores?: Record<string, number | null>;
  rankHistory?: Array<{ date: string; rank: number | null }>;
  previousScores?: Array<{ date: string; score: number | null }>;
  syllabusStatus?: string;
  teacherNote?: string;
};

export type AiAnalysis = {
  performanceSummary: string;
  improvementSinceLastTest: string;
  weakAreas: string[];
  strongAreas: string[];
  recommendedChapters: string[];
  parentFriendlyFeedback: string;
  whatsappDraft: string;
};

export type ProviderName = "gemini" | "openai" | "other-openai" | "groq" | "local";

type ProviderStatus = {
  name: ProviderName;
  label: string;
  configured: boolean;
  maskedKey: string;
  model: string;
};

interface AiProvider {
  name: ProviderName;
  label: string;
  key: string;
  model: string;
  configured: boolean;
  generate(prompt: string): Promise<string>;
}

function env(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key];
    if (value?.trim()) return value.trim();
  }
  return "";
}

function maskKey(value: string) {
  if (!value) return "Not configured";
  return `${value.slice(0, 7)}...${value.slice(-4)}`;
}

function buildPrompt(input: AiAnalysisInput) {
  return `Return only JSON with these keys:
performanceSummary, improvementSinceLastTest, weakAreas, strongAreas, recommendedChapters, parentFriendlyFeedback, whatsappDraft.

Roman Academy mark upload context:
Student: ${input.studentName}
Test: ${input.testName}
Percentage: ${input.percentage}
Previous scores: ${JSON.stringify(input.previousScores || [])}
Rank history: ${JSON.stringify(input.rankHistory || [])}
Subject scores: ${JSON.stringify(input.subjectScores || {})}
Weak chapters: ${(input.weakChapters || []).join(", ") || "none"}
Strong chapters: ${(input.strongChapters || []).join(", ") || "none"}
Attendance: ${input.attendance ?? "not recorded"}
Syllabus status: ${input.syllabusStatus || "not recorded"}
Teacher note: ${input.teacherNote || "none"}

Keep the WhatsApp draft parent-friendly, concise, and teacher-review ready.`;
}

function localAnalysis(input: AiAnalysisInput): AiAnalysis {
  const weakAreas = input.weakChapters.slice(0, 4);
  const strongAreas = input.strongChapters?.length ? input.strongChapters.slice(0, 4) : ["Mathematics"];
  const recommended = weakAreas.length ? weakAreas : ["Thermodynamics", "Differentiation"];
  return {
    performanceSummary: `${input.studentName} scored ${input.percentage}% in ${input.testName}. The profile is ready for teacher review with weak areas and next actions synced.`,
    improvementSinceLastTest: "Trend will be calculated from saved historical results after each upload.",
    weakAreas,
    strongAreas,
    recommendedChapters: recommended,
    parentFriendlyFeedback: `${input.studentName} should revise ${recommended.join(", ")} with a short correction session before the next test.`,
    whatsappDraft: `Roman Academy\n\n${input.studentName} scored ${input.percentage}% in ${input.testName}.\n\nStrong:\n${strongAreas.join("\n")}\n\nImprove:\n${recommended.join("\n")}\n\n-Kunal Datkhile`
  };
}

function parseJson(text: string, input: AiAnalysisInput): AiAnalysis {
  try {
    const cleaned = text.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleaned) as Partial<AiAnalysis>;
    const fallback = localAnalysis(input);
    return {
      performanceSummary: parsed.performanceSummary || fallback.performanceSummary,
      improvementSinceLastTest: parsed.improvementSinceLastTest || fallback.improvementSinceLastTest,
      weakAreas: Array.isArray(parsed.weakAreas) ? parsed.weakAreas : fallback.weakAreas,
      strongAreas: Array.isArray(parsed.strongAreas) ? parsed.strongAreas : fallback.strongAreas,
      recommendedChapters: Array.isArray(parsed.recommendedChapters) ? parsed.recommendedChapters : fallback.recommendedChapters,
      parentFriendlyFeedback: parsed.parentFriendlyFeedback || fallback.parentFriendlyFeedback,
      whatsappDraft: parsed.whatsappDraft || fallback.whatsappDraft
    };
  } catch {
    return localAnalysis(input);
  }
}

class GeminiProvider implements AiProvider {
  name: ProviderName = "gemini";
  label = "Gemini";
  key = env("GOOGLE_API_KEY", "GEMINI_API_KEY");
  model = env("GEMINI_MODEL") || "gemini-1.5-flash";
  configured = Boolean(this.key);

  async generate(prompt: string) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      })
    });
    if (!response.ok) throw new Error(`Gemini ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }
}

class OpenAiCompatibleProvider implements AiProvider {
  configured: boolean;

  constructor(
    public name: ProviderName,
    public label: string,
    public key: string,
    public model: string,
    private url: string
  ) {
    this.configured = Boolean(key);
  }

  async generate(prompt: string) {
    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are Roman Academy's academic analysis assistant. Return strict JSON only." },
          { role: "user", content: prompt }
        ]
      })
    });
    if (!response.ok) throw new Error(`${this.label} ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }
}

function providers(): AiProvider[] {
  return [
    new GeminiProvider(),
    new OpenAiCompatibleProvider("openai", "OpenAI", env("OPENAI_API_KEY", "openai_api_key"), env("OPENAI_MODEL") || "gpt-4.1-mini", "https://api.openai.com/v1/chat/completions"),
    new OpenAiCompatibleProvider("other-openai", "Other OpenAI", env("OTHER_OPENAI_API_KEY"), env("OTHER_OPENAI_MODEL") || "gpt-4.1-mini", "https://api.openai.com/v1/chat/completions"),
    new OpenAiCompatibleProvider("groq", "Groq", env("GROQ_API_KEY", "GROK_API_KEY"), env("GROQ_MODEL", "GROK_MODEL") || "llama-3.1-8b-instant", "https://api.groq.com/openai/v1/chat/completions")
  ];
}

export function getAiProviderStatus(): ProviderStatus[] {
  return providers().map((provider) => ({
    name: provider.name,
    label: provider.label,
    configured: provider.configured,
    maskedKey: maskKey(provider.key),
    model: provider.model
  }));
}

export async function generateContent(input: AiAnalysisInput) {
  const prompt = buildPrompt(input);
  const errors: string[] = [];

  for (const provider of providers()) {
    if (!provider.configured) {
      errors.push(`${provider.label}: key missing`);
      continue;
    }
    try {
      const text = await provider.generate(prompt);
      return {
        providerUsed: provider.name,
        analysis: parseJson(text, input),
        errors
      };
    } catch (error) {
      errors.push(`${provider.label}: ${error instanceof Error ? error.message : "failed"}`);
    }
  }

  return {
    providerUsed: "local" as ProviderName,
    analysis: localAnalysis(input),
    errors
  };
}

export const analyzeWithFallback = generateContent;
