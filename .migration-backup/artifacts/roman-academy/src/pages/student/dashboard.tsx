import { useState, useEffect } from "react";
import { Link } from "wouter";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, BookOpen, Flame, ShieldCheck, ArrowUpRight, Trophy, LogOut } from "lucide-react";

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

export default function StudentDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/student/profile`)
      .then(r => r.json()).then(setProfile).catch(() => setProfile(null)).finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch(`${import.meta.env.BASE_URL}api/auth/logout`, { method: "POST" });
    localStorage.removeItem("ra_role");
    window.location.href = "/login";
  };

  return (
    <AppShell active="/student" role="student">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader eyebrow="Student Portal" title={`Hello, ${profile?.fullName?.split(" ")[0] || "Student"}!`} />
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-ivory-100/60 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
            <LogOut className="size-4" /> Logout
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Rank", value: profile?.rank ? `#${profile.rank}` : "N/A", sub: "In your batch", tone: "gold" },
            { label: "Average", value: profile?.average ? `${profile.average}%` : "N/A", sub: "Test performance", tone: "green" },
            { label: "CET Readiness", value: profile?.cetReadiness ? `${profile.cetReadiness}%` : "N/A", sub: "Board + CET prep", tone: "blue" },
            { label: "Attendance", value: profile?.attendance ? `${profile.attendance}%` : "N/A", sub: "Present rate", tone: "neutral" },
          ].map((item) => (
            <Card key={item.label} className="border-gold-500/20">
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-ivory-100/60 uppercase tracking-wide mb-2">{item.label}</p>
                <p className="text-2xl font-bold text-white">{loading ? "—" : item.value}</p>
                <p className="text-xs text-ivory-100/50 mt-1">{item.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 border-gold-500/20">
            <CardHeader className="border-b border-gold-500/10">
              <CardTitle className="flex items-center gap-2 text-white">
                <Bell className="size-5 text-gold-600" /> Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {profile ? (
                <>
                  <div className="p-3 rounded-lg border border-gold-500/15 bg-navy-900/50">
                    <p className="font-semibold text-white text-sm">Current Chapter</p>
                    <p className="text-xs text-ivory-100/60 mt-0.5">{profile.currentChapter}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-gold-500/15 bg-navy-900/50">
                    <p className="font-semibold text-white text-sm">Next Test</p>
                    <p className="text-xs text-ivory-100/60 mt-0.5">{profile.nextTest}</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-ivory-100/50">
                  {loading ? "Loading..." : "No notifications at the moment."}
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
                { href: "/student/tests", label: "View Tests", icon: BookOpen },
                { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
                { href: "/student/progress", label: "My Progress", icon: Flame },
                { href: "/student/support", label: "Get Support", icon: ShieldCheck },
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
      </div>
    </AppShell>
  );
}
