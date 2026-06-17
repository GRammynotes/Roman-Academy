import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WandSparkles, CheckCircle2, AlertCircle, Loader2, MessageSquare, ChevronRight } from "lucide-react";

const TEST_TYPES = [
  { value: "WEEKLY_CHAPTER",   label: "Weekly Chapter Test" },
  { value: "MONTHLY",          label: "Monthly Test" },
  { value: "QUARTERLY",        label: "Quarterly Full-Length Test" },
  { value: "FULL_LENGTH_MOCK", label: "Full Length Mock" },
  { value: "REVISION_TEST",    label: "Revision Test" },
];

const CHAPTERS_11: Record<string, string[]> = {
  Physics: [
    "Physical World & Units",
    "Laws of Motion",
    "Work Energy & Power",
    "Thermal Properties of Matter",
  ],
  Chemistry: [
    "Some Basic Concepts of Chemistry",
    "Structure of Atom",
    "Chemical Bonding",
    "Redox Reactions",
  ],
  Mathematics: [
    "Sets",
    "Relations and Functions",
    "Trigonometric Functions",
    "Straight Lines",
  ],
};

const CHAPTERS_12: Record<string, string[]> = {
  Physics: [
    "Electrostatics",
    "Current Electricity",
    "Magnetic Effects of Current",
    "Electromagnetic Induction",
    "Optics",
  ],
  Chemistry: [
    "Solid State",
    "Solutions",
    "Electrochemistry",
    "Chemical Kinetics",
    "Surface Chemistry",
  ],
  Mathematics: [
    "Relations & Functions (12th)",
    "Matrices",
    "Determinants",
    "Continuity and Differentiability",
    "Applications of Derivatives",
  ],
};

const BATCHES = [
  "12th Science 2026",
  "11th Science 2026",
];

const SELECT_CLS = "h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-gold-400/40";
const INPUT_CLS  = "h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white placeholder-ivory-100/30 outline-none focus:ring-2 focus:ring-gold-400/40";

type ProcessedResult = { name: string; score: number; percentage: number; rank: number };
type UploadResult = {
  success: boolean;
  testName: string;
  processed: ProcessedResult[];
  skipped: number;
  skippedNames: string[];
  batchAvg: number;
  nextChapter: string | null;
};

