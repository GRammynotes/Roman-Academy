"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, WandSparkles, AlertCircle, RefreshCw } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const promptExample = `Weekly Test

Sonal 72
Prachi 68
Aditya 80
Ritik 61

Completed:
Rotational Dynamics

Weak:
Electrostatics`;

export default function UploadMarksPage() {
  const [uploadText, setUploadText] = useState(promptExample);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [parsedPreview, setParsedPreview] = useState<any>(null);

  // Quick client side preview parsing matching academy.ts rules
  const handleTextChange = (text: string) => {
    setUploadText(text);
    
    // Parse on change to update structured preview
    try {
      const lines = text.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        setParsedPreview(null);
        return;
      }
      
      const testName = lines[0];
      const payloadLines = lines.slice(1);
      
      let currentSection: "students" | "completed" | "weak" = "students";
      const students: string[] = [];
      const completed: string[] = [];
      const weak: string[] = [];
      
      for (const line of payloadLines) {
        const lower = line.toLowerCase();
        if (lower.startsWith("completed:")) {
          currentSection = "completed";
          const rest = line.slice(line.indexOf(":") + 1).trim();
          if (rest) completed.push(rest);
          continue;
        }
        if (lower.startsWith("weak:")) {
          currentSection = "weak";
          const rest = line.slice(line.indexOf(":") + 1).trim();
          if (rest) weak.push(rest);
          continue;
        }
        
        if (currentSection === "students") {
          const match = line.match(/^(.+?)\s+(\d{1,3})$/);
          if (match) students.push(match[1].trim());
        } else if (currentSection === "completed") {
          completed.push(line);
        } else if (currentSection === "weak") {
          weak.push(line);
        }
      }
      
      setParsedPreview({
        testName,
        students: students.join(", "),
        completed: completed.join(", "),
        weak: weak.join(", ")
      });
    } catch {
      setParsedPreview(null);
    }
  };

  // Initialize preview on first load
  useState(() => {
    handleTextChange(promptExample);
  });

  const handleSaveAndSync = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/tests/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: uploadText })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Marks sync failed.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell active="/teacher/upload-marks" role="teacher">
      <PageHeader eyebrow="Teacher Portal" title="Upload Marks">
        <Badge tone="gold">AI-Assisted Processing Engine</Badge>
      </PageHeader>

      <div className="grid gap-4 mt-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-gold-500/20 shadow-md">
          <CardHeader className="bg-ivory-50/50 border-b border-gold-500/10">
            <CardTitle>Sync Progression Flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 bg-white">
            {[
              ["1", "Paste Teacher Prompt", "Paste student names with scores and completion indicators."],
              ["2", "Verify Preview", "Check the live structured conversion preview on the right panel."],
              ["3", "Execute Save and Sync", "Upload to DB, advancing syllabus roadmap and updating leaderboard ranking."],
              ["4", "Review WhatsApp Queue", "Check generated message drafts under WhatsApp workspace."]
            ].map(([step, title, detail]) => (
              <div key={step} className="grid grid-cols-[40px_1fr] gap-3 rounded-xl border border-gold-500/15 bg-ivory-50/50 p-3">
                <div className="grid size-9 place-items-center rounded-full bg-navy-950 text-sm font-bold text-gold-300">{step}</div>
                <div>
                  <p className="font-semibold text-navy-950 text-sm">{title}</p>
                  <p className="mt-0.5 text-xs text-navy-800/70">{detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-gold-500/20 shadow-md">
          <CardHeader className="bg-ivory-50/50 border-b border-gold-500/10 flex flex-row items-center justify-between py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-navy-950">
              <WandSparkles className="size-4 text-gold-600 animate-pulse" />
              Teacher Entry Prompt
            </CardTitle>
            {success && <Badge tone="green">Sync Successful</Badge>}
          </CardHeader>
          <CardContent className="space-y-4 p-4 bg-white">
            {error && (
              <div className="p-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="p-3 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>All operations synced! Ranks calculated, chapter advanced, drafts loaded.</span>
              </div>
            )}

            <textarea
              value={uploadText}
              onChange={(e) => handleTextChange(e.target.value)}
              disabled={loading}
              className="min-h-52 w-full resize-none rounded-xl border border-gold-500/25 bg-ivory-50 p-4 font-mono text-sm leading-6 text-navy-950 outline-none focus:ring-1 focus:ring-gold-500 disabled:opacity-50"
              placeholder="Test Title..."
            />

            <div className="rounded-xl border border-gold-500/20 bg-gold-400/5 p-4 space-y-2">
              <p className="font-bold text-xs uppercase tracking-wider text-gold-700">Live Structured Preview</p>
              <div className="grid gap-2 text-xs text-navy-800 md:grid-cols-2">
                <p><span className="font-semibold text-navy-950">Test Name:</span> {parsedPreview?.testName || "Invalid format"}</p>
                <p><span className="font-semibold text-navy-950">Students Detected:</span> {parsedPreview?.students || "None"}</p>
                <p><span className="font-semibold text-navy-950">Completed:</span> {parsedPreview?.completed || "None"}</p>
                <p><span className="font-semibold text-navy-950">Weak Areas:</span> {parsedPreview?.weak || "None"}</p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {[
                "Create marks records in DB",
                "Recalculate RankHistory rankings",
                "Queue WhatsApp notification drafts",
                "Trigger syllabus catch-up markers"
              ].map((effect) => (
                <div key={effect} className="flex items-center gap-2 rounded-xl border border-gold-500/15 bg-ivory-50/50 p-2.5 text-xs text-navy-800">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <span>{effect}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                onClick={handleSaveAndSync}
                disabled={loading || !uploadText.trim()}
                className="bg-gold-600 hover:bg-gold-700 text-white font-semibold flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    Save and Sync
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
