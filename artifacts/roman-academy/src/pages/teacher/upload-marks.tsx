import { useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WandSparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const TEST_TYPES = [
  { value: "WEEKLY_1",  label: "Weekly Test – Test 1" },
  { value: "WEEKLY_2",  label: "Weekly Test – Test 2" },
  { value: "MONTHLY",   label: "Monthly Test" },
  { value: "QUARTERLY", label: "Quarterly Full-Length Test" },
  { value: "YEARLY",    label: "Yearly Test" },
  { value: "MOCK",      label: "Mock Test" },
];

const CHAPTERS: Record<string, { no: number; name: string }[]> = {
  Physics: [
    { no: 1,  name: "Motion in a Plane" },
    { no: 2,  name: "Laws of Motion" },
    { no: 3,  name: "Gravitation" },
    { no: 4,  name: "Thermal Properties of Matter" },
    { no: 5,  name: "Sound" },
    { no: 6,  name: "Optics" },
    { no: 7,  name: "Electrostatics" },
    { no: 8,  name: "Semiconductors" },
  ],
  Chemistry: [
    { no: 1,  name: "Some Basic Concepts of Chemistry" },
    { no: 2,  name: "Structure of Atom" },
    { no: 3,  name: "Chemical Bonding" },
    { no: 4,  name: "Redox Reactions" },
    { no: 5,  name: "Elements of Group 1 and Group 2" },
    { no: 6,  name: "States of Matter: Gaseous and Liquid States" },
    { no: 7,  name: "Adsorption and Colloids" },
    { no: 8,  name: "Hydrocarbons" },
    { no: 9,  name: "Basic Principles of Organic Chemistry" },
    { no: 10, name: "Chemistry in Everyday Life" },
  ],
  Mathematics: [
    { no: 1,  name: "Trigonometry – II" },
    { no: 2,  name: "Straight Line" },
    { no: 3,  name: "Circle" },
    { no: 4,  name: "Measures of Dispersion" },
    { no: 5,  name: "Probability" },
    { no: 6,  name: "Complex Numbers" },
    { no: 7,  name: "Permutations and Combinations" },
    { no: 8,  name: "Functions" },
    { no: 9,  name: "Limits" },
    { no: 10, name: "Continuity" },
  ],
};

const SELECT_CLS = "h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-gold-400/40";

const promptExample = `Sonal 72
Prachi 68
Aditya 80
Ritik 61`;

type ParsedResult = { name: string; score: number; percentage: number };
type UploadResult = { success: boolean; testName: string; processed: ParsedResult[]; skipped: number };

export default function UploadMarksPage() {
  const [text, setText] = useState("");
  const [testType, setTestType] = useState("WEEKLY_1");
  const [subject, setSubject] = useState("Physics");
  const [chapter, setChapter] = useState("Ch 1 – Motion in a Plane");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubjectChange = (s: string) => {
    setSubject(s);
    const first = CHAPTERS[s][0];
    setChapter(`Ch ${first.no} – ${first.name}`);
  };

  const preview = (() => {
    if (!text.trim()) return null;
    const lines = text.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 1) return null;
    const students: Array<{ name: string; score: number }> = [];
    for (const line of lines) {
      const match = line.match(/^(.+?)\s+(\d+(?:\.\d+)?)$/);
      if (match) students.push({ name: match[1].trim(), score: parseFloat(match[2]) });
    }
    return { students };
  })();

  const testLabel = TEST_TYPES.find(t => t.value === testType)?.label ?? testType;
  const builtTestName = `${testLabel} – ${chapter}`;

  const handleUpload = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/teacher/upload-marks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `${builtTestName}\n\n${text}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload");
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell active="/teacher/upload-marks" role="teacher">
      <PageHeader eyebrow="Teacher Portal" title="Upload Marks">
        <Badge tone="gold">AI Text Parser</Badge>
      </PageHeader>

      <div className="p-4 md:p-6 grid gap-6 lg:grid-cols-2">
        <Card className="border-gold-500/20">
          <CardHeader className="border-b border-gold-500/10">
            <CardTitle className="text-white flex items-center gap-2">
              <WandSparkles className="size-4 text-gold-400" /> Paste Test Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm text-ivory-100/80 block col-span-2">
                <span className="font-semibold">Test Type</span>
                <select value={testType} onChange={e => setTestType(e.target.value)} className={SELECT_CLS}>
                  {TEST_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm text-ivory-100/80 block">
                <span className="font-semibold">Subject</span>
                <select value={subject} onChange={e => handleSubjectChange(e.target.value)} className={SELECT_CLS}>
                  {Object.keys(CHAPTERS).map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm text-ivory-100/80 block">
                <span className="font-semibold">Chapter</span>
                <select value={chapter} onChange={e => setChapter(e.target.value)} className={SELECT_CLS}>
                  {CHAPTERS[subject].map(ch => (
                    <option key={ch.no} value={`Ch ${ch.no} – ${ch.name}`}>
                      Ch {ch.no} – {ch.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="rounded-lg border border-gold-500/15 bg-gold-400/5 p-3">
              <p className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-0.5">Auto-generated test name</p>
              <p className="text-sm font-semibold text-white">{builtTestName}</p>
            </div>

            <div className="rounded-lg border border-gold-500/15 bg-navy-900/50 p-4">
              <p className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-2">Paste format — one student per line:</p>
              <pre className="text-xs text-ivory-100/60 whitespace-pre-wrap">{promptExample}</pre>
            </div>

            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full h-44 p-4 rounded-lg border border-gold-500/25 bg-navy-900 text-white placeholder-ivory-100/30 focus:ring-2 focus:ring-gold-400 focus:outline-none resize-none font-mono text-sm"
              placeholder="Sonal 72&#10;Prachi 68&#10;Aditya 80"
            />

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/30 border border-red-700/40 text-red-300 text-sm">
                <AlertCircle className="size-4 shrink-0" /> {error}
              </div>
            )}
            {result && (
              <div className="p-3 rounded-lg bg-emerald-900/30 border border-emerald-700/40 text-emerald-300 text-sm space-y-1">
                <p className="font-bold flex items-center gap-2"><CheckCircle2 className="size-4" /> Upload Successful!</p>
                <p>Test: {result.testName}</p>
                <p>Processed: {result.processed.length} students{result.skipped > 0 ? `, ${result.skipped} skipped (not found)` : ""}</p>
              </div>
            )}
            <button
              onClick={handleUpload}
              disabled={loading || !text.trim()}
              className="w-full py-2.5 bg-gold-400 text-navy-950 font-bold rounded-lg hover:bg-gold-300 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <><WandSparkles className="size-4" /> Upload Results</>}
            </button>
          </CardContent>
        </Card>

        <Card className="border-gold-500/20 h-fit">
          <CardHeader className="border-b border-gold-500/10">
            <CardTitle className="text-white">Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {!preview || preview.students.length === 0 ? (
              <div className="text-center py-8 text-ivory-100/50">
                <WandSparkles className="size-8 mx-auto mb-2 text-gold-400/30" />
                <p>Paste student scores on the left to preview</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="font-bold text-gold-300 text-sm">{builtTestName}</p>
                <div className="space-y-2">
                  {preview.students.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-gold-500/15 bg-navy-900/50 text-sm">
                      <span className="font-medium text-white">{s.name}</span>
                      <Badge tone="gold">{s.score}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
