import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileChartClient as ProfileChart } from "@/components/profile-chart-client";
import { WalkthroughPopup } from "@/components/walkthrough-popup";
import { getStudentNotifications, getStudentProfile, getStudentProgress, getStudentTests } from "@/lib/academy";
import { Bell, CalendarDays, LineChart, Award, Users, BookOpen, ClipboardCheck, BrainCircuit } from "lucide-react";

export default async function StudentDashboard() {
  const student = await getStudentProfile();
  const studentProgress = await getStudentProgress(student?.id);
  const notifications = await getStudentNotifications(student?.id);
  const tests = await getStudentTests(student?.id);
  const progressTrend = student?.progressTrend ?? [];
  const latestResult = tests[0];

  const unreadAlertsCount = notifications.length;
  const subjects = studentProgress?.subjects ?? {};

  // Core subjects scores mapping
  const coreSubjectsList = [
    { name: "Physics", key: "Physics" },
    { name: "Chemistry", key: "Chemistry" },
    { name: "Maths", key: "Mathematics" }
  ];

  return (
    <AppShell active="/student" role="student">
      <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto text-white">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold-400/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold-400">Student Portal</p>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-white mt-1">
              Welcome, {student?.fullName ?? "Student"}
            </h1>
          </div>
          <div className="flex gap-2">
            <Badge tone="gold" className="text-xs py-1">HSC Science Batch</Badge>
            {unreadAlertsCount > 0 && (
              <Badge tone="red" className="text-xs py-1 animate-pulse">
                {unreadAlertsCount} New Alerts
              </Badge>
            )}
          </div>
        </div>

        {/* Academic priority row */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="bg-navy-900 border-gold-400/20 text-white">
            <CardContent className="p-5 flex flex-col justify-between h-28">
              <div className="flex justify-between items-center text-xs text-white/60 font-semibold uppercase tracking-wider">
                <span>Today's Status</span>
                <ClipboardCheck className="size-4 text-gold-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-white">{student?.currentChapter ?? "Review Day"}</span>
              </div>
              <p className="text-[10px] text-white/50 truncate">Next chapter: {student?.nextChapter ?? "To be assigned"}</p>
            </CardContent>
          </Card>

          <Card className="bg-navy-900 border-gold-400/20 text-white">
            <CardContent className="p-5 flex flex-col justify-between h-28">
              <div className="flex justify-between items-center text-xs text-white/60 font-semibold uppercase tracking-wider">
                <span>Upcoming Test</span>
                <CalendarDays className="size-4 text-gold-400" />
              </div>
              <p className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-white">{student?.nextTest ?? "None scheduled"}</p>
            </CardContent>
          </Card>

          <Card className="bg-navy-900 border-gold-400/20 text-white">
            <CardContent className="p-5 flex flex-col justify-between h-28">
              <div className="flex justify-between items-center text-xs text-white/60 font-semibold uppercase tracking-wider">
                <span>Latest Result</span>
                <Award className="size-4 text-gold-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-gold-400">{latestResult ? `${latestResult.percentage}%` : "Pending"}</span>
                <span className="text-[10px] text-white/50">{latestResult?.testName ?? "No tests uploaded"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-navy-900 border-gold-400/20 text-white">
            <CardContent className="p-5 flex flex-col justify-between h-28">
              <div className="flex justify-between items-center text-xs text-white/60 font-semibold uppercase tracking-wider">
                <span>AI Performance Summary</span>
                <BrainCircuit className="size-4 text-gold-400" />
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-white/75">
                {student?.aiNote ?? "Analysis will appear after the next marks upload."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary status metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-navy-900 border-gold-400/20 text-white">
            <CardContent className="p-5 flex flex-col justify-between h-28">
              <div className="flex justify-between items-center text-xs text-white/60 font-semibold uppercase tracking-wider">
                <span>Attendance Rate</span>
                <Users className="size-4 text-gold-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-white">{student?.attendance ?? 0}%</span>
                <span className="text-[10px] text-gold-400">Target: 90%+</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-navy-900 border-gold-400/20 text-white">
            <CardContent className="p-5 flex flex-col justify-between h-28">
              <div className="flex justify-between items-center text-xs text-white/60 font-semibold uppercase tracking-wider">
                <span>Current Batch Rank</span>
                <Award className="size-4 text-gold-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-gold-400">
                  {student?.rank ? `#${student.rank}` : "Pending"}
                </span>
                <span className="text-[10px] text-white/50">Overall Standing</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-navy-900 border-gold-400/20 text-white">
            <CardContent className="p-5 flex flex-col justify-between h-28">
              <div className="flex justify-between items-center text-xs text-white/60 font-semibold uppercase tracking-wider">
                <span>Overall Progress</span>
                <BookOpen className="size-4 text-gold-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-white">{student?.average ?? 0}%</span>
                <span className="text-[10px] text-emerald-400">Syllabus complete</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Row: Recent Tests (Left) & Performance Chart (Right) */}
        <div className="grid gap-6 md:grid-cols-[1.1fr_1.9fr]">
          
          {/* Recent Tests List */}
          <Card className="bg-navy-900 border-gold-400/20 text-white flex flex-col">
            <CardHeader className="border-b border-gold-400/10 py-3.5 flex flex-row items-center justify-between">
              <CardTitle className="text-sm uppercase tracking-wider text-white">Recent Subject Tests</CardTitle>
              <Badge tone="gold">Latest Result</Badge>
            </CardHeader>
            <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-center">
              {coreSubjectsList.map((subj) => {
                const mark = subjects[subj.key];
                const percentage = mark && mark.maxMarks > 0 ? Math.round((mark.scored / mark.maxMarks) * 100) : null;
                return (
                  <div key={subj.name} className="flex items-center justify-between p-3 rounded-lg bg-navy-950 border border-gold-400/10">
                    <div>
                      <p className="font-bold text-sm text-white">{subj.name}</p>
                      <p className="text-[10px] text-white/50">
                        {mark ? `Score: ${mark.scored}/${mark.maxMarks}` : "No marks uploaded"}
                      </p>
                    </div>
                    {percentage !== null ? (
                      <span className={`text-sm font-bold ${percentage >= 75 ? "text-emerald-400" : percentage >= 60 ? "text-gold-400" : "text-rose-400"}`}>
                        {percentage}%
                      </span>
                    ) : (
                      <span className="text-xs text-white/30 italic">Pending</span>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card className="bg-navy-900 border-gold-400/20 text-white">
            <CardHeader className="border-b border-gold-400/10 py-3.5 flex flex-row items-center justify-between">
              <CardTitle className="text-sm uppercase tracking-wider text-white">Performance Score Trend</CardTitle>
              <LineChart className="size-4 text-gold-400" />
            </CardHeader>
            <CardContent className="p-5 pt-3">
              {progressTrend.length > 0 ? (
                <ProfileChart data={progressTrend} />
              ) : (
                <div className="h-72 flex items-center justify-center text-sm text-white/50 italic">
                  Upload tests to display your performance trend.
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Bottom Row: Upcoming Tests (Left) & Notifications (Right) */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Upcoming Tests */}
          <Card className="bg-navy-900 border-gold-400/20 text-white">
            <CardHeader className="border-b border-gold-400/10 py-3.5 flex flex-row items-center justify-between">
              <CardTitle className="text-sm uppercase tracking-wider text-white">Upcoming Academic Schedule</CardTitle>
              <CalendarDays className="size-4 text-gold-400" />
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="p-3 rounded-lg bg-navy-950 border border-gold-400/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gold-400 uppercase">Quarterly CET Mock</span>
                  <Badge tone="blue">Scheduled</Badge>
                </div>
                <p className="text-xs text-white/70 mt-1">Full-syllabus CET Prep test series covering Physics and Mathematics.</p>
                <p className="text-[10px] text-white/40 mt-2">Next Date: June 15, 2026</p>
              </div>
              <div className="p-3 rounded-lg bg-navy-950 border border-gold-400/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gold-400 uppercase">HSC Boards Physics Prep</span>
                  <Badge tone="gold">Chapter Test</Badge>
                </div>
                <p className="text-xs text-white/70 mt-1">Rotational Dynamics and Thermodynamics chapter test review.</p>
                <p className="text-[10px] text-white/40 mt-2">Next Date: June 22, 2026</p>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-navy-900 border-gold-400/20 text-white">
            <CardHeader className="border-b border-gold-400/10 py-3.5 flex flex-row items-center justify-between">
              <CardTitle className="text-sm uppercase tracking-wider text-white flex items-center gap-2">
                <Bell className="size-4 text-gold-400" />
                Notification Center
              </CardTitle>
              {unreadAlertsCount > 0 && (
                <Badge tone="red" className="text-[10px]">{unreadAlertsCount} new</Badge>
              )}
            </CardHeader>
            <CardContent className="p-5 space-y-3 max-h-[220px] overflow-y-auto">
              {notifications.length ? (
                notifications.map((note) => (
                  <div key={note.id} className="p-3 rounded-lg bg-navy-950 border border-gold-400/10">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-white">{note.title}</p>
                      <span className="text-[9px] text-white/45">
                        {new Date(note.createdAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/75 leading-relaxed">{note.body}</p>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-white/40 italic">
                  No new unread notifications.
                </div>
              )}
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Guided Walkthrough (Shows only on first login) */}
      <WalkthroughPopup />
    </AppShell>
  );
}
