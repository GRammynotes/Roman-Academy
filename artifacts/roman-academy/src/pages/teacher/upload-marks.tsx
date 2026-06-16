import { useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WandSparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const promptExample = `Weekly Test

Sonal 72
Prachi 68
Aditya 80
Ritik 61

Completed:
Rotational Dynamics

Weak:
Electrostatics`;

type ParsedResult = { name: string; score: number; percentage: number };
type UploadResult = { success: boolean; testName: string; processed: ParsedResult[]; skipped: number };

export default function UploadMarksPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const preview = (() => {
    if (!text.trim()) return null;
    const lines = text.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return null;
    const testName = lines[0];
    const students: Array<{ name: string; score: number }> = [];
    for (const line of lines.slice(1)) {
      const match = line.match(/^(.+?)\s+(\d+(?:\.\d+)?)$/);
      if (match) students.push({ name: match[1].trim(), score: parseFloat(match[2]) });
    }
    return { testName, students };
  })();

  const handleUpload = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/teacher/upload-marks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
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
            <div className="rounded-lg border border-gold-500/15 bg-navy-900/50 p-4">
              <p className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-2">Format:</p>
              <pre className="text-xs text-ivory-100/60 whitespace-pre-wrap">{promptExample}</pre>
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full h-56 p-4 rounded-lg border border-gold-500/25 bg-navy-900 text-white placeholder-ivory-100/30 focus:ring-2 focus:ring-gold-400 focus:outline-none resize-none font-mono text-sm"
              placeholder="Paste your test results here..."
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
            <button onClick={handleUpload} disabled={loading || !text.trim()} className="w-full py-2.5 bg-gold-400 text-navy-950 font-bold rounded-lg hover:bg-gold-300 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <><WandSparkles className="size-4" /> Upload Results</>}
            </button>
          </CardContent>
        </Card>

        <Card className="border-gold-500/20 h-fit">
          <CardHeader className="border-b border-gold-500/10">
            <CardTitle className="text-white">Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {!preview ? (
              <div className="text-center py-8 text-ivory-100/50">
                <WandSparkles className="size-8 mx-auto mb-2 text-gold-400/30" />
                <p>Paste text on the left to preview</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="font-bold text-gold-300 text-lg">{preview.testName}</p>
                <div className="space-y-2">
                  {preview.students.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-gold-500/15 bg-navy-900/50 text-sm">
                      <span className="font-medium text-white">{s.name}</span>
                      <Badge tone="gold">{s.score}</Badge>
                    </div>
                  ))}
                </div>
                {preview.students.length === 0 && (
                  <p className="text-ivory-100/50 text-sm">No valid student entries found. Check format.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
