import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BookOpen, CheckCircle2 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
} from "recharts";

type ProgressData = {
  progressTrend: Array<{ name: string; score: number; batch: number }>;
  syllabusCompletion: number;
  completedChapters: string[];
  totalChapters: number;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-gold-500/30 bg-navy-900 p-3 shadow-xl text-sm">
      <p className="font-bold text-white mb-1">{d.name}</p>
      <p className="text-gold-300 font-mono text-base">{d.score}%</p>
      {d.batch !== undefined && (
        <p className="text-ivory-100/50 text-xs mt-0.5">Batch avg: {d.batch}%</p>
      )}
    </div>
  );
};

function ProgressBar({ value, color = "bg-gold-400" }: { value: number; color?: string }) {
  return (
    <div className="w-full h-2 rounded-full bg-navy-800 overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-700`}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

export default function StudentProgress() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/student/progress`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const trendData = data?.progressTrend ?? [];
  const avgScore = trendData.length
    ? Math.round(trendData.reduce((s, d) => s + d.score, 0) / trendData.length)
    : null;

  const subjectBars = [
    { subject: "Physics", pct: 68, color: "#60a5fa" },
    { subject: "Chemistry", pct: 74, color: "#4ade80" },
    { subject: "Maths", pct: 61, color: "#D4AF37" },
  ];

  return (
    <AppShell active="/student/progress" role="student">
      <PageHeader eyebrow="Student Portal" title="My Progress" />

      <div className="p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Syllabus Done", value: loading ? "—" : `${data?.syllabusCompletion ?? 0}%`, color: "text-gold-300" },
            { label: "Avg Score", value: loading ? "—" : avgScore !== null ? `${avgScore}%` : "N/A", color: "text-emerald-400" },
            { label: "Chapters", value: loading ? "—" : `${data?.completedChapters?.length ?? 0}/${data?.totalChapters ?? 0}`, color: "text-blue-400" },
          ].map(item => (
            <Card key={item.label} className="border-gold-500/20">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-ivory-100/50 uppercase tracking-wider font-semibold mb-1">{item.label}</p>
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-gold-500/20">
          <CardHeader className="border-b border-gold-500/10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="size-5 text-gold-400" /> Score Trend
              </CardTitle>
              {avgScore !== null && (
                <span className="text-xs text-ivory-100/50">
                  Avg: <span className="font-bold text-gold-300">{avgScore}%</span>
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {loading ? (
              <div className="h-52 flex items-center justify-center text-ivory-100/40 text-sm">Loading…</div>
            ) : trendData.length === 0 ? (
              <div className="h-52 flex flex-col items-center justify-center text-ivory-100/40">
                <TrendingUp className="size-8 mb-2 text-gold-400/30" />
                <p className="text-sm">No test data yet</p>
                <p className="text-xs mt-1">Your trend will appear after your first test</p>
              </div>
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="batchGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.08)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "rgba(240,235,220,0.4)", fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: "rgba(212,175,55,0.15)" }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={36}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "rgba(240,235,220,0.4)", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={v => `${v}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={75} stroke="rgba(52,211,153,0.3)" strokeDasharray="4 4" />
                    <ReferenceLine y={60} stroke="rgba(251,191,36,0.3)" strokeDasharray="4 4" />
                    <Area
                      type="monotone"
                      dataKey="batch"
                      stroke="#60a5fa"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      fill="url(#batchGrad)"
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#D4AF37"
                      strokeWidth={2.5}
                      fill="url(#progressGrad)"
                      dot={{ fill: "#D4AF37", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, fill: "#D4AF37", stroke: "#0a0e1a", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="mt-3 flex items-center gap-4 text-xs text-ivory-100/40 px-1">
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-gold-400/80 inline-block" /> You</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-blue-400/60 inline-block" /> Batch avg</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-400/60 inline-block" /> 75% target</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-gold-500/20">
            <CardHeader className="border-b border-gold-500/10">
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="size-4 text-gold-400" /> Subject Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectBars} barSize={36}>
                    <XAxis dataKey="subject" tick={{ fill: "rgba(240,235,220,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: "rgba(240,235,220,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip
                      cursor={{ fill: "rgba(212,175,55,0.06)" }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-lg border border-gold-500/30 bg-navy-900 p-2 text-xs">
                            <p className="text-gold-300 font-bold">{payload[0].payload.subject}</p>
                            <p className="text-white">{payload[0].value}%</p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                      {subjectBars.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gold-500/20">
            <CardHeader className="border-b border-gold-500/10">
              <CardTitle className="text-white">Syllabus Coverage</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {[
                { label: "Overall Syllabus", value: loading ? 0 : data?.syllabusCompletion ?? 0, color: "bg-gold-400" },
                { label: "CET Readiness", value: 72, color: "bg-blue-400" },
                { label: "Attendance", value: 90, color: "bg-emerald-400" },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5 text-sm">
                    <span className="font-medium text-ivory-100/80">{item.label}</span>
                    <span className="text-gold-400 font-semibold">{loading ? "—" : `${item.value}%`}</span>
                  </div>
                  <ProgressBar value={item.value} color={item.color} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {data?.completedChapters && data.completedChapters.length > 0 && (
          <Card className="border-gold-500/20">
            <CardHeader className="border-b border-gold-500/10">
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400" /> Completed Chapters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {data.completedChapters.map((ch, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs bg-emerald-900/30 text-emerald-300 border border-emerald-700/40 rounded-full px-3 py-1 font-medium">
                    <CheckCircle2 className="size-3" /> {ch}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
