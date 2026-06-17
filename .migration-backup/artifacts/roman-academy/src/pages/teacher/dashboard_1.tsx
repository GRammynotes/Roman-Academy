import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppShell, PageHeader } from "@/components/app-shell";
import { BarChart3, Users, BookOpen, AlertCircle, ArrowUpRight, LogOut } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

type DashboardStats = {
  totalStudents: number;
  avgScore: number;
  testsCreated: number;
  lowPerformers: number;
  scoreDistribution: Array<{ band: string; count: number }>;
  recentActivity: Array<{ name: string; action: string; score: string }>;
};

const BAND_COLORS: Record<string, string> = {
  "90-100%": "#D4AF37",
  "75-89%":  "#4ade80",
  "60-74%":  "#60a5fa",
  "<60%":    "#f87171",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-navy-900 border border-gold-500/30 rounded-lg px-3 py-2 text-sm">
        <p className="text-gold-300 font-semibold">{label}</p>
        <p className="text-white">{payload[0].value} results</p>
      </div>
    );
  }
  return null;
};

export default function TeacherDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/teacher/dashboard`)
      .then(r => r.json())
      .then(setStats)
      .catch(() => setStats({ totalStudents: 0, avgScore: 0, testsCreated: 0, lowPerformers: 0, scoreDistribution: [], recentActivity: [] }))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch(`${import.meta.env.BASE_URL}api/auth/logout`, { method: "POST" });
    localStorage.removeItem("ra_role");
    window.location.href = "/login";
  };

  return (
    <AppShell active="/teacher" role="teacher">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader eyebrow="Teacher Portal" title="Dashboard" />
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-ivory-100/60 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
            <LogOut className="size-4" /> Logout
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: stats?.totalStudents ?? "—", sub: "Active", icon: Users },
            { label: "Avg Score", value: stats?.avgScore ? `${stats.avgScore}%` : "—", sub: "Class average", icon: BarChart3 },
            { label: "Tests Created", value: stats?.testsCreated ?? "—", sub: "This semester", icon: BookOpen },
            { label: "Weak Performers", value: stats?.lowPerformers ?? "—", sub: "Below 65% avg", icon: AlertCircle },
          ].map((item) => (
            <Card key={item.label} className="border-gold-500/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-ivory-100/60 uppercase tracking-wide">{item.label}</p>
                  <item.icon className="size-4 text-gold-400/60" />
                </div>
                <p className="text-3xl font-bold text-white">{loading ? "—" : item.value}</p>
                <p className="text-xs text-ivory-100/50 mt-1">{item.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-gold-500/20">
            <CardHeader className="border-b border-gold-500/10">
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="size-5 text-gold-600" /> Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {loading ? (
                <div className="text-center py-12 text-ivory-100/50">Loading...</div>
              ) : !stats?.scoreDistribution?.length || stats.scoreDistribution.every(d => d.count === 0) ? (
                <div className="text-center py-12 text-ivory-100/50">
                  No test data yet. Upload marks to see distribution.
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={stats.scoreDistribution} barSize={40}>
                      <XAxis dataKey="band" tick={{ fill: "#c9b96e", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fill: "#8a8070", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(212,175,55,0.08)" }} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {stats.scoreDistribution.map((entry) => (
                          <Cell key={entry.band} fill={BAND_COLORS[entry.band] ?? "#D4AF37"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 justify-center mt-3 flex-wrap">
                    {stats.scoreDistribution.map(d => (
                      <div key={d.band} className="flex items-center gap-1.5 text-xs text-ivory-100/60">
                        <span className="size-2.5 rounded-sm" style={{ background: BAND_COLORS[d.band] }} />
                        {d.band}: <strong className="text-white">{d.count}</strong>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-gold-500/20 h-fit">
            <CardHeader className="border-b border-gold-500/10">
              <CardTitle className="text-base text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {[
                { href: "/teacher/upload-marks", label: "Upload Test Marks", icon: BookOpen },
                { href: "/teacher/students", label: "Manage Students", icon: Users },
                { href: "/teacher/schedule", label: "View Schedule", icon: BarChart3 },
                { href: "/leaderboard", label: "Leaderboard", icon: ArrowUpRight },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-3 p-3 rounded-lg border border-gold-500/15 hover:border-gold-500/50 hover:bg-white/5 transition text-sm font-semibold text-ivory-100">
                  <item.icon className="size-4 text-gold-600" />
                  <span>{item.label}</span>
                  <ArrowUpRight className="size-3 ml-auto text-ivory-100/30" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="border-gold-500/20">
          <CardHeader className="border-b border-gold-500/10">
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="size-5 text-gold-600" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {loading ? (
              <div className="text-center py-8 text-ivory-100/50">Loading...</div>
            ) : stats?.recentActivity?.length === 0 ? (
              <div className="text-center py-8 text-ivory-100/50">No recent activity. Upload test marks to get started.</div>
            ) : (
              stats?.recentActivity?.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gold-500/15 bg-navy-900/50 hover:border-gold-500/30 transition">
                  <div>
                    <p className="font-semibold text-white text-sm">{item.name}</p>
                    <p className="text-xs text-ivory-100/60">{item.action}</p>
                  </div>
                  {item.score && <Badge tone="gold">{item.score}</Badge>}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
