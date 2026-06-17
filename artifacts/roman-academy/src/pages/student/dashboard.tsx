import { useState, useEffect } from "react";
import { Link } from "wouter";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Flame, ShieldCheck, ArrowUpRight, Trophy, LogOut, TrendingUp } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

type Profile = {
  fullName: string;
  rank: number | null;
  average: number | null;
  batchType: string;
  cetReadiness: number;
  attendance: number;
  currentChapter: string;
  nextTest: string;
};

type TestResult = {
  testName: string;
  date: string;
  percentage: number;
  rank: number | string;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as { label: string; score: number; rank: string | number };
  return (
    <div className="rounded-lg border border-gold-500/30 bg-navy-900 p-3 shadow-xl text-sm">
      <p className="font-bold text-white mb-1">{d.label}</p>
      <p className="text-gold-300 font-mono text-base">{d.score}%</p>
      {d.rank !== "N/A" && <p className="text-ivory-100/60 text-xs mt-0.5">Rank #{d.rank}</p>}
    </div>
  );
};

export default function StudentDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    Promise.all([
      fetch(`${base}api/student/profile`).then(r => r.json()),
      fetch(`${base}api/student/tests`).then(r => r.json()),
    ]).then(([p, t]) => {
      setProfile(p);
      if (Array.isArray(t)) setTests(t);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch(`${import.meta.env.BASE_URL}api/auth/logout`, { method: "POST" });
    localStorage.removeItem("ra_role");
    window.location.href = "/login";
  };

  const trendData = [...tests]
    .reverse()
    .slice(-8)
    .map((t, i) => ({
      label: t.testName.length > 20 ? t.testName.slice(0, 18) + "…" : t.testName,
      score: Math.round(t.percentage),
      rank: t.rank,
      index: i + 1,
    }));

  const avgScore = trendData.length
    ? Math.round(trendData.reduce((s, d) => s + d.score, 0) / trendData.length)
    : null;

  const lastScore = trendData[trendData.length - 1]?.score ?? null;
  const prevScore = trendData[trendData.length - 2]?.score ?? null;
  const trend = lastScore !== null && prevScore !== null ? lastScore - prevScore : null;

  return (
    <AppShell active="/student" role="student">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader eyebrow="Student Portal" title={`Hello, ${profile?.fullName?.split(" ")[0] || "Student"}!`} />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-ivory-100/60 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
          >
            <LogOut className="size-4" /> Logout
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Rank",          value: profile?.rank ? `#${profile.rank}` : "N/A",          sub: "In your batch",     accent: "text-gold-300" },
            { label: "Average",       value: profile?.average ? `${profile.average}%` : "N/A",    sub: "Test performance",  accent: "text-emerald-400" },
            { label: "CET Readiness", value: profile?.cetReadiness ? `${profile.cetReadiness}%` : "N/A", sub: "Board + CET prep", accent: "text-blue-400" },
            { label: "Attendance",    value: profile?.attendance ? `${profile.attendance}%` : "N/A", sub: "Present rate",   accent: "text-ivory-100/80" },
          ].map(item => (
            <Card key={item.label} className="border-gold-500/20">
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-ivory-100/60 uppercase tracking-wide mb-2">{item.label}</p>
                <p className={`text-2xl font-bold ${loading ? "text-ivory-100/30" : item.accent}`}>
                  {loading ? "—" : item.value}
                </p>
                <p className="text-xs text-ivory-100/50 mt-1">{item.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Score Trend Chart */}
        <Card className="border-gold-500/20">
          <CardHeader className="border-b border-gold-500/10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="size-5 text-gold-400" /> Score Trend
              </CardTitle>
              <div className="flex items-center gap-3">
                {avgScore !== null && (
                  <span className="text-xs text-ivory-100/50">
                    Avg: <span className="font-bold text-gold-300">{avgScore}%</span>
                  </span>
                )}
                {trend !== null && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    trend > 0 ? "text-emerald-400 bg-emerald-900/30 border-emerald-700/40"
                    : trend < 0 ? "text-red-400 bg-red-900/30 border-red-700/40"
                    : "text-ivory-100/40 border-gold-500/20"
                  }`}>
                    {trend > 0 ? `↑ +${trend}%` : trend < 0 ? `↓ ${trend}%` : "→ No change"}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {loading ? (
              <div className="h-48 flex items-center justify-center text-ivory-100/40 text-sm">Loading…</div>
            ) : trendData.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-ivory-100/40">
                <TrendingUp className="size-8 mb-2 text-gold-400/30" />
                <p className="text-sm">No test results yet</p>
                <p className="text-xs mt-1">Your score trend will appear here after your first test</p>
              </div>
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#D4AF37" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.08)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "rgba(240,235,220,0.4)", fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: "rgba(212,175,55,0.15)" }}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "rgba(240,235,220,0.4)", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={v => `${v}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={75} stroke="rgba(52,211,153,0.3)" strokeDasharray="4 4" label={{ value: "75%", fill: "rgba(52,211,153,0.5)", fontSize: 10, position: "insideTopRight" }} />
                    <ReferenceLine y={60} stroke="rgba(251,191,36,0.3)" strokeDasharray="4 4" label={{ value: "60%", fill: "rgba(251,191,36,0.5)", fontSize: 10, position: "insideTopRight" }} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#D4AF37"
                      strokeWidth={2.5}
                      fill="url(#scoreGrad)"
                      dot={{ fill: "#D4AF37", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, fill: "#D4AF37", stroke: "#0a0e1a", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {trendData.length > 0 && (
              <div className="mt-3 flex items-center gap-4 text-xs text-ivory-100/40 px-1">
                <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-400/60 inline-block" /> 75%+ = Strong</span>
                <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-400/60 inline-block" /> 60%+ = Average</span>
                <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-red-400/60 inline-block" /> Below 60% = Needs work</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom Row */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 border-gold-500/20">
            <CardHeader className="border-b border-gold-500/10">
              <CardTitle className="text-white text-base">Current Status</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {profile ? (
                <>
                  <div className="p-3 rounded-lg border border-gold-500/15 bg-navy-900/50">
                    <p className="font-semibold text-white text-sm">Current Chapter</p>
                    <p className="text-xs text-ivory-100/60 mt-0.5">{profile.currentChapter}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-gold-500/15 bg-navy-900/50">
                    <p className="font-semibold text-white text-sm">Batch</p>
                    <p className="text-xs text-ivory-100/60 mt-0.5">{profile.batchType}</p>
                  </div>
                  {tests.length > 0 && (
                    <div className="p-3 rounded-lg border border-gold-500/15 bg-navy-900/50">
                      <p className="font-semibold text-white text-sm">Latest Test</p>
                      <p className="text-xs text-ivory-100/60 mt-0.5">
                        {tests[0].testName} — <span className={`font-bold ${
                          tests[0].percentage >= 75 ? "text-emerald-400"
                          : tests[0].percentage >= 60 ? "text-amber-400"
                          : "text-red-400"
                        }`}>{Math.round(tests[0].percentage)}%</span>
                        {tests[0].rank !== "N/A" && ` · Rank #${tests[0].rank}`}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-ivory-100/50">
                  {loading ? "Loading…" : "No data at the moment."}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-gold-500/20 h-fit">
            <CardHeader className="border-b border-gold-500/10">
              <CardTitle className="text-base text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {[
                { href: "/student/tests",    label: "View Tests",    icon: BookOpen },
                { href: "/leaderboard",      label: "Leaderboard",   icon: Trophy },
                { href: "/student/progress", label: "My Progress",   icon: Flame },
                { href: "/student/support",  label: "Get Support",   icon: ShieldCheck },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gold-500/15 hover:border-gold-500/50 hover:bg-white/5 transition text-sm font-semibold text-ivory-100"
                >
                  <item.icon className="size-4 text-gold-600" />
                  <span>{item.label}</span>
                  <ArrowUpRight className="size-3 ml-auto text-ivory-100/30" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
