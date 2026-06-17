import { useState, useEffect } from "react";
import { Trophy, Medal, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LeaderboardStudent = {
  id: string;
  fullName: string;
  batchType: string;
  average: number;
  lastTest: number;
  rank: number;
  rankMovement: number | null;
};

export default function LeaderboardPage() {
  const role = (typeof localStorage !== "undefined" ? localStorage.getItem("ra_role") : null) || "student";
  const [scope, setScope] = useState<"weekly" | "monthly" | "quarterly" | "overall">("weekly");
  const [stream, setStream] = useState("SCIENCE_PCM");
  const [classLevel, setClassLevel] = useState("TWELVE");
  const [batch, setBatch] = useState("12th Science 2026");
  const [students, setStudents] = useState<LeaderboardStudent[]>([]);
  const [loading, setLoading] = useState(true);

  const batchMap: Record<string, Record<string, string>> = {
    SCIENCE_PCM: { ELEVEN: "11th Science 2026", TWELVE: "12th Science 2026" },
    COMMERCE_ADDON: { ELEVEN: "11th Commerce 2026", TWELVE: "12th Commerce 2026" },
    NEET_ADDON: { ELEVEN: "11th Science 2026", TWELVE: "12th Science 2026" },
  };

  useEffect(() => { setBatch(batchMap[stream]?.[classLevel] || "all"); }, [stream, classLevel]);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.BASE_URL}api/teacher/leaderboard?scope=${scope}&batch=${encodeURIComponent(batch)}`)
      .then(r => r.json()).then(data => setStudents(data || [])).catch(() => setStudents([])).finally(() => setLoading(false));
  }, [scope, batch]);

  return (
    <AppShell active="/leaderboard" role={role as any}>
      <PageHeader eyebrow={role === "student" ? "Student Portal" : "Teacher Portal"} title="Academy Leaderboard">
        <Badge tone="gold">Weekly 20% | Monthly 30% | Quarterly 50%</Badge>
      </PageHeader>

      <div className="p-4 md:p-6 space-y-6">
        <div className="flex gap-2 border-b border-gold-500/10 overflow-x-auto whitespace-nowrap pb-px">
          {[
            { key: "weekly", label: "Weekly Tests" },
            { key: "monthly", label: "Monthly Tests" },
            { key: "quarterly", label: "Quarterly Tests" },
            { key: "overall", label: "Overall Weighted" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setScope(item.key as any)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                scope === item.key ? "border-gold-500 text-gold-300 font-bold" : "border-transparent text-ivory-100/60 hover:text-ivory-100/90"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <Card className="border-gold-500/20">
          <CardContent className="p-4 grid gap-4 md:grid-cols-3 items-end">
            <div className="space-y-1">
              <label className="text-xs font-bold text-ivory-100/60 uppercase">Stream</label>
              <select value={stream} onChange={(e) => setStream(e.target.value)} className="w-full h-10 rounded-lg border border-gold-500/30 bg-navy-900 px-3 text-sm text-white outline-none focus:ring-1 focus:ring-gold-500">
                <option value="SCIENCE_PCM">Science (PCM)</option>
                <option value="COMMERCE_ADDON">Commerce</option>
                <option value="NEET_ADDON">NEET</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-ivory-100/60 uppercase">Class</label>
              <select value={classLevel} onChange={(e) => setClassLevel(e.target.value)} className="w-full h-10 rounded-lg border border-gold-500/30 bg-navy-900 px-3 text-sm text-white outline-none focus:ring-1 focus:ring-gold-500">
                <option value="ELEVEN">11th Standard</option>
                <option value="TWELVE">12th Standard</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-ivory-100/60 uppercase">Batch</label>
              <div className="h-10 flex items-center px-3 rounded-lg border border-gold-500/20 text-gold-300 font-semibold text-sm">{batch}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gold-500/20">
          <CardHeader className="border-b border-gold-500/10">
            <CardTitle className="flex items-center gap-2 text-white">
              <Trophy className="size-4 text-gold-600" /> Rankings for {batch}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2 rounded-xl border border-gold-500/20 bg-navy-950 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-gold-300">
              <span>Rank</span>
              <span className="col-span-2">Student</span>
              <span>Avg %</span>
              <span className="hidden md:block">Last Score</span>
              <span className="hidden md:block">Movement</span>
            </div>

            {loading ? (
              <div className="text-center py-8 text-ivory-100/50">Loading rankings...</div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-ivory-100/50">
                <Trophy className="size-8 mx-auto mb-2 text-gold-600/40" />
                <p>No rankings yet for this batch.</p>
                <p className="text-xs mt-1">Rankings appear after test results are uploaded.</p>
              </div>
            ) : (
              students.map((student, index) => (
                <div key={student.id} className="grid grid-cols-4 md:grid-cols-6 gap-2 rounded-xl border border-gold-500/15 bg-navy-900/50 p-3 text-sm items-center hover:border-gold-500/30 transition-all">
                  <p className="flex items-center gap-1.5 text-lg font-bold text-gold-400">
                    {index < 3 ? <Medal className="size-4 text-gold-500" /> : null}
                    #{student.rank}
                  </p>
                  <div className="col-span-2">
                    <p className="font-bold text-white">{student.fullName}</p>
                    <p className="text-xs text-ivory-100/50">{student.batchType}</p>
                  </div>
                  <Badge tone={student.average >= 75 ? "green" : student.average >= 65 ? "gold" : "red"}>{student.average}%</Badge>
                  <p className="hidden md:block text-ivory-100/70">{student.lastTest ?? "—"}%</p>
                  <div className="hidden md:flex items-center gap-1">
                    {student.rankMovement === null ? (
                      <span className="text-xs text-ivory-100/40 bg-navy-950 px-2 py-0.5 rounded border border-gold-500/10">New</span>
                    ) : student.rankMovement > 0 ? (
                      <span className="flex items-center gap-0.5 text-xs text-emerald-400 font-bold"><ArrowUp className="size-3.5" />{student.rankMovement}</span>
                    ) : student.rankMovement < 0 ? (
                      <span className="flex items-center gap-0.5 text-xs text-rose-400 font-bold"><ArrowDown className="size-3.5" />{Math.abs(student.rankMovement)}</span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-xs text-ivory-100/40"><Minus className="size-3.5" />0</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
