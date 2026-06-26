import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle2, Circle, Clock, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

type ChapterStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

type Chapter = {
  id: string;
  name: string;
  orderIndex: number;
  subject: string;
  status: ChapterStatus;
  startedAt: string | null;
  completedAt: string | null;
};

type SubjectGroup = {
  subject: string;
  chapters: Chapter[];
};

type Batch = {
  id: string;
  name: string;
  classLevel: string;
  stream: string;
};

const SUBJECT_ICONS: Record<string, string> = {
  Physics: "⚡",
  Chemistry: "🧪",
  Maths: "📐",
  Mathematics: "📐",
  Biology: "🔬",
  English: "📖",
};

function ChapterRow({
  chapter,
  onAction,
  loading,
}: {
  chapter: Chapter;
  onAction: (chapterId: string, action: "start" | "complete" | "reset") => void;
  loading: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
        chapter.status === "COMPLETED"
          ? "border-emerald-500/20 bg-emerald-500/5"
          : chapter.status === "IN_PROGRESS"
          ? "border-gold-400/30 bg-gold-400/5"
          : "border-gold-500/10 bg-navy-900/30"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {chapter.status === "COMPLETED" ? (
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
        ) : chapter.status === "IN_PROGRESS" ? (
          <Clock className="size-4 text-gold-400 shrink-0 animate-pulse" />
        ) : (
          <Circle className="size-4 text-ivory-100/25 shrink-0" />
        )}
        <div className="min-w-0">
          <p className={`text-sm font-medium truncate ${chapter.status === "COMPLETED" ? "line-through text-ivory-100/40" : "text-white"}`}>
            {chapter.name}
          </p>
          {chapter.completedAt && (
            <p className="text-xs text-emerald-400/70 mt-0.5">
              Done {new Date(chapter.completedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
            </p>
          )}
          {chapter.startedAt && !chapter.completedAt && (
            <p className="text-xs text-gold-300/60 mt-0.5">
              Started {new Date(chapter.startedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {chapter.status === "PENDING" && (
          <button
            onClick={() => onAction(chapter.id, "start")}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gold-400/15 text-gold-300 border border-gold-400/25 hover:bg-gold-400/25 transition-colors disabled:opacity-50"
          >
            Start
          </button>
        )}
        {chapter.status === "IN_PROGRESS" && (
          <>
            <button
              onClick={() => onAction(chapter.id, "complete")}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
            >
              Mark Done
            </button>
            <button
              onClick={() => onAction(chapter.id, "reset")}
              disabled={loading}
              className="p-1.5 rounded-lg text-ivory-100/30 hover:text-ivory-100/60 hover:bg-white/5 transition-colors disabled:opacity-50"
              title="Reset to Pending"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </>
        )}
        {chapter.status === "COMPLETED" && (
          <button
            onClick={() => onAction(chapter.id, "reset")}
            disabled={loading}
            className="p-1.5 rounded-lg text-ivory-100/25 hover:text-ivory-100/50 hover:bg-white/5 transition-colors disabled:opacity-50"
            title="Reset chapter"
          >
            <RotateCcw className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function SubjectCard({
  group,
  onAction,
  loading,
}: {
  group: SubjectGroup;
  onAction: (chapterId: string, action: "start" | "complete" | "reset") => void;
  loading: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const total = group.chapters.length;
  const done = group.chapters.filter(c => c.status === "COMPLETED").length;
  const ongoing = group.chapters.filter(c => c.status === "IN_PROGRESS").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const icon = SUBJECT_ICONS[group.subject] || "📚";

  return (
    <Card className="border-gold-500/20">
      <CardHeader className="border-b border-gold-500/10 pb-3">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex items-center justify-between w-full text-left group"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <CardTitle className="text-white text-base">{group.subject}</CardTitle>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-ivory-100/50">{done}/{total} chapters done</span>
                {ongoing > 0 && (
                  <Badge tone="gold">{ongoing} ongoing</Badge>
                )}
                <Badge tone={pct === 100 ? "success" : pct > 50 ? "info" : "navy"}>
                  {pct}%
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-navy-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: pct === 100 ? "#34d399" : pct > 50 ? "#D4AF37" : "#3B6CC5",
                }}
              />
            </div>
            {collapsed ? (
              <ChevronDown className="size-4 text-ivory-100/40 group-hover:text-ivory-100/70 transition-colors" />
            ) : (
              <ChevronUp className="size-4 text-ivory-100/40 group-hover:text-ivory-100/70 transition-colors" />
            )}
          </div>
        </button>
      </CardHeader>
      {!collapsed && (
        <CardContent className="p-4 space-y-2">
          {group.chapters.map(ch => (
            <ChapterRow key={ch.id} chapter={ch} onAction={onAction} loading={loading} />
          ))}
        </CardContent>
      )}
    </Card>
  );
}

export default function ChaptersPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const base = import.meta.env.BASE_URL;

  useEffect(() => {
    fetch(`${base}api/teacher/batches`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBatches(data);
          setSelectedBatch(data[0].name);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const load = () => {
    if (!selectedBatch) return;
    setLoading(true);
    setError(null);
    fetch(`${base}api/teacher/chapters?batch=${encodeURIComponent(selectedBatch)}`)
      .then(r => {
        if (!r.ok) throw new Error("Failed to load chapters");
        return r.json();
      })
      .then(data => setChapters(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [selectedBatch]);

  const handleAction = async (chapterId: string, action: "start" | "complete" | "reset") => {
    if (!selectedBatch) return;
    setActionLoading(true);
    try {
      const r = await fetch(`${base}api/teacher/chapter-progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId, batchName: selectedBatch, action }),
      });
      if (!r.ok) throw new Error("Action failed");
      await load();
    } catch {
      alert("Failed to update chapter. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const groups = chapters.reduce<SubjectGroup[]>((acc, ch) => {
    const existing = acc.find(g => g.subject === ch.subject);
    if (existing) {
      existing.chapters.push(ch);
    } else {
      acc.push({ subject: ch.subject, chapters: [ch] });
    }
    return acc;
  }, []);

  const totalChapters = chapters.length;
  const doneChapters = chapters.filter(c => c.status === "COMPLETED").length;
  const ongoingChapters = chapters.filter(c => c.status === "IN_PROGRESS").length;
  const overallPct = totalChapters > 0 ? Math.round((doneChapters / totalChapters) * 100) : 0;

  return (
    <AppShell active="/teacher/chapters" role="teacher">
      <PageHeader eyebrow="Teacher Dashboard" title="Chapter Progress">
        <Badge tone="gold">{overallPct}% Complete</Badge>
      </PageHeader>

      <div className="p-4 md:p-6 space-y-5">
        <Card className="border-gold-500/20">
          <CardContent className="p-4">
            <label className="space-y-1 text-sm text-ivory-100/80">
              <span className="font-semibold">Select Batch</span>
              <select
                value={selectedBatch}
                onChange={e => setSelectedBatch(e.target.value)}
                className="h-10 w-full rounded-lg border border-gold-500/25 bg-navy-900 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-gold-400/40 mt-1"
              >
                {batches.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </label>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Chapters", value: totalChapters, color: "text-white" },
            { label: "Ongoing", value: ongoingChapters, color: "text-gold-300" },
            { label: "Completed", value: doneChapters, color: "text-emerald-400" },
          ].map(stat => (
            <Card key={stat.label} className="border-gold-500/15">
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-ivory-100/50 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl border border-gold-500/15 bg-navy-900/30">
          <BookOpen className="size-5 text-gold-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-white">Overall Syllabus Progress</span>
              <span className="text-sm font-bold text-gold-300">{overallPct}%</span>
            </div>
            <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${overallPct}%`,
                  background: overallPct === 100 ? "#34d399" : "linear-gradient(90deg, #B8962E, #D4AF37)",
                }}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-ivory-100/50">
            <div className="animate-spin size-6 border-2 border-gold-400 border-t-transparent rounded-full mx-auto mb-3" />
            Loading chapters...
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-400 text-sm">{error}</div>
        ) : groups.length === 0 ? (
          <div className="text-center py-16 text-ivory-100/40">
            <BookOpen className="size-10 mx-auto mb-3 text-gold-400/30" />
            <p className="font-semibold">No chapters found</p>
            <p className="text-xs mt-1">No chapters are set up for this batch yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map(g => (
              <SubjectCard key={g.subject} group={g} onAction={handleAction} loading={actionLoading} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