export default function UploadMarksPage() {
  const [text, setText] = useState("");
  const [testType, setTestType] = useState("WEEKLY_CHAPTER");
  const [totalMarks, setTotalMarks] = useState("100");
  const [batch, setBatch] = useState("12th Science 2026");
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const chapterMap = batch.startsWith("11") ? CHAPTERS_11 : CHAPTERS_12;

  const toggleChapter = (ch: string) => {
    setSelectedChapters(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  const preview = (() => {
    if (!text.trim()) return null;
    const lines = text.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const students: Array<{ name: string; score: number }> = [];
    for (const line of lines) {
      const match = line.match(/^(.+?)\s+(\d+(?:\.\d+)?)$/);
      if (match) students.push({ name: match[1].trim(), score: parseFloat(match[2]) });
    }
    const total = Number(totalMarks) || 100;
    return students.map(s => ({ ...s, pct: Math.round(s.score / total * 100 * 10) / 10 }));
  })();

  const handleUpload = async () => {
    if (!text.trim()) return;
    if (!totalMarks || isNaN(Number(totalMarks)) || Number(totalMarks) <= 0) {
      setError("Please enter valid total marks");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/teacher/upload-marks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          testType,
          totalMarks: Number(totalMarks),
          chapters: selectedChapters,
          batchType: batch,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload");
      setResult(data);
      setText("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell active="/teacher/upload-marks" role="teacher">
      <PageHeader eyebrow="Teacher Portal" title="Upload Marks">
        <Badge tone="gold">Rank + WhatsApp Auto-Draft</Badge>
      </PageHeader>

      <div className="p-4 md:p-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left: Upload Form */}
        <div className="space-y-4">
          <Card className="border-gold-500/20">
            <CardHeader className="border-b border-gold-500/10">
              <CardTitle className="text-white flex items-center gap-2">
                <WandSparkles className="size-4 text-gold-400" /> Test Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 text-sm text-ivory-100/80 col-span-2">
                  <span className="font-semibold">Batch</span>
                  <select value={batch} onChange={e => { setBatch(e.target.value); setSelectedChapters([]); }} className={SELECT_CLS}>
                    {BATCHES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </label>

                <label className="space-y-1 text-sm text-ivory-100/80">
                  <span className="font-semibold">Test Type</span>
                  <select value={testType} onChange={e => setTestType(e.target.value)} className={SELECT_CLS}>
                    {TEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </label>

                <label className="space-y-1 text-sm text-ivory-100/80">
                  <span className="font-semibold">Total Marks</span>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={e => setTotalMarks(e.target.value)}
                    min={1}
                    className={INPUT_CLS}
                    placeholder="100"
                  />
                </label>
              </div>

              {/* Chapter Multi-select */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-ivory-100/80">Chapters Covered <span className="text-ivory-100/40 font-normal">(tick all tested)</span></p>
                <div className="space-y-2">
                  {Object.entries(chapterMap).map(([subject, chs]) => (
                    <div key={subject}>
                      <p className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-1">{subject}</p>
                      <div className="flex flex-wrap gap-2">
                        {chs.map(ch => (
                          <button
                            key={ch}
                            onClick={() => toggleChapter(ch)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                              selectedChapters.includes(ch)
                                ? "bg-gold-400 text-navy-950 border-gold-400 font-bold"
                                : "border-gold-500/25 text-ivory-100/60 hover:border-gold-400/50"
                            }`}
                          >
                            {ch}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedChapters.length > 0 && (
                  <p className="text-xs text-gold-400">✓ {selectedChapters.length} chapter(s) selected — will be marked COMPLETED</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gold-500/20">
            <CardHeader className="border-b border-gold-500/10">
              <CardTitle className="text-white">Paste Scores</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="rounded-lg border border-gold-500/15 bg-navy-900/50 p-3">
                <p className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-1.5">Format — one student per line:</p>
                <pre className="text-xs text-ivory-100/60 font-mono">Rujula 72{"\n"}Shraddha 68{"\n"}Aditya 80{"\n"}Ritik 61</pre>
              </div>

              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                className="w-full h-44 p-4 rounded-lg border border-gold-500/25 bg-navy-900 text-white placeholder-ivory-100/30 focus:ring-2 focus:ring-gold-400 focus:outline-none resize-none font-mono text-sm"
                placeholder={"Rujula 72\nShraddha 68\nAditya 80\nRitik 61"}
              />

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/30 border border-red-700/40 text-red-300 text-sm">
                  <AlertCircle className="size-4 shrink-0" /> {error}
                </div>
              )}

              {result && (
                <div className="p-4 rounded-lg bg-emerald-900/20 border border-emerald-700/40 space-y-2">
                  <p className="font-bold text-emerald-300 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="size-4" /> Results Uploaded!
                  </p>
                  <p className="text-sm text-emerald-200">{result.testName}</p>
                  <p className="text-xs text-ivory-100/60">
                    {result.processed.length} processed · {result.skipped} skipped · Batch avg: {result.batchAvg}%
                  </p>
                  {result.skippedNames.length > 0 && (
                    <p className="text-xs text-amber-400">Not found: {result.skippedNames.join(", ")}</p>
                  )}
                  {result.nextChapter && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg border border-gold-500/30 bg-gold-400/10 p-2.5 text-sm text-gold-300">
                      <ChevronRight className="size-4" />
                      <span>Next chapter suggestion: <strong>{result.nextChapter}</strong></span>
                    </div>
                  )}
                  <p className="text-xs text-ivory-100/50 flex items-center gap-1">
                    <MessageSquare className="size-3" /> WhatsApp drafts created — check the WhatsApp tab
                  </p>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={loading || !text.trim()}
                className="w-full py-2.5 bg-gold-400 text-navy-950 font-bold rounded-lg hover:bg-gold-300 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {loading
                  ? <><Loader2 className="size-4 animate-spin" /> Uploading...</>
                  : <><WandSparkles className="size-4" /> Upload & Compute Ranks</>
                }
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Live Preview */}
        <Card className="border-gold-500/20 h-fit sticky top-4">
          <CardHeader className="border-b border-gold-500/10">
            <CardTitle className="text-white">Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {!preview || preview.length === 0 ? (
              <div className="text-center py-10 text-ivory-100/40">
                <WandSparkles className="size-8 mx-auto mb-2 text-gold-400/30" />
                <p className="text-sm">Paste student scores to see preview</p>
                <p className="text-xs mt-1">Ranks computed automatically</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-ivory-100/50 px-1 mb-2">
                  <span>Student</span>
                  <span>Score · %</span>
                </div>
                {[...preview]
                  .sort((a, b) => b.score - a.score)
                  .map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-gold-500/15 bg-navy-900/50 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`size-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          i === 0 ? "bg-gold-400 text-navy-950"
                          : i === 1 ? "bg-ivory-100/30 text-white"
                          : i === 2 ? "bg-amber-700 text-white"
                          : "bg-navy-900 text-ivory-100/50 border border-gold-500/20"
                        }`}>
                          {i + 1}
                        </span>
                        <span className="font-medium text-white">{s.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gold-300 font-mono font-bold">{s.score}</span>
                        <span className={`ml-2 text-xs ${s.pct >= 75 ? "text-emerald-400" : s.pct >= 60 ? "text-amber-400" : "text-red-400"}`}>
                          {s.pct}%
                        </span>
                      </div>
                    </div>
                  ))}
                <div className="mt-3 rounded-lg border border-gold-500/15 bg-navy-900/50 p-2 text-xs text-center text-ivory-100/50">
                  Avg: {preview.length > 0 ? Math.round(preview.reduce((s, r) => s + r.pct, 0) / preview.length * 10) / 10 : 0}% · {preview.length} students
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
