"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ArrowRight, Play, BookOpen, MessageCircleWarning, RefreshCw } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SyllabusChapter = {
  subject: string;
  name: string;
  status: string;
  priority: string;
};

type SyllabusBatch = {
  batch: string;
  chapters: SyllabusChapter[];
};

const statusTone = {
  PLANNED: "neutral",
  ONGOING: "blue",
  COMPLETED: "green",
  REVISION: "gold",
  CATCH_UP: "red"
} as const;

export default function SyllabusPage() {
  const [batches, setBatches] = useState<SyllabusBatch[]>([]);
  const [activeBatchName, setActiveBatchName] = useState("12th Science 2026");
  const [activeSubject, setActiveSubject] = useState("Physics");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadSyllabus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/syllabus");
      if (res.ok) {
        const data = await res.json();
        setBatches(data || []);
      }
    } catch (err) {
      console.error("Failed to load syllabus:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSyllabus();
  }, []);

  const handleMarkCompleted = async (chapterName: string) => {
    setActionLoading(chapterName);
    try {
      const res = await fetch("/api/teacher/syllabus/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchName: activeBatchName,
          chapterName
        })
      });

      if (res.ok) {
        await loadSyllabus(); // Refresh syllabus
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update chapter status.");
      }
    } catch (error) {
      console.error("Error completing chapter:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const selectedBatch = batches.find((b) => b.batch === activeBatchName);
  const subjects = selectedBatch ? [...new Set(selectedBatch.chapters.map((c) => c.subject))] : [];

  const chaptersForSubject = selectedBatch
    ? selectedBatch.chapters.filter((c) => c.subject === activeSubject)
    : [];

  const completedCount = chaptersForSubject.filter((c) => c.status === "COMPLETED").length;
  const progressPercent = chaptersForSubject.length
    ? Math.round((completedCount / chaptersForSubject.length) * 100)
    : 0;

  return (
    <AppShell active="/teacher/syllabus" role="teacher">
      <PageHeader eyebrow="Teacher Portal" title="Syllabus Tracker">
        <Badge tone="gold">Batch & Subject Driven Roadmap</Badge>
      </PageHeader>

      {/* Batch Select Tabs */}
      <div className="flex gap-2 border-b border-gold-500/10 mt-6 pb-px overflow-x-auto whitespace-nowrap">
        {[
          "11th Science 2026",
          "12th Science 2026",
          "11th Commerce 2026",
          "12th Commerce 2026"
        ].map((batchName) => (
          <button
            key={batchName}
            onClick={() => {
              setActiveBatchName(batchName);
              // reset subject to Physics when batch switches (or accounting for commerce)
              if (batchName.includes("Commerce")) {
                setActiveSubject("Commerce");
              } else {
                setActiveSubject("Physics");
              }
            }}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
              activeBatchName === batchName
                ? "border-gold-500 text-gold-300 font-bold"
                : "border-transparent text-ivory-100/60 hover:text-ivory-100/90"
            }`}
          >
            {batchName}
          </button>
        ))}
      </div>

      <div className="grid gap-4 mt-6 xl:grid-cols-[250px_1fr]">
        {/* Subject Navigation */}
        <Card className="border-gold-500/20 shadow-md">
          <CardHeader className="bg-ivory-50/50 py-3">
            <CardTitle className="text-sm font-bold text-navy-950 uppercase">Subjects</CardTitle>
          </CardHeader>
          <CardContent className="p-3 flex flex-col gap-2">
            {subjects.length === 0 ? (
              <p className="text-xs text-navy-500 p-2">No subjects found</p>
            ) : (
              subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubject(sub)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all font-semibold flex items-center justify-between ${
                    activeSubject === sub
                      ? "bg-gold-600 text-white shadow-sm"
                      : "bg-ivory-50 hover:bg-gold-50 text-navy-950"
                  }`}
                >
                  <span>{sub}</span>
                  <BookOpen className="size-4 shrink-0" />
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Chapters view */}
        <div className="space-y-4">
          <Card className="border-gold-500/20 shadow-md">
            <CardHeader className="bg-white/80 flex flex-row items-center justify-between py-4 border-b border-gold-500/10">
              <div>
                <CardTitle className="text-lg font-bold text-navy-950">{activeSubject} Roadmap</CardTitle>
                <p className="text-xs text-navy-800/60 mt-1">Batch: {activeBatchName}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gold-700">{progressPercent}% Completed</span>
                <div className="w-24 bg-ivory-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-gold-600 h-full transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 bg-ivory-50/20">
              {loading ? (
                <p className="text-sm text-navy-500 text-center py-6">Loading syllabus data...</p>
              ) : chaptersForSubject.length === 0 ? (
                <p className="text-sm text-navy-500 text-center py-6">No chapters configured for this subject.</p>
              ) : (
                chaptersForSubject.map((chapter) => (
                  <div
                    key={chapter.name}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-white shadow-sm transition-all ${
                      chapter.status === "ONGOING"
                        ? "border-blue-500/40 ring-1 ring-blue-500/15"
                        : "border-gold-500/10"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-navy-950 text-base">{chapter.name}</p>
                        <Badge tone={statusTone[chapter.status as keyof typeof statusTone] ?? "neutral"}>
                          {chapter.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-navy-800/60 mt-1">Priority: {chapter.priority} · Subject: {chapter.subject}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {chapter.status !== "COMPLETED" ? (
                        <Button
                          disabled={actionLoading !== null}
                          onClick={() => handleMarkCompleted(chapter.name)}
                          className="gap-1.5 text-xs h-9 bg-gold-600 hover:bg-gold-700 text-white font-semibold"
                        >
                          {actionLoading === chapter.name ? (
                            <RefreshCw className="size-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-3.5" />
                          )}
                          Mark Completed
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1 text-emerald-600 font-semibold text-xs py-1 px-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                          <CheckCircle2 className="size-4" />
                          Verified Done
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Integration Roadmap state alert info */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-gold-500/20 shadow-sm bg-white">
              <CardHeader className="py-3">
                <CardTitle className="text-xs font-bold text-navy-950 uppercase flex items-center gap-2">
                  <Play className="size-3.5 text-gold-600" /> Progression Automation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 text-xs text-navy-800/80 leading-relaxed">
                When a chapter is completed, the system automatically advances the nextPlanned roadmap chapter to <span className="font-bold text-blue-600">ONGOING</span> status. This updates all student dashboards immediately.
              </CardContent>
            </Card>

            <Card className="border-gold-500/20 shadow-sm bg-white">
              <CardHeader className="py-3">
                <CardTitle className="text-xs font-bold text-navy-950 uppercase flex items-center gap-2">
                  <MessageCircleWarning className="size-3.5 text-gold-600" /> Catch-Up Support
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 text-xs text-navy-800/80 leading-relaxed">
                Late-joining students will have ongoing chapters automatically marked as <span className="font-bold text-rose-600">CATCH_UP</span> to ensure they receive revision notes and focused assignments.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
