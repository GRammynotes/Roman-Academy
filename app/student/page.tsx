import { AppShell, PageHeader } from "@/components/app-shell";
import { StudentProfileCard } from "@/components/student-profile-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileChart } from "@/components/profile-chart";
import { getStudentNotifications, getStudentProfile } from "@/lib/academy";
import { Bell, ArrowUpRight, ShieldCheck, Flame, BookOpen } from "lucide-react";

export default async function StudentDashboard() {
  const student = await getStudentProfile();
  const notifications = await getStudentNotifications(student?.id);
  const progressTrend = student?.progressTrend ?? [];

  const unreadAlertsCount = notifications.length;

  return (
    <AppShell active="/student" role="student">
      <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto">
        <PageHeader eyebrow="Student Portal" title="Dashboard">
          <Badge tone="gold">Live Tracker</Badge>
          {unreadAlertsCount > 0 && (
            <Badge tone="red" className="animate-bounce font-bold">
              {unreadAlertsCount} New Alerts
            </Badge>
          )}
        </PageHeader>

        {/* Live Academic Timeline / Alert Banner */}
        {unreadAlertsCount > 0 && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3">
            <Bell className="size-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Action Needed</p>
              <p className="text-xs text-rose-300/80 mt-0.5">
                You have {unreadAlertsCount} unread notification{unreadAlertsCount !== 1 ? "s" : ""} on your dashboard.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* Mobile-Friendly Profile Card */}
          <div className="space-y-4">
            <StudentProfileCard
              fullName={student?.fullName ?? "Student"}
              rank={student?.rank ?? null}
              batch={student?.batchType ?? "Unknown"}
              attendance={student?.attendance ?? 0}
              overall={student?.average ?? 0}
              cetReadiness={student?.cetReadiness ?? 0}
              currentChapter={student?.currentChapter ?? "N/A"}
              nextTest={student?.nextTest ?? "N/A"}
              mainProgress={student?.mainProgress ?? 0}
            />

            {/* Quick Micro-stats card */}
            <Card className="bg-navy-900 border-gold-500/20 text-white shadow-md">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-ivory-100/55 uppercase font-semibold">Latest Test Score</span>
                  <Badge tone={student?.average && student.average >= 75 ? "green" : "gold"}>
                    {student?.average ?? 0}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-ivory-100/55 uppercase font-semibold">Active Syllabus Chapter</span>
                  <span className="font-bold text-gold-300 text-right truncate max-w-[200px]" title={student?.currentChapter || "N/A"}>
                    {student?.currentChapter || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-ivory-100/55 uppercase font-semibold">Next Scheduled Test</span>
                  <span className="font-bold text-right truncate max-w-[200px]" title={student?.nextTest || "None scheduled"}>
                    {student?.nextTest || "None scheduled"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart Card */}
          <Card className="border-gold-500/20 shadow-md">
            <CardHeader className="flex-row items-center justify-between pb-2 border-b border-gold-500/10">
              <div>
                <CardTitle className="text-lg font-bold text-navy-950">Performance Overview</CardTitle>
                <p className="text-xs text-navy-800/60 mt-1">Weighted score tracking over latest chapter tests</p>
              </div>
              <ArrowUpRight className="size-5 text-gold-600" />
            </CardHeader>
            <CardContent className="pt-4">
              {progressTrend.length > 0 ? (
                <ProfileChart data={progressTrend} />
              ) : (
                <div className="p-12 text-center text-navy-500 text-sm">
                  Upload tests to display your performance score trend.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Alerts & Notifications */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-gold-500/20 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gold-500/10 py-3.5">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-navy-950">
                <Bell className="size-4 text-gold-600 animate-pulse" />
                Live Notification Center
              </CardTitle>
              {unreadAlertsCount > 0 && (
                <Badge tone="red" className="text-xs">{unreadAlertsCount} new</Badge>
              )}
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {notifications.length ? (
                notifications.map((note) => (
                  <div key={note.id} className="rounded-xl border border-gold-500/15 bg-white p-3 hover:border-gold-500/40 transition-colors shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-navy-950 text-sm">{note.title}</p>
                      <span className="text-[10px] text-navy-500 uppercase font-semibold">
                        {new Date(note.createdAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-navy-800/75 leading-relaxed">{note.body}</p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-navy-500">
                  No new unread alerts or notifications.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Menu Actions */}
          <Card className="border-gold-500/20 shadow-md">
            <CardHeader className="border-b border-gold-500/10 py-3.5">
              <CardTitle className="text-base font-bold text-navy-950">Coaching Core Operations</CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid gap-3">
              <a
                href="/student/tests"
                className="flex items-center justify-between p-3 rounded-xl border border-gold-500/15 bg-white hover:border-gold-500/50 hover:bg-gold-50/10 transition-all font-semibold text-sm text-navy-950 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="size-4.5 text-gold-600" />
                  <span>Test & Marks History</span>
                </div>
                <ArrowUpRight className="size-4 text-navy-500" />
              </a>

              <a
                href="/leaderboard"
                className="flex items-center justify-between p-3 rounded-xl border border-gold-500/15 bg-white hover:border-gold-500/50 hover:bg-gold-50/10 transition-all font-semibold text-sm text-navy-950 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <Flame className="size-4.5 text-gold-600" />
                  <span>Interactive Leaderboards</span>
                </div>
                <ArrowUpRight className="size-4 text-navy-500" />
              </a>

              <a
                href="/student/progress"
                className="flex items-center justify-between p-3 rounded-xl border border-gold-500/15 bg-white hover:border-gold-500/50 hover:bg-gold-50/10 transition-all font-semibold text-sm text-navy-950 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="size-4.5 text-gold-600" />
                  <span>Syllabus Progression Chart</span>
                </div>
                <ArrowUpRight className="size-4 text-navy-500" />
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
